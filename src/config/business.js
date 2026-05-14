const business = {
  businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || "WNY Automation Co",
  shortName: "WNY Automation",
  tagline: "Practical workflow automation for local businesses.",
  subline: "Start small. Fix one workflow. Prove value.",
  positioning: "Practical websites, blog schedules, and workflow automation for local businesses.",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "hello@wnyautomation.co",
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
  bookingLink: process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendly.com/wnyautomation/free-workflow-audit",
  awpPortalSignInUrl: "https://app.wnyautomation.com/sign-in?redirect_url=/launch",
  clientGatewaySignInUrl: "https://awp.wnyautomation.com/sign-in?redirect_url=/app",
  clientLoginPath: "/client-login",
  clientPortalUrl: "https://awp.wnyautomation.com/sign-in?redirect_url=/app",
  n8nWebhookUrl: process.env.N8N_LEAD_WEBHOOK_URL || "",
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  defaultSeoTitle: "WNY Automation Co | Websites and Automation for Local Businesses",
  defaultSeoDescription:
    "WNY Automation Co helps Buffalo, Niagara, and Western New York businesses with website creation, blog schedules, missed lead follow-up, quote follow-up, and practical workflow automation.",
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
    gscVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  },
};

function normalizeSiteUrl(value) {
  return String(value || "http://localhost:3000").replace(/\/+$/, "");
}

module.exports = business;
