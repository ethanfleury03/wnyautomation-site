const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const styles = read("public/styles.css");
const offline = read("public/offline.html");
const layoutSource = read("src/render/layout.js");
const componentsSource = read("src/render/components.js");
const htmlSource = read("src/render/html.js");
const serviceWorker = read("public/sw.js");
const manifest = JSON.parse(read("public/manifest.webmanifest"));
const { renderAboutPage, renderHomePage } = require("../src/render/pages");
const { markdownToHtml } = require("../src/render/html");

const approvedHex = new Set([
  "#10251e", "#254d36", "#405525", "#516920", "#547334", "#586354", "#587224",
  "#b4d335", "#d6ff3f", "#e2ff76", "#dbe4b8", "#dce2d0", "#e6f4c2",
  "#e9efcf", "#f0f4e3", "#f0f4e6", "#f6f7ef", "#f8faef", "#fff", "#ffffff",
  "#9f3328", "#fff2ef",
]);
const approvedRgbBases = new Set([
  "0,0,0", "16,37,30", "37,77,54", "64,85,37", "81,105,32", "84,115,52",
  "88,99,84", "88,114,36", "159,51,40", "180,211,53", "214,255,63", "219,228,184",
  "220,226,208", "233,239,207", "243,248,228", "246,247,239", "248,250,239",
  "248,250,240", "255,255,255",
]);

function assertApprovedPalette(css) {
  const hexValues = [...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((match) => match[0].toLowerCase());
  const rgbBases = [...css.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/gi)].map((match) =>
    `${Number(match[1])},${Number(match[2])},${Number(match[3])}`,
  );
  const unapprovedHex = [...new Set(hexValues.filter((value) => !approvedHex.has(value)))];
  const unapprovedRgb = [...new Set(rgbBases.filter((value) => !approvedRgbBases.has(value)))];
  assert.deepEqual(unapprovedHex, [], `Unapproved CSS hex colors: ${unapprovedHex.join(", ")}`);
  assert.deepEqual(unapprovedRgb, [], `Unapproved CSS RGB bases: ${unapprovedRgb.join(", ")}`);
}

function pngDimensions(relativePath) {
  const buffer = fs.readFileSync(path.join(ROOT, relativePath));
  assert.equal(buffer.toString("ascii", 1, 4), "PNG", `${relativePath} must be a PNG`);
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

assertApprovedPalette(styles);
assert.doesNotMatch(styles, /\/assets\/[0-9a-f]{16}\.(?:png|jpe?g|webp|svg|avif)/i);
assert.match(styles, /--ink:\s*#10251e/);
assert.match(styles, /--gold:\s*#d6ff3f/);
assert.match(styles, /\.button-primary\s*\{[^}]*background:\s*var\(--gold\)/s);
assert.match(styles, /\.section\.process-section\s*\{[^}]*background:\s*#e9efcf/s);
assert.match(styles, /\.answer-card\s*\{[^}]*linear-gradient\(var\(--gold\)/s);
assert.doesNotMatch(styles, /Approved WNY rebrand|data-preview-logo|preview-badge|preview-portal|preview-form-warning/);

assert.equal(manifest.background_color, "#f6f7ef");
assert.equal(manifest.theme_color, "#10251e");
assert.match(layoutSource, /const assetVersion = "brand-pine-lime-v1"/);
assert.match(layoutSource, /name="theme-color" content="#10251e"/);
assert.match(serviceWorker, /const CACHE_NAME = "wny-site-shell-v7-brand-pine-lime"/);
assert.match(componentsSource, /\/assets\/ribbon-w\.svg/);
assert.doesNotMatch(componentsSource, /\/assets\/wny-automation-icon\.png/);
assert.match(htmlSource, /style="color:#10251e;text-decoration:none"/);
assert.doesNotMatch(htmlSource, /style="color:#fff;text-decoration:none"/);

for (const asset of [
  "public/assets/ribbon-w.svg",
  "public/assets/wny-automation-icon.svg",
  "public/assets/wny-automation-icon.png",
  "public/assets/site-icon-512.png",
  "public/assets/site-icon-192.png",
  "public/assets/apple-touch-icon.png",
  "public/assets/favicon-32.png",
  "public/favicon.ico",
]) {
  assert.ok(fs.existsSync(path.join(ROOT, asset)), `Missing brand asset ${asset}`);
}
assert.match(read("public/assets/ribbon-w.svg"), /#d6ff3f/i);
assert.match(read("public/assets/wny-automation-icon.svg"), /#10251e/i);
assert.match(read("public/assets/wny-automation-icon.svg"), /#d6ff3f/i);
assert.match(read("public/assets/wny-automation-logo.svg"), /#10251e/i);
assert.match(read("public/assets/wny-automation-logo.svg"), /#d6ff3f/i);
assert.deepEqual(pngDimensions("public/assets/site-icon-512.png"), [512, 512]);
assert.deepEqual(pngDimensions("public/assets/site-icon-192.png"), [192, 192]);
assert.deepEqual(pngDimensions("public/assets/apple-touch-icon.png"), [180, 180]);
assert.deepEqual(pngDimensions("public/assets/favicon-32.png"), [32, 32]);

const home = renderHomePage([]);
const about = renderAboutPage();
assert.match(home, /name="theme-color" content="#10251e"/);
assert.match(home, /src="\/assets\/ribbon-w\.svg"/);
assert.match(home, /href="\/free-workflow-audit#workflow-form"/);
assert.doesNotMatch(home, /mailto:|ethan@wnyautomation\.com|Ethan Fleury/i);
assert.doesNotMatch(about, /Ethan Fleury|ethan@wnyautomation\.com|mailto:/i);
assert.match(about, /WNY Business Automation was built for practical small-business problems/);
assert.match(about, /Founder photo coming soon/);

const articleCta = markdownToHtml("[CTA: Get 3 Automation Ideas](/free-workflow-audit#workflow-form)");
assert.match(articleCta, /style="color:#10251e;text-decoration:none"/);

assert.match(offline, /name="theme-color" content="#10251e"/);
assert.match(offline, /background:\s*#d6ff3f/);
assert.match(offline, /color:\s*#10251e/);

console.log("Brand rebrand regression checks passed.");
