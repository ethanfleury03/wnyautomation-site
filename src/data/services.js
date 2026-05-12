// Edit this file to add, remove, or revise service pages.
// Each object becomes a public page at /services/{slug}.

const defaultTools = ["Website forms", "Email", "Calendars", "CRM", "Spreadsheets", "SMS tools", "n8n or Zapier"];

const services = [
  service({
    slug: "missed-lead-rescue-system",
    title: "Missed Lead Rescue System",
    h1: "Missed Lead Rescue System for Small Businesses",
    primaryKeyword: "missed lead rescue system",
    shortDescription: "Catch website forms, missed calls, and new inquiries faster with first-response texts or emails and clear lead alerts.",
    painPoints: [
      "Website forms sit in an inbox too long",
      "Calls get missed while the team is working",
      "After-hours inquiries wait until the next day",
      "New leads are not tracked in one place",
      "Owners cannot see which opportunities still need follow-up",
    ],
    exampleWorkflow:
      "A form submission or missed call triggers a quick first response, saves the lead details, alerts the owner or team, and creates a follow-up reminder.",
    relatedServices: ["quote-follow-up-system", "intake-to-task-automation", "website-faq-lead-capture-assistant"],
    relatedIndustries: ["hvac-companies", "roofing-companies", "home-service-businesses"],
    toolsItCanConnect: ["Website forms", "Call tracking or missed-call alerts", "Email", "SMS tools", "CRM", "Spreadsheets", "n8n or Zapier"],
    benefits: [
      "Faster response to new opportunities",
      "Cleaner lead alerts for owners and staff",
      "Less dependence on inbox watching",
      "Better visibility into unanswered leads",
    ],
  }),
  service({
    slug: "quote-follow-up-system",
    title: "Quote Follow-Up System",
    h1: "Quote Follow-Up System for Open Estimates",
    primaryKeyword: "quote follow-up system",
    shortDescription: "Follow up on open estimates so good opportunities do not die quietly in the inbox.",
    painPoints: [
      "Quotes go quiet after they are sent",
      "Estimate follow-up depends on memory",
      "Owners do not know which quotes are stale",
      "Customers need a simple way to ask next-step questions",
      "Potential revenue gets lost because no one follows up",
    ],
    exampleWorkflow:
      "A sent quote starts a friendly follow-up sequence, tracks whether the customer replied, and creates a task when a human should step in.",
    relatedServices: ["missed-lead-rescue-system", "intake-to-task-automation", "appointment-review-reminder-follow-up"],
    relatedIndustries: ["roofing-companies", "contractors", "insurance-agencies"],
    toolsItCanConnect: ["Email", "CRM", "Spreadsheets", "Quote tools", "SMS tools", "Calendars", "n8n or Zapier"],
    benefits: [
      "More consistent follow-up on open estimates",
      "Clearer view of quotes that need attention",
      "Less manual reminder tracking",
      "Better timing for customer check-ins",
    ],
  }),
  service({
    slug: "intake-to-task-automation",
    title: "Intake-to-Task Automation",
    h1: "Intake-to-Task Automation for Local Business Workflows",
    primaryKeyword: "intake-to-task automation",
    shortDescription: "Turn forms, emails, and requests into organized tasks with owners, due dates, and clear next steps.",
    painPoints: [
      "Requests arrive from too many places",
      "Staff copy details into spreadsheets by hand",
      "Tasks do not have a clear owner",
      "Important requests get buried in email",
      "Managers cannot tell what is waiting on a next step",
    ],
    exampleWorkflow:
      "A form, email, or request is summarized, categorized, routed to the right person, and turned into a task with due date guidance.",
    relatedServices: ["missed-lead-rescue-system", "quote-follow-up-system", "appointment-review-reminder-follow-up"],
    relatedIndustries: ["property-managers", "contractors", "professional-services"],
    toolsItCanConnect: ["Website forms", "Email", "Task boards", "CRM", "Spreadsheets", "Calendars", "n8n or Zapier"],
    benefits: [
      "Cleaner handoffs between people",
      "Less copying and pasting",
      "Clearer task ownership",
      "Fewer requests lost in inboxes",
    ],
  }),
  service({
    slug: "website-faq-lead-capture-assistant",
    title: "Website FAQ + Lead Capture Assistant",
    h1: "Website FAQ and Lead Capture Assistant",
    primaryKeyword: "website FAQ lead capture assistant",
    shortDescription: "Answer common website questions and route real prospects to you with clean contact details.",
    painPoints: [
      "Visitors leave before contacting the business",
      "Staff answer the same basic questions repeatedly",
      "After-hours questions wait until morning",
      "Contact forms do not collect enough detail",
      "Real leads are mixed in with low-priority questions",
    ],
    exampleWorkflow:
      "A website visitor asks a common question, gets an approved answer, and is asked for contact details when the conversation should become a lead.",
    relatedServices: ["missed-lead-rescue-system", "website-creation", "intake-to-task-automation"],
    relatedIndustries: ["restaurants", "med-spas", "dental-offices"],
    toolsItCanConnect: ["Website", "Approved FAQ content", "Email", "CRM", "Spreadsheets", "SMS tools", "n8n or Zapier"],
    benefits: [
      "Faster answers for common questions",
      "More useful website lead capture",
      "Cleaner handoffs to a human",
      "Less repetitive front-desk communication",
    ],
  }),
  service({
    slug: "appointment-review-reminder-follow-up",
    title: "Appointment, Review, and Reminder Follow-Up",
    h1: "Appointment, Review, and Reminder Follow-Up",
    primaryKeyword: "appointment review reminder follow-up",
    shortDescription: "Send the simple follow-ups customers expect: appointment reminders, review requests, and check-in messages.",
    painPoints: [
      "Customers forget appointments or next steps",
      "Staff manually send reminders",
      "Happy customers are not asked for reviews",
      "Follow-up timing is inconsistent",
      "Small customer touches depend on someone remembering",
    ],
    exampleWorkflow:
      "A booked appointment triggers a reminder, a completed visit triggers a polite review request, and the owner can see which follow-ups were sent.",
    relatedServices: ["missed-lead-rescue-system", "quote-follow-up-system", "website-faq-lead-capture-assistant"],
    relatedIndustries: ["home-service-businesses", "med-spas", "dental-offices"],
    toolsItCanConnect: ["Calendars", "Email", "SMS tools", "CRM", "Spreadsheets", "Review links", "n8n or Zapier"],
    benefits: [
      "Fewer forgotten reminders",
      "More consistent review requests",
      "Less front-desk follow-up work",
      "Better customer communication after the first contact",
    ],
  }),
  service({
    slug: "website-creation",
    title: "Website Creation",
    h1: "Website Creation for Local Small Businesses",
    primaryKeyword: "website creation for small business",
    shortDescription: "Build a clear, practical website that explains what you do, captures leads, and gives customers an easy next step.",
    painPoints: [
      "The current website is outdated or unclear",
      "Customers cannot quickly understand the offer",
      "Lead forms are weak or hard to find",
      "The site does not support follow-up workflows",
      "Owners need a simple web presence without a giant agency process",
    ],
    exampleWorkflow:
      "A local business gets a focused website with service pages, contact paths, basic SEO structure, and lead forms that can connect into follow-up automations later.",
    relatedServices: ["website-faq-lead-capture-assistant", "missed-lead-rescue-system", "blog-schedules"],
    relatedIndustries: ["home-service-businesses", "contractors", "local-retail-businesses"],
    toolsItCanConnect: ["Website forms", "Analytics", "Search Console", "Email", "Calendars", "CRM", "n8n or Zapier"],
    idealFor: [
      "New local businesses",
      "Owners with outdated websites",
      "Service businesses that need better lead capture",
      "Teams that want a practical website before adding automation",
    ],
    benefits: [
      "Clearer first impression",
      "Better lead capture paths",
      "More useful service pages",
      "A stronger base for future automation",
    ],
    howItWorks: [
      "We clarify the pages, offer, and lead capture path.",
      "We build a focused website around the services customers need to understand.",
      "We connect forms and next steps so the site can support future follow-up.",
    ],
    faqs: [
      {
        question: "What does website creation include?",
        answer:
          "It includes planning the core pages, writing clear service-focused copy, building the site, and setting up practical contact or lead capture paths.",
      },
      {
        question: "Can the website connect to automations later?",
        answer:
          "Yes. The site can be built with forms and tracking paths that make lead follow-up, FAQ assistants, and intake workflows easier to add later.",
      },
      {
        question: "Is this for large custom web apps?",
        answer:
          "No. This is focused website creation for local businesses that need a clear, useful web presence without unnecessary complexity.",
      },
      {
        question: "How should we start?",
        answer:
          "Start by identifying the pages customers need most: home, services, contact, FAQs, and any local or industry pages that support search.",
      },
    ],
  }),
  service({
    slug: "blog-schedules",
    title: "Blog Schedules",
    h1: "Blog Schedules for Local Business Websites",
    primaryKeyword: "blog schedules for small business",
    shortDescription: "Plan a realistic blog calendar with topics, publish dates, and reminders so content does not depend on last-minute ideas.",
    painPoints: [
      "The business wants blog content but has no plan",
      "Topics are chosen randomly",
      "Publishing falls behind after a few posts",
      "Local SEO ideas are not organized",
      "Owners need a simple schedule they can actually follow",
    ],
    exampleWorkflow:
      "A business gets a simple content calendar with service topics, local search ideas, draft prompts, target publish dates, and reminders to keep the schedule moving.",
    relatedServices: ["website-creation", "website-faq-lead-capture-assistant", "intake-to-task-automation"],
    relatedIndustries: ["professional-services", "home-service-businesses", "local-retail-businesses"],
    toolsItCanConnect: ["Content calendar", "Google Sheets", "Docs", "Website CMS", "Email reminders", "n8n or Zapier"],
    idealFor: [
      "Local businesses building search visibility",
      "Owners who need a realistic publishing plan",
      "Service businesses with repeat customer questions",
      "Teams that want content ideas organized before writing",
    ],
    benefits: [
      "A clearer publishing plan",
      "Better topic organization",
      "More consistent website activity",
      "Content ideas tied to real customer questions",
    ],
    howItWorks: [
      "We identify the services, questions, and local topics worth covering.",
      "We organize those ideas into a practical publishing calendar.",
      "We set up reminders or a simple tracking sheet so the schedule is easy to follow.",
    ],
    faqs: [
      {
        question: "What does a blog schedule include?",
        answer:
          "It includes topic ideas, recommended publish dates, target services or service areas, and a simple way to track what is planned, drafted, and published.",
      },
      {
        question: "Is this the same as a full content agency?",
        answer:
          "No. This is a practical blog planning service for small businesses that need structure before committing to a larger content program.",
      },
      {
        question: "Can the schedule connect to automation?",
        answer:
          "Yes. Reminders, calendar tasks, draft checklists, and publishing workflows can be connected when the process is ready.",
      },
      {
        question: "How should we start?",
        answer:
          "Start with the questions customers already ask and the services or service areas you want the website to be known for.",
      },
    ],
  }),
];

