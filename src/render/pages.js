const business = require("../config/business");
const services = require("../data/services");
const industries = require("../data/industries");
const caseStudies = require("../data/caseStudies");
const blogPosts = require("../data/blogPosts");
const { homepageFaqs, workflowAuditFaqs } = require("../data/faqs");
const { absoluteUrl, buildStaticRoutes } = require("../lib/seo");
const {
  articleSchema,
  breadcrumbSchema,
  compactSchemas,
  faqPageSchema,
  localBusinessSchema,
  organizationSchema,
  serviceSchema,
  websiteSchema,
} = require("../lib/schema");
const { formatDisplayDate } = require("../lib/slugs");
const { escapeAttribute, escapeHtml, icon, listItems, markdownToHtml } = require("./html");
const { renderPage } = require("./layout");
const {
  renderAutomationExamplesGrid,
  renderBlogCard,
  renderBreadcrumbs,
  renderCTASection,
  renderFAQSection,
  renderHowItWorksSection,
  renderIndexGrid,
  renderInternalLinksSection,
  renderPainPointSection,
  renderSEOPageHero,
  renderTrustSection,
  renderWorkflowAuditForm,
  section,
} = require("./components");

const serviceBySlug = new Map(services.map((item) => [item.slug, item]));
const industryBySlug = new Map(industries.map((item) => [item.slug, item]));
const caseStudyBySlug = new Map(caseStudies.map((item) => [item.slug, item]));
const sampleBlogBySlug = new Map(blogPosts.map((item) => [item.slug, item]));

const defaultExamples = [
  {
    icon: "reply",
    title: "Missed lead rescue",
    description: "Catch forms, missed calls, and new inquiries with fast first-response alerts.",
  },
  {
    icon: "file-clock",
    title: "Quote follow-up",
    description: "Follow up on open estimates before good opportunities go cold.",
  },
  {
    icon: "list-todo",
    title: "Intake-to-task routing",
    description: "Turn forms, emails, and requests into tasks with owners and due dates.",
  },
  {
    icon: "message-circle-question",
    title: "Website FAQ + lead capture",
    description: "Answer common questions and route real prospects to a person.",
  },
  {
    icon: "star",
    title: "Appointment and review follow-up",
    description: "Send reminders, review requests, and simple customer check-ins.",
  },
  {
    icon: "globe-2",
    title: "Website creation",
    description: "Build a clear local business website with strong lead capture paths.",
  },
  {
    icon: "calendar-days",
    title: "Blog schedules",
    description: "Plan realistic topics, publish dates, and reminders for local SEO content.",
  },
];

function page(body, meta, schemas = [], bodyClass = "") {
  return renderPage({
    meta,
    schemas: compactSchemas([organizationSchema(), websiteSchema(), ...schemas]),
    body,
    bodyClass,
    services,
    industries,
  });
}

function renderHomePage(blogItems = []) {
  const body = `
    <main id="top">
      ${renderSEOPageHero({
        eyebrow: "Practical automation for Buffalo, Niagara, and WNY businesses",
        h1: "Get 3 practical automation ideas for one manual workflow.",
        subheading:
          "Tell WNY Automation Co the task your business keeps doing by hand. We will review it and send back practical ideas for saving time, improving follow-up, or reducing admin work.",
        primaryHref: "#workflow-form",
        primaryLabel: "Get 3 Automation Ideas",
        valueHighlights: [
          { icon: "speech", text: "No tech jargon" },
          { icon: "plug", text: "Current tools first" },
          { icon: "target", text: "Small pilot first" },
          { icon: "map-pin", text: "Local WNY support" },
        ],
        miniForm: true,
      })}
      ${renderTrustSection()}
      ${renderAutomationExamplesGrid({ title: "Practical fixes for work your team keeps repeating.", examples: defaultExamples })}
      ${renderHowItWorksSection()}
      ${renderFAQSection(homepageFaqs, "Short answers before you book")}
      ${renderCTASection({
        primaryHref: "#workflow-form",
        primaryLabel: "Get 3 Automation Ideas",
        text: "Tell us one manual task. We will review it and send back practical ideas before you commit to a paid project.",
        withForm: false,
      })}
    </main>`;

  return page(
    body,
    {
      title: business.defaultSeoTitle,
      description: business.defaultSeoDescription,
      path: "/",
    },
    [localBusinessSchema("/"), faqPageSchema(homepageFaqs)],
  );
}

