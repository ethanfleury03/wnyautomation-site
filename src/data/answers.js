const fs = require("node:fs");
const path = require("node:path");

const answerRoot = path.join(process.cwd(), "public", "assets", "answers");

const answerCategories = [
  { slug: "getting-started", label: "Getting Started", icon: "flag" },
  { slug: "leads-follow-up", label: "Leads & Follow-Up", icon: "users" },
  { slug: "admin-work", label: "Admin Work", icon: "clipboard" },
  { slug: "marketing", label: "Marketing", icon: "megaphone" },
  { slug: "tools-costs", label: "Tools & Costs", icon: "circle-dollar-sign" },
];

function loadAnswerPages() {
  if (!fs.existsSync(answerRoot)) return [];

  return fs
    .readdirSync(answerRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const folderPath = path.join(answerRoot, entry.name);
      const metadataPath = path.join(folderPath, "metadata.json");
      const bodyPath = path.join(folderPath, "body.md");
      if (!fs.existsSync(metadataPath) || !fs.existsSync(bodyPath)) return null;

      return {
        ...JSON.parse(fs.readFileSync(metadataPath, "utf8")),
        body: fs.readFileSync(bodyPath, "utf8").trim(),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.title.localeCompare(right.title));
}

const answerPages = loadAnswerPages();

const answers = [
  {
    category: "admin-work",
    title: "How can a small business automate repetitive manual data entry?",
    description: "Connect forms, email, spreadsheets, and business systems while keeping uncertain information human-reviewed.",
    href: "/answers/how-to-automate-manual-data-entry-small-business",
    keywords: ["manual data entry", "copy and paste", "forms", "CRM", "spreadsheets"],
  },
  {
    category: "admin-work",
    title: "How can a contractor reduce office work without hiring another employee?",
    description: "Remove repeated office handoffs while keeping pricing, safety, scope, customer relationships, and staffing decisions human-owned.",
    href: "/answers/contractor-reduce-office-work-without-hiring",
    keywords: ["contractor office automation", "back-office", "admin work", "trades", "employee capacity", "Buffalo contractors"],
  },
  {
    category: "getting-started",
    title: "What should a small business automate first?",
    description: "Use a practical scorecard to choose one clear, repeated, low-risk workflow before buying more tools.",
    href: "/answers/what-should-small-business-automate-first",
    keywords: ["first automation", "what to automate", "automation pilot", "small business"],
  },
  {
    category: "getting-started",
    title: "Can AI help without replacing employees?",
    description: "Use AI to prepare, summarize, route, and remind while people keep judgment, relationships, and approvals.",
    href: "/answers/ai-for-small-business-without-replacing-employees",
    keywords: ["AI employees", "human review", "employee trust", "small business AI"],
  },
  {
    category: "marketing",
    title: "What marketing tasks can a small business automate without an agency?",
    description: "Automate repeatable handoffs and reminders without handing brand strategy or sensitive replies to a machine.",
    href: "/answers/small-business-marketing-tasks-to-automate",
    keywords: ["marketing automation", "without agency", "reviews", "lead follow-up", "content"],
  },
  {
    category: "tools-costs",
    title: "How much does workflow automation cost for a small business?",
    description: "Understand software, setup, usage, maintenance, and support costs before choosing a build approach.",
    href: "/answers/small-business-workflow-automation-cost",
    keywords: ["automation cost", "pricing", "software cost", "maintenance", "small business"],
  },
  {
    category: "tools-costs",
    title: "How do I choose an AI automation company in Buffalo or WNY?",
    description: "Compare providers by workflow fit, ownership, safety, support, and proof instead of marketing claims.",
    href: "/answers/choose-ai-automation-company-buffalo-ny",
    keywords: ["Buffalo automation company", "WNY AI consultant", "choose provider", "buyer guide"],
  },
  {
    category: "tools-costs",
    title: "Should I use Zapier, Make, n8n, or custom automation?",
    description: "Choose based on workflow complexity, ownership, maintenance, integrations, and the team operating it.",
    href: "/answers/zapier-vs-make-vs-n8n-vs-custom-automation",
    keywords: ["Zapier", "Make", "n8n", "custom automation", "tool comparison"],
  },
  {
    category: "leads-follow-up",
    title: "How can my business stop missing leads after hours?",
    description: "Acknowledge inquiries, capture useful details, and create a clear human follow-up path for the next step.",
    href: "/answers/stop-missing-leads-after-hours",
    keywords: ["after hours leads", "missed calls", "lead response", "follow-up"],
  },
  {
    category: "leads-follow-up",
    title: "How can contractors automate quote follow-up without sounding pushy?",
    description: "Use polite reminders, stop when customers reply, and keep personal judgment in the sales conversation.",
    href: "/answers/contractor-quote-follow-up-without-sounding-pushy",
    keywords: ["contractor quote follow-up", "estimate reminders", "not pushy", "open quotes"],
  },
  {
    category: "leads-follow-up",
    title: "Do I need a CRM before I automate lead follow-up?",
    description: "A structured spreadsheet or task list may be enough until shared ownership and history justify a CRM.",
    href: "/answers/do-small-businesses-need-crm-for-automation",
    keywords: ["need CRM", "lead follow-up", "spreadsheet", "CRM automation"],
  },
];

module.exports = {
  answerCategories,
  answerPages,
  answers,
};
