const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

process.env.NEXT_PUBLIC_SITE_URL = "https://wnyautomation.com";
process.env.NEXT_PUBLIC_META_PIXEL_ID = "123456789012345";

const {
  renderLegalPage,
  renderServicesIndex,
  renderWorkflowAuditPage,
} = require("../src/render/pages");
const { inlineMarkdownToHtml } = require("../src/render/html");

const privacy = renderLegalPage("privacy");
assert.match(privacy, /Effective date:<\/strong> August 29, 2026/);
assert.match(privacy, /HubSpot CRM/);
assert.match(privacy, /Google Analytics/);
assert.match(privacy, /Meta Pixel/);
assert.match(privacy, /expire after 24 hours/);
assert.doesNotMatch(privacy, /placeholder|Review before launch/i);

const services = renderServicesIndex();
assert.match(services, /<title>Automation and Website Services for Buffalo Small Businesses \| WNY Business Automation<\/title>/);
assert.doesNotMatch(services, /WNY Automation Co/);

const audit = renderWorkflowAuditPage();
assert.match(audit, /connect\.facebook\.net\/en_US\/fbevents\.js/);
assert.match(audit, /fbq\('track', 'PageView'\)/);
assert.match(audit, /fbq\('track', 'ViewContent'/);
assert.match(audit, /facebook\.com\/tr\?id=123456789012345&amp;ev=PageView/);

const browserScript = fs.readFileSync(path.join(__dirname, "..", "public", "script.js"), "utf8");
const layoutSource = fs.readFileSync(path.join(__dirname, "..", "src", "render", "layout.js"), "utf8");
const serviceWorker = fs.readFileSync(path.join(__dirname, "..", "public", "sw.js"), "utf8");
const productionFallbackSiteUrl = execFileSync(
  process.execPath,
  ["-e", "process.stdout.write(require('./src/config/business').siteUrl)"],
  {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "" },
    encoding: "utf8",
  },
);
assert.doesNotMatch(browserScript, /wny_automation_leads/);
assert.match(browserScript, /expiresAt: Date\.now\(\) \+ 24 \* 60 \* 60 \* 1000/);
assert.match(browserScript, /window\.fbq\("track", "Lead"/);
assert.match(browserScript, /function scrollToCurrentHashTarget\(\)/);
assert.match(browserScript, /window\.addEventListener\("hashchange", scrollToCurrentHashTarget\)/);
assert.match(browserScript, /target\.scrollIntoView\(\{ block: "start" \}\)/);
assert.match(layoutSource, /const assetVersion = "hash-anchor-20260908b"/);
assert.match(serviceWorker, /const CACHE_NAME = "wny-site-shell-v6-hash-anchor"/);
assert.equal(productionFallbackSiteUrl, "https://wnyautomation.com");

const apostropheLink = inlineMarkdownToHtml(
  "[Knowify's field-to-office guide](https://example.com/report?source=field&view=office)",
);
assert.equal(
  apostropheLink,
  '<a href="https://example.com/report?source=field&amp;view=office">Knowify&#39;s field-to-office guide</a>',
);
assert.doesNotMatch(apostropheLink, /&amp;#39;|&amp;amp;/);

console.log("Marketing readiness checks passed.");
