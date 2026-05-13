#!/usr/bin/env node

const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];
const OUTPUT_CSV = "data/outreach/wny-no-website-leads.csv";
const OUTPUT_JSON = "data/outreach/wny-no-website-leads.json";

const counties = [
  { label: "Erie County", areaId: 3600036074 },
  { label: "Niagara County", areaId: 3600036267 },
  { label: "Monroe County", areaId: 3601804311 },
  { label: "Genesee County", areaId: 3600078970 },
  { label: "Orleans County", areaId: 3600068855 },
  { label: "Wyoming County", areaId: 3601837997 },
  { label: "Livingston County", areaId: 3601837992 },
  { label: "Ontario County", areaId: 3601837993 },
  { label: "Wayne County", areaId: 3601838139 },
];

const selectors = [
  '["shop"]',
  '["office"]',
  '["craft"]',
  '["amenity"~"restaurant|bar|cafe|pub|fast_food|clinic|dentist|veterinary|childcare|bank|pharmacy|fuel|car_wash|dojo|studio|theatre|marketplace|biergarten"]',
  '["healthcare"]',
  '["tourism"~"hotel|motel|guest_house|attraction|gallery|museum"]',
  '["leisure"~"fitness_centre|sports_centre|bowling_alley|dance|amusement_arcade|escape_game|golf_course"]',
];

const chainDenyList = new Set([
  "7-eleven", "aldi", "applebee's", "arbys", "arby's", "autozone", "burger king",
  "cvs pharmacy", "dairy queen", "dollar general", "dollar tree", "domino's",
  "dunkin'", "family dollar", "fedex", "five guys", "five below", "gamestop",
  "home depot", "jimmy john's", "kfc", "lowe's", "mcdonald's", "panera bread",
  "papa john's", "pizza hut", "rite aid", "speedway", "starbucks", "subway",
  "taco bell", "target", "the ups store", "tim hortons", "tractor supply co.",
  "walgreens", "walmart", "wendy's",
]);

function overpassQuery(county) {
  const clauses = selectors.flatMap((selector) => [
    `node["name"]${selector}[!"website"][!"contact:website"][!"url"](area.searchArea);`,
    `way["name"]${selector}[!"website"][!"contact:website"][!"url"](area.searchArea);`,
    `relation["name"]${selector}[!"website"][!"contact:website"][!"url"](area.searchArea);`,
  ]);

  return `
[out:json][timeout:180];
area(${county.areaId})->.searchArea;
(
${clauses.join("\n")}
);
out center tags;
`;
}

async function fetchCounty(county) {
  let lastError;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent": "wnyautomation-site lead research script; contact local owner",
      },
      body: new URLSearchParams({ data: overpassQuery(county) }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.elements.map((element) => ({ ...element, source_region: county.label }));
    }

    lastError = new Error(`Overpass returned ${response.status} for ${county.label} at ${endpoint}: ${await response.text()}`);
  }

  throw lastError;
}

function text(value) {
  return String(value || "").trim();
}

function firstTag(tags, keys) {
  for (const key of keys) {
    const value = text(tags[key]);
    if (value) return value;
  }
  return "";
}

function category(tags) {
  if (tags.shop) return `shop:${tags.shop}`;
  if (tags.office) return `office:${tags.office}`;
  if (tags.craft) return `craft:${tags.craft}`;
  if (tags.amenity) return `amenity:${tags.amenity}`;
  if (tags.healthcare) return `healthcare:${tags.healthcare}`;
  if (tags.tourism) return `tourism:${tags.tourism}`;
  if (tags.leisure) return `leisure:${tags.leisure}`;
  if (tags.building) return `building:${tags.building}`;
  return "business";
}

function streetAddress(tags) {
  const house = firstTag(tags, ["addr:housenumber"]);
  const street = firstTag(tags, ["addr:street"]);
  const unit = firstTag(tags, ["addr:unit", "addr:suite"]);
  return [house, street, unit && `Unit ${unit}`].filter(Boolean).join(" ");
}

function city(tags, fallbackRegion) {
  return firstTag(tags, ["addr:city", "addr:town", "addr:village", "is_in:city"]) || fallbackRegion;
}

function scoreLead(tags) {
  let score = 50;
  if (streetAddress(tags)) score += 15;
  if (firstTag(tags, ["phone", "contact:phone"])) score += 15;
  if (firstTag(tags, ["email", "contact:email"])) score += 10;
  if (firstTag(tags, ["facebook", "contact:facebook", "brand:facebook"])) score += 5;
    if (tags.opening_hours) score += 5;
  if (tags.office === "government") score -= 100;
  return Math.min(score, 100);
}

function cleanName(name) {
  return name.replace(/\s+/g, " ").trim();
}

function elementToLead(element) {
  const tags = element.tags || {};
  const name = cleanName(text(tags.name));
  const lat = element.lat ?? element.center?.lat ?? "";
  const lon = element.lon ?? element.center?.lon ?? "";

  return {
    name,
    category: category(tags),
    address: streetAddress(tags),
    city: city(tags, element.source_region),
    state: firstTag(tags, ["addr:state"]) || "NY",
    postcode: firstTag(tags, ["addr:postcode"]),
    phone: firstTag(tags, ["phone", "contact:phone"]),
    email: firstTag(tags, ["email", "contact:email"]),
    facebook: firstTag(tags, ["facebook", "contact:facebook", "brand:facebook"]),
    osm_type: element.type,
    osm_id: element.id,
    osm_url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    latitude: lat,
    longitude: lon,
    source_region: element.source_region,
    confidence_score: scoreLead(tags),
    no_website_signal: "No website/contact:website/url tag recorded in OpenStreetMap at generation time",
  };
}

function keyForLead(lead) {
  return [lead.name.toLowerCase(), lead.address.toLowerCase(), lead.city.toLowerCase()].join("|");
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n\r]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
  return stringValue;
}

async function main() {
  const allElements = [];

  for (const county of counties) {
    console.error(`Fetching ${county.label}...`);
    allElements.push(...await fetchCounty(county));
  }

  const seen = new Set();
  const leads = allElements
    .map(elementToLead)
    .filter((lead) => lead.name)
    .filter((lead) => lead.category !== "office:government")
    .filter((lead) => !chainDenyList.has(lead.name.toLowerCase()))
    .filter((lead) => {
      const key = keyForLead(lead);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.confidence_score - a.confidence_score || a.name.localeCompare(b.name))
    .slice(0, 1000);

  const headers = Object.keys(leads[0] || {
    name: "", category: "", address: "", city: "", state: "", postcode: "", phone: "", email: "",
    facebook: "", osm_type: "", osm_id: "", osm_url: "", latitude: "", longitude: "",
    source_region: "", confidence_score: "", no_website_signal: "",
  });

  const csv = [
    headers.join(","),
    ...leads.map((lead) => headers.map((header) => csvEscape(lead[header])).join(",")),
  ].join("\n");

  const { writeFile } = await import("node:fs/promises");
  await writeFile(OUTPUT_CSV, `${csv}\n`);
  await writeFile(OUTPUT_JSON, `${JSON.stringify({ generated_at: new Date().toISOString(), count: leads.length, leads }, null, 2)}\n`);

  console.error(`Wrote ${leads.length} leads to ${OUTPUT_CSV}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
