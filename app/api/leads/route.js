import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { insertLead } = require("../../../src/server/lead-store");
const { clean } = require("../../../src/lib/slugs");

export const dynamic = "force-dynamic";

function normalizeLeadPayload(body, request) {
  const businessName = clean(body.businessName || body.business);
  const manualTask = clean(body.manualTask || body.task);

  return {
    eventType: "lead",
    submittedAt: clean(body.submittedAt) || new Date().toISOString(),
    name: clean(body.name),
    email: clean(body.email),
    phone: clean(body.phone),
    businessName,
    business: businessName,
    website: clean(body.website),
    industry: clean(body.industry),
    manualTask,
    task: manualTask,
    source: clean(body.source || body.pageSource || "website"),
    pageUrl: clean(body.pageUrl),
    pageTitle: clean(body.pageTitle),
    utmSource: clean(body.utmSource),
    utmMedium: clean(body.utmMedium),
    utmCampaign: clean(body.utmCampaign),
    userAgent: clean(body.userAgent || request.headers.get("user-agent")),
    companyWebsite: clean(body.companyWebsite),
    formVariant: clean(body.formVariant),
    conversionPath: clean(body.conversionPath),
    detailFieldsProvided: clean(body.detailFieldsProvided),
  };
}

function hasDurableLeadDestination() {
  return Boolean(process.env.DATABASE_URL?.trim() || process.env.N8N_LEAD_WEBHOOK_URL?.trim());
}

function validateLeadPayload(payload) {
  const missing = [];

  if (!payload.email) missing.push("email");
  if (!payload.manualTask) missing.push("manualTask");

  return missing;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const payload = normalizeLeadPayload(body || {}, request);

  if (payload.companyWebsite) {
    return Response.json({ ok: true, configured: hasDurableLeadDestination() });
  }

  const missingFields = validateLeadPayload(payload);
  if (missingFields.length) {
    return Response.json(
      {
        ok: false,
        message: "Please include an email and the manual task you want reviewed.",
        missingFields,
      },
      { status: 400 },
    );
  }

  if (!hasDurableLeadDestination() && process.env.NODE_ENV === "production") {
    return Response.json(
      {
        ok: false,
        configured: false,
        message: "Lead capture is not configured. Please email us directly.",
      },
      { status: 503 },
    );
  }

  try {
    await insertLead(payload);

    if (process.env.N8N_LEAD_WEBHOOK_URL) {
      const response = await fetch(process.env.N8N_LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    }

    return Response.json({
      ok: true,
      configured: hasDurableLeadDestination(),
      message: "Thanks - WNY Automation Co will review your workflow and send back a few practical automation ideas.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Something went wrong. Please try again or email us directly.",
      },
      { status: 502 },
    );
  }
}
