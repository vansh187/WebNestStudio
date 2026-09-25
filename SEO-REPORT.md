# WebNest Studio: discoverability and conversion improvements

## SEO audit

The before-change findings and architecture are in [SEO-AUDIT.md](SEO-AUDIT.md). This is a React/Vite application with an external Render API and Vercel hosting. Its existing Playwright prerendering covered marketing pages but omitted the learning platform. The site has 12 courses and 372 canonical lessons, so exposing that existing content is the immediate opportunity.

Production checks confirmed the apex domain redirects to www. Existing lesson URLs are preserved; search-index coverage and baseline traffic cannot be verified without Search Console. No ranking or traffic increase is claimed from code changes alone.

## Changes made / significant files

| Files | Purpose |
| --- | --- |
| `src/lib/seo.js`, `src/hooks/useSeo.js` | Shared canonical, description, date and breadcrumb utilities; default social images; safe JSON-LD serialization. |
| `src/data/lessons/render.js`, `src/data/codelabDefaults.js` | Unique lesson metadata, H1/H2 structure, contents links and example data. Literal tag examples in prose no longer become page markup. |
| `src/components/Breadcrumbs.jsx`, `src/pages/learn/*` | Visible breadcrumbs, Course/TechArticle schema, related concepts, author link, start/continue action and example practice. |
| `src/lib/lessonPlayground.js`, `src/pages/coding/Playground.jsx` | Supported examples preload from shareable lesson/example URLs, with separate saved sessions. |
| `src/data/servicePages.js`, `src/pages/ServiceDetail.jsx`, `src/pages/Services.jsx` | Three service pages based on existing offerings. |
| `src/lib/analytics.js`, `src/components/ConversionTracking.jsx`, `src/pages/Contact.jsx` | Funnel events through the existing Vercel Analytics integration and an optional already-installed GA4 `gtag`. |
| `scripts/generate-sitemap.mjs`, `scripts/prerender.mjs`, `scripts/browser.mjs` | One canonical inventory, complete HTML snapshots, failure reporting and local/serverless browser launch. |
| `public/robots.txt`, `public/sitemap.xml`, `vercel.json`, `package.json` | Local crawl assets, permanent alias redirects, explicit private-route handling, required prerender build. |
| `src/App.jsx`, `src/components/Reveal.jsx`, `src/components/LaunchAnnouncementModal.jsx` | Route splitting, readable reveal content, less disruptive announcement timing. |
| `tests/seo.test.mjs`, `scripts/check-seo.mjs` | Content-inventory tests and built-HTML/browser regression checks. |

## Technical SEO

- Public pages receive title, description, canonical, Open Graph and Twitter metadata. Default imagery uses the existing brand asset; a designed social card remains an opportunity.
- Every canonical lesson uses its topic and course in its title and a description derived from its own introduction. Aliases canonicalize to the original lesson; Vercel adds permanent redirects for existing course/playground aliases.
- Sitemap generation includes services, courses, lessons, blog posts, portfolio entries and practice pages. It excludes private/account routes and aliases. Last-modified dates are only emitted from valid, non-future content dates, never the build date.
- Backend list endpoints fail independently. Required local pages must render successfully; optional live details that fail are recorded and removed from the deployed sitemap. The build report is `.seo-build/prerender-report.json`.
- `robots.txt` allows public content and rendering assets. Account pages use noindex directives and hosting headers; authorization remains the backend's responsibility.
- Existing Organization/BlogPosting data is retained. WebSite, breadcrumbs, Course, TechArticle and Service data describe visible content. No ratings, reviews or invented dates were added.
- Snapshots use extensionless HTML routing (`learn/course.html` served at `/learn/course`) with Vercel `cleanUrls`, avoiding a trailing-slash dependency. Vercel checks static files before permitted SPA fallbacks and serves its custom `404.html` for unmatched paths. API-backed detail routes retain a client fallback for content published between builds; their missing states use noindex. Validate these hosting behaviors on preview before publishing.
- Global navigation and footer now link to Learn. Blog listing retains curated fallback articles alongside live articles so they remain discoverable.
- Two current backend articles reused the same `meta_title`; article metadata now uses each visible editorial headline. Their overlapping subject matter still merits editorial review.

## Learn SEO and retention

All lessons retain their existing URLs, explanations, examples and outputs. Longer lessons have a contents list. Each lesson has one H1, related module concepts, previous/next navigation and breadcrumbs linking back to its course. Course pages expose start/continue learning using existing completion data. Signed-in progress, notes, bookmarks and dashboard remain in place; they remain browser-local and do not become cross-device sync.

Authorship is attributed to WebNest Studio with an About link, without invented individual credentials. Learn's description and service/portfolio links retain the consultancy brand. No extra keyword pages were generated. Quizzes, interview question reviews, search and recently viewed lessons remain editorial/product follow-ups rather than empty UI or fabricated assessments.

## Codelab integration

Supported examples link to `/codelab/playground?lesson=<existing-id>&example=<index>`. The editor loads the exact selected code from the local lesson catalogue. Python uses `main.py`; HTML/CSS/JavaScript use the corresponding web file. Recognized terminal setup commands are copy-only. Example drafts have separate storage keys so a lesson does not overwrite the general playground draft. A return link leads back to the lesson.

Java, SQL and framework-specific examples have copy actions and local-environment guidance. CodeLab currently supports web and Python execution, so no Java runtime is implied. Some browser/Python examples need input, markup or dependencies; the UI states that. The existing execution engine was not replaced.

## Consultancy SEO