function renderAboutPage() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
  ];
  const body = `
    <main>
      <div class="section-inner">${renderBreadcrumbs(crumbs)}</div>
      ${renderSEOPageHero({
        eyebrow: "About WNY Automation Co",
        h1: "Practical websites and automation for local businesses.",
        subheading:
          "WNY Automation Co helps local businesses improve websites, follow-up, intake, reminders, and simple workflows without confusing tech jargon.",
        primaryHref: "#workflow-form",
        primaryLabel: "Share a Workflow or Website Problem",
      })}
      ${section(`
        <div class="two-column-section">
          <div>
            <p class="section-kicker">Founder note</p>
            <h2>I'm Ethan Fleury, and I built WNY Automation Co for practical small-business problems.</h2>
            <p>I work across website creation, automation, AI tools, software development, and local business operations. The goal is simple: help owners fix the repeated work that slows them down without turning the project into a giant software build.</p>
            <p>I am based in Western New York and focused on helping local businesses make their websites and workflows easier to use, easier to follow up on, and easier to maintain.</p>
          </div>
          <div class="audit-panel founder-photo-panel">
            <div class="founder-photo-placeholder" aria-label="Founder photo placeholder">
              <img src="/assets/wny-automation-icon.png" alt="" decoding="async" />
            </div>
            <h3>Founder photo coming soon</h3>
            <p>No stock headshot here. This spot is reserved for a real photo when it is ready.</p>
          </div>
        </div>`)}
      ${section(`
        <div class="section-heading">
          <p class="section-kicker">How I work</p>
          <h2>Small, clear, and built around what is actually happening.</h2>
        </div>
        <div class="check-card-grid">
          ${[
            "Start with one real problem before expanding anything.",
            "Use the tools you already have when they are the right fit.",
            "Skip fake ROI promises and measure practical improvements.",
            "Keep people in control of anything sensitive or important.",
            "Explain the workflow in plain English so you know what is running.",
            "Build websites and automations that support the way the business already works.",
          ]
            .map((item) => `<article class="check-card">${icon("check")}<p>${escapeHtml(item)}</p></article>`)
            .join("")}
        </div>`)}
      ${section(`
        <div class="two-column-section">
          <div>
            <p class="section-kicker">Good first conversations</p>
            <h2>Bring one workflow or website problem.</h2>
            <p>The best starting point is usually specific: leads are being missed, quotes are not followed up on, forms create messy handoffs, the website is unclear, or content ideas never make it onto a schedule.</p>
            <p>If automation is not the right first move, I will say that. Sometimes the better answer is a cleaner page, a better form, or a simpler process before any AI tools get involved.</p>
          </div>
          <div class="audit-panel">
            <h3>Good problems to send over</h3>
            ${listItems([
              "A website that is not turning visitors into leads",
              "Follow-up that depends on memory or inbox checking",
              "Quote or estimate conversations that go quiet",
              "Forms, emails, or requests that need clearer ownership",
              "Repeated customer questions that should have better answers",
            ], "check-list")}
          </div>
        </div>`)}
      ${section(renderWorkflowAuditForm({
        source: "About Page",
        title: "Tell me one workflow or website problem you want to clean up.",
      }), "form-section")}
    </main>`;

  return page(
    body,
    {
      title: "About WNY Automation Co | Websites and Automation for Local Businesses",
      description:
        "Meet Ethan Fleury, founder of WNY Automation Co. Practical website creation, automation, AI tools, and workflow support for Western New York businesses.",
      path: "/about",
    },
    [breadcrumbSchema(crumbs), localBusinessSchema("/about")],
  );
}

