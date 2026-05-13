#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const VERIFIED_CSV = "data/outreach/wny-verified-no-website-leads.csv";
const REJECTED_CSV = "data/outreach/wny-rejected-website-found.csv";
const UNVERIFIED_CSV = "data/outreach/wny-unverified-search-failed.csv";

const TARGET_ADDS = Number(process.env.TARGET_ADDS || 100);
const SEARCH_DELAY_MS = Number(process.env.SEARCH_DELAY_MS || 2500);
const MAX_CHECKS = Number(process.env.MAX_CHECKS || 350);

const denyDomains = new Set([
  "211wny.org", "411.info", "alignable.com", "allbiz.com", "angi.com", "apple.com",
  "bank-exit.org", "bbb.org", "bestprosintown.com", "bing.com", "bizapedia.com",
  "bizprofile.net", "buildzoom.com", "businessyab.com", "buzzfile.com",
  "chamberofcommerce.com", "city-data.com", "clutch.co", "cmac.ws", "com-place.com",
  "cylex.us.com", "datanyze.com", "dnb.com", "doordash.com", "dunandbradstreet.com",
  "edan.io", "facebook.com", "findglocal.com", "foursquare.com", "giftly.com",
  "glassdoor.com", "google.com", "groupon.com", "hotfrog.com", "indeed.com",
  "instagram.com", "loc8nearme.com", "local.yahoo.com", "localitybiz.com",
  "locally.com", "mapquest.com", "manta.com", "menuguide.com", "merchantcircle.com",
  "nextdoor.com", "opengovny.com", "openstreetmap.org", "patch.com", "puffingbird.com",
  "res-menu.net", "restaurantguru.com", "restaurantji.com", "sirved.com",
  "smokeshops.com", "specialtygrocery.net", "stepoutbuffalo.com", "superpages.com",
  "thebluebook.com", "thelandscapeconnection.com", "thumbtack.com", "tripadvisor.com",
  "twitter.com", "usbizs.com", "waze.com", "weeblyte.com", "wheree.com", "whereorg.com",
  "womply.com", "x.com", "yellowpages.com", "yelp.com", "youtube.com", "youtu.be",
  "zillow.com", "zmenu.com", "zoominfo.com",
]);

const rejectAlwaysDomains = new Set([
  "doitbest.com",
  "grubhub.com",
  "lovable.app",
  "opentable.com",
  "square.site",
  "toasttab.com",
]);

const lowValueNames = /\b(ace hardware|bj's|bruegger|chili's|cubesmart|five star bank|gnc|hard rock cafe|homegoods|howard hanna|keybank|kwik fill|little caesars|mobil|nbt bank|old navy|red robin|sally beauty|tj maxx|tops|tractor supply|wegmans|allstate|athleta|bath & body|bed bath|denny's|extra space|famous footwear|goodwill|jared|jcpenney|napa|price rite|rent-a-center|shake shack|sleep number|supercuts|texas roadhouse|home depot|a&w|aaa|aamco|advance auto|aeropostale|allegra|aloft|american red cross|america's best|rainforest cafe|lands' end|home outlet|western new york dental group)\b/i;

const preferredCategories = /^(amenity:(bar|restaurant|cafe|marketplace)|shop:(bakery|beauty|hairdresser|car_repair|laundry|farm|gift|craft|e-cigarette|hardware|doityourself|bicycle|general|alcohol|copyshop|clothes|books|florist|jewelry|shoes|tailor)|office:(lawyer|company)|craft:)/;

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i += 1) {
    const ch = csv[i];
    const next = csv[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...records] = rows.filter((candidate) => candidate.length && candidate.some((value) => value !== ""));
  return {
    headers,
    rows: records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""]))),
  };
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n\r]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
  return stringValue;
}

function toCsv(headers, rows) {
  return `${headers.join(",")}\n${rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")).join("\n")}\n`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function domainFor(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    const parts = host.split(".");
    if (parts.length <= 2) return host;
    return parts.slice(-2).join(".");
  } catch {
    return "";
  }
}

function isDeniedDomain(domain) {
  return [...denyDomains].some((deny) => domain === deny || domain.endsWith(`.${deny}`));
}

