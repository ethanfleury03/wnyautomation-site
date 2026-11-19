const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { articleSchema } = require("../src/lib/schema");
const { renderBlogPostPage } = require("../src/render/pages");
const { renderBlogCard } = require("../src/render/components");

const base = { title: "Test post", slug: "test-post", status: "published", publishDate: "2026-11-03", updatedDate: "2026-11-03", body: "Test body" };
const pending = { ...base, firstLiveAt: null };
const pendingSchema = articleSchema(pending);
assert.equal(Object.hasOwn(pendingSchema, "datePublished"), false);
assert.equal(Object.hasOwn(pendingSchema, "dateModified"), false);
function renderedArticle(post) {
  const html = renderBlogPostPage(post);
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  return schemas.find((schema) => schema["@type"] === "Article");
}
assert.deepEqual(renderedArticle(pending), JSON.parse(JSON.stringify(pendingSchema)));
for (const html of [renderBlogPostPage(pending), renderBlogCard(pending)]) {
  assert.match(html, /Editorial date: November 3, 2026/);
}
const confirmed = { ...base, firstLiveAt: "2026-11-19" };
assert.equal(articleSchema(confirmed).datePublished, "2026-11-19");
assert.equal(Object.hasOwn(articleSchema(confirmed), "dateModified"), false);
assert.equal(renderedArticle(confirmed).datePublished, "2026-11-19");
assert.equal(Object.hasOwn(renderedArticle(confirmed), "dateModified"), false);
assert.equal(articleSchema({ ...confirmed, updatedDate: "2026-11-20" }).dateModified, "2026-11-20");
assert.equal(Object.hasOwn(articleSchema({ ...confirmed, updatedDate: "2026-02-30" }), "dateModified"), false);
assert.match(renderBlogPostPage(confirmed), /Editorial date: November 3, 2026/);
for (const bad of ["2026-02-30", "2026-1-01", "", 123, false, "2026-11-19T00:00:00Z"]) {
  assert.throws(() => articleSchema({ ...base, firstLiveAt: bad }), /firstLiveAt/);
}
const legacy = articleSchema(base);
assert.equal(legacy.datePublished, "2026-11-03");
assert.equal(legacy.dateModified, "2026-11-03");
assert.doesNotMatch(renderBlogPostPage(base), /Editorial date:/);
assert.doesNotMatch(renderBlogCard(base), /Editorial date:/);
const databaseLegacy = articleSchema({ ...base, publish_date: "2026-10-01", updated_at: "2026-10-02" });
assert.equal(databaseLegacy.datePublished, "2026-10-01");
assert.equal(databaseLegacy.dateModified, "2026-10-02");

// Exercise the real static loader from disk, not a mock of its metadata spread.
const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-date-loader-"));
try {
  for (const [name, firstLiveAt] of [["pending", null], ["confirmed", "2026-11-19"]]) {
    const folder = path.join(root, "public", "assets", "blog", name);
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, "metadata.json"), JSON.stringify({ ...base, slug: name, firstLiveAt }));
    fs.writeFileSync(path.join(folder, "body.md"), "Body");
  }
  const loader = path.resolve(__dirname, "../src/data/blogPosts.js");
  const child = spawnSync(process.execPath, ["-e", `process.stdout.write(JSON.stringify(require(${JSON.stringify(loader)})))`], { cwd: root, encoding: "utf8" });
  assert.equal(child.status, 0, child.stderr);
  const posts = JSON.parse(child.stdout);
  assert.equal(posts.length, 2);
  assert.equal(posts.find((post) => post.slug === "pending").firstLiveAt, null);
  assert.equal(posts.find((post) => post.slug === "confirmed").firstLiveAt, "2026-11-19");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
console.log("Blog article date tests passed.");