function renderBlogPreview(posts) {
  return section(`
    <div class="section-heading">
      <p class="section-kicker">WNY Automation Co Blog</p>
      <h2>Practical automation ideas for local businesses.</h2>
      <p>Plain-English guides for reducing admin work, improving follow-up, and making operations smoother.</p>
    </div>
    <div class="blog-feed">${posts.length ? posts.map((post) => renderBlogCard(post)).join("") : `<p class="blog-empty">No blog posts are published yet.</p>`}</div>
    <div class="section-actions"><a class="button button-secondary" href="/blog">${icon("book-open")}View all posts</a></div>`, "blogs-section");
}

function renderWorkflowAuditPage() {
  const body = `
    <main>
      ${renderSEOPageHero({
        eyebrow: "Free workflow audit",
        h1: "Free Workflow Audit for Buffalo Small Businesses",
        subheading:
          "Submit one repetitive task and WNY Automation Co will help identify practical automation ideas that fit your current tools and team.",
        primaryHref: "#workflow-form",
      })}
      ${section(`
        <div class="two-column-section">
          <div>
            <p class="section-kicker">What the audit includes</p>
            <h2>A clear look at one workflow before you buy more tools.</h2>
            ${listItems([
              "The manual steps your team follows today",
              "The tools already connected to the task",
              "Where delays or missed opportunities happen",
              "A small first automation idea if it makes sense",
            ], "check-list")}
          </div>
          <div class="audit-panel">
            <h3>Good tasks to submit</h3>
            ${listItems([
              "Missed lead follow-up",
              "Open quote follow-up",
              "Website FAQ and lead capture",
              "Appointment and review reminders",
              "Copying form or email details into another tool",
              "Website or blog schedule planning",
            ], "check-list")}
          </div>
        </div>`)}
      ${renderHowItWorksSection()}
      ${section(renderWorkflowAuditForm({ source: "Free Workflow Audit Page" }), "form-section")}
      ${renderFAQSection(workflowAuditFaqs, "Workflow audit questions")}
    </main>`;

  return page(
    body,
    {
      title: "Free Workflow Audit for Buffalo Small Businesses | WNY Automation Co",
      description:
        "Submit one manual task and get practical automation ideas for your Buffalo or Western New York small business.",
      path: "/free-workflow-audit",
    },
    [localBusinessSchema("/free-workflow-audit"), faqPageSchema(workflowAuditFaqs)],
  );
}

function renderServicesIndex() {
  return indexPage({
    path: "/services",
    title: "Automation and Website Services for Buffalo Small Businesses | WNY Automation Co",
    h1: "Services built around real small-business work.",
    intro:
      "Explore practical systems for missed leads, quote follow-up, intake tasks, website FAQs, customer reminders, website creation, and blog schedules.",
    items: services,
    basePath: "/services",
  });
}

function renderIndustriesIndex() {
  return indexPage({
    path: "/industries",
    title: "Workflow Automation by Industry | WNY Automation Co",
    h1: "Workflow automation ideas for local industries.",
    intro:
      "Browse practical workflow ideas for home services, professional offices, restaurants, med spas, contractors, property managers, and other local businesses.",
    items: industries,
    basePath: "/industries",
  });
}

function indexPage({ path, title, h1, intro, items, basePath }) {
  const body = `
    <main>
      ${renderSEOPageHero({ eyebrow: "WNY Automation Co", h1, subheading: intro })}
      ${section(renderIndexGrid(items, basePath))}
      ${renderCTASection({ withForm: false })}
    </main>`;

  return page(body, { title, description: intro, path });
}

