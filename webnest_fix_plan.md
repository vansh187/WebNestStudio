# Webnest Studio AdSense Readiness Fix Plan

Audit evidence: refreshed public crawl on 2026-10-20. This is a developer review plan, not an AdSense policy decision. Do not remove pages or change indexing solely to improve a crawl count.

## P0 — Verify the pages that may show ads

### Review representative `/learn` and `/blog` pages in a real browser

- **Affected URLs:** `/learn`, representative `/learn/:courseSlug` pages, representative `/learn/lessons/:lessonId` pages, `/blog`, and representative `/blog/:slug` pages.
- **Evidence:** The site requests ads only on indexable `/learn` and `/blog` routes. The refreshed HTTP crawl found 2,088 URLs and no broken responses, but it does not execute a browser or verify asynchronous content and interactions.
- **Proposed solution:** Use desktop and mobile browser sessions to confirm that lesson and article text is visible without sign-in, API errors do not leave empty ad-bearing pages, and navigation and examples work.
- **Acceptance criteria:** Check at least two pages from each monetized family, including a typical and a weaker page; record screenshot and console/network results; confirm empty, error, exam, and account states do not request ads.
- **Verification:** Browser review plus a check of the rendered DOM and network requests. Do not infer content quality from word count alone.

## P1 — Verify privacy and consent configuration

### Confirm the deployed AdSense privacy setup matches the policy

- **Affected URLs:** `/privacy-policy`; AdSense requests on `/learn` and `/blog`.
- **Evidence:** The policy discloses advertising cookies, personalization settings, and consent. The repository contains no visible CMP integration, and the AdSense account configuration is not available to this audit.
- **Proposed solution:** In AdSense Privacy & messaging, confirm the configured consent message or certified CMP and test it for applicable visitor regions. Keep the privacy policy accurate to the actual message, vendors, and ad behavior.
- **Acceptance criteria:** A consent choice is presented and respected where required. For personalized ads in the EEA, UK, and Switzerland, use a Google-certified CMP integrated with TCF.
- **Verification:** Test the deployed site using region-based consent preview and confirm the AdSense account's Privacy & messaging settings. This is a conditional serving requirement, not evidence of a current violation.

## P1 — Keep route discovery and indexing clean

### Recheck redirects, sitemap, and canonical destinations after deployment

- **Affected URLs:** `/services/ai-development`, `/services/software-development`, `/ai-development-company-india`, `/software-development-company-gurugram`, `/sitemap.xml`, and `/robots.txt`.
- **Evidence:** The refreshed crawl found 301 responses from both old service routes, self-canonical preferred destinations, 594 sitemap candidates, and no malformed or inaccessible sitemap locations. Host variants redirect to the HTTPS `www` host. The sitemap and robots file return HTTP 200.
- **Proposed solution:** Keep only preferred service URLs in the sitemap and internal links. Keep blog filters canonical to `/blog`; leave intentional noindex utility variants alone.
- **Acceptance criteria:** Old service routes continue returning one-hop permanent redirects; preferred destinations return 200 and self-canonical URLs; sitemap contains the destinations, not the legacy routes.
- **Verification:** Re-run the public audit after each deployment and inspect redirect chains, canonical tags, robots directives, and sitemap URLs.

## P2 — Improve only where the visitor benefits

### Review the short public Contact page without adding filler

- **Affected URL:** `/contact`.
- **Evidence:** The crawl flags it as thin. Live page inspection shows phone and email links, Gurugram location, service area, working hours, a one-business-day response expectation, and contact forms. Form labels are excluded by the crawler's word-count method.
- **Proposed solution:** Confirm these business details and the form submission path are accurate. Add a physical address or business registration details only if they are genuine and appropriate to publish.
- **Acceptance criteria:** Visitors can identify the business, choose a contact method, understand response expectations, and submit each form accessibly.
- **Verification:** Submit each form in a test environment and manually check the mobile layout and keyboard access.

### Grow case studies with verified project detail

- **Affected URL:** `/case-studies` and its detail pages.
- **Evidence:** The listing now provides an engineering overview; the refreshed crawler reports 125 visible words on the landing page. The content data contains one detailed project study and avoids invented performance numbers.
- **Proposed solution:** Add further case studies only for real work with permission, including the client problem, actual engineering choices, constraints, and verifiable outcome.
- **Acceptance criteria:** Each published study is specific, accurate, and distinct from the service page copy; no unsupported metrics or client claims are added.
- **Verification:** Client/project owner review and rendered-page inspection.

## Findings not requiring bulk changes

- **1,445 CodeLab playground variants:** They are `noindex` and canonicalize to `/codelab/playground`; preserve the query behavior and do not create thousands of redirects.
- **11 URLs without canonical declarations:** They are account, admin, deletion, or utility routes and are marked `noindex`; no canonical change is indicated by this crawl.
- **7 thin classifications:** Five are noindex CodeLab problem pages, one is the noindex problem list, and `/contact` is a functional business page. These are not seven AdSense blockers.
- **No broken URLs:** The crawl reported zero broken responses, zero blocked URLs, and zero malformed same-host links. This does not verify authenticated screens or account state.

## Unresolved checks

- AdSense Sites status, Policy Center messages, and account verification cannot be inspected without account access.
- Browser rendering, mobile viewport behavior, console errors, and real form submission were not tested in this audit.
- The accuracy of business claims, client permissions, project outcomes, and legal-policy statements requires owner confirmation.
- AdSense approval is Google's decision; this plan cannot predict or guarantee it.
