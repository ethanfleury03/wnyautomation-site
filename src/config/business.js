const isStaging = process.env.APP_ENV === "staging";
const productionPortalHosts = new Set([
  "app.wnyautomation.com",
  "admin.wnyautomation.com",
  "awp.wnyautomation.com",
]);

function defaultSiteUrl() {
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://wnyautomation.com";
}

function requireStagingUrl(name, value) {
  const raw = String(value || "").trim();
  if (!raw) {
    throw new Error(`${name} is required when APP_ENV=staging.`);
  }

  const url = new URL(raw);
  if (productionPortalHosts.has(url.hostname)) {
    throw new Error(`${name} must not point at production when APP_ENV=staging.`);
  }
  return url.toString();
}

function clientLoginUrl() {
  const configured =
    process.env.NEXT_PUBLIC_CLIENT_LOGIN_URL ||
    process.env.NEXT_PUBLIC_AWP_PORTAL_SIGN_IN_URL ||
    "";

  if (isStaging) {
    return requireStagingUrl("NEXT_PUBLIC_CLIENT_LOGIN_URL", configured);
  }

  return configured || "https://app.wnyautomation.com/sign-in?redirect_url=/launch";
}

const business = {
  businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || "WNY Business Automation",
  legalName: "WNY Business Automation LLC",
  shortName: "WNY Business Automation",
  tagline: "Practical automation for local businesses.",
  subline: "Start small. Fix one workflow. Prove value.",
  positioning: "Practical websites, blog schedules, and workflow automation for local businesses.",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "",
  contactPath: "/free-workflow-audit#workflow-form",
  serviceArea: [
    "Buffalo, NY",
    "Niagara Falls, NY",
    "Amherst, NY",
    "Williamsville, NY",
    "Cheektowaga, NY",
    "Tonawanda, NY",
    "Lockport, NY",
    "Lewiston, NY",
    "Grand Island, NY",
    "Western New York",
  ],
  primaryCity: process.env.NEXT_PUBLIC_PRIMARY_CITY || "Buffalo",
  primaryState: "NY",
  primaryRegion: process.env.NEXT_PUBLIC_PRIMARY_REGION || "Western New York",
  address: {
    street: process.env.NEXT_PUBLIC_BUSINESS_STREET || "",
    city: process.env.NEXT_PUBLIC_PRIMARY_CITY || "Buffalo",
    state: "NY",
    postalCode: process.env.NEXT_PUBLIC_BUSINESS_POSTAL_CODE || "",
    country: "US",
  },
  socialLinks: {
    linkedin: "",
    facebook: "",
    instagram: "",
  },
  googleBusinessProfileUrl: "",
  awpPortalSignInUrl: clientLoginUrl(),
  clientLoginPath: "/client-login",
  n8nWebhookUrl: process.env.N8N_LEAD_WEBHOOK_URL || "",
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl()),
  defaultSeoTitle: "WNY Business Automation | Websites and Automation for Local Businesses",
  defaultSeoDescription:
    "WNY Business Automation helps Buffalo, Niagara, and Western New York businesses with website creation, blog schedules, missed lead follow-up, quote follow-up, and practical workflow automation.",
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
    gscVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  },
};

function normalizeSiteUrl(value) {
  return String(value || defaultSiteUrl()).replace(/\/+$/, "");
}

module.exports = business;