function renderServicePage(service) {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: service.title, href: `/services/${service.slug}` },
  ];
  const related = [...serviceLinks(service.relatedServices), ...industryLinks(service.relatedIndustries)];
  const body = `
    <main>
      <div class="section-inner">${renderBreadcrumbs(crumbs)}</div>
      ${renderSEOPageHero({
        eyebrow: "Workflow automation service",
        h1: service.h1,
        subheading: service.shortDescription,
      })}
      ${renderPainPointSection({ title: "Manual work this can help reduce", items: service.painPoints })}
      ${section(`
        <div class="two-column-section">
          <div>
            <p class="section-kicker">What this automation does</p>
            <h2>Simple workflow support without a giant software project.</h2>
            <p>${escapeHtml(service.shortDescription)}</p>
            <h3>Example workflow</h3>
            <p>${escapeHtml(service.exampleWorkflow)}</p>
          </div>
          <div class="audit-panel">
            <h3>Tools it can connect to</h3>
            ${listItems(service.toolsItCanConnect, "check-list")}
          </div>
        </div>`)}
      ${section(`
        <div class="section-heading"><p class="section-kicker">Benefits</p><h2>What a cleaner workflow can improve.</h2></div>
        <div class="check-card-grid">${service.benefits.map((item) => `<article class="check-card">${icon("check")}<p>${escapeHtml(item)}</p></article>`).join("")}</div>`)}
      ${renderHowItWorksSection()}
      ${renderInternalLinksSection("Related services and industries", related)}
      ${renderFAQSection(service.faqs, "Questions about this service")}
      ${renderCTASection({ withForm: true, source: service.title })}
    </main>`;

  return page(
    body,
    {
      title: service.metaTitle,
      description: service.metaDescription,
      path: `/services/${service.slug}`,
    },
    [breadcrumbSchema(crumbs), serviceSchema(service), faqPageSchema(service.faqs)],
  );
}

function renderIndustryPage(industry) {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Industries", href: "/industries" },
    { label: industry.title, href: `/industries/${industry.slug}` },
  ];
  const body = `
    <main>
      <div class="section-inner">${renderBreadcrumbs(crumbs)}</div>
      ${renderSEOPageHero({ eyebrow: "Industry automation", h1: industry.h1, subheading: industry.intro })}
      ${renderPainPointSection({ title: "Common manual tasks in this industry", items: industry.commonPainPoints })}
      ${renderAutomationExamplesGrid({
        title: "How workflow automation can help",
        examples: industry.automationIdeas.map((item) => ({ title: item, description: "A focused workflow that can be reviewed by a human before expanding." })),
      })}
      ${section(`
        <div class="two-column-section">
          <div>
            <p class="section-kicker">Example workflow</p>
            <h2>A realistic first automation.</h2>
            <p>${escapeHtml(industry.exampleWorkflow)}</p>
          </div>
          <div class="audit-panel">
            <h3>Start small</h3>
            <p>Pick one repeated task with clear steps. Prove the workflow, then decide whether to improve more of the operation.</p>
          </div>
        </div>`)}
      ${renderInternalLinksSection("Recommended automations", serviceLinks(industry.recommendedServices))}
      ${renderFAQSection(industry.faqs, "Questions for this industry")}
      ${renderCTASection({ withForm: true, source: industry.title })}
    </main>`;

  return page(
    body,
    {
      title: industry.metaTitle,
      description: industry.metaDescription,
      path: `/industries/${industry.slug}`,
    },
    [breadcrumbSchema(crumbs), faqPageSchema(industry.faqs)],
  );
}

function renderCaseStudiesIndex() {
  const body = `
    <main>
      ${renderSEOPageHero({
        eyebrow: "Sample workflows",
        h1: "Workflow examples for future case studies.",
        subheading: "These are sample workflow examples, not client case studies. Replace them with approved real stories when ready.",
      })}
      ${section(renderIndexGrid(caseStudies, "/case-studies"))}
      ${renderCTASection({ withForm: false })}
    </main>`;
  return page(body, {
    title: "Sample Workflow Examples | WNY Automation Co",
    description: "Sample workflow examples for local business automation. These are not client case studies.",
    path: "/case-studies",
  });
}

