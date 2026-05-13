#!/usr/bin/env python3
"""Enrich verified no-website leads and export HubSpot-ready CSVs.

Uses DuckDuckGo HTML plus publicly reachable result pages to find emails/phones/social URLs.
Designed for small batches; stores no secrets and does not write to HubSpot.
"""

from __future__ import annotations

import csv
import html
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

BASE = Path(__file__).resolve().parents[1]
INPUT = BASE / "data/outreach/wny-verified-no-website-leads.csv"
OUT_COMPANIES = BASE / "data/outreach/hubspot-ready-no-website-companies.csv"
OUT_CONTACTS = BASE / "data/outreach/hubspot-ready-no-website-contacts.csv"
OUT_AUDIT = BASE / "data/outreach/hubspot-ready-no-website-enrichment-audit.csv"
CACHE = BASE / "data/outreach/enrichment-cache"
CACHE.mkdir(parents=True, exist_ok=True)

EMAIL_RE = re.compile(r"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}", re.I)
PHONE_RE = re.compile(r"(?:\+?1[\s.\-]?)?(?:\(?([2-9]\d{2})\)?[\s.\-]?)([2-9]\d{2})[\s.\-]?(\d{4})")
BAD_EMAIL_DOMAINS = {
    "example.com", "email.com", "domain.com", "sentry.io", "wixpress.com", "schema.org",
    "facebook.com", "fb.com", "google.com", "bing.com", "duckduckgo.com", "yahoo.com",
}
DIRECTORY_DOMAINS = [
    "loc8nearme.com", "chamberofcommerce.com", "mapquest.com", "whereorg.com", "cylex.us.com",
    "salondiscover.com", "allbiz.com", "verview.com", "restaurantji.com", "usarestaurants.info",
    "cmac.ws", "superpages.com", "yellowpages.com", "manta.com", "yelp.com", "tripadvisor.com",
    "facebook.com", "instagram.com", "bizstanding.com", "dandb.com", "netwaiter.com", "wheree.com",
]


def fetch(url: str, timeout: int = 20) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) outreach contact enrichment",
            "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read(1_000_000)
        encoding = resp.headers.get_content_charset() or "utf-8"
        return raw.decode(encoding, "ignore")


def cache_key(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_.-]+", "_", text)[:180]


def cached_fetch(label: str, url: str) -> str:
    path = CACHE / f"{cache_key(label)}.html"
    if path.exists():
        return path.read_text(encoding="utf-8", errors="ignore")
    try:
        text = fetch(url)
    except Exception as exc:
        text = f"FETCH_ERROR: {type(exc).__name__}: {exc}"
    path.write_text(text, encoding="utf-8")
    time.sleep(0.8)
    return text


def strip_tags(text: str) -> str:
    text = re.sub(r"<script[\s\S]*?</script>", " ", text, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    return html.unescape(re.sub(r"\s+", " ", text))


def root_domain(url: str) -> str:
    try:
        host = urllib.parse.urlparse(url).hostname or ""
        host = host.lower().removeprefix("www.")
        parts = host.split(".")
        return ".".join(parts[-2:]) if len(parts) > 2 else host
    except Exception:
        return ""


def ddg_results(query: str) -> List[Dict[str, str]]:
    url = "https://duckduckgo.com/html/?q=" + urllib.parse.quote(query)
    text = cached_fetch("search_" + query, url)
    results = []
    for m in re.finditer(r'class="result__a"\s+href="([^"]+)"[^>]*>([\s\S]*?)</a>', text):
        href = html.unescape(m.group(1))
        parsed = urllib.parse.urlparse(href)
        if parsed.path.startswith("/l/"):
            qs = urllib.parse.parse_qs(parsed.query)
            href = qs.get("uddg", [href])[0]
        title = strip_tags(m.group(2))
        if href.startswith("http") and root_domain(href) != "duckduckgo.com":
            results.append({"url": href, "title": title, "domain": root_domain(href)})
    # fallback: any uddg links
    if not results:
        for href in re.findall(r'uddg=([^&"]+)', text):
            u = urllib.parse.unquote(html.unescape(href))
            if u.startswith("http"):
                results.append({"url": u, "title": u, "domain": root_domain(u)})
    seen = set()
    uniq = []
    for r in results:
        if r["url"] in seen:
            continue
        seen.add(r["url"])
        uniq.append(r)
    return uniq[:8]


def clean_email(email: str) -> str:
    email = email.strip(" .,:;()[]{}<>\"'").lower()
    email = email.replace("%40", "@")
    return email


def extract_emails(text: str) -> List[str]:
    emails = []
    # Decode common obfuscations before regex.
    expanded = html.unescape(text)
    expanded = re.sub(r"\s*\[at\]\s*|\s*\(at\)\s*|\s+at\s+", "@", expanded, flags=re.I)
    expanded = re.sub(r"\s*\[dot\]\s*|\s*\(dot\)\s*|\s+dot\s+", ".", expanded, flags=re.I)
    for e in EMAIL_RE.findall(expanded):
        e = clean_email(e)
        domain = e.split("@")[-1]
        if domain in BAD_EMAIL_DOMAINS:
            continue
        if any(e.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".gif", ".webp"]):
            continue
        emails.append(e)
    return sorted(set(emails))


