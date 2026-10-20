# Webnest Studio Public URL and AdSense Readiness Audit

- Audit date: 2026-10-20 (UTC)
- Site: https://www.webneststudio.co.in
- URLs inspected: 2068
- Sitemap documents: 1
- Sitemap URL candidates: 593
- React route templates: `*`, `:resource`, `blog/:slug`, `case-studies/:slug`, `certificates/:certificateId`, `codelab/problems/:slug`, `learn/:courseSlug`, `learn/:courseSlug/exam`, `learn/lessons/:lessonId`, `portfolio/:slug`, `projects/:id`, `s/:shareId`, `services/:slug`

## Scope and method

Read-only audit using robots.txt, recursively discovered sitemaps, static React routes and same-host links. Requests use four workers, an 80 ms per-worker delay, a 20 second timeout and up to three attempts for transient failures. Query parameters are retained except common tracking parameters. Exact content hashes identify identical fetched HTML; similarity scores compare title and H1 text as triage signals. Classification uses status, route purpose, metadata and visible word count; it is not a Google policy determination. Nested protected admin routes were resolved beneath `/admin` and fetched as route shells.

## Summary

- Valuable: 589
- Thin: 5
- Duplicate: 1462
- Private: 12
- Broken: 0
- Investigate: 0
- Responses with `noindex`: 1462
- Pages without a canonical declaration: 11
- Pages without an HTML title: 0

## Findings requiring review

- robots.txt returned HTTP 200 and declares the sitemap. Sitemap XML parsed successfully; no malformed sitemap URLs or inaccessible sitemap files were reported.
- No broken responses were found after resolving nested admin routes correctly. The four admin child pages return HTTP 200, `noindex, follow`, and an empty unauthenticated route shell; inspect them with an authorized account if their content needs review.
- Missing canonical declarations: `https://www.webneststudio.co.in/admin`, `https://www.webneststudio.co.in/codelab/dashboard`, `https://www.webneststudio.co.in/codelab/github/callback`, `https://www.webneststudio.co.in/delete-account`, `https://www.webneststudio.co.in/login`, `https://www.webneststudio.co.in/portal`, `https://www.webneststudio.co.in/projects`, `https://www.webneststudio.co.in/admin/leads`, `https://www.webneststudio.co.in/admin/project-status`, `https://www.webneststudio.co.in/admin/exam-bank`, `https://www.webneststudio.co.in/admin/certificates`. Many are utility or query variants; check intended canonical behavior before changing anything.
- 1462 responses declare noindex. This count includes intended utility pages and duplicate query variants; check the CSV before deciding whether any directive is accidental.
- Exact duplicate hashes include filtered URL variants and legacy/redirect routes. Compare each canonical target and query intent before consolidating.
- Playwright browser verification was not run. Render status reflects fetched HTML; client-only pages and interactions may need a browser session. Authenticated exams, results and account data were not inspected while unauthenticated.

## Route families

| Route family | Audit note |
|---|---|
| Java, Spring Boot, Python and web tutorials | Course and lesson URLs are included when present in sitemap and internal links; word count is a diagnostic. |
| Coding problems, exams and certificates | Public problem/certificate routes are included when discovered; authenticated exams and private results need authorized inspection. |
| Playground and GitHub | Tool/callback routes are flagged for utility review. |
| Blogs, services and case studies | Included from sitemap and links; compare metadata, canonical targets and duplicate signals in CSV. |

## Decision guidance

Review each CSV row before changing indexing. Improve pages with a clear purpose and specific content gaps; keep useful short pages that solve a specific need; consolidate genuine duplicates; enforce access control for private data; use noindex for indexing control only; fix broken routes and canonical destinations. This audit is triage, not an AdSense approval prediction.