function renderCaseStudyPage(caseStudy) {
  const body = `
    <main>
      ${renderSEOPageHero({
        eyebrow: caseStudy.disclaimer,
        h1: caseStudy.title,
        subheading: `${caseStudy.businessType} example workflow in ${caseStudy.location}. This is not a real client result.`,
      })}
      ${section(`
        <div class="two-column-section">
          <div>
            <p class="section-kicker">Problem</p>
            <h2>${escapeHtml(caseStudy.problem)}</h2>
            <p>${escapeHtml(caseStudy.solution)}</p>
          </div>
          <div class="audit-panel"><h3>Tools used</h3>${listItems(caseStudy.toolsUsed, "check-list")}</div>
        </div>`)}
      ${section(`<div class="section-heading"><p class="section-kicker">Workflow</p><h2>Sample steps.</h2></div>${listItems(caseStudy.workflow, "numbered-list")}`)}
      ${renderInternalLinksSection("Related services", serviceLinks(caseStudy.relatedServices))}
      ${renderCTASection({ withForm: false })}
    </main>`;
  return page(body, {
    title: `${caseStudy.title} | Sample Workflow | WNY Automation Co`,
    description: `${caseStudy.disclaimer}. ${caseStudy.problem}`,
    path: `/case-studies/${caseStudy.slug}`,
  });
}

function renderBlogIndexPage(posts) {
  const body = `
    <main>
      ${renderSEOPageHero({
        eyebrow: "WNY Automation Co Blog",
        h1: "Practical automation ideas for local businesses.",
        subheading:
          "Plain-English guides for reducing admin work, improving follow-up, and making operations smoother.",
      })}
      ${section(`<div class="blog-feed">${posts.length ? posts.map((post) => renderBlogCard(post)).join("") : `<p class="blog-empty">No posts have been published yet.</p>`}</div>`)}
      ${renderCTASection({ withForm: false })}
    </main>`;
  return page(body, {
    title: "Blog | WNY Automation Co",
    description: "Practical WNY Automation Co blog guides for automating repetitive work in Buffalo, Niagara, and Western New York.",
    path: "/blog",
  });
}

function renderBlogPostPage(post) {
  const isSample = post.status === "sample";
  const articleHtml = post.blog_html || markdownToHtml(post.body || post.blog_markdown || "");
  const related = [...serviceLinks(post.relatedServices), ...industryLinks(post.relatedIndustries)];
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title, href: `/blog/${post.slug}` },
  ];
  const body = `
    <main>
      <article class="blog-page">
        <div class="section-inner blog-article-inner">
          ${renderBreadcrumbs(crumbs)}
          <div class="article-shell">
            <p class="section-kicker">${escapeHtml(isSample ? "Sample draft" : post.category || post.industry || "WNY Automation Co Blog")}</p>
            <h1>${escapeHtml(post.title)}</h1>
            <div class="article-meta">
              ${post.publish_date || post.publishDate ? `<span>${escapeHtml(formatDisplayDate(post.publish_date || post.publishDate))}</span>` : ""}
              <span>${escapeHtml(post.author || business.businessName)}</span>
            </div>
            ${isSample ? `<p class="sample-notice">Sample draft placeholder. Replace this with a real n8n-generated article before launch.</p>` : ""}
            ${
              post.image_url || post.featuredImage
                ? `<img class="blog-hero-image" src="${escapeAttribute(post.image_url || post.featuredImage)}" alt="${escapeAttribute(post.image_alt || post.title)}" loading="eager" />`
                : ""
            }
            <div class="article-body">${articleHtml}</div>
          </div>
        </div>
      </article>
      ${renderInternalLinksSection("Related reading and services", related)}
      ${renderCTASection({ withForm: false })}
    </main>`;
  return page(
    body,
    {
      title: `${post.meta_title || post.metaTitle || post.title} | WNY Automation Co`,
      description: post.meta_description || post.metaDescription || post.excerpt || "",
      path: `/blog/${post.slug}`,
      type: "article",
      image: post.image_url || post.featuredImage || "/assets/site-icon-512.png",
    },
    [breadcrumbSchema(crumbs), articleSchema(post)],
  );
}

