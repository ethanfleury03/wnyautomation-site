const HUBSPOT_BASE_URL = "https://api.hubapi.com";
const WEBSITE_PIPELINE_LABEL = "Sales Pipeline";
const WEBSITE_PIPELINE_ID = "default";
const WEBSITE_LEAD_STAGE_LABEL = "Prospect";

function accessToken() {
  return process.env.HUBSPOT_ACCESS_TOKEN?.trim();
}

function isConfigured() {
  return Boolean(accessToken());
}

async function hubspotRequest(path, { method = "GET", body } = {}) {
  const token = accessToken();
  if (!token) throw new Error("HUBSPOT_ACCESS_TOKEN is not configured");

  const response = await fetch(`${HUBSPOT_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`HubSpot ${method} ${path} returned ${response.status}: ${detail.slice(0, 500)}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function verifyHubSpotConnection() {
  if (!isConfigured()) return { configured: false, connected: false };
  await Promise.all([
    hubspotRequest("/crm/v3/objects/contacts?limit=1&properties=email"),
    hubspotRequest("/crm/v3/objects/companies?limit=1&properties=name"),
    hubspotRequest("/crm/v3/objects/notes?limit=1&properties=hs_timestamp"),
    hubspotRequest("/crm/v3/pipelines/deals?archived=false"),
  ]);
  return { configured: true, connected: true };
}

async function searchObject(objectType, filters, properties = []) {
  const result = await hubspotRequest(`/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    body: {
      filterGroups: [{ filters }],
      properties,
      limit: 1,
    },
  });
  return result.results?.[0] || null;
}

function splitName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return {};
  if (parts.length === 1) return { firstname: parts[0] };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

function domainFromWebsite(website) {
  const raw = String(website || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

function nonEmptyProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ""),
  );
}

async function upsertContact(payload) {
  const existing = await searchObject(
    "contacts",
    [{ propertyName: "email", operator: "EQ", value: payload.email }],
    ["email", "firstname", "lastname", "phone", "company", "lifecyclestage", "hs_lead_status"],
  );

  const baseProperties = nonEmptyProperties({
    email: payload.email,
    ...splitName(payload.name),
    phone: payload.phone,
    company: payload.businessName,
  });

  if (existing) {
    return hubspotRequest(`/crm/v3/objects/contacts/${existing.id}`, {
      method: "PATCH",
      body: { properties: baseProperties },
    });
  }

  return hubspotRequest("/crm/v3/objects/contacts", {
    method: "POST",
    body: {
      properties: {
        ...baseProperties,
        lifecyclestage: "lead",
        hs_lead_status: "NEW",
      },
    },
  });
}

async function upsertCompany(payload) {
  if (!payload.businessName) return null;

  const domain = domainFromWebsite(payload.website);
  const filters = domain
    ? [{ propertyName: "domain", operator: "EQ", value: domain }]
    : [{ propertyName: "name", operator: "EQ", value: payload.businessName }];

  const existing = await searchObject("companies", filters, ["name", "domain", "website", "phone"]);
  const properties = nonEmptyProperties({
    name: payload.businessName,
    domain,
    website: payload.website,
    phone: payload.phone,
  });

  if (existing) {
    return hubspotRequest(`/crm/v3/objects/companies/${existing.id}`, {
      method: "PATCH",
      body: { properties },
    });
  }

  return hubspotRequest("/crm/v3/objects/companies", {
    method: "POST",
    body: { properties },
  });
}

async function ensureWebsiteLeadPipeline() {
  const pipeline = await hubspotRequest(`/crm/v3/pipelines/deals/${WEBSITE_PIPELINE_ID}`);
  const prospectStage = pipeline.stages?.find((stage) => stage.label === WEBSITE_LEAD_STAGE_LABEL);
  if (!prospectStage) throw new Error(`HubSpot pipeline is missing the ${WEBSITE_LEAD_STAGE_LABEL} stage`);
  return pipeline;
}

async function findOrCreateDeal(payload, pipeline) {
  const leadName = payload.businessName || payload.name || payload.email;
  const dealName = `${leadName} - Website Automation Audit`;
  const existing = await searchObject(
    "deals",
    [
      { propertyName: "dealname", operator: "EQ", value: dealName },
      { propertyName: "pipeline", operator: "EQ", value: pipeline.id },
    ],
    ["dealname", "pipeline", "dealstage"],
  );
  if (existing) return existing;

  const targetStage = pipeline.stages?.find((stage) => stage.label === WEBSITE_LEAD_STAGE_LABEL);
  if (!targetStage) throw new Error(`Website lead pipeline is missing the ${WEBSITE_LEAD_STAGE_LABEL} stage`);

  return hubspotRequest("/crm/v3/objects/deals", {
    method: "POST",
    body: {
      properties: {
        dealname: dealName,
        pipeline: pipeline.id,
        dealstage: targetStage.id,
        description: payload.manualTask,
      },
    },
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function createLeadNote(payload) {
  const lines = [
    "<p><strong>WNYAutomation.com workflow-audit request</strong></p>",
    "<ul>",
    `<li><strong>Manual task:</strong> ${escapeHtml(payload.manualTask)}</li>`,
    `<li><strong>Name:</strong> ${escapeHtml(payload.name || "Not provided")}</li>`,
    `<li><strong>Email:</strong> ${escapeHtml(payload.email)}</li>`,
    `<li><strong>Phone:</strong> ${escapeHtml(payload.phone || "Not provided")}</li>`,
    `<li><strong>Business:</strong> ${escapeHtml(payload.businessName || "Not provided")}</li>`,
    `<li><strong>Industry:</strong> ${escapeHtml(payload.industry || "Not provided")}</li>`,
    `<li><strong>Website:</strong> ${escapeHtml(payload.website || "Not provided")}</li>`,
    `<li><strong>Source page:</strong> ${escapeHtml(payload.pageUrl || payload.source || "website")}</li>`,
    `<li><strong>Submitted:</strong> ${escapeHtml(payload.submittedAt || new Date().toISOString())}</li>`,
    "</ul>",
  ];

  return hubspotRequest("/crm/v3/objects/notes", {
    method: "POST",
    body: {
      properties: {
        hs_timestamp: payload.submittedAt || new Date().toISOString(),
        hs_note_body: lines.join(""),
      },
    },
  });
}

async function associate(fromType, fromId, toType, toId) {
  if (!fromId || !toId) return;
  await hubspotRequest(`/crm/v4/objects/${fromType}/${fromId}/associations/default/${toType}/${toId}`, {
    method: "PUT",
  });
}

async function syncLeadToHubSpot(payload) {
  if (!isConfigured()) return { configured: false, synced: false };

  let pipeline = null;
  let pipelineBlocked = false;
  try {
    pipeline = await ensureWebsiteLeadPipeline();
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("API_LIMIT") || message.includes("limit of 1 deal pipelines")) {
      // HubSpot Free/Starter accounts can be limited to one deal pipeline.
      // Preserve the lead as a contact/company/note without mixing WNY records
      // into an unrelated existing pipeline.
      pipelineBlocked = true;
    } else {
      throw error;
    }
  }

  const [contact, company] = await Promise.all([
    upsertContact(payload),
    upsertCompany(payload),
  ]);
  const deal = pipeline ? await findOrCreateDeal(payload, pipeline) : null;
  const note = await createLeadNote(payload);

  const associations = [
    ["notes", note.id, "contacts", contact.id],
  ];
  if (deal) {
    associations.push(
      ["contacts", contact.id, "deals", deal.id],
      ["notes", note.id, "deals", deal.id],
    );
  }
  if (company) {
    associations.push(["contacts", contact.id, "companies", company.id], ["notes", note.id, "companies", company.id]);
    if (deal) associations.push(["companies", company.id, "deals", deal.id]);
  }

  await Promise.all(associations.map((args) => associate(...args)));

  return {
    configured: true,
    synced: true,
    contactId: contact.id,
    companyId: company?.id || null,
    dealId: deal?.id || null,
    noteId: note.id,
    pipelineId: pipeline?.id || null,
    pipelineBlocked,
  };
}

module.exports = {
  WEBSITE_PIPELINE_LABEL,
  isConfigured,
  verifyHubSpotConnection,
  syncLeadToHubSpot,
};