function service(overrides) {
  return {
    metaTitle: overrides.metaTitle || `${overrides.title} | WNY Automation Co`,
    metaDescription:
      overrides.metaDescription ||
      `${overrides.shortDescription} Built for Buffalo, Niagara, and Western New York small businesses.`,
    secondaryKeywords: overrides.secondaryKeywords || [
      "small business automation",
      "AI workflow automation",
      "Buffalo business automation",
    ],
    howItWorks: overrides.howItWorks || [
      "Tell us the manual task that wastes time.",
      "We map the current workflow, tools, and handoffs.",
      "We recommend or build one focused automation pilot.",
    ],
    toolsItCanConnect: overrides.toolsItCanConnect || defaultTools,
    idealFor: overrides.idealFor || [
      "Small business owners",
      "Local service teams",
      "Busy offices",
      "Operators who want less manual follow-up",
    ],
    benefits: overrides.benefits || [
      "Faster response times",
      "Less repetitive admin work",
      "Cleaner task ownership",
      "Better visibility into follow-up",
    ],
    relatedIndustries: overrides.relatedIndustries || [
      "home-service-businesses",
      "contractors",
      "professional-services",
    ],
    ctaLabel: overrides.ctaLabel || "Get My Free Automation Ideas",
    faqs: overrides.faqs || defaultServiceFaqs(overrides.title),
    ...overrides,
  };
}

function defaultServiceFaqs(serviceTitle) {
  return [
    {
      question: `What does ${serviceTitle.toLowerCase()} include?`,
      answer:
        "It starts with mapping one repeatable workflow, then identifying the smallest useful automation that can save time or reduce missed follow-up.",
    },
    {
      question: "Do we need to replace our current tools?",
      answer:
        "Usually not. WNY Automation Co looks at your current website, forms, email, calendars, CRM, and spreadsheets before recommending anything new.",
    },
    {
      question: "Will AI replace our staff?",
      answer:
        "No. The goal is to reduce repetitive manual work so your team can spend more time with customers, jobs, and higher-value tasks.",
    },
    {
      question: "How should we start?",
      answer:
        "Start with one workflow that is repetitive, easy to describe, and worth improving. A free workflow audit helps identify that first step.",
    },
  ];
}

module.exports = services;
