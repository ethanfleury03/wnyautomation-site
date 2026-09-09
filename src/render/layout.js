const business = require("../config/business");
const { renderMeta, renderTrackingScripts } = require("../lib/seo");
const { escapeScriptJson, jsonScript } = require("./html");
const { renderFooter, renderHeader } = require("./components");

const assetVersion = "hash-anchor-20260908b";

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
    businessEmail: business.email,
    leadEndpoint: "/api/leads",
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    ${renderMeta(meta)}
    <meta name="theme-color" content="#147d6f" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="${business.shortName}" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="stylesheet" href="/styles.css?v=${assetVersion}" />
    ${schemaScripts}
    ${renderTrackingScripts(meta?.path || "/")}
    <script>window.WNY_AUTOMATION_CONFIG = ${jsonScript(publicConfig)};</script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" defer></script>
    <script src="/script.js?v=${assetVersion}" defer></script>
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
