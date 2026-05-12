const business = require("../config/business");
const { renderMeta, renderTrackingScripts } = require("../lib/seo");
const { escapeScriptJson, jsonScript } = require("./html");
const { renderFooter, renderHeader } = require("./components");

function renderPage({
  meta,
  schemas = [],
  body,
  bodyClass = "",
  services = [],
  industries = [],
}) {
  const schemaScripts = schemas
    .filter(Boolean)
    .map((schema) => `<script type="application/ld+json">${escapeScriptJson(JSON.stringify(schema))}</script>`)
    .join("\n");

  const publicConfig = {
    bookingLink: business.bookingLink,
    businessEmail: business.email,
    leadEndpoint: "/api/leads",
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${renderMeta(meta)}
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
    <link rel="stylesheet" href="/styles.css" />
    ${schemaScripts}
    ${renderTrackingScripts()}
    <script>window.WNY_AUTOMATION_CONFIG = ${jsonScript(publicConfig)};</script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" defer></script>
    <script src="/script.js" defer></script>
  </head>
  <body${bodyClass ? ` class="${bodyClass}"` : ""}>
    ${renderHeader({ currentPath: meta?.path })}
    ${body}
    ${renderFooter({ services, industries })}
  </body>
</html>`;
}

module.exports = {
  renderPage,
};