def normalize_phone(match: Tuple[str, str, str]) -> str:
    return f"+1-{match[0]}-{match[1]}-{match[2]}"


def extract_phones(text: str) -> List[str]:
    return sorted(set(normalize_phone(m) for m in PHONE_RE.findall(text)))


def category_to_industry(cat: str) -> str:
    if "hairdresser" in cat or "beauty" in cat:
        return "Beauty / Personal Care"
    if "restaurant" in cat or "bar" in cat or "cafe" in cat:
        return "Restaurant / Bar"
    if "laundry" in cat:
        return "Laundry"
    if "alcohol" in cat or "beverage" in cat or "convenience" in cat:
        return "Retail"
    if "hvac" in cat:
        return "Home Services"
    if "jewelry" in cat or "clothes" in cat or "craft" in cat or "model" in cat or "copyshop" in cat:
        return "Retail"
    if "tailor" in cat or "shoemaker" in cat:
        return "Local Service"
    return "Local Business"


def first_nonmasked_phone(phones: Iterable[str], original: str) -> str:
    if original and "*" not in original:
        # Normalize semicolon-separated first number if possible.
        found = PHONE_RE.findall(original)
        if found:
            return normalize_phone(found[0])
        return original
    for p in phones:
        if "*" not in p:
            return p
    return original or ""


def contact_score(row: Dict[str, str], email: str, phone: str, facebook: str) -> str:
    score = 0
    if email:
        score += 45
    if phone and "*" not in phone:
        score += 30
    if facebook:
        score += 15
    if int(row.get("confidence_score") or 0) >= 85:
        score += 10
    return str(score)


