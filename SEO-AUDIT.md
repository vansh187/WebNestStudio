# WebNest Studio SEO audit — 25 September 2026

## Architecture and evidence before changes

- React 19 + Vite 8, React Router BrowserRouter; client rendering with an existing Playwright build-time snapshot script. No backend source in this checkout; REST API is hosted on Render. Hosting configuration targets Vercel.
- Production apex responds with 308 to `https://www.webneststudio.co.in/`; retain www canonicals and all existing course/lesson URLs. Actual indexed URLs and traffic require Search Console access; neither is available here.
- 12 local courses, 372 canonical lessons and three legacy aliases. Rich authored lesson content already includes examples, outputs and common mistakes. Progress, bookmarks, personal notes, course outlines and a signed-in dashboard already exist.
- Public service catalogue, blog, portfolio, about/story, contact and legal pages exist. Services and portfolio depend on the external API. Organization and BlogPosting schema already exist. No Course, TechArticle or visible breadcrumb navigation on learning pages.
- Vercel Analytics is installed. No GA4 or Search Console verification configuration found. AdSense is loaded globally.

## Priority findings

1. **Crawl delivery:** prerender list excludes Learn, all courses/lessons and practice pages; deployment swallows prerender failures. Vercel proxies sitemap/robots to the backend instead of the frontend's generated content inventory. Catch-all SPA rewrite requires deployment verification for snapshot precedence and returns 200 for unknown URLs.
2. **Metadata:** all lessons share `Read a static Webnest CodeLab lesson.`; no lesson H1 (body starts at H2), no table of contents, default social image absent. Playground canonical incorrectly points to `/codelab`. Missing courses/lessons and failed dynamic details can remain indexable. Legacy lesson aliases need canonical consolidation.
3. **Sitemap:** fabricated build-day lastmod for undated pages; one endpoint failure drops all live routes. Local fallback articles can be orphaned when live posts replace the list.
4. **Learning journey:** examples are duplicated below the lesson; no example transfer to playground. Runtime supports browser web/Python only, so Java must not be advertised as runnable. Related concepts and public Learn links in global navigation are missing.
5. **Business discovery:** dedicated intent-specific service pages absent. Existing offerings support website development, AI implementation and full-stack engineering pages without inventing capabilities or client results. New Delhi comes from the owner's supplied brief.
6. **Performance/accessibility:** marketing pages eagerly imported; the learning catalogue bundles all lesson HTML. Nested main landmarks, reveal animations can preserve invisible content in snapshots, immediate homepage modal interrupts reading. Monaco/Pyodide already load on demand. Font families use system fallback; no external font fetch found. Several content images lack lazy loading or explicit dimensions; most cards reserve space.
7. **Measurement/trust:** no learning-to-contact funnel events. Claims and testimonials fetched from the backend cannot be independently verified from this checkout. Existing founder, contact and legal pages can be linked; do not invent author credentials, reviews or dates. Core Web Vitals field measurements are unavailable.

## Incremental implementation plan

Preserve React/Vite and existing URLs. Improve shared metadata and schema, lessons and breadcrumbs, supported example transfer, service content, event instrumentation and internal links. Generate sitemap and prerender inventory from one source, serve local crawl assets, make required snapshot failures visible and add SEO regression checks. Document external dashboard work and remaining performance/content work. No mass article generation or framework migration.

## Reference guidance

- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics): meaningful metadata, crawlable links, rendering and missing-page handling.
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): canonical URLs and truthful modification dates.

Implementation and validation results are recorded in SEO-REPORT.md.
