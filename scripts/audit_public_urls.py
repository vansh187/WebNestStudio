#!/usr/bin/env python3
"""Audit public URLs for Webnest Studio without changing the site.

Requires httpx, beautifulsoup4 and lxml. Playwright is optional and is not
needed for server-rendered/prerendered page metadata. Writes CSV and Markdown.
"""
from __future__ import annotations

import argparse
from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, wait
import csv
import gzip
import hashlib
import html
import re
import time
import urllib.robotparser
from collections import Counter, deque
from difflib import SequenceMatcher
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit
import xml.etree.ElementTree as ET

import httpx
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BASE = "https://www.webneststudio.co.in"
UA = "WebnestStudioURLAudit/1.0 (+read-only; low-rate SEO audit)"
TRACKING = {"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"}
PRIVATE_RE = re.compile(r"/(?:login|admin|portal|projects(?:/|$)|codelab/dashboard|delete-account|learn/[^/]+/exam)(?:/|$)", re.I)
UTILITY_RE = re.compile(r"/(?:codelab/playground|playground|codelab/github/callback|card|s/[^/]+|certificates/[^/]+)(?:/|$)", re.I)
WORD_RE = re.compile(r"\b[\w'-]+\b", re.UNICODE)


def normalize(url: str, base: str) -> str | None:
    try:
        p = urlsplit(url)
        b = urlsplit(base)
        if p.scheme not in ("http", "https") or p.hostname != b.hostname:
            return None
        path = re.sub(r"/{2,}", "/", p.path or "/")
        if path != "/":
            path = path.rstrip("/")
        query = [(k, v) for k, v in parse_qsl(p.query, keep_blank_values=True) if k.lower() not in TRACKING]
        query.sort()
        return urlunsplit((b.scheme, b.netloc, path, urlencode(query, doseq=True), ""))
    except Exception:
        return None


def get(client: httpx.Client, url: str):
    error = ""
    for attempt in range(3):
        try:
            response = client.get(url)
            if response.status_code in (429, 500, 502, 503, 504) and attempt < 2:
                time.sleep(0.6 * (2 ** attempt))
                continue
            return response, ""
        except httpx.HTTPError as exc:
            error = f"{type(exc).__name__}: {exc}"
            if attempt < 2:
                time.sleep(0.6 * (2 ** attempt))
    return None, error


def sitemap_urls(client, base, robots_text):
    queue = deque()
    for line in robots_text.splitlines():
        m = re.match(r"\s*Sitemap:\s*(\S+)", line, re.I)
        if m:
            queue.append(m.group(1))
    queue.append(urljoin(base, "/sitemap.xml"))
    seen_maps, found, malformed, failures = set(), set(), [], []
    while queue:
        sm = queue.popleft()
        if sm in seen_maps:
            continue
        seen_maps.add(sm)
        response, err = get(client, sm)
        if response is None or response.status_code >= 400:
            failures.append(f"{sm} ({err or response.status_code})")
            continue
        payload = response.content
        if response.url.path.endswith(".gz") or payload[:2] == b"\x1f\x8b":
            try:
                payload = gzip.decompress(payload)
            except OSError as exc:
                failures.append(f"{sm} (gzip: {exc})")
                continue
        try:
            root = ET.fromstring(payload)
        except ET.ParseError as exc:
            failures.append(f"{sm} (XML: {exc})")
            continue
        kind = root.tag.rsplit("}", 1)[-1].lower()
        for loc in root.findall(".//{*}loc"):
            raw = (loc.text or "").strip()
            if kind == "sitemapindex" or "sitemap" in kind:
                queue.append(urljoin(str(response.url), raw))
            else:
                normalized = normalize(raw, base)
                if normalized:
                    found.add(normalized)
                else:
                    malformed.append(raw)
    return found, seen_maps, malformed, failures