function renderLegalPage(type) {
  const isPrivacy = type === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms";
  const body = `
    <main>
      ${renderSEOPageHero({
        eyebrow: "Legal placeholder",
        h1: title,
        subheading: "Placeholder legal copy. Review with a qualified professional before launch.",
      })}
      ${section(`
        <div class="article-body legal-copy">
          <h2>Review before launch</h2>
          <p>This page is placeholder copy for ${escapeHtml(business.businessName)} and should be reviewed before the site is used publicly.</p>
          <h2>Information collected</h2>
          <p>Lead forms may collect contact details, business information, page source, UTM values, and the manual task submitted by the visitor.</p>
          <h2>How information is used</h2>
          <p>Information is used to respond to workflow audit requests and improve communication with interested businesses.</p>
          <h2>Contact</h2>
          <p>Email ${escapeHtml(business.email)} with questions.</p>
        </div>`)}
    </main>`;
  return page(body, {
    title: `${title} | WNY Automation Co`,
    description: `${title} placeholder for WNY Automation Co. Review before launch.`,
    path: isPrivacy ? "/privacy-policy" : "/terms",
  });
}

function renderHtmlSitemapPage(staticRoutes, blogRoutes = []) {
  const all = [...staticRoutes, ...blogRoutes];
  const body = `
    <main>
      ${renderSEOPageHero({ eyebrow: "Sitemap", h1: "HTML sitemap", subheading: "A plain list of public WNY Automation Co pages." })}
      ${section(`<div class="sitemap-list">${all.map((route) => `<a href="${escapeAttribute(route.path)}">${escapeHtml(route.path)}</a>`).join("")}</div>`)}
    </main>`;
  return page(body, {
    title: "Sitemap | WNY Automation Co",
    description: "HTML sitemap for WNY Automation Co pages.",
    path: "/sitemap",
  });
}

function renderNotFoundPage() {
  const body = `
    <main class="not-found-page">
      ${renderSEOPageHero({
        eyebrow: "Not found",
        h1: "That page is not here.",
        subheading: "The link may have changed, or the article has not been published yet.",
        primaryHref: "/",
        primaryLabel: "Back to WNY Automation Co",
      })}
    </main>`;
  return page(body, { title: "Page Not Found | WNY Automation Co", description: "The requested WNY Automation Co page was not found.", path: "/", noindex: true });
}

function renderSitemapXml(routes) {
  const urls = routes
    .map(
      (route) => `
  <url>
    <loc>${escapeHtml(absoluteUrl(route.path))}</loc>
    <changefreq>${escapeHtml(route.changefreq || "weekly")}</changefreq>
    <priority>${escapeHtml(route.priority || "0.7")}</priority>
  </url>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

function renderRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
}

function getStaticRoutes() {
  return buildStaticRoutes({ services, industries, caseStudies, blogPosts });
}

function serviceLinks(slugs = []) {
  return [...new Set(slugs || [])]
    .map((slug) => serviceBySlug.get(slug))
    .filter(Boolean)
    .map((item) => ({ label: item.title, href: `/services/${item.slug}`, description: item.shortDescription }));
}

function industryLinks(slugs = []) {
  return (slugs || [])
    .map((slug) => industryBySlug.get(slug))
    .filter(Boolean)
    .map((item) => ({ label: item.title, href: `/industries/${item.slug}`, description: item.intro }));
}

module.exports = {
  caseStudyBySlug,
  getStaticRoutes,
  industryBySlug,
  renderAboutPage,
  renderBlogIndexPage,
  renderBlogPostPage,
  renderCaseStudiesIndex,
  renderCaseStudyPage,
  renderHomePage,
  renderHtmlSitemapPage,
  renderIndustriesIndex,
  renderIndustryPage,
  renderLegalPage,
  renderNotFoundPage,
  renderRobotsTxt,
  renderServicePage,
  renderServicesIndex,
  renderSitemapXml,
  renderWorkflowAuditPage,
  sampleBlogBySlug,
  serviceBySlug,
};
