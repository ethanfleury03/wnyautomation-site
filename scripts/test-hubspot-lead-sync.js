const assert = require("node:assert/strict");

process.env.HUBSPOT_ACCESS_TOKEN = "test-token";

const calls = [];
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
  if (path === "/crm/v3/pipelines/deals?archived=false") {
    return jsonResponse(200, {
      results: [
        {
          id: "default",
          label: "Sales Pipeline",
          stages: [{ id: "prospect-stage", label: "Prospect", displayOrder: 1 }],
        },
      ],
    });
  }
  if (path === "/crm/v3/objects/contacts/search") return jsonResponse(200, { results: [] });
  if (path === "/crm/v3/objects/companies/search") return jsonResponse(200, { results: [] });
  if (path === "/crm/v3/objects/deals/search") return jsonResponse(200, { results: [] });
  if (path === "/crm/v3/objects/contacts") return jsonResponse(201, { id: "contact-1", properties: body.properties });
  if (path === "/crm/v3/objects/companies") return jsonResponse(201, { id: "company-1", properties: body.properties });
  if (path === "/crm/v3/pipelines/deals/default") {
    return jsonResponse(200, {
      id: "default",
      label: "Sales Pipeline",
      stages: [{ id: "prospect-stage", label: "Prospect", displayOrder: 1 }],
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
  assert.equal(result.pipelineId, "default");

  const contactCreate = calls.find((call) => call.path === "/crm/v3/objects/contacts" && call.method === "POST");
  assert.equal(contactCreate.body.properties.email, "owner@example.com");
  assert.equal(contactCreate.body.properties.lifecyclestage, "lead");

  const dealCreate = calls.find((call) => call.path === "/crm/v3/objects/deals" && call.method === "POST");
  assert.equal(dealCreate.body.properties.pipeline, "default");
  assert.equal(dealCreate.body.properties.dealstage, "prospect-stage");

  const associationCalls = calls.filter((call) => call.path.startsWith("/crm/v4/objects/"));
  assert.equal(associationCalls.length, 6);

  console.log("HubSpot lead sync unit test passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