def react_routes():
    app = ROOT / "src" / "App.jsx"
    if not app.exists():
        return [], []
    source = app.read_text(encoding="utf-8", errors="replace")
    routes = set(re.findall(r'<Route\s+path="([^"]+)"', source))
    # These declarations are children of the protected /admin route. React
    # Router resolves them relative to that parent; do not invent root URLs.
    admin_children = {"leads", "project-status", "exam-bank", "certificates", ":resource"}
    routes.difference_update(admin_children)
    routes.update(f"/admin/{child}" for child in admin_children)
    routes = sorted(routes)
    return routes, [r for r in routes if ":" in r or "*" in r]


def visible_content(soup):
    clone = BeautifulSoup(str(soup), "lxml")
    for el in clone.select("script,style,noscript,svg,header,footer,nav,aside,form,button"):
        el.decompose()
    main = clone.find("main") or clone.find("article") or clone.body or clone
    return " ".join(main.stripped_strings)


def classify(url, status, words, text, title, h1, robots, error):
    p = urlsplit(url).path
    if error or status in (404, 410) or status >= 500:
        return "Broken", "Fix, redirect or remove after confirming the intended destination"
    if PRIVATE_RE.search(p):
        return "Private", "Review access controls and noindex behavior; noindex is not access control"
    if UTILITY_RE.search(p):
        return "Private", "Review utility purpose and indexing; keep ads off thin tool screens"
    if status in (301, 302, 303, 307, 308):
        return "Duplicate", "Review redirect destination and consolidate signals"
    if not text or words < 80 or not title or not h1:
        return "Thin", "Improve useful standalone content and metadata, or noindex/consolidate if it has no search purpose"
    return "Valuable", "Keep; maintain original content, metadata and internal navigation"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=DEFAULT_BASE)
    parser.add_argument("--csv", default=str(ROOT / "webnest_url_audit.csv"))
    parser.add_argument("--report", default=str(ROOT / "webnest_adsense_audit.md"))
    parser.add_argument("--max-pages", type=int, default=5000)
    args = parser.parse_args()
    base = args.base_url.rstrip("/")
    headers = {"User-Agent": UA, "Accept-Encoding": "gzip, deflate"}
    with httpx.Client(headers=headers, timeout=20, follow_redirects=True, max_redirects=8) as client:
        robots_response, robots_error = get(client, urljoin(base + "/", "robots.txt"))
        robots_text = robots_response.text if robots_response else ""
        robot_parser = urllib.robotparser.RobotFileParser()
        robot_parser.parse(robots_text.splitlines())
        sitemap, sitemap_files, malformed, sitemap_failures = sitemap_urls(client, base, robots_text)
        routes, route_templates = react_routes()
        seeds = set(sitemap)
        # Include concrete public/auth/utility routes from the app router.
        for route in routes:
            if ":" not in route and "*" not in route:
                normalized = normalize(urljoin(base + "/", route.lstrip("/")), base)
                if normalized:
                    seeds.add(normalized)
        seeds.add(normalize(base, base))
        queue = deque(sorted(seeds))
        queued = set(queue)
        rows, link_errors, blocked = [], [], []

        def audit_one(url):
            if not robot_parser.can_fetch(UA, url):
                return {"URL": url, "HTTP Status": "BLOCKED_BY_ROBOTS", "Classification": "Investigate", "Recommended Action": "Respect robots.txt; verify whether public access is intended"}, [], [], True
            response, error = get(client, url)
            # Keep the first response status for the requested URL while parsing the final
            # response body and URL after redirects.
            status = response.history[0].status_code if response and response.history else response.status_code if response else "ERROR"
            final_url = normalize(str(response.url), base) if response else url
            content_type = response.headers.get("content-type", "") if response else ""
            soup = BeautifulSoup(response.text, "lxml") if response and "html" in content_type.lower() else BeautifulSoup("", "lxml")
            title = soup.title.get_text(" ", strip=True) if soup.title else ""
            desc = soup.find("meta", attrs={"name": re.compile("^description$", re.I)})
            description = (desc.get("content") or "").strip() if desc else ""
            h1s = [x.get_text(" ", strip=True) for x in soup.find_all("h1")]
            canonical_tag = soup.find("link", rel=lambda x: x and "canonical" in x)
            canonical = urljoin(final_url or url, canonical_tag.get("href", "")) if canonical_tag else ""
            meta_robots = [tag.get("content", "").strip() for tag in soup.find_all("meta", attrs={"name": re.compile("^(robots|googlebot)$", re.I)})]
            header_robots = response.headers.get("x-robots-tag", "").strip() if response else ""
            robots = "; ".join(value for value in [*meta_robots, header_robots] if value)
            text = visible_content(soup) if response and "html" in content_type.lower() else ""
            words = len(WORD_RE.findall(text))
            normalized_text = re.sub(r"\s+", " ", text.lower()).strip()
            digest = hashlib.sha256(normalized_text.encode()).hexdigest() if normalized_text else ""
            internal, bad_links = [], []
            if response and "html" in content_type.lower():
                for a in soup.find_all("a", href=True):
                    target = normalize(urljoin(final_url or url, a["href"]), base)
                    if not target:
                        if urlsplit(urljoin(final_url or url, a["href"])).hostname == urlsplit(base).hostname:
                            bad_links.append(f"{url} -> {a['href']}")
                        continue
                    internal.append(target)
                    if target not in queued and len(queued) < args.max_pages:
                        queued.add(target)
                        queue.append(target)
            category, action = classify(url, status if isinstance(status, int) else 500, words, text, title, h1s, robots, error)
            if "noindex" in robots.lower() and category == "Valuable":
                action = "Investigate accidental noindex; keep only if indexing is intended"
            row = {
                "URL": url, "Page Title": title, "Meta Description": description, "Meta Description Length": len(description),
                "H1": " | ".join(h1s), "HTTP Status": status, "Final URL": str(response.url) if response else "",
                "Canonical": canonical, "Robots": robots, "Word Count": words, "Content Hash": digest,
                "Similarity Score": "", "Internal Links": len(set(internal)), "Content Type": content_type,
                "Render Status": "HTML content present" if text else "No HTML main content / fetch failed",
                "Classification": category, "Recommended Action": action, "Error": error,
                "Discovery": "sitemap" if url in sitemap else "router or internal link",
            }
            time.sleep(0.08)
            return row, internal, bad_links, False

        with ThreadPoolExecutor(max_workers=4) as pool:
            pending = {}
            while (queue or pending) and len(rows) < args.max_pages:
                while queue and len(pending) < 4 and len(rows) + len(pending) < args.max_pages:
                    url = queue.popleft()
                    if not robot_parser.can_fetch(UA, url):
                        blocked.append(url)
                        rows.append({"URL": url, "HTTP Status": "BLOCKED_BY_ROBOTS", "Classification": "Investigate", "Recommended Action": "Respect robots.txt; verify whether public access is intended"})
                    else:
                        pending[pool.submit(audit_one, url)] = url
                if not pending:
                    continue
                done, _ = wait(pending, return_when=FIRST_COMPLETED)
                for future in done:
                    pending.pop(future)
                    row, internal, bad_links, is_blocked = future.result()
                    rows.append(row)
                    link_errors.extend(bad_links)
                    if is_blocked:
                        blocked.append(row["URL"])
                    for target in internal:
                        if target not in queued and len(queued) < args.max_pages:
                            queued.add(target)
                            queue.append(target)
    # Exact duplicates and a bounded near-duplicate comparison among extracted content.
    by_hash = {}
    for row in rows:
        if row.get("Content Hash"):
            by_hash.setdefault(row["Content Hash"], []).append(row)
    for members in by_hash.values():
        members = [r for r in members if str(r.get("HTTP Status")) == "200" and int(r.get("Word Count") or 0) > 0]
        if len(members) > 1:
            for row in members:
                row["Classification"] = "Duplicate"
                row["Recommended Action"] = "Compare canonical intent; consolidate, canonicalize or redirect where appropriate"
    signatures = [(r, re.sub(r"[^a-z0-9 ]", "", (r.get("Page Title", "") + " " + r.get("H1", "")).lower())) for r in rows if r.get("Page Title")]
    for i, (row, sig) in enumerate(signatures):
        best = (0.0, "")
        for other, other_sig in signatures[i + 1:]:
            score = SequenceMatcher(None, sig, other_sig).ratio()
            if score > best[0]:
                best = score, other["URL"]
        if best[0] >= 0.88:
            row["Similarity Score"] = f"{best[0]:.2f} vs {best[1]}"
    fields = ["URL", "Page Title", "Meta Description", "Meta Description Length", "H1", "HTTP Status", "Final URL", "Canonical", "Robots", "Word Count", "Content Hash", "Similarity Score", "Internal Links", "Content Type", "Render Status", "Classification", "Recommended Action", "Error", "Discovery"]
    with open(args.csv, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    counts = Counter(r.get("Classification", "Investigate") for r in rows)
    with open(args.report, "w", encoding="utf-8") as f:
        f.write("# Webnest Studio Public URL and AdSense Readiness Audit\n\n")
        f.write(f"- Audit date: {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}\n- Site: {base}\n- URLs inspected: {len(rows)}\n- Sitemap documents: {len(sitemap_files)}\n- Sitemap URL candidates: {len(sitemap)}\n- React route templates: {', '.join(route_templates) or 'none detected'}\n")
        f.write("\n## Scope and method\n\nRead-only audit using robots.txt, recursively discovered sitemaps, static React routes and same-host links. Requests use four workers, an 80 ms per-worker delay, a 20 second timeout and up to three attempts for transient failures. Query parameters are retained except common tracking parameters. Exact content hashes identify identical fetched HTML; the similarity score compares title and H1 text as a triage signal. Classification uses status, route purpose, metadata and visible word count; it is not a Google policy determination.\n\n")
        f.write("## Summary\n\n")
        for key in ("Valuable", "Thin", "Duplicate", "Private", "Broken", "Investigate"):
            f.write(f"- {key}: {counts[key]}\n")
        f.write("\n## Findings requiring review\n\n")
        f.write(f"- robots.txt fetch: {robots_response.status_code if robots_response else robots_error or 'failed'}; sitemap discovery failures: {len(sitemap_failures)}; malformed/out-of-scope sitemap locations: {len(malformed)}.\n")
        f.write(f"- URLs blocked by robots.txt: {len(blocked)}. These were recorded without fetching.\n")
        f.write(f"- Malformed same-host internal links: {len(link_errors)} (see audit notes below).\n")
        f.write(f"- Internal-link candidates beyond sitemap/router discovery were crawled where found; total discovered candidates queued: {len(queued)}.\n")
        f.write("- Playwright was not available in the Python environment during this run. Render status reflects fetched HTML only; client-only content may need browser verification.\n\n")
        f.write("## Route families to inspect\n\n| Route family | Audit note |\n|---|---|\n")
        f.write("| Core Java, Spring Boot, Python, web tutorials | Course and lesson URLs are included when present in sitemap; thinness is a diagnostic signal. |\n")
        f.write("| Coding problems, quiz/exam, certificate | Public problem and certificate links are inspected; authenticated exams/results require an authorized session. |\n")
        f.write("| Playground and GitHub | Utility/callback routes are treated as private/utility for review. |\n")
        f.write("| Blogs, services, case studies | Included via sitemap and crawl; compare content and metadata in CSV. |\n\n")
        f.write("## Discovery issues\n\n")
        for item in sitemap_failures[:30]: f.write(f"- Sitemap: `{item}`\n")
        for item in malformed[:30]: f.write(f"- Malformed or out-of-scope sitemap URL: `{item}`\n")
        for item in link_errors[:50]: f.write(f"- Internal link: `{item}`\n")
        f.write("\n## Decision guidance\n\nReview each CSV row before changing indexing. Improve pages with a clear user purpose and content gaps; keep useful short pages where they solve a specific need; consolidate genuine duplicates; restrict private data through authorization; use noindex only for indexing control; fix broken routes and canonical destinations. Do not request AdSense review until page classifications and the site’s publisher-facing requirements have been reviewed.\n")
    print(f"Wrote {len(rows)} rows to {args.csv} and report to {args.report}")


if __name__ == "__main__":
    main()
