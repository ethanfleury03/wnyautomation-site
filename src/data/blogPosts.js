// Static published blog posts and fallback content for WNYAutomation.com.
// Each post lives in its own folder under public/assets/blog/<date>-<slug>/.
// Expected folder contents: metadata.json, body.md, featured.png, and any future post-specific assets.

const fs = require("node:fs");
const path = require("node:path");

const blogRoot = path.join(process.cwd(), "public", "assets", "blog");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadBlogPosts() {
  if (!fs.existsSync(blogRoot)) return [];

  return fs
    .readdirSync(blogRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const folderPath = path.join(blogRoot, entry.name);
      const metadataPath = path.join(folderPath, "metadata.json");
      const bodyPath = path.join(folderPath, "body.md");

      if (!fs.existsSync(metadataPath) || !fs.existsSync(bodyPath)) {
        return null;
      }

      return {
        ...readJson(metadataPath),
        body: fs.readFileSync(bodyPath, "utf8").trim(),
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      const leftDate = left.publishDate || left.publish_date || "";
      const rightDate = right.publishDate || right.publish_date || "";
      return rightDate.localeCompare(leftDate);
    });
}

module.exports = loadBlogPosts();
