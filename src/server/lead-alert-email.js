const business = require("../config/business");

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1";

function emailConfig() {
  return {
    clientId: process.env.GMAIL_OAUTH_CLIENT_ID?.trim(),
    clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET?.trim(),
    refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN?.trim(),
    fromEmail: process.env.GMAIL_FROM_EMAIL?.trim() || business.email,
    alertEmail: process.env.LEAD_ALERT_EMAIL?.trim() || business.email,
  };
}

function isConfigured() {
  const config = emailConfig();
  return Boolean(config.clientId && config.clientSecret && config.refreshToken && config.fromEmail && config.alertEmail);
}

async function getAccessToken() {
  const config = emailConfig();
  if (!isConfigured()) throw new Error("Gmail lead-alert credentials are not configured");

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(15000),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.access_token) {
    throw new Error(`Google OAuth token refresh returned ${response.status}`);
  }
  return result.access_token;
}

async function gmailRequest(path, accessToken, { method = "GET", body } = {}) {
  const response = await fetch(`${GMAIL_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Gmail API ${method} ${path} returned ${response.status}`);
  return result;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeHeader(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function base64Url(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function display(value, fallback = "Not provided") {
  const cleaned = String(value || "").trim();
  return cleaned || fallback;
}

function hubspotDealUrl(hubspot = {}) {
  if (!hubspot.dealId) return "";
  const portalId = process.env.HUBSPOT_PORTAL_ID?.trim() || "246158782";
  return `https://app-na2.hubspot.com/contacts/${portalId}/record/0-3/${hubspot.dealId}`;
}

function buildLeadAlertMessage(payload, hubspot = {}) {
  const config = emailConfig();
  const leadName = display(payload.name, payload.email || "Unknown lead");
  const subject = safeHeader(`New website inquiry - ${leadName}`);
  const dealUrl = hubspotDealUrl(hubspot);
  const replyTo = safeHeader(payload.email);

  const body = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#18212b;max-width:680px">
      <h1 style="font-size:22px;margin:0 0 16px">New WNY Business Automation website inquiry</h1>
      <p>A visitor submitted one of the workflow-audit forms on WNYAutomation.com.</p>

      <h2 style="font-size:17px;margin:24px 0 8px">Inquiry</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">Manual task</td><td style="padding:6px 0">${escapeHtml(display(payload.manualTask))}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">Page</td><td style="padding:6px 0"><a href="${escapeHtml(display(payload.pageUrl, business.siteUrl))}">${escapeHtml(display(payload.pageUrl, business.siteUrl))}</a></td></tr>
        <tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">Page title</td><td style="padding:6px 0">${escapeHtml(display(payload.pageTitle))}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">Submitted</td><td style="padding:6px 0">${escapeHtml(display(payload.submittedAt, new Date().toISOString()))}</td></tr>
      </table>

      <h2 style="font-size:17px;margin:24px 0 8px">Contact and company</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">Name</td><td style="padding:6px 0">${escapeHtml(display(payload.name))}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">Email</td><td style="padding:6px 0"><a href="mailto:${escapeHtml(display(payload.email))}">${escapeHtml(display(payload.email))}</a></td></tr>
        <tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">Phone</td><td style="padding:6px 0">${escapeHtml(display(payload.phone))}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">Business</td><td style="padding:6px 0">${escapeHtml(display(payload.businessName))}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">Industry</td><td style="padding:6px 0">${escapeHtml(display(payload.industry))}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">Website</td><td style="padding:6px 0">${escapeHtml(display(payload.website))}</td></tr>
      </table>

      <h2 style="font-size:17px;margin:24px 0 8px">Tracking</h2>
      <p>CTA/form: ${escapeHtml(display(payload.conversionPath))} · Variant: ${escapeHtml(display(payload.formVariant))}</p>
      ${dealUrl ? `<p><a href="${dealUrl}" style="display:inline-block;padding:10px 16px;background:#147d6f;color:white;text-decoration:none;border-radius:6px">Open deal in HubSpot</a></p>` : ""}
    </div>`;

  const headers = [
    `From: WNY Business Automation Website <${safeHeader(config.fromEmail)}>`,
    `To: ${safeHeader(config.alertEmail)}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
  ];
  if (replyTo) headers.push(`Reply-To: ${replyTo}`);

  return {
    subject,
    raw: base64Url(`${headers.join("\r\n")}\r\n\r\n${body}`),
  };
}

async function verifyEmailConnection() {
  if (!isConfigured()) return { configured: false, connected: false };
  const accessToken = await getAccessToken();
  const profile = await gmailRequest("/users/me/profile", accessToken);
  return {
    configured: true,
    connected: true,
    sender: profile.emailAddress || emailConfig().fromEmail,
    recipient: emailConfig().alertEmail,
  };
}

async function sendLeadAlertEmail(payload, hubspot = {}) {
  if (!isConfigured()) return { configured: false, sent: false };
  const accessToken = await getAccessToken();
  const message = buildLeadAlertMessage(payload, hubspot);
  const result = await gmailRequest("/users/me/messages/send", accessToken, {
    method: "POST",
    body: { raw: message.raw },
  });
  return {
    configured: true,
    sent: true,
    messageId: result.id,
    threadId: result.threadId || null,
    subject: message.subject,
    recipient: emailConfig().alertEmail,
  };
}

module.exports = {
  buildLeadAlertMessage,
  isConfigured,
  sendLeadAlertEmail,
  verifyEmailConnection,
};
