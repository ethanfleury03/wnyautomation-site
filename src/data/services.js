// Edit this file to add, remove, or revise service pages.
// Each object becomes a public page at /services/{slug}.

const defaultTools = [
  "Website forms",
  "Gmail / Outlook",
  "Google Sheets",
  "HubSpot",
  "GoHighLevel",
  "Airtable",
  "Scheduling tools",
  "Jobber",
  "Housecall Pro",
  "Slack / Discord / Teams",
  "SMS/email tools",
  "Existing CRMs",
];

const defaultTrustLine =
  "Built for small businesses that want practical automation without adding more software chaos.";

const services = [
  service({
    slug: "missed-lead-rescue-system",
    title: "Missed Lead Rescue System",
    h1: "Catch missed leads before they go cold.",
    heroEyebrow: "Lead follow-up automation",
    primaryKeyword: "missed lead rescue system",
    shortDescription:
      "Respond faster to website forms, missed calls, voicemails, emails, and other new inquiries with clear alerts and follow-up reminders.",
    metaDescription:
      "Respond faster to forms, missed calls, and new inquiries with alerts, logging, and follow-up reminders for WNY small businesses.",
    whatThisDoes:
      "A missed lead rescue system helps your business acknowledge new inquiries quickly, alert the right person, log the lead, and keep reminders moving until someone handles it.",
    includes: [
      "Website form alerts",
      "Missed-call text-back workflows",
      "New inquiry notifications",
      "Internal lead alerts",
      "CRM, sheet, or task logging",
      "Follow-up reminders",
      "Basic source tracking",
    ],
    problemTitle: "Many businesses do not have a lead-volume problem.",
    problem:
      "They have a response-time and follow-up problem. A prospect fills out a form, calls after hours, or leaves a message, but by the time someone responds, they may have already contacted a competitor.",
    painPoints: [
      "Website forms sit in an inbox too long",
      "Calls get missed while the team is working",
      "After-hours inquiries wait until the next day",
      "New leads are not tracked in one place",
      "Owners cannot see which opportunities still need follow-up",
    ],
    whoThisIsFor: [
      "Contractors, roofers, HVAC, plumbing, and electrical companies",
      "Landscapers and home service businesses",
      "Clinics, salons, and appointment-based businesses",
      "Professional services that depend on timely replies",
      "Any business where a call or form can become revenue",
    ],
    workflowSteps: [
      "A new form, missed call, voicemail, email, or inquiry comes in.",
      "The customer gets a quick confirmation text or email.",
      "The owner or team gets a clean alert with the lead details.",
      "The lead is logged in a CRM, sheet, or task list.",
      "If nobody marks it handled, a reminder fires.",
      "Follow-up continues until the lead is handled or closed.",
    ],
    connectionIntro:
      "Depending on your setup, this can often connect to the tools already receiving lead details today.",
    exampleWorkflow:
      "A form submission or missed call triggers a quick first response, saves the lead details, alerts the owner or team, and creates a follow-up reminder.",
    relatedServices: ["quote-follow-up-system", "website-faq-lead-capture-assistant"],
    relatedIndustries: ["hvac-companies", "roofing-companies", "home-service-businesses"],
    toolsItCanConnect: [
      "Website forms",
      "Missed-call or call tracking tools",
      "Gmail / Outlook",
      "Google Sheets",
      "HubSpot",
      "GoHighLevel",
      "Airtable",
      "Slack / Discord / Teams",
      "SMS/email tools",
      "Existing CRMs",
    ],
    signsYouNeedIt: [
      "Leads sit in your inbox.",
      "You miss calls during busy hours.",
      "Customers contact you after hours.",
      "Nobody knows who followed up.",
      "You copy lead information manually.",
      "You rely on memory or sticky notes.",
    ],
    whatWeLookAtFirst: [
      "Where new inquiries enter the business today",
      "How quickly someone usually responds",
      "Who should own each type of lead",
      "Where lead details should be logged",
      "Which follow-ups need a human before sending",
      "What counts as handled, closed, or still open",
    ],
    ctaLabel: "Find out where your leads are slipping through",
    finalCtaTitle: "Find out where your leads are slipping through.",
    finalCtaText:
      "Send over the places leads come from today. WNY Business Automation can help you spot the gaps and decide whether a small rescue workflow makes sense.",
    benefits: [
      "Faster response to new opportunities",
      "Cleaner lead alerts for owners and staff",
      "Less dependence on inbox watching",
      "Better visibility into unanswered leads",
    ],
    faqs: [
      {
        question: "Will this replace the person who follows up with leads?",
        answer:
          "No. It helps your team respond faster and remember the next step. A person should still handle real conversations, questions, pricing, and scheduling.",
      },
      {
        question: "Can this work with my current forms or phone setup?",
        answer:
          "Often, yes. We would first look at your website forms, missed-call tools, email, CRM, and any call tracking you already use.",
      },
      {
        question: "Do I need a CRM for missed lead rescue?",
        answer:
          "Not always. A simple sheet or task list can be enough to start, especially if the business does not need a full sales pipeline yet.",
      },
      {
        question: "What happens if a customer replies to the first message?",
        answer:
          "Replies should route back to the right person or inbox. We plan that handoff before automating any customer-facing message.",
      },
      {
        question: "Can this start simple?",
        answer:
          "Yes. A good first version might only alert the team, send a confirmation, and create one reminder if nobody follows up.",
      },
      {
        question: "What information do you need to set it up?",
        answer:
          "We need to know where leads come from, who should receive alerts, what first response is appropriate, and how you want to mark a lead as handled.",
      },
    ],
  }),
  service({
    slug: "quote-follow-up-system",
    title: "Quote Follow-Up System",
    h1: "Follow up on quotes before good opportunities disappear.",
    heroEyebrow: "Estimate and proposal follow-up",
    primaryKeyword: "quote follow-up system",
    shortDescription:
      "Track open estimates, proposals, and opportunities so follow-up is consistent, visible, and not dependent on memory.",
    metaDescription:
      "Track open quotes and send polite follow-up reminders so estimates do not get buried in email or forgotten.",
    whatThisDoes:
      "A quote follow-up system keeps open estimates visible and helps the team check back at the right time with polite, customer-friendly follow-ups.",
    includes: [
      "Quote status tracking",
      "Follow-up reminders",
      "Customer check-in emails or texts",
      "Internal task creation",
      "Aging quote alerts",
      "Simple pipeline visibility",
      "Won, lost, or needs-follow-up tracking when available",
    ],
    problemTitle: "Open estimates often die quietly because nobody sees them aging.",
    problem:
      "Many businesses spend real time creating quotes, but follow-up depends on the owner scanning email or remembering who has not replied. Good opportunities can go cold without any obvious warning.",
    painPoints: [
      "Quotes go quiet after they are sent",
      "Estimate follow-up depends on memory",
      "Owners do not know which quotes are stale",
      "Customers need a simple way to ask next-step questions",
      "Potential revenue gets lost because no one follows up",
    ],
    whoThisIsFor: [
      "Contractors, landscapers, roofers, and remodelers",
      "Commercial service providers",
      "B2B service businesses",
      "Teams sending estimates, proposals, or scopes of work",
      "Owners who want visibility without a complicated CRM",
    ],
    workflowSteps: [
      "A quote is sent.",
      "The quote is added to a simple tracking system.",
      "If there is no response after a set time, a reminder is created.",
      "The customer receives a polite follow-up.",
      "The team gets alerted if the quote is still open.",
      "Quotes are marked won, lost, or needs follow-up.",
    ],
    connectionIntro:
      "Depending on how quotes are created today, this can often connect to email, spreadsheets, CRMs, or quote tools.",
    exampleWorkflow:
      "A sent quote starts a friendly follow-up sequence, tracks whether the customer replied, and creates a task when a human should step in.",
    relatedServices: ["missed-lead-rescue-system", "intake-to-task-automation"],
    relatedIndustries: ["roofing-companies", "contractors", "insurance-agencies"],
    toolsItCanConnect: [
      "Gmail / Outlook",
      "Google Sheets",
      "HubSpot",
      "GoHighLevel",
      "Airtable",
      "Jobber",
      "Housecall Pro",
      "SMS/email tools",
      "Existing CRMs",
    ],
    signsYouNeedIt: [
      "You send quotes but forget to follow up.",
      "You do not know how many quotes are open.",
      "Quotes get buried in email.",
      "Follow-up depends on memory.",
      "You do not know why opportunities go cold.",
      "You want better visibility without a complicated CRM.",
    ],
    whatWeLookAtFirst: [
      "How quotes are created and sent today",
      "Where quote status is recorded, if anywhere",
      "The timing and tone of follow-up messages",
      "Who should handle replies or objections",
      "How won and lost quotes should be marked",
      "Whether a simple sheet is enough before adding CRM complexity",
    ],
    ctaLabel: "Clean up open quote follow-up",
    finalCtaTitle: "Turn open quotes into a cleaner follow-up process.",
    finalCtaText:
      "Share how estimates move through your business today. WNY Business Automation can help you make the next follow-up easier to see and easier to do.",
    benefits: [
      "More consistent follow-up on open estimates",
      "Clearer view of quotes that need attention",
      "Less manual reminder tracking",
      "Better timing for customer check-ins",
    ],
    faqs: [
      {
        question: "Will this send pushy sales messages?",
        answer:
          "No. The follow-ups should be polite, useful, and easy for a real person to take over when the customer responds.",
      },
      {
        question: "Can this work if quotes are sent from email?",
        answer:
          "Often, yes. We can review how quote emails are sent today and decide whether email, a sheet, or a CRM should be the tracking source.",
      },
      {
        question: "Do I need a full quote pipeline?",
        answer:
          "Not always. Many businesses can start with a simple open-quote list, aging reminders, and a clear won or lost status.",
      },
      {
        question: "What happens when someone replies?",
        answer:
          "The reply should go to your team. The system can pause follow-ups or create a task so a person can respond.",
      },
      {
        question: "How custom is the timing?",
        answer:
          "Follow-up timing should match your sales process. Some quotes need a next-day check-in, while others need more time.",
      },
      {
        question: "What information do you need to set it up?",
        answer:
          "We need sample quote flow details, current tools, follow-up timing, message preferences, and how you want to track quote outcomes.",
      },
    ],
  }),
  service({
    slug: "intake-to-task-automation",
    title: "Intake-to-Task Automation",
    h1: "Turn forms, emails, and requests into clear next steps.",
    heroEyebrow: "Request routing and task automation",
    primaryKeyword: "intake-to-task automation",
    shortDescription:
      "Convert incoming requests into organized tasks with owners, notes, due dates, and status visibility.",
    metaDescription:
      "Turn forms, emails, and requests into organized tasks with owners, due dates, notifications, and clearer handoffs.",
    whatThisDoes:
      "Intake-to-task automation takes work that arrives through forms, email, texts, and internal messages and turns it into a clear task instead of another loose thread.",
    includes: [
      "Form-to-task workflows",
      "Email-to-task workflows",
      "Owner assignment",
      "Due dates or priority labels",
      "Status tracking",
      "Internal notifications",
      "Task summaries",
      "Handoff clarity",
    ],
    problemTitle: "Requests get messy when they arrive from too many places.",
    problem:
      "Without a clear intake process, tasks get missed, duplicated, delayed, or assigned to the wrong person. Work ends up living in inboxes and chat threads instead of a place the team can act on.",
    painPoints: [
      "Requests arrive from too many places",
      "Staff copy details into spreadsheets by hand",
      "Tasks do not have a clear owner",
      "Important requests get buried in email",
      "Managers cannot tell what is waiting on a next step",
    ],
    whoThisIsFor: [
      "Small teams with too many intake channels",
      "Agencies and service businesses",
      "Operations-heavy businesses",
      "Admin teams that route requests",
      "Businesses that need clearer ownership for incoming work",
    ],
    workflowSteps: [
      "A request comes in through a form or email.",
      "The system identifies the request type.",
      "A task is created in the right workspace.",
      "The correct person is assigned.",
      "A due date or priority is added.",
      "The team gets notified.",
      "Follow-up reminders happen if the task is not completed.",
    ],
    connectionIntro:
      "Depending on your setup, intake can often connect to forms, inboxes, task boards, spreadsheets, and team notifications.",
    exampleWorkflow:
      "A form, email, or request is summarized, categorized, routed to the right person, and turned into a task with due date guidance.",
    relatedServices: ["quote-follow-up-system", "appointment-review-reminder-follow-up"],
    relatedIndustries: ["property-managers", "contractors", "professional-services"],
    toolsItCanConnect: [
      "Website forms",
      "Gmail / Outlook",
      "Google Sheets",
      "HubSpot",
      "Airtable",
      "Scheduling tools",
      "Slack / Discord / Teams",
      "Existing CRMs",
      "Task boards",
    ],
    signsYouNeedIt: [
      "Requests get lost in email.",
      "Nobody knows who owns a task.",
      "You manually copy information between tools.",
      "Customers or team members ask for status updates.",
      "Work depends on one person remembering everything.",
      "You have too many intake channels.",
    ],
    whatWeLookAtFirst: [
      "Where requests enter the business",
      "Which request types need different handling",
      "Who owns each type of task",
      "What details are required before work can start",
      "Where the task should live",
      "What statuses and reminders are actually useful",
    ],
    ctaLabel: "Organize your intake",
    finalCtaTitle: "Organize your intake before more work slips through.",
    finalCtaText:
      "Send one messy intake path, like a form or shared inbox. WNY Business Automation can help turn it into a clearer task process.",
    benefits: [
      "Cleaner handoffs between people",
      "Less copying and pasting",
      "Clearer task ownership",
      "Fewer requests lost in inboxes",
    ],
    faqs: [
      {
        question: "Will this replace our project management tool?",
        answer:
          "No. It usually works with the place your team already tracks tasks, or starts with a simple task list if you do not have one.",
      },
      {
        question: "Can this handle different request types?",
        answer:
          "Yes, if the request types are clear enough to route. We would define the categories and what information each one needs.",
      },
      {
        question: "Do we need a CRM?",
        answer:
          "No. Intake-to-task workflows can use task boards, spreadsheets, inboxes, or CRMs depending on what your team already uses.",
      },
      {
        question: "What happens if information is missing?",
        answer:
          "The system can flag missing details, ask for more information, or create a task for a person to review.",
      },
      {
        question: "Can this start with one form?",
        answer:
          "Yes. Starting with one high-volume form or inbox is usually the best way to prove the workflow.",
      },
      {
        question: "What information do you need to set it up?",
        answer:
          "We need sample requests, current intake channels, task owners, required fields, due date rules, and where completed work should be tracked.",
      },
    ],
  }),
  service({
    slug: "website-faq-lead-capture-assistant",
    title: "Website FAQ + Lead Capture Assistant",
    h1: "Give website visitors helpful answers and a clear next step.",
    heroEyebrow: "Website assistant and lead capture",
    primaryKeyword: "website FAQ lead capture assistant",
    shortDescription:
      "Answer common questions with approved business information and guide serious prospects toward contacting your team.",
    metaDescription:
      "Add a practical website FAQ and lead capture assistant that answers common questions and routes serious prospects.",
    whatThisDoes:
      "A website FAQ + lead capture assistant gives visitors practical answers from approved business information, collects useful contact details, and escalates anything that needs a human.",
    includes: [
      "Approved FAQ answers",
      "Lead capture",
      "Contact detail collection",
      "Routing prospects to the right next step",
      "Human escalation",
      "After-hours help",
      "Basic qualification questions",
      "Reduced repetitive questions",
    ],
    problemTitle: "Visitors often need a little clarity before they contact you.",
    problem:
      "If basic answers are missing, people may leave. If every question needs a human response, your team spends time repeating the same information instead of helping serious prospects.",
    painPoints: [
      "Visitors leave before contacting the business",
      "Staff answer the same basic questions repeatedly",
      "After-hours questions wait until morning",
      "Contact forms do not collect enough detail",
      "Real leads are mixed in with low-priority questions",
    ],
    whoThisIsFor: [
      "Service businesses with repeated pre-sales questions",
      "Clinics, salons, and med spas",
      "Contractors and professional services",
      "Agencies and local businesses with detailed offerings",
      "Businesses that want safer lead capture than a generic chatbot",
    ],
    workflowSteps: [
      "A visitor asks a question on the website.",
      "The assistant answers using approved content.",
      "If the visitor seems interested, it asks for contact details.",
      "The inquiry is routed to the business.",
      "The team receives a clean summary.",
      "Unanswered or sensitive questions are escalated to a human.",
    ],
    connectionIntro:
      "Depending on your website and lead process, this can often connect to forms, inboxes, CRMs, sheets, and notification tools.",
    exampleWorkflow:
      "A website visitor asks a common question, gets an approved answer, and is asked for contact details when the conversation should become a lead.",
    relatedServices: ["website-creation", "missed-lead-rescue-system"],
    relatedIndustries: ["restaurants", "med-spas", "dental-offices"],
    toolsItCanConnect: [
      "Website forms",
      "Approved FAQ content",
      "Gmail / Outlook",
      "Google Sheets",
      "HubSpot",
      "GoHighLevel",
      "Airtable",
      "Slack / Discord / Teams",
      "SMS/email tools",
      "Existing CRMs",
    ],
    signsYouNeedIt: [
      "Customers ask the same questions repeatedly.",
      "Your website does not answer basic questions.",
      "Visitors leave without contacting you.",
      "You want to collect better lead details.",
      "You need after-hours inquiry capture.",
      "You want a safer alternative to a generic chatbot.",
    ],
    whatWeLookAtFirst: [
      "The questions customers already ask",
      "Which answers are approved and safe to use",
      "Where the assistant should hand off to a human",
      "What contact details are useful without being intrusive",
      "Which pages should offer the assistant",
      "How leads should be routed after capture",
    ],
    ctaLabel: "Review your website questions",
    finalCtaTitle: "See what your website should be answering for you.",
    finalCtaText:
      "Send the questions customers ask before buying or booking. WNY Business Automation can help shape a practical assistant around approved answers and clear handoffs.",
    benefits: [
      "Faster answers for common questions",
      "More useful website lead capture",
      "Cleaner handoffs to a human",
      "Less repetitive front-desk communication",
    ],
    faqs: [
      {
        question: "Is this just a generic chatbot?",
        answer:
          "No. The useful version is built around approved business information, clear limits, and a human handoff for anything sensitive or uncertain.",
      },
      {
        question: "Can it work with my current website?",
        answer:
          "Often, yes. We would first review your website platform, forms, tracking, and where new inquiries should go.",
      },
      {
        question: "Do I need a CRM?",
        answer:
          "No. Captured leads can often go to email, a sheet, a task list, or a CRM depending on your current process.",
      },
      {
        question: "What happens if it does not know an answer?",
        answer:
          "It should avoid guessing and route the question to a human with a summary of what the visitor asked.",
      },
      {
        question: "Can this start with basic FAQs?",
        answer:
          "Yes. Starting with approved answers to the questions you already hear is usually the safest first version.",
      },
      {
        question: "What information do you need to set it up?",
        answer:
          "We need your common questions, approved answers, service details, contact preferences, escalation rules, and the pages where it should appear.",
      },
    ],
  }),
  service({
    slug: "appointment-review-reminder-follow-up",
    title: "Appointment, Review, and Reminder Follow-Up",
    h1: "Keep appointments, reviews, and customer follow-ups from falling through the cracks.",
    heroEyebrow: "Customer reminder automation",
    primaryKeyword: "appointment review reminder follow-up",
    shortDescription:
      "Send appointment reminders, review requests, post-service check-ins, and other simple follow-ups with more consistency.",
    metaDescription:
      "Send appointment reminders, review requests, post-service check-ins, and customer follow-ups more consistently.",
    whatThisDoes:
      "This system helps your business send the simple customer messages people expect without requiring someone to remember every reminder, review request, or check-in manually.",
    includes: [
      "Appointment reminders",
      "Review requests",
      "Post-service check-ins",
      "Reschedule reminders",
      "Customer reactivation",
      "Follow-up sequences",
      "Internal alerts",
      "Simple message templates",
    ],
    problemTitle: "Customers expect reminders, but teams are busy.",
    problem:
      "Manual reminders and review requests often get skipped when the day gets full. That can mean more no-shows, fewer reviews, weaker repeat business, and extra admin work.",
    painPoints: [
      "Customers forget appointments or next steps",
      "Staff manually send reminders",
      "Happy customers are not asked for reviews",
      "Follow-up timing is inconsistent",
      "Small customer touches depend on someone remembering",
    ],
    whoThisIsFor: [
      "Clinics, salons, med spas, and fitness studios",
      "Consultants and appointment-based services",
      "Home service businesses",
      "Teams that schedule jobs or visits",
      "Businesses that want more consistent customer communication",
    ],
    workflowSteps: [
      "An appointment or job is scheduled.",
      "The customer receives a reminder before the appointment.",
      "After completion, the system sends a thank-you or check-in.",
      "A review request is sent when appropriate.",
      "If the customer does not respond, a polite follow-up can be triggered.",
      "The business gets visibility into follow-up status.",
    ],
    connectionIntro:
      "Depending on your scheduling and customer tools, this can often connect to calendars, booking systems, CRMs, and messaging tools.",
    exampleWorkflow:
      "A booked appointment triggers a reminder, a completed visit triggers a polite review request, and the owner can see which follow-ups were sent.",
    relatedServices: ["quote-follow-up-system", "intake-to-task-automation"],
    relatedIndustries: ["home-service-businesses", "med-spas", "dental-offices"],
    toolsItCanConnect: [
      "Scheduling tools",
      "Gmail / Outlook",
      "Google Sheets",
      "HubSpot",
      "GoHighLevel",
      "Jobber",
      "Housecall Pro",
      "SMS/email tools",
      "Review links",
      "Existing CRMs",
    ],
    signsYouNeedIt: [
      "You manually send reminders.",
      "Customers forget appointments.",
      "You do not consistently ask for reviews.",
      "Follow-ups happen only when someone remembers.",
      "Past customers are not re-engaged.",
      "Customer communication is inconsistent.",
    ],
    whatWeLookAtFirst: [
      "Where appointments or jobs are scheduled",
      "When reminders should be sent",
      "Which messages are appropriate for each customer type",
      "When review requests should not be sent",
      "How replies should route back to the team",
      "What follow-up status needs to be visible",
    ],
    ctaLabel: "Make follow-up consistent",
    finalCtaTitle: "Make customer follow-up feel automatic, not forgotten.",
    finalCtaText:
      "Send the reminders or review requests your team handles manually today. WNY Business Automation can help you design a practical follow-up flow.",
    benefits: [
      "Fewer forgotten reminders",
      "More consistent review requests",
      "Less front-desk follow-up work",
      "Better customer communication after the first contact",
    ],
    faqs: [
      {
        question: "Will this message every customer automatically?",
        answer:
          "Only if that is appropriate. We define timing, exclusions, and human review points so messages fit the business.",
      },
      {
        question: "Can this work with my calendar or booking tool?",
        answer:
          "Often, yes. We would review your calendar, booking system, CRM, or job tool before choosing the connection path.",
      },
      {
        question: "Do I need a CRM?",
        answer:
          "No. Some reminder systems can start from a calendar, spreadsheet, booking tool, or simple customer list.",
      },
      {
        question: "What happens if someone replies?",
        answer:
          "Replies should go back to your team so a person can handle rescheduling, questions, complaints, or sensitive details.",
      },
      {
        question: "Can review requests be conditional?",
        answer:
          "Yes. It is often better to send review requests only after the right job status or customer interaction.",
      },
      {
        question: "What information do you need to set it up?",
        answer:
          "We need your scheduling source, message timing, review links, customer types, reply routing, and any situations where messages should be skipped.",
      },
    ],
  }),
  service({
    slug: "website-creation",
    title: "Website Creation",
    h1: "A clear small business website built around trust and next steps.",
    heroEyebrow: "Practical website creation",
    primaryKeyword: "website creation for small business",
    shortDescription:
      "Build a practical website that explains what you do, helps customers trust the business, and makes the next step clear.",
    metaDescription:
      "Build a practical small business website with clear services, mobile-first design, lead capture, FAQs, and local SEO basics.",
    whatThisDoes:
      "WNY Business Automation builds practical websites for local small businesses that need a clearer online presence, stronger service pages, and better contact or quote paths.",
    includes: [
      "Homepage clarity",
      "Service pages",
      "Mobile-first design",
      "Contact or quote flow",
      "Lead capture forms",
      "Local SEO basics",
      "Trust signals",
      "FAQs",
      "Simple analytics when applicable",
      "Practical copywriting",
    ],
    problemTitle: "A website should support the sales process, not just exist.",
    problem:
      "Many small business websites are unclear, outdated, hard to use on mobile, missing calls-to-action, or not built around lead capture. Visitors should quickly understand the business and know what to do next.",
    painPoints: [
      "The current website is outdated or unclear",
      "Customers cannot quickly understand the offer",
      "Lead forms are weak or hard to find",
      "The site does not support follow-up workflows",
      "Owners need a simple web presence without a giant agency process",
    ],
    whoThisIsFor: [
      "Small businesses with outdated sites",
      "Businesses with no website",
      "Owners relying mostly on Facebook",
      "Service businesses needing quote or contact flows",
      "Local businesses that need clearer positioning",
    ],
    workflowSteps: [
      "Review the current online presence.",
      "Identify the main customer action.",
      "Plan pages and content.",
      "Write clear copy.",
      "Build a mobile-friendly website.",
      "Add contact or quote paths.",
      "Launch and refine based on business needs.",
    ],
    connectionIntro:
      "Depending on the site and tools, the website can often connect to forms, analytics, calendars, email, and future follow-up automations.",
    exampleWorkflow:
      "A local business gets a focused website with service pages, contact paths, basic SEO structure, and lead forms that can connect into follow-up automations later.",
    relatedServices: ["website-faq-lead-capture-assistant", "blog-schedules"],
    relatedIndustries: ["home-service-businesses", "contractors", "local-retail-businesses"],
    toolsItCanConnect: [
      "Website forms",
      "Google Analytics",
      "Search Console",
      "Gmail / Outlook",
      "Scheduling tools",
      "Google Sheets",
      "HubSpot",
      "Existing CRMs",
      "SMS/email tools",
    ],
    signsYouNeedIt: [
      "Your website does not explain what you do quickly.",
      "Customers have to search for contact information.",
      "You rely mostly on Facebook.",
      "Your site looks outdated on mobile.",
      "You have no clear service pages.",
      "Your website does not capture leads well.",
    ],
    whatWeLookAtFirst: [
      "What the business needs visitors to do",
      "Which services need dedicated pages",
      "What proof, FAQs, and trust signals are missing",
      "How customers should request quotes or contact you",
      "What local SEO basics should be in place",
      "How website leads should be followed up on after launch",
    ],
    ctaLabel: "Plan a clearer website",
    finalCtaTitle: "Build a website that gives customers a clear next step.",
    finalCtaText:
      "Share what your current site does not explain well. WNY Business Automation can help plan a practical site around trust, clarity, and lead capture.",
    benefits: [
      "Clearer first impression",
      "Better lead capture paths",
      "More useful service pages",
      "A stronger base for future automation",
    ],
    faqs: [
      {
        question: "What does website creation include?",
        answer:
          "It can include page planning, service-focused copy, mobile-first design, contact paths, lead capture forms, FAQs, and basic local SEO structure.",
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
        question: "Do I need all my copy ready first?",
        answer:
          "No. Clear copywriting is part of the work. We start by understanding the business, services, proof, FAQs, and customer next steps.",
      },
      {
        question: "Can this start with a small site?",
        answer:
          "Yes. A focused site with a strong homepage, service pages, FAQs, and contact flow is often a better start than a large unfinished site.",
      },
      {
        question: "How should we start?",
        answer:
          "Start by identifying the main services, the customer action you want, and what is unclear or outdated about the current online presence.",
      },
    ],
  }),
  service({
    slug: "blog-schedules",
    title: "Blog Schedules",
    h1: "Plan useful content before your business needs it.",
    heroEyebrow: "Content calendar and blog planning",
    primaryKeyword: "blog schedules for small business",
    shortDescription:
      "Create a realistic content plan with useful topics, publish dates, reminders, and a simple workflow your business can maintain.",
    metaDescription:
      "Plan a realistic blog schedule with topics, publish dates, reminders, local SEO ideas, and simple draft tracking.",
    whatThisDoes:
      "A blog schedule helps small businesses organize content topics, publishing dates, reminders, draft tracking, and simple approval steps before content becomes a last-minute scramble.",
    includes: [
      "Blog topic planning",
      "Local SEO topics",
      "Service-focused content ideas",
      "Publish calendar",
      "Reminder workflow",
      "Content repurposing",
      "Draft tracking",
      "Simple approval process",
    ],
    problemTitle: "Content is hard to keep up with when there is no plan.",
    problem:
      "Many businesses know they should publish useful content, but topics depend on random ideas, busy owners, or short bursts of effort. A realistic schedule makes content easier to maintain.",
    painPoints: [
      "The business wants blog content but has no plan",
      "Topics are chosen randomly",
      "Publishing falls behind after a few posts",
      "Local SEO ideas are not organized",
      "Owners need a simple schedule they can actually follow",
    ],
    whoThisIsFor: [
      "Local service businesses",
      "Professional services",
      "Contractors and clinics",
      "Agencies and educational businesses",
      "Businesses that want better SEO but lack consistency",
    ],
    workflowSteps: [
      "Identify services and customer questions.",
      "Turn them into blog or content topics.",
      "Prioritize topics by usefulness and search intent.",
      "Build a realistic publishing calendar.",
      "Add reminders and task owners.",
      "Repurpose posts into social or email content.",
      "Review performance and update the calendar.",
    ],
    connectionIntro:
      "Depending on how your team works, a blog schedule can often connect to calendars, sheets, docs, reminders, and website publishing workflows.",
    exampleWorkflow:
      "A business gets a simple content calendar with service topics, local search ideas, draft prompts, target publish dates, and reminders to keep the schedule moving.",
    relatedServices: ["website-creation", "website-faq-lead-capture-assistant"],
    relatedIndustries: ["professional-services", "home-service-businesses", "local-retail-businesses"],
    toolsItCanConnect: [
      "Google Sheets",
      "Google Docs",
      "Airtable",
      "Website CMS",
      "Gmail / Outlook",
      "Scheduling tools",
      "Slack / Discord / Teams",
      "Task boards",
      "Email reminders",
    ],
    signsYouNeedIt: [
      "You rarely publish content.",
      "You do not know what to write about.",
      "Customers ask the same questions.",
      "Your website has thin service pages.",
      "Social posts are inconsistent.",
      "Content depends on whoever has time that week.",
    ],
    whatWeLookAtFirst: [
      "The services and locations worth explaining",
      "Questions customers already ask",
      "Which topics support search and sales conversations",
      "Who can review or approve drafts",
      "How often the business can realistically publish",
      "Where reminders, drafts, and finished posts should live",
    ],
    ctaLabel: "Build a usable content plan",
    finalCtaTitle: "Create a content plan your business can actually keep up with.",
    finalCtaText:
      "Send the services or questions you want customers to understand. WNY Business Automation can help turn them into a practical blog schedule.",
    benefits: [
      "A clearer publishing plan",
      "Better topic organization",
      "More consistent website activity",
      "Content ideas tied to real customer questions",
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
        question: "Do you write every post for us?",
        answer:
          "This service is focused on the plan and workflow. Writing can be discussed separately, but the first goal is a schedule the business can realistically maintain.",
      },
      {
        question: "Can this help local SEO?",
        answer:
          "It can support local SEO by organizing useful topics around services, customer questions, and locations, but it should not rely on thin or generic posts.",
      },
      {
        question: "How should we start?",
        answer:
          "Start with the customer questions you answer often and the services or service areas you want the website to explain better.",
      },
    ],
  }),
];

