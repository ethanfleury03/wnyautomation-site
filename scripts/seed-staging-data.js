#!/usr/bin/env node
const { Pool } = require("@neondatabase/serverless");
const { saveBlogFromPayload } = require("../src/server/blog-store");

const CONFIRM_VALUE = "seed-staging-data";

function requireStaging() {
  if (process.env.APP_ENV !== "staging") {
    throw new Error('Refusing to seed: APP_ENV must be exactly "staging".');
  }
  if (process.env.STAGING_SEED_CONFIRM !== CONFIRM_VALUE) {
    throw new Error(`Refusing to seed: STAGING_SEED_CONFIRM must be "${CONFIRM_VALUE}".`);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("Refusing to seed: DATABASE_URL is required for persistent staging site data.");
  }
}

async function ensureLeadSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS marketing_leads (
      id UUID PRIMARY KEY,
      company_id UUID,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      trade TEXT,
      message TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      referrer TEXT,
      user_agent TEXT,
      ip_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW())
    );
    CREATE INDEX IF NOT EXISTS idx_marketing_leads_kind ON marketing_leads(kind);
    CREATE INDEX IF NOT EXISTS idx_marketing_leads_email ON marketing_leads(email);
    CREATE INDEX IF NOT EXISTS idx_marketing_leads_created ON marketing_leads(created_at);
  `);
}

async function upsertLead(pool, lead) {
  await pool.query(
    `
      INSERT INTO marketing_leads (
        id, kind, name, email, company, phone, trade, message,
        utm_source, utm_medium, utm_campaign, referrer, user_agent, ip_hash,
        created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        'staging', 'seed', 'test-environment', $9, 'WNY staging seed', NULL,
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        kind = EXCLUDED.kind,
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        company = EXCLUDED.company,
        phone = EXCLUDED.phone,
        trade = EXCLUDED.trade,
        message = EXCLUDED.message,
        referrer = EXCLUDED.referrer,
        updated_at = NOW()
    `,
    [
      lead.id,
      lead.kind,
      lead.name,
      lead.email,
      lead.company,
      lead.phone,
      lead.trade,
      lead.message,
      process.env.NEXT_PUBLIC_SITE_URL || "https://wnyautomation-git-staging-wny-automation.vercel.app",
    ],
  );
}

async function seedBlogs() {
  const blogs = [
    {
      title: "Staging: Automating a Small Business Follow-Up Loop",
      slug: "staging-small-business-follow-up-loop",
      excerpt: "A fake staging post for validating the WNY Automation blog pipeline.",
      caption: "A fake staging post for validating the WNY Automation blog pipeline.",
      meta_title: "Staging Small Business Follow-Up Loop",
      meta_description: "Fake staging content used to test WNY Automation blog rendering.",
      industry: "operations",
      publish_date: "2026-05-14",
      blog_markdown:
        "## Quick Answer\nThis staging post verifies that blog publishing, rendering, and sanitization work without touching production content.\n\n- Fake business\n- Fake workflow\n- Fake measurable outcome",
      image_url: "",
      image_alt: "Staging blog placeholder",
      status: "published",
    },
    {
      title: "Staging: Website Lead Routing Smoke Test",
      slug: "staging-website-lead-routing-smoke-test",
      excerpt: "A fake staging post for checking lead capture and routing copy.",
      caption: "A fake staging post for checking lead capture and routing copy.",
      meta_title: "Staging Website Lead Routing Smoke Test",
      meta_description: "Fake staging content used to test WNY Automation lead capture routes.",
      industry: "lead operations",
      publish_date: "2026-05-13",
      blog_markdown:
        "## Quick Answer\nThis staging post keeps the public blog list populated while test leads are submitted against isolated staging data.",
      image_url: "",
      image_alt: "Staging lead routing placeholder",
      status: "published",
    },
  ];

  for (const blog of blogs) {
    await saveBlogFromPayload(blog);
  }
}

async function seedLeads() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await ensureLeadSchema(pool);
    const leads = [
      {
        id: "00000000-0000-4000-8000-000000001001",
        kind: "demo",
        name: "Morgan Staging",
        email: "morgan.staging@example.test",
        company: "Staging HVAC Co",
        phone: "(716) 555-0101",
        trade: "HVAC",
        message: "Fake staging lead for verifying lead intake without firing production automation.",
      },
      {
        id: "00000000-0000-4000-8000-000000001002",
        kind: "contact",
        name: "Jamie Test",
        email: "jamie.test@example.test",
        company: "Test Property Services",
        phone: "(716) 555-0102",
        trade: "Property services",
        message: "Fake staging lead for checking admin review and webhook-disabled behavior.",
      },
    ];

    for (const lead of leads) {
      await upsertLead(pool, lead);
    }
  } finally {
    await pool.end();
  }
}

async function main() {
  requireStaging();
  await seedBlogs();
  await seedLeads();
  console.log("[seed-staging-data] Seed complete");
}

main().catch((error) => {
  console.error("[seed-staging-data] Failed", error);
  process.exit(1);
});
