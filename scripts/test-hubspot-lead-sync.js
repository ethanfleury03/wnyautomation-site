const assert = require("node:assert/strict");

process.env.HUBSPOT_ACCESS_TOKEN = "test-token";

const calls = [];
let pipelineLimitMode = false;
function jsonResponse(status, body) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

global.fetch = async (url, options = {}) => {
  const path = new URL(url).pathname + new URL(url).search;
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : null;
  calls.push({ path, method, body });

  if (path.startsWith("/crm/v3/objects/contacts?")) {
    return jsonResponse(200, { results: [{ id: "sample" }] });
  }
  if (path.startsWith("/crm/v3/objects/companies?")) return jsonResponse(200, { results: [] });
  if (path.startsWith("/crm/v3/objects/notes?")) return jsonResponse(200, { results: [] });
  if (path === "/crm/v3/objects/contacts/search") return jsonResponse(200, { results: [] });
  if (path === "/crm/v3/objects/companies/search") return jsonResponse(200, { results: [] });
  if (path === "/crm/v3/objects/deals/search") return jsonResponse(200, { results: [] });
  if (path === "/crm/v3/objects/contacts") return jsonResponse(201, { id: "contact-1", properties: body.properties });
  if (path === "/crm/v3/objects/companies") return jsonResponse(201, { id: "company-1", properties: body.properties });
  if (path === "/crm/v3/pipelines/deals?archived=false") {
    if (pipelineLimitMode) return jsonResponse(200, { results: [] });
    return jsonResponse(200, {
      results: [
        {
          id: "pipeline-1",
          label: "WNY Automation Website Leads",
          stages: [{ id: "stage-1", label: "New Website Lead", displayOrder: 0 }],
        },
      ],
    });
  }
  if (path === "/crm/v3/pipelines/deals" && method === "POST") {
    return jsonResponse(400, {
      status: "error",
      message: "You have reached your limit of 1 deal pipelines.",
      category: "API_LIMIT",
    });
  }
  if (path === "/crm/v3/objects/deals") return jsonResponse(201, { id: "deal-1", properties: body.properties });
  if (path === "/crm/v3/objects/notes") return jsonResponse(201, { id: "note-1", properties: body.properties });
  if (path.startsWith("/crm/v4/objects/")) return jsonResponse(204, null);

  throw new Error(`Unexpected mocked HubSpot request: ${method} ${path}`);
};

const {
  syncLeadToHubSpot,
  verifyHubSpotConnection,
} = require("../src/server/hubspot-lead-sync");

(async () => {
  const health = await verifyHubSpotConnection();
  assert.deepEqual(health, { configured: true, connected: true });

  const result = await syncLeadToHubSpot({
    submittedAt: "2026-08-21T17:29:54.023Z",
    name: "Example Owner",
    email: "owner@example.com",
    phone: "716-555-0100",
    businessName: "Example WNY Business",
    website: "https://www.example.com",
    industry: "Contractor",
    manualTask: "We manually follow up with every website lead.",
    pageUrl: "https://wnyautomation.com/",
  });

  assert.equal(result.synced, true);
  assert.equal(result.contactId, "contact-1");
  assert.equal(result.companyId, "company-1");
  assert.equal(result.dealId, "deal-1");
  assert.equal(result.noteId, "note-1");
  assert.equal(result.pipelineId, "pipeline-1");

  const contactCreate = calls.find((call) => call.path === "/crm/v3/objects/contacts" && call.method === "POST");
  assert.equal(contactCreate.body.properties.email, "owner@example.com");
  assert.equal(contactCreate.body.properties.lifecyclestage, "lead");

  const dealCreate = calls.find((call) => call.path === "/crm/v3/objects/deals" && call.method === "POST");
  assert.equal(dealCreate.body.properties.pipeline, "pipeline-1");
  assert.equal(dealCreate.body.properties.dealstage, "stage-1");

  const associationCalls = calls.filter((call) => call.path.startsWith("/crm/v4/objects/"));
  assert.equal(associationCalls.length, 6);

  pipelineLimitMode = true;
  const callsBeforeFallback = calls.length;
  const fallback = await syncLeadToHubSpot({
    submittedAt: "2026-08-21T18:00:00.000Z",
    name: "Second Owner",
    email: "second@example.com",
    manualTask: "We manually route every request.",
    pageUrl: "https://wnyautomation.com/",
  });
  assert.equal(fallback.synced, true);
  assert.equal(fallback.pipelineBlocked, true);
  assert.equal(fallback.dealId, null);
  assert.equal(fallback.pipelineId, null);
  assert.equal(
    calls.slice(callsBeforeFallback).filter((call) => call.path === "/crm/v3/objects/deals" && call.method === "POST").length,
    0,
  );

  console.log("HubSpot lead sync unit test passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
