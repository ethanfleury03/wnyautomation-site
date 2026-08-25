const answerCategories = [
  { slug: "getting-started", label: "Getting Started", icon: "flag" },
  { slug: "leads-follow-up", label: "Leads & Follow-Up", icon: "users" },
  { slug: "admin-work", label: "Admin Work", icon: "clipboard" },
  { slug: "marketing", label: "Marketing", icon: "megaphone" },
  { slug: "tools-costs", label: "Tools & Costs", icon: "circle-dollar-sign" },
];

const answers = [
  {
    category: "getting-started",
    title: "What should a small business automate first?",
    description: "Start with the repeated handoffs that cost time every week, not the flashiest tool.",
    href: "/blog/first-business-workflow-to-automate",
    keywords: ["first automation", "what to automate", "automation pilot", "small business"],
  },
  {
    category: "leads-follow-up",
    title: "How do I stop leads from slipping through the cracks?",
    description: "A simple intake and follow-up path can make every inquiry easier to track and answer.",
    href: "/services/missed-lead-rescue-system",
    keywords: ["missed leads", "lead follow-up", "lead response", "inquiries"],
  },
  {
    category: "admin-work",
    title: "Which admin tasks are worth automating?",
    description: "Look for forms, reminders, status updates, and copy-and-paste work your team repeats often.",
    href: "/blog/admin-workflow-automation",
    keywords: ["admin tasks", "manual data entry", "repetitive work", "workflow"],
  },
  {
    category: "tools-costs",
    title: "Do I need new software to automate my workflow?",
    description: "Often the best first step is connecting tools you already use before adding another platform.",
    href: "/blog/zapier-vs-custom-automation",
    keywords: ["automation software", "Zapier", "n8n", "custom automation", "existing tools"],
  },
  {
    category: "marketing",
    title: "Can automation help with reviews and referrals?",
    description: "Well-timed requests can help happy customers respond without making outreach feel pushy.",
    href: "/blog/review-request-automation",
    keywords: ["reviews", "referrals", "review requests", "marketing automation"],
  },
  {
    category: "leads-follow-up",
    title: "How much follow-up is too much?",
    description: "Set a helpful cadence that keeps prospects informed while respecting their time.",
    href: "/services/quote-follow-up-system",
    keywords: ["quote follow-up", "follow-up cadence", "estimates", "contractors"],
  },
];

module.exports = {
  answerCategories,
  answers,
};