def main() -> None:
    with INPUT.open(newline="", encoding="utf-8") as f:
        leads = list(csv.DictReader(f))

    company_rows = []
    contact_rows = []
    audit_rows = []

    for idx, lead in enumerate(leads, 1):
        name = lead["name"]
        city = lead.get("city") or lead.get("source_region") or ""
        queries = [
            f'"{name}" "{city}" email',
            f'"{name}" "{lead.get("phone", "")}"',
            f'"{name}" "{lead.get("address", "")}" contact',
        ]
        result_urls = []
        evidence_texts = []
        search_domains = []
        for q in queries:
            results = ddg_results(q)
            evidence_texts.append(" ".join([r["title"] + " " + r["url"] for r in results]))
            for r in results:
                search_domains.append(r["domain"])
                # Prioritize directory/social pages where contact info might be visible.
                if r["domain"] in DIRECTORY_DOMAINS or any(d in r["domain"] for d in DIRECTORY_DOMAINS):
                    result_urls.append(r["url"])
        # Also fetch OSM page if present; sometimes has unmasked tags.
        if lead.get("osm_url"):
            result_urls.append(lead["osm_url"])

        emails = []
        phones = []
        source_notes = []
        for text in evidence_texts:
            emails.extend(extract_emails(text))
            phones.extend(extract_phones(text))
        for u in list(dict.fromkeys(result_urls))[:8]:
            page = cached_fetch("page_" + name + "_" + u, u)
            if page.startswith("FETCH_ERROR"):
                continue
            plain = strip_tags(page)
            found_emails = extract_emails(page + " " + plain)
            found_phones = extract_phones(page + " " + plain)
            if found_emails or found_phones:
                source_notes.append(f"{root_domain(u)}: emails={';'.join(found_emails[:3]) or 'none'}, phones={';'.join(found_phones[:3]) or 'none'}")
            emails.extend(found_emails)
            phones.extend(found_phones)

        # Prefer emails already in source CSV, then discovered public emails.
        original_email = clean_email(lead.get("email", "")) if lead.get("email") else ""
        usable_emails = []
        if original_email:
            usable_emails.append(original_email)
        for e in emails:
            if e not in usable_emails:
                usable_emails.append(e)
        primary_email = usable_emails[0] if usable_emails else ""
        additional_emails = "; ".join(usable_emails[1:])
        primary_phone = first_nonmasked_phone(phones, lead.get("phone", ""))
        facebook = lead.get("facebook", "")
        if not facebook:
            fb_urls = [u for u in result_urls if "facebook.com" in u]
            facebook = fb_urls[0] if fb_urls else ""

        street = lead.get("address", "")
        state = lead.get("state", "NY") or "NY"
        postal = lead.get("postcode", "")
        industry = category_to_industry(lead.get("category", ""))
        lead_score = contact_score(lead, primary_email, primary_phone, facebook)
        status = "New"
        lifecycle = "Lead"
        owner_note = (
            "No official website verified in prior search. Outreach angle: offer a simple local website + missed-call/lead follow-up automation. "
            f"Verification: {lead.get('verification_status', '')}. Notes: {lead.get('verification_notes', '')}"
        ).strip()

        company_rows.append({
            "Company name": name,
            "Company domain name": "",
            "Website URL": "",
            "Phone number": primary_phone,
            "Street address": street,
            "City": city,
            "State/Region": state,
            "Postal code": postal,
            "Country/Region": "United States",
            "Industry": industry,
            "Facebook company page": facebook,
            "Lead status": status,
            "Lifecycle stage": lifecycle,
            "Lead source": "WNY no-website verified outreach list",
            "No website verified": "Yes",
            "Confidence score": lead.get("confidence_score", ""),
            "Outreach priority score": lead_score,
            "Original source region": lead.get("source_region", ""),
            "OSM URL": lead.get("osm_url", ""),
            "Primary email found": primary_email,
            "Additional emails found": additional_emails,
            "Enrichment notes": owner_note,
        })
        if primary_email:
            contact_rows.append({
                "Email": primary_email,
                "First name": "",
                "Last name": "",
                "Company name": name,
                "Phone number": primary_phone,
                "Website URL": "",
                "City": city,
                "State/Region": state,
                "Lead status": status,
                "Lifecycle stage": lifecycle,
                "Lead source": "WNY no-website verified outreach list",
                "Associated company": name,
                "Contact notes": owner_note,
            })
        audit_rows.append({
            "name": name,
            "primary_email": primary_email,
            "additional_emails": additional_emails,
            "primary_phone": primary_phone,
            "facebook": facebook,
            "search_domains_seen": "; ".join(sorted(set(search_domains))[:20]),
            "source_notes": " | ".join(source_notes[:8]),
        })
        print(f"{idx}/{len(leads)} {name}: email={primary_email or '-'} phone={primary_phone or '-'}")

    for path, rows in [(OUT_COMPANIES, company_rows), (OUT_CONTACTS, contact_rows), (OUT_AUDIT, audit_rows)]:
        if not rows:
            path.write_text("", encoding="utf-8")
            continue
        with path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)
    print(f"Wrote {OUT_COMPANIES}")
    print(f"Wrote {OUT_CONTACTS}")
    print(f"Wrote {OUT_AUDIT}")


if __name__ == "__main__":
    main()