async function braveSearch(lead) {
  const query = `"${lead.name}" ${lead.city} NY website`;
  const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`;
  const response = await fetch(url, {
    headers: {
      "accept": "text/html,application/xhtml+xml",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 lead verification",
    },
  });
  if (!response.ok) throw new Error(`Brave returned ${response.status}`);
  const html = await response.text();
  const results = [];
  const seen = new Set();
  for (const match of html.matchAll(/<a\s+[^>]*href="(https?:\/\/[^"]+)"[^>]*class="[^"]*svelte-14r20fy[^"]*"[^>]*>([\s\S]*?)<\/a>/g)) {
    const url = decodeHtml(match[1]);
    const title = decodeHtml(match[2].replace(/<[^>]+>/g, " "));
    const domain = domainFor(url);
    if (!domain || domain === "brave.com" || seen.has(url)) continue;
    seen.add(url);
    results.push({ url, title, domain });
    if (results.length >= 10) break;
  }
  return { query, results };
}

function classify(lead, search) {
  if (!search.results.length) return { status: "unverified", reason: "No parseable Brave results" };
  const firstDomains = search.results.slice(0, 8).map((result) => result.domain);
  const official = search.results.slice(0, 8).find((result) => {
    if (rejectAlwaysDomains.has(result.domain)) return true;
    return !isDeniedDomain(result.domain);
  });
  if (official) {
    return {
      status: "reject",
      reason: `Likely official/non-directory domain in top results: ${official.domain}`,
      website_found_url: official.url,
      website_found_title: official.title,
    };
  }
  return {
    status: "verify",
    reason: `Top Brave results were directory/social/review/listing domains only: ${[...new Set(firstDomains)].join("; ")}`,
  };
}

async function main() {
  const verified = parseCsv(await readFile(VERIFIED_CSV, "utf8"));
  const rejected = parseCsv(await readFile(REJECTED_CSV, "utf8"));
  const unverified = parseCsv(await readFile(UNVERIFIED_CSV, "utf8"));
  const verifiedNames = new Set(verified.rows.map((row) => row.name));
  const rejectedNames = new Set(rejected.rows.map((row) => row.name));
  const additions = [];
  const rejections = [];
  const remaining = [];
  let checks = 0;

  for (const lead of unverified.rows) {
    if (additions.length >= TARGET_ADDS || checks >= MAX_CHECKS) {
      remaining.push(lead);
      continue;
    }
    if (!preferredCategories.test(lead.category) || lowValueNames.test(lead.name)) {
      remaining.push(lead);
      continue;
    }
    checks += 1;
    process.stderr.write(`Checking ${checks}: ${lead.name} (${additions.length}/${TARGET_ADDS} added)\n`);
    let search;
    try {
      search = await braveSearch(lead);
    } catch (error) {
      remaining.push(lead);
      process.stderr.write(`  unverified: ${error.message}\n`);
      await sleep(SEARCH_DELAY_MS);
      continue;
    }
    const decision = classify(lead, search);
    if (decision.status === "verify" && !verifiedNames.has(lead.name)) {
      verifiedNames.add(lead.name);
      additions.push({
        ...lead,
        verification_status: "brave_verified_no_official_website_in_top_results",
        search_query: search.query,
        searched_at: new Date().toISOString(),
        verification_notes: decision.reason,
      });
      process.stderr.write(`  verified: ${decision.reason}\n`);
    } else if (decision.status === "reject" && !rejectedNames.has(lead.name)) {
      rejectedNames.add(lead.name);
      rejections.push({
        ...lead,
        verification_status: "rejected_website_found_brave",
        website_found_url: decision.website_found_url,
        website_found_title: decision.website_found_title,
        search_query: search.query,
      });
      process.stderr.write(`  rejected: ${decision.reason}\n`);
    } else {
      remaining.push(lead);
      process.stderr.write(`  unverified: ${decision.reason}\n`);
    }
    await sleep(SEARCH_DELAY_MS);
  }

  const verifiedHeaders = verified.headers.includes("verification_notes") ? verified.headers : [...verified.headers, "verification_notes"];
  const verifiedRows = verified.rows.map((row) => ({ ...row, verification_notes: row.verification_notes || "" }));
  const newVerifiedRows = additions.map((row) => Object.fromEntries(verifiedHeaders.map((header) => [header, row[header] ?? ""])));
  const newRejectedRows = rejections.map((row) => Object.fromEntries(rejected.headers.map((header) => [header, row[header] ?? ""])));
  await writeFile(VERIFIED_CSV, toCsv(verifiedHeaders, [...verifiedRows, ...newVerifiedRows]));
  await writeFile(REJECTED_CSV, toCsv(rejected.headers, [...rejected.rows, ...newRejectedRows]));
  await writeFile(UNVERIFIED_CSV, toCsv(unverified.headers, remaining));
  process.stderr.write(`Added ${additions.length}; rejected ${rejections.length}; checked ${checks}; remaining ${remaining.length}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
