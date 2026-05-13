#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";

const INPUT_CSV = "data/outreach/wny-no-website-leads.csv";
const OUTPUT_CSV = "data/outreach/wny-verified-no-website-leads.csv";
const REJECTED_CSV = "data/outreach/wny-rejected-website-found.csv";
const UNVERIFIED_CSV = "data/outreach/wny-unverified-search-failed.csv";
const CACHE_FILE = "data/outreach/search-verification-cache.json";

const SEARCH_DELAY_MS = Number(process.env.SEARCH_DELAY_MS || 900);
const LIMIT = Number(process.env.VERIFY_LIMIT || 0);
const VERIFY_PHONE = process.env.VERIFY_PHONE === "1";
const CACHE_ONLY = process.env.CACHE_ONLY === "1";

const directoryDomains = [
  "411.info", "alignable.com", "allbiz.com", "angi.com", "apple.com", "bank-exit.org",
  "bbb.org", "bestprosintown.com", "bing.com", "bizapedia.com", "bizprofile.net",
  "buildzoom.com", "businessyab.com", "buzzfile.com", "chamberofcommerce.com",
  "city-data.com", "clutch.co", "cmac.ws", "cylex.us.com", "datanyze.com", "dnb.com", "dunandbradstreet.com",
  "facebook.com", "findglocal.com", "foursquare.com", "glassdoor.com", "google.com",
  "govtribe.com", "hotfrog.com", "indeed.com", "instagram.com", "linkedin.com", "loc8nearme.com",
  "mapquest.com", "manta.com", "menuguide.com", "merchantcircle.com", "nextdoor.com", "opengovny.com",
  "openstreetmap.org", "patch.com", "restaurantguru.com", "restaurantji.com", "sirved.com", "superpages.com",
  "thebluebook.com", "thumbtack.com", "tripadvisor.com", "twitter.com", "waze.com",
  "whereorg.com", "womply.com", "x.com", "yellowpages.com", "yelp.com", "youtube.com", "youtu.be",
  "zillow.com", "zoominfo.com",
];

const irrelevantDomains = [
  "buffalonews.com", "democratandchronicle.com", "spectrumlocalnews.com", "wgrz.com",
  "whec.com", "wivb.com", "rochesterfirst.com", "13wham.com", "ny.gov", "opencorporates.com",
  "bitcoincities.org", "btcmap.org",
];

const domainDenyList = new Set([...directoryDomains, ...irrelevantDomains]);

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
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records.filter((record) => record.length === headers.length).map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index]])));
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n\r]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
  return stringValue;
}

function toCsv(rows, headers) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n";
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(llc|inc|ltd|corp|corporation|company|co|the)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function dedupeKey(lead) {
  return normalize(lead.name);
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
    .replace(/<[^>]+>/g, "")
    .trim();
}