Added `/services/web-development`, `/services/ai-development` and `/services/software-development`, covering actual offerings already present in the repository. Each explains suitable projects, capabilities, technology, process and practical questions, then links to contact, portfolio, About, learning and related services. New Delhi is shown based on the owner's brief. No clients, outcomes, prices, credentials or reviews were invented.

## Performance and remaining concerns

Secondary marketing pages now load on demand. The measured Vite entry chunk changed from approximately 790 KB (239 KB gzip) to 304 KB (94 KB gzip); shared chunks still contribute to total page transfer, so this is not a total-download or Core Web Vitals claim.

Reveal content remains visible before animations, and snapshots clear invisible animation states. The homepage announcement waits 15 seconds and shows once per tab session. Blog thumbnails load lazily. Existing Monaco/Pyodide lazy loading is preserved.

Remaining work: split the approximately 1.76 MB learning-content chunk by course; review Monaco language workers and the large output/editor chunks; resize the existing 681 KB logo/favicon asset and create responsive content images; reserve/test advertisement space. AdSense remains enabled and may affect layout/performance. The app still replaces static markup with `createRoot`, so slow clients may see a redraw. No LCP, CLS or INP field results were available; use Search Console/CrUX after deployment.

## Analytics

Events added: `course_started`, `lesson_viewed`, `lesson_completed`, `practice_started`, `codelab_opened`, `contact_clicked`, `consultation_requested`. Lead events fire after a successful API submission, not just a submit click. Quiz events are intentionally absent until a real quiz flow exists.

Only allowlisted context such as course/lesson IDs, language and source is sent. Form values, notes, code and email addresses are excluded from these new events. Prerendering does not emit them. The existing Vercel Analytics script is reused; no second analytics loader or unconfigured GA4 property is installed. Confirm custom-event availability for the Vercel plan. If GA4 is installed once through the site's chosen consent/tag setup, the same events forward to its `gtag` function.

## Manual actions required

1. **Deployment:** review and deploy the changes. Confirm www/apex behavior, 308 aliases, raw HTML for a lesson/service, a 404 for an unknown path, noindex headers on account URLs, and local sitemap/robots responses. This work has not been published.
2. **Search Console:** verify the domain property using the provided DNS TXT record, submit `https://www.webneststudio.co.in/sitemap.xml`, and inspect the homepage, service pages, course and sample lesson URLs. Check excluded/duplicate pages and sitemap fetch results; record the baseline before comparing outcomes.
3. **GA4 / Vercel Analytics:** configure the actual property once if desired, verify events in DebugView or the analytics dashboard, and mark successful consultation requests as a key event. Compare the learning → Codelab → contact funnel by landing page. Avoid duplicate page-view tracking and review consent/privacy requirements for the chosen setup.
4. **Google Business Profile:** verify the real business and eligible location/service area, use the same name, phone, site and New Delhi details, and add genuine photos/services. Obtain genuine client feedback; no fabricated reviews.
5. **Publishing operations:** redeploy when API content is added, changed or removed so the HTML and sitemap stay current. A content-publication webhook or scheduled redeploy is recommended. Backend article expiry currently risks outdated snapshots between deployments.
6. **Trust/content:** validate existing API-provided testimonials, statistics and case-study claims with the owner. Add named technical reviewers and meaningful update dates only after an actual review. Keep contact information consistent across external profiles.

## Future content opportunities

Prioritise improvements to existing lessons and useful comparisons rather than duplicate URLs:

1. Core Java: JDK/JRE/JVM, inheritance vs composition, abstract class vs interface, HashMap behavior, collections comparisons, checked/unchecked exceptions and multithreading exercises.
2. Spring: one complete REST API project tying dependency injection, validation, persistence and testing back to the existing lessons.
3. Business resources: selecting an AI chatbot use case, evaluating AI output, custom CRM vs SaaS decision criteria, and planning integrations. Publish only services the team can support.
4. Web: a measured React performance case study and a website-redesign planning guide, with real before/after evidence when available.
5. Distribution: share one useful code example or project walkthrough at a time through the company's social profiles; link to the matching lesson/service, and measure return visits and qualified enquiries. No external posts were sent.

## Validation

Final results on 25 September 2026:

| Check | Actual result |
| --- | --- |
| `npm run build` | Passed. 413 public pages plus the 404 page rendered; zero failed routes. |
| `npm test` | Passed, 5/5 test groups. Includes all 372 lessons' metadata, H1s, course links and aliases, plus canonical/date/breadcrumb/template behavior. |
| `npm run test:seo` | Passed. Checked all 413 public snapshots for metadata, canonicals, H1, valid JSON-LD, social image, indexability and internal links. No duplicate title/description warnings remain in this build. |
| Browser regression checks | Passed: exact Python example transfer, schema cleanup during navigation, mobile overflow, missing-lesson noindex, service content and lesson readability with JavaScript disabled at the canonical path. |
| `npm run lint` | Exit 0, no errors. 18 pre-existing warnings remain: 15 unnecessary escapes in database-design content and 3 React context Fast Refresh warnings. The unused App import warning was removed. |
| `git diff --check` | Passed; Git only reports its existing LF/CRLF conversion notices. |

Build warnings remain for existing Pyodide Node-module externalization and large learning/editor chunks. These do not fail the build; the performance section describes the remaining work. Hosting-specific HTTP status/redirect/header behavior, real conversions, live GA4 delivery and field Core Web Vitals still need deployment/dashboard validation.

Build artifacts and screenshots are written under ignored `dist/` and `.seo-build/` directories. No production deployment or external dashboard changes were performed.

Implementation guidance: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Vercel routing configuration](https://vercel.com/docs/project-configuration/vercel-json#routes).
