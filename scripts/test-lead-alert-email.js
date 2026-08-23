const assert = require("node:assert/strict");

process.env.GMAIL_OAUTH_CLIENT_ID = "client-id";
process.env.GMAIL_OAUTH_CLIENT_SECRET = "client-secret";
process.env.GMAIL_OAUTH_REFRESH_TOKEN = "refresh-token";
process.env.GMAIL_FROM_EMAIL = "ethan@wnyautomation.com";
process.env.LEAD_ALERT_EMAIL = "ethan@wnyautomation.com";
process.env.HUBSPOT_PORTAL_ID = "246158782";

const calls = [];
global.fetch = async (url, options = {}) => {
  calls.push({ url, options });
  if (url === "https://oauth2.googleapis.com/token") {
    return Response.json({ access_token: "access-token", token_type: "Bearer", expires_in: 3600 });
  }
  if (url === "https://gmail.googleapis.com/gmail/v1/users/me/profile") {
    return Response.json({ emailAddress: "ethan@wnyautomation.com" });
  }
  if (url === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send") {
    return Response.json({ id: "message-1", threadId: "thread-1" });
  }
  throw new Error(`Unexpected request: ${url}`);
};

const {
  sendLeadAlertEmail,
  verifyEmailConnection,
} = require("../src/server/lead-alert-email");

(async () => {
  const health = await verifyEmailConnection();
  assert.deepEqual(health, {
    configured: true,
    connected: true,
    sender: "ethan@wnyautomation.com",
    recipient: "ethan@wnyautomation.com",
  });

  const result = await sendLeadAlertEmail(
    {
      submittedAt: "2026-08-21T20:00:00.000Z",
      name: "Example Owner",
      email: "owner@example.com",
      phone: "716-555-0100",
      businessName: "Example WNY Business",
      website: "https://example.com",
      industry: "Contractor",
      manualTask: "We manually follow up with every <website> lead.",
      pageUrl: "https://wnyautomation.com/services/automated-lead-follow-up",
      pageTitle: "Automated Lead Follow-Up | WNY Business Automation",
      conversionPath: "service-page-form",
      formVariant: "standard",
    },
    { dealId: "deal-123", synced: true },
  );

  assert.equal(result.sent, true);
  assert.equal(result.messageId, "message-1");
  assert.equal(result.recipient, "ethan@wnyautomation.com");
  assert.equal(result.subject, "New website inquiry - Example Owner");

  const sendCall = calls.find((call) => call.url.endsWith("/users/me/messages/send"));
  const raw = JSON.parse(sendCall.options.body).raw;
  const decoded = Buffer.from(raw, "base64url").toString("utf8");
  assert.match(decoded, /From: WNY Business Automation Website <ethan@wnyautomation\.com>/);
  assert.match(decoded, /To: ethan@wnyautomation\.com/);
  assert.match(decoded, /Reply-To: owner@example\.com/);
  assert.match(decoded, /New website inquiry - Example Owner/);
  assert.match(decoded, /https:\/\/wnyautomation\.com\/services\/automated-lead-follow-up/);
  assert.match(decoded, /Example WNY Business/);
  assert.match(decoded, /We manually follow up with every &lt;website&gt; lead\./);
  assert.match(decoded, /record\/0-3\/deal-123/);

  console.log("Website lead email alert unit test passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