function service(overrides) {
  return {
    metaTitle: overrides.metaTitle || `${overrides.title} | WNY Business Automation`,
    metaDescription:
      overrides.metaDescription ||
      `${overrides.shortDescription} Built for Buffalo, Niagara, and Western New York small businesses.`,
    secondaryKeywords: overrides.secondaryKeywords || [
      "small business automation",
      "AI workflow automation",
      "Buffalo business automation",
    ],
    heroEyebrow: overrides.heroEyebrow || "Workflow automation service",
    trustLine: overrides.trustLine || defaultTrustLine,
    whatThisDoes:
      overrides.whatThisDoes ||
      "This service turns a repeated business workflow into a clearer process with practical automation where it makes sense.",
    includes: overrides.includes || overrides.benefits || [],
    problemTitle: overrides.problemTitle || "The problem it solves",
    problem:
      overrides.problem ||
      "The goal is to reduce repeated manual work, missed follow-up, unclear ownership, and slow response times without adding unnecessary complexity.",
    whoThisIsFor: overrides.whoThisIsFor || overrides.idealFor || [
      "Small business owners",
      "Local service teams",
      "Busy offices",
      "Operators who want less manual follow-up",
    ],
    workflowSteps: overrides.workflowSteps || overrides.howItWorks || [
      "Review the current process.",
      "Identify the handoffs, delays, and repeated steps.",
      "Design a small first workflow.",
      "Connect the right tools where practical.",
      "Test the workflow with human review.",
      "Improve it once the first version is working.",
    ],
    connectionIntro:
      overrides.connectionIntro ||
      "Depending on your setup, this can often connect to the tools your business already uses.",
    toolsItCanConnect: overrides.toolsItCanConnect || defaultTools,
    signsYouNeedIt: overrides.signsYouNeedIt || overrides.painPoints || [],
    whatWeLookAtFirst: overrides.whatWeLookAtFirst || [
      "The current workflow and where it starts",
      "Who owns the next step",
      "Which tools already hold the information",
      "Where delays, duplicates, or missed follow-ups happen",
      "What should stay human-reviewed",
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
        "Usually not. WNY Business Automation looks at your current website, forms, email, calendars, CRM, and spreadsheets before recommending anything new.",
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
