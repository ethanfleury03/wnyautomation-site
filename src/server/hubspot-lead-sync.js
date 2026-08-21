const HUBSPOT_BASE_URL = "https://api.hubapi.com";
const WEBSITE_PIPELINE_LABEL = "WNY Automation Website Leads";
const WEBSITE_PIPELINE_STAGES = [
  { label: "New Website Lead", displayOrder: 0, metadata: { probability: "0.10" } },
  { label: "Audit Scheduled", displayOrder: 1, metadata: { probability: "0.30" } },
  { label: "Audit Completed", displayOrder: 2, metadata: { probability: "0.50" } },
  { label: "Proposal Sent", displayOrder: 3, metadata: { probability: "0.70" } },
  { label: "Won", displayOrder: 4, metadata: { probability: "1.00", isClosed: "true" } },
  { label: "Lost / Not Fit", displayOrder: 5, metadata: { probability: "0.00", isClosed: "true" } },
];

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
  const result = await hubspotRequest("/crm/v3/pipelines/deals?archived=false");
  const existing = result.results?.find((pipeline) => pipeline.label === WEBSITE_PIPELINE_LABEL);
  if (existing) return existing;

  return hubspotRequest("/crm/v3/pipelines/deals", {
    method: "POST",
    body: {
      label: WEBSITE_PIPELINE_LABEL,
      displayOrder: 0,
      stages: WEBSITE_PIPELINE_STAGES,
    },
  });
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

  const firstStage = [...(pipeline.stages || [])].sort((a, b) => a.displayOrder - b.displayOrder)[0];
  if (!firstStage) throw new Error("Website lead pipeline has no stages");

  return hubspotRequest("/crm/v3/objects/deals", {
    method: "POST",
    body: {
      properties: {
        dealname: dealName,
        pipeline: pipeline.id,
        dealstage: firstStage.id,
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

  // Verify/create the deal pipeline before writing any contact or company
  // records. This avoids a partial sync when deal permissions are missing.
  const pipeline = await ensureWebsiteLeadPipeline();
  const [contact, company] = await Promise.all([
    upsertContact(payload),
    upsertCompany(payload),
  ]);
  const deal = await findOrCreateDeal(payload, pipeline);
  const note = await createLeadNote(payload);

  const associations = [
    ["contacts", contact.id, "deals", deal.id],
    ["notes", note.id, "contacts", contact.id],
    ["notes", note.id, "deals", deal.id],
  ];
  if (company) {
    associations.push(
      ["contacts", contact.id, "companies", company.id],
      ["companies", company.id, "deals", deal.id],
      ["notes", note.id, "companies", company.id],
    );
  }

  await Promise.all(associations.map((args) => associate(...args)));

  return {
    configured: true,
    synced: true,
    contactId: contact.id,
    companyId: company?.id || null,
    dealId: deal.id,
    noteId: note.id,
    pipelineId: pipeline.id,
  };
}

module.exports = {
  WEBSITE_PIPELINE_LABEL,
  isConfigured,
  verifyHubSpotConnection,
  syncLeadToHubSpot,
};
