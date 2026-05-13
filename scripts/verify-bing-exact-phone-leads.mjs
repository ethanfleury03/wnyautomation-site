#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const VERIFIED_CSV = "data/outreach/wny-verified-no-website-leads.csv";
const REJECTED_CSV = "data/outreach/wny-rejected-website-found.csv";
const UNVERIFIED_CSV = "data/outreach/wny-unverified-search-failed.csv";
const CACHE_FILE = "data/outreach/bing-exact-phone-verification-cache.json";

const TARGET_ADDS = Number(process.env.TARGET_ADDS || 100);
const MAX_CHECKS = Number(process.env.MAX_CHECKS || 500);
const SEARCH_DELAY_MS = Number(process.env.SEARCH_DELAY_MS || 900);
const MIN_RESULTS = Number(process.env.MIN_RESULTS || 2);

const directoryDomains = [
  "2findlocal.com", "411.info", "8coupons.com", "ablocal.com", "alignable.com",
  "allbiz.com", "angi.com", "apple.com", "bbb.org", "bestprosintown.com",
  "bing.com", "bizapedia.com", "bizprofile.net", "booksy.com", "brownbook.net",
  "buildzoom.com", "businessyab.com", "buzzfile.com", "chamberofcommerce.com",
  "checkle.com", "city-data.com", "clutch.co", "cmac.ws", "com-place.com",
  "cylex.us.com", "datanyze.com", "dnb.com", "dunandbradstreet.com",
  "edan.io", "ezlocal.com", "facebook.com", "findglocal.com", "foursquare.com",
  "giftly.com", "glassdoor.com", "google.com", "groupon.com", "hotfrog.com",
  "hours.com", "indeed.com", "instagram.com", "kiddle.co", "local.com",
  "local.yahoo.com", "localitybiz.com", "loc8nearme.com", "locally.com",
  "mapcarta.com", "mapquest.com", "manta.com", "menuguide.com", "menupix.com",
  "merchantcircle.com", "nicelocal.com", "nextdoor.com", "opencorporates.com",
  "opengovny.com", "openstreetmap.org", "patch.com", "pinterest.com",
  "restaurantguru.com", "restaurantji.com", "restaurantjump.com",
  "restaurants10.org", "res-menu.net", "sirved.com", "superpages.com",
  "thebluebook.com", "thumbtack.com", "tripadvisor.com", "twitter.com",
  "usarestaurants.info", "usbizs.com", "waze.com", "wheree.com", "whereorg.com",
  "womply.com", "x.com", "yellowpages.com", "yelp.com", "youtube.com",
  "youtu.be", "zillow.com", "zmenu.com", "zoominfo.com",
];

const rejectAlwaysDomains = [
  "doitbest.com", "grubhub.com", "lovable.app", "opentable.com", "square.site",
  "toasttab.com", "ubereats.com", "wixsite.com",
];

const lowValueNames = /\b(ace hardware|bj's|bruegger|chili's|cubesmart|five star bank|gnc|hard rock cafe|homegoods|howard hanna|keybank|kwik fill|little caesars|mobil|nbt bank|old navy|red robin|sally beauty|tj maxx|tops|tractor supply|wegmans|allstate|athleta|bath & body|bed bath|denny's|extra space|famous footwear|goodwill|jared|jcpenney|napa|price rite|rent-a-center|shake shack|sleep number|supercuts|texas roadhouse|home depot|a&w|aaa|aamco|advance auto|aeropostale|allegra|aloft|american red cross|america's best|rainforest cafe|lands' end|home outlet|western new york dental group|mighty taco|five guys|subway|taco bell|dunkin|mcdonald|burger king|wendy|tim hortons|starbucks|dollar tree|family dollar|dollar general|aldi|target|walmart|michaels|joann|autozone|valvoline|mavis|monro|delta sonic|sherwin|spectrum|verizon|at&t|cricket|metro by t-mobile|bank of america|citizens bank|chase|northwest bank|genesee regional bank|rochester regional|strong west|university of rochester|fedex|ups|usps|hobby lobby|great clips|maurices|outback|pep boys|firestone|coffee beanery|consumers beverages|burgerfi|spot coffee|playa bowls)\b/i;

const preferredCategories = /^(amenity:(bar|restaurant|cafe|marketplace|fast_food)|shop:(bakery|beauty|hairdresser|car_repair|laundry|farm|gift|craft|e-cigarette|hardware|doityourself|bicycle|general|alcohol|copyshop|clothes|books|florist|jewelry|shoes|tailor|convenience|art)|office:(lawyer|company)|craft:)/;

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
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

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(llc|inc|ltd|corp|corporation|company|co|the|restaurant|barber|shop|salon|spa|auto|service|services)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function dedupeKey(lead) {
  return normalize(`${lead.name} ${lead.city}`);
}

function phoneQueryValue(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 10) return "";
  const local = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (local.length !== 10) return "";
  return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
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
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeBingUrl(href) {
  const decoded = decodeHtml(href);
  try {
    const url = new URL(decoded);
    const encodedTarget = url.searchParams.get("u");
    if (encodedTarget?.startsWith("a1")) {
      let base64 = encodedTarget.slice(2).replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) base64 += "=";
      return Buffer.from(base64, "base64").toString("utf8");
    }
    return decoded;
  } catch {
    return decoded;
  }
}

function rootDomain(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    const parts = host.split(".");
    if (parts.length <= 2) return host;
    return parts.slice(-2).join(".");
  } catch {
    return "";
  }
}

function isDirectoryDomain(domain) {
  return directoryDomains.some((directoryDomain) => domain === directoryDomain || domain.endsWith(`.${directoryDomain}`));
}

