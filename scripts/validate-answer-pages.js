const fs = require("node:fs");
const path = require("node:path");
const { markdownToHtml } = require("../src/render/html");

const ROOT = path.resolve(__dirname, "..");
const ANSWERS_ROOT = path.join(ROOT, "public", "assets", "answers");
const STYLES_PATH = path.join(ROOT, "public", "styles.css");
const EXPECTED = new Set([
  "how-to-automate-manual-data-entry-small-business",
  "what-should-small-business-automate-first",
  "ai-for-small-business-without-replacing-employees",
  "small-business-marketing-tasks-to-automate",
  "small-business-workflow-automation-cost",
  "choose-ai-automation-company-buffalo-ny",
  "zapier-vs-make-vs-n8n-vs-custom-automation",
  "stop-missing-leads-after-hours",
  "contractor-quote-follow-up-without-sounding-pushy",
  "do-small-businesses-need-crm-for-automation",
  "contractor-reduce-office-work-without-hiring",
  "ai-improve-small-business-employee-productivity",
  "automate-customer-intake-calls-emails-forms",
  "automate-contractor-field-to-office-job-updates",
]);
const FORBIDDEN = [
  /(?:we|wny business automation) (?:will )?guarantee(?:s|d)? (?:revenue|roi|rankings?|results?|savings?)/i,
  /replace (?:all |your )?(?:employees|staff)/i,
  /fully autonomous business/i,
  /trusted by \d+/i,
  /\d+x (?:growth|revenue|roi)/i,
];

function fail(message) {
  throw new Error(message);
}

function words(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

if (!fs.existsSync(ANSWERS_ROOT)) {
  fail(`Answer pages directory does not exist: ${ANSWERS_ROOT}`);
}

const styles = fs.readFileSync(STYLES_PATH, "utf8");
if (!/\.answer-card\[hidden\]\s*\{[^}]*display:\s*none\s*;/s.test(styles)) {
  fail("Answer search requires .answer-card[hidden] { display: none; } so filtered cards are removed from the grid");
}

const folders = fs.readdirSync(ANSWERS_ROOT, { withFileTypes: true }).filter((entry) => entry.isDirectory());
const found = new Set(folders.map((entry) => entry.name));
for (const slug of EXPECTED) {
  if (!found.has(slug)) fail(`Missing expected answer package: ${slug}`);
}
if (found.size !== EXPECTED.size) {
  fail(`Expected exactly ${EXPECTED.size} answer packages, found ${found.size}: ${[...found].join(", ")}`);
}

for (const folder of folders) {
  const folderPath = path.join(ANSWERS_ROOT, folder.name);
  const metadataPath = path.join(folderPath, "metadata.json");
  const bodyPath = path.join(folderPath, "body.md");
  if (!fs.existsSync(metadataPath) || !fs.existsSync(bodyPath)) fail(`${folder.name}: metadata.json and body.md are required`);

  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  const body = fs.readFileSync(bodyPath, "utf8").trim();
  const renderedBody = markdownToHtml(body);
  const required = ["title", "slug", "metaTitle", "metaDescription", "excerpt", "eyebrow", "author", "reviewer", "primaryPrompt", "directAnswer", "ctaTitle", "ctaLabel", "trustNote"];
  for (const key of required) {
    if (!String(metadata[key] || "").trim()) fail(`${folder.name}: missing ${key}`);
  }
  if (metadata.slug !== folder.name) fail(`${folder.name}: metadata slug must match folder name`);
  if (metadata.metaTitle.length > 65) fail(`${folder.name}: metaTitle exceeds 65 characters`);
  if (metadata.metaDescription.length < 100 || metadata.metaDescription.length > 170) {
    fail(`${folder.name}: metaDescription must be 100-170 characters`);
  }
  const directAnswerWords = words(metadata.directAnswer);
  if (directAnswerWords < 40 || directAnswerWords > 100) fail(`${folder.name}: directAnswer must be 40-100 words; found ${directAnswerWords}`);
  if (!metadata.decisionAid || !metadata.decisionAid.type || !metadata.decisionAid.title) fail(`${folder.name}: decisionAid with type and title is required`);
  if (metadata.decisionAid.type === "table" && (!Array.isArray(metadata.decisionAid.headers) || !Array.isArray(metadata.decisionAid.rows) || metadata.decisionAid.rows.length < 3)) {
    fail(`${folder.name}: table decisionAid requires headers and at least 3 rows`);
  }
  if (["cards", "steps"].includes(metadata.decisionAid.type) && (!Array.isArray(metadata.decisionAid.items) || metadata.decisionAid.items.length < 3)) {
    fail(`${folder.name}: ${metadata.decisionAid.type} decisionAid requires at least 3 items`);
  }
  if (!Array.isArray(metadata.faqs) || metadata.faqs.length < 3) fail(`${folder.name}: at least 3 FAQs are required`);
  if (!Array.isArray(metadata.internalLinks) || metadata.internalLinks.length < 3) fail(`${folder.name}: at least 3 internal links are required`);
  if (body.length < 3500) fail(`${folder.name}: body.md is too thin (${body.length} characters)`);
  if (/^#\s+/m.test(body)) fail(`${folder.name}: body.md must not include an H1`);
  if (!/^##\s+/m.test(body)) fail(`${folder.name}: body.md must include H2 sections`);
  if (!body.toLowerCase().includes(metadata.directAnswer.slice(0, 60).toLowerCase())) {
    fail(`${folder.name}: direct answer from metadata must appear visibly near the page body`);
  }
  if (/&amp;#(?:39|34|96);|&amp;amp;|&amp;apos;/.test(renderedBody)) {
    fail(`${folder.name}: rendered body contains a double-escaped HTML entity`);
  }
  if (/\[[^\]]+\]\((?:https?:\/\/|\/|#)[^)]+\)/.test(renderedBody)) {
    fail(`${folder.name}: rendered body exposes unparsed Markdown link syntax`);
  }
  for (const pattern of FORBIDDEN) {
    if (pattern.test(`${JSON.stringify(metadata)}\n${body}`)) fail(`${folder.name}: forbidden unsupported-claim pattern ${pattern}`);
  }
}

console.log(`Answer page package validation passed: ${folders.length} pages.`);
