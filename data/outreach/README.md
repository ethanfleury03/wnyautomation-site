# WNY No-Website Outreach Leads

Generated on 2026-05-11 from OpenStreetMap/Overpass data.

Files:

- `wny-no-website-leads.csv`: 1,000 outreach leads.
- `wny-no-website-leads.json`: Same leads with generation metadata.
- `wny-verified-no-website-leads.csv`: Deduped leads where cached search results did not show an official company website.
- `wny-rejected-website-found.csv`: Leads rejected because search results showed a likely official website.
- `wny-unverified-search-failed.csv`: Deduped leads that still need verification because search results were not cached or the search provider rate-limited the request.

Lead definition:

- The business has a `name` and a business-like OSM category in the Buffalo/Rochester-area NY counties queried.
- The OSM record does not have `website`, `contact:website`, or `url` tags at generation time.
- This is a prospecting signal, not proof that the company has no website anywhere on the internet.

Counties queried:

- Erie
- Niagara
- Monroe
- Genesee
- Orleans
- Wyoming
- Livingston
- Ontario
- Wayne

Recommended next step before outreach:

1. Search the company name plus city.
2. Check Google Business Profile, Facebook, and Yelp for a real domain.
3. Prioritize rows with `confidence_score` of 85+ and a phone/email/Facebook contact.
4. Skip obvious chains, franchises, public entities, and companies that already have domains.

Verification notes:

- `scripts/verify-no-website-leads.mjs` dedupes by normalized company name.
- The verifier rejects independent domains that look like official company websites.
- Directory/social/search/map sites are ignored as company websites.
- Search engines rate-limit bulk verification. Use `CACHE_ONLY=1 node scripts/verify-no-website-leads.mjs` to rebuild output files from cached checks, or run `SEARCH_DELAY_MS=3000 node scripts/verify-no-website-leads.mjs` to resume slowly.

Data license:

- OpenStreetMap data is available under the Open Database License. Include attribution if this data is reused in a published product.