function resultUrl(rawHref) {
  const href = decodeHtml(rawHref);
  const yahooRedirect = href.match(/\/RU=([^/]+)\/RK=/);
  if (yahooRedirect) return decodeURIComponent(yahooRedirect[1]);

  try {
    const url = href.startsWith("//") ? new URL(`https:${href}`) : new URL(href);
    return url.searchParams.get("uddg") || url.href;
  } catch {
    return href;
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

function isDeniedDomain(domain) {
  return [...domainDenyList].some((denied) => domain === denied || domain.endsWith(`.${denied}`));
}

function nameTokens(name) {
  return normalize(name).split(" ").filter((token) => token.length >= 3);
}

function hasNameOverlap(lead, result) {
  const haystack = normalize(`${result.title} ${result.url}`);
  const tokens = nameTokens(lead.name);
  if (tokens.length === 0) return false;
  const matches = tokens.filter((token) => haystack.includes(token)).length;
  return matches >= Math.min(2, tokens.length);
}

function looksLikeOfficialWebsite(lead, result) {
  const domain = rootDomain(result.url);
  if (!domain || isDeniedDomain(domain)) return false;
  if (domain.endsWith(".gov") || domain.endsWith(".edu")) return false;
  if (!/^https?:\/\//.test(result.url)) return false;

  const title = normalize(result.title);
  const domainText = normalize(domain.split(".")[0]);
  const domainContainsNameToken = nameTokens(lead.name).some((token) => domainText.includes(token));
  const officialWords = /\b(home|official|book|appointment|services|menu|about|contact|welcome)\b/.test(title);
  return hasNameOverlap(lead, result) || officialWords || domainContainsNameToken;
}

async function loadCache() {
  try {
    return JSON.parse(await readFile(CACHE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function queriesForLead(lead) {
  return [
    `"${lead.name}"`,
    VERIFY_PHONE && lead.phone ? `"${lead.name}" "${lead.phone}"` : "",
  ].filter(Boolean).filter((query, index, queries) => queries.indexOf(query) === index);
}

async function searchQuery(query, cache) {
  const cacheKey = `yahoo:${query}`;
  if (cache[cacheKey]) return cache[cacheKey];
  if (CACHE_ONLY) throw new Error(`No cached search result for ${query}`);

  const url = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
  let response;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    response = await fetch(url, {
      headers: {
        "accept": "text/html,application/xhtml+xml",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 verification for local business outreach",
      },
    });

    if (response.ok) break;
    if (![403, 429, 500, 502, 503, 504].includes(response.status) || attempt === 4) break;
    const waitMs = 15000 * attempt;
    process.stderr.write(`Search rate-limited for ${query}; waiting ${waitMs / 1000}s...\n`);
    await sleep(waitMs);
  }

  if (!response.ok) {
    throw new Error(`Search failed with ${response.status} for ${query}`);
  }

  const html = await response.text();
  const seen = new Set();
  const results = [...html.matchAll(/href="(https:\/\/r\.search\.yahoo\.com\/[^"]+\/RU=[^"]+\/RK=[^"]+)"/g)]
    .map((match) => resultUrl(match[1]))
    .filter((foundUrl) => {
      const domain = rootDomain(foundUrl);
      if (!domain || domain.endsWith("yahoo.com")) return false;
      if (seen.has(foundUrl)) return false;
      seen.add(foundUrl);
      return true;
    })
    .slice(0, 8)
    .map((foundUrl) => ({
      url: foundUrl,
      title: foundUrl,
    }));

  cache[cacheKey] = { query, results, searched_at: new Date().toISOString() };
  await writeFile(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);
  await sleep(SEARCH_DELAY_MS);
  return cache[cacheKey];
}

async function searchLead(lead, cache) {
  const searches = [];
  const seenUrls = new Set();
  const results = [];

  for (const query of queriesForLead(lead)) {
    let search;
    try {
      search = await searchQuery(query, cache);
      searches.push(search);
    } catch (error) {
      return {
        query,
        results,
        searched_at: new Date().toISOString(),
        error: error.message,
      };
    }

    for (const result of search.results) {
      if (seenUrls.has(result.url)) continue;
      seenUrls.add(result.url);
      results.push(result);
    }
  }

  return {
    query: searches.map((search) => search.query).join(" | "),
    results,
    searched_at: searches.map((search) => search.searched_at).sort().at(-1),
  };
}

async function main() {
  await mkdir("data/outreach", { recursive: true });
  const leads = parseCsv(await readFile(INPUT_CSV, "utf8"));
  const cache = await loadCache();

  const seen = new Set();
  const deduped = [];
  let duplicateCount = 0;

  for (const lead of leads) {
    const key = dedupeKey(lead);
    if (seen.has(key)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(key);
    deduped.push(lead);
  }

  const verified = [];
  const rejected = [];
  const unverified = [];
  const candidates = LIMIT ? deduped.slice(0, LIMIT) : deduped;

  for (let index = 0; index < candidates.length; index += 1) {
    const lead = candidates[index];
    process.stderr.write(`Checking ${index + 1}/${candidates.length}: ${lead.name}\n`);
    const search = await searchLead(lead, cache);
    if (search.error) {
      unverified.push({
        ...lead,
        verification_status: "unverified_search_failed",
        search_query: search.query,
        verification_error: search.error,
      });
      continue;
    }

    const website = search.results.find((result) => looksLikeOfficialWebsite(lead, result));

    if (website) {
      rejected.push({
        ...lead,
        verification_status: "rejected_website_found",
        website_found_url: website.url,
        website_found_title: website.title,
        search_query: search.query,
      });
    } else {
      verified.push({
        ...lead,
        verification_status: "verified_no_official_website_in_top_search_results",
        search_query: search.query,
        searched_at: search.searched_at,
      });
    }
  }

  const baseHeaders = Object.keys(leads[0]);
  await writeFile(OUTPUT_CSV, toCsv(verified, [...baseHeaders, "verification_status", "search_query", "searched_at"]));
  await writeFile(REJECTED_CSV, toCsv(rejected, [...baseHeaders, "verification_status", "website_found_url", "website_found_title", "search_query"]));
  await writeFile(UNVERIFIED_CSV, toCsv(unverified, [...baseHeaders, "verification_status", "search_query", "verification_error"]));

  process.stderr.write(`Deduped ${leads.length} rows to ${deduped.length}; removed ${duplicateCount} duplicates.\n`);
  process.stderr.write(`Verified no apparent official site: ${verified.length}; rejected with website found: ${rejected.length}; unverified: ${unverified.length}.\n`);
  process.stderr.write(`Wrote ${OUTPUT_CSV}, ${REJECTED_CSV}, and ${UNVERIFIED_CSV}.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
