# Webnest Studio Public URL and AdSense Readiness Audit

- Audit date: 2026-10-20 10:47 UTC
- Site: https://www.webneststudio.co.in
- URLs inspected: 2088
- Sitemap documents: 1
- Sitemap URL candidates: 594
- React route templates: *, /admin/:resource, blog/:slug, case-studies/:slug, certificates/:certificateId, codelab/problems/:slug, learn/:courseSlug, learn/:courseSlug/exam, learn/lessons/:lessonId, portfolio/:slug, projects/:id, s/:shareId, services/:slug

## Scope and method

Read-only audit using robots.txt, recursively discovered sitemaps, static React routes and same-host links. Requests use four workers, an 80 ms per-worker delay, a 20 second timeout and up to three attempts for transient failures. Query parameters are retained except common tracking parameters. Exact content hashes identify identical fetched HTML; the similarity score compares title and H1 text as a triage signal. Classification uses status, route purpose, metadata and visible word count; it is not a Google policy determination.

## Summary

- Valuable: 609
- Thin: 7
- Duplicate: 1459
- Private: 13
- Broken: 0
- Investigate: 0

## Findings requiring review

- robots.txt fetch: 200; sitemap discovery failures: 0; malformed/out-of-scope sitemap locations: 0.
- URLs blocked by robots.txt: 0. These were recorded without fetching.
- Malformed same-host internal links: 0 (see audit notes below).
- Internal-link candidates beyond sitemap/router discovery were crawled where found; total discovered candidates queued: 2088.
- Playwright was not available in the Python environment during this run. Render status reflects fetched HTML only; client-only content may need browser verification.

## Route families to inspect

| Route family | Audit note |
|---|---|
| Core Java, Spring Boot, Python, web tutorials | Course and lesson URLs are included when present in sitemap; thinness is a diagnostic signal. |
| Coding problems, quiz/exam, certificate | Public problem and certificate links are inspected; authenticated exams/results require an authorized session. |
| Playground and GitHub | Utility/callback routes are treated as private/utility for review. |
| Blogs, services, case studies | Included via sitemap and crawl; compare content and metadata in CSV. |

## Discovery issues


## Decision guidance

Review each CSV row before changing indexing. Improve pages with a clear user purpose and content gaps; keep useful short pages where they solve a specific need; consolidate genuine duplicates; restrict private data through authorization; use noindex only for indexing control; fix broken routes and canonical destinations. Do not request AdSense review until page classifications and the site’s publisher-facing requirements have been reviewed.