function isRejectAlwaysDomain(domain) {
  return rejectAlwaysDomains.some((rejectDomain) => domain === rejectDomain || domain.endsWith(`.${rejectDomain}`));
}

async function loadCache() {
  try {
    return JSON.parse(await readFile(CACHE_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function searchBing(lead, cache) {
  const phone = phoneQueryValue(lead.phone);
  const query = phone ? `"${lead.name}" "${phone}"` : `"${lead.name}" "${lead.city}" NY`;
  const cacheKey = `bing:${query}`;
  if (cache[cacheKey]) return cache[cacheKey];
  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(searchUrl, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122 Safari/537.36",
    },
  });
  if (!response.ok) throw new Error(`Bing returned ${response.status}`);
  const html = await response.text();
  const results = [];
  const seen = new Set();
  for (const match of html.matchAll(/<li class="b_algo"[\s\S]*?<\/li>/g)) {
    const block = match[0];
    const anchor = block.match(/<h2[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h2>/);
    if (!anchor) continue;
    const url = decodeBingUrl(anchor[1]);
    const domain = rootDomain(url);
    if (!domain || domain === "bing.com" || seen.has(url)) continue;
    seen.add(url);
    results.push({
      title: decodeHtml(anchor[2]),
      url,
      domain,
    });
    if (results.length >= 8) break;
  }
  const cached = { query, results, searched_at: new Date().toISOString() };
  cache[cacheKey] = cached;
  await writeFile(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);
  await sleep(SEARCH_DELAY_MS);
  return cached;
}

function classify(search) {
  if (search.results.length < MIN_RESULTS) {
    return { status: "unverified", reason: `Only ${search.results.length} parseable Bing result(s)` };
  }
  const official = search.results.slice(0, 8).find((result) => !isDirectoryDomain(result.domain) || isRejectAlwaysDomain(result.domain));
  if (official) {
    return {
      status: "reject",
      reason: `Possible official/non-directory site in exact search results: ${official.domain}`,
      website_found_url: official.url,
      website_found_title: official.title,
    };
  }
  return {
    status: "verify",
    reason: `Exact-name/phone Bing results show directory/social/listing domains only: ${[...new Set(search.results.map((result) => result.domain))].join("; ")}`,
  };
}

async function main() {
  const cache = await loadCache();
  const verified = parseCsv(await readFile(VERIFIED_CSV, "utf8"));
  const rejected = parseCsv(await readFile(REJECTED_CSV, "utf8"));
  const unverified = parseCsv(await readFile(UNVERIFIED_CSV, "utf8"));
  const verifiedKeys = new Set(verified.rows.map(dedupeKey));
  const rejectedKeys = new Set(rejected.rows.map(dedupeKey));
  const additions = [];
  const rejections = [];
  const remaining = [];
  let checks = 0;

  for (const lead of unverified.rows) {
    if (additions.length >= TARGET_ADDS || checks >= MAX_CHECKS) {
      remaining.push(lead);
      continue;
    }
    if (!preferredCategories.test(lead.category) || lowValueNames.test(lead.name) || !phoneQueryValue(lead.phone)) {
      remaining.push(lead);
      continue;
    }
    checks += 1;
    process.stderr.write(`Checking ${checks}: ${lead.name} (${additions.length}/${TARGET_ADDS} added)\n`);
    let search;
    try {
      search = await searchBing(lead, cache);
    } catch (error) {
      remaining.push(lead);
      process.stderr.write(`  unverified: ${error.message}\n`);
      await sleep(SEARCH_DELAY_MS);
      continue;
    }
    const decision = classify(search);
    const key = dedupeKey(lead);
    if (decision.status === "verify" && !verifiedKeys.has(key)) {
      verifiedKeys.add(key);
      additions.push({
        ...lead,
        verification_status: "bing_exact_phone_verified_no_official_website",
        search_query: search.query,
        searched_at: search.searched_at,
        verification_notes: decision.reason,
      });
      process.stderr.write(`  verified: ${decision.reason}\n`);
    } else if (decision.status === "reject" && !rejectedKeys.has(key)) {
      rejectedKeys.add(key);
      rejections.push({
        ...lead,
        verification_status: "rejected_website_found_bing_exact_phone",
        website_found_url: decision.website_found_url,
        website_found_title: decision.website_found_title,
        search_query: search.query,
      });
      process.stderr.write(`  rejected: ${decision.reason}\n`);
    } else {
      remaining.push(lead);
      process.stderr.write(`  unverified: ${decision.reason}\n`);
    }
  }

  const verifiedHeaders = verified.headers.includes("verification_notes") ? verified.headers : [...verified.headers, "verification_notes"];
  const rejectedHeaders = rejected.headers;
  await writeFile(VERIFIED_CSV, toCsv(verifiedHeaders, [
    ...verified.rows.map((row) => Object.fromEntries(verifiedHeaders.map((header) => [header, row[header] ?? ""]))),
    ...additions.map((row) => Object.fromEntries(verifiedHeaders.map((header) => [header, row[header] ?? ""]))),
  ]));
  await writeFile(REJECTED_CSV, toCsv(rejectedHeaders, [
    ...rejected.rows,
    ...rejections.map((row) => Object.fromEntries(rejectedHeaders.map((header) => [header, row[header] ?? ""]))),
  ]));
  await writeFile(UNVERIFIED_CSV, toCsv(unverified.headers, remaining));
  process.stderr.write(`Added ${additions.length}; rejected ${rejections.length}; checked ${checks}; remaining ${remaining.length}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
