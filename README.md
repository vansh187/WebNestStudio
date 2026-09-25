# WebNest Studio

## Development and SEO checks

Run `npm ci`, then `npm run dev`. The public API defaults to the Render host in `.env.example`; use `VITE_API_BASE_URL` to select another backend.

`npm run build` generates the sitemap, builds the app and prerenders public pages. Local builds need Chrome/Edge or a Playwright Chromium installation (`npx playwright install chromium`). Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for another browser path. Vercel uses the existing serverless Chromium dependency. Prerender failures for required pages fail the build.

Run `npm test`, `npm run lint`, and then `npm run test:seo` after a successful build. The last command validates every sitemap snapshot and exercises learning/navigation in a browser. Its generated report and mobile screenshot are in `.seo-build/`. `npm run preview` serves the built HTML locally; Vercel-specific redirects, headers and 404 status still need a deployment smoke check.

New public content must be included in `scripts/generate-sitemap.mjs` or one of its data inventories. The same inventory drives prerendering. Redeploy when backend content changes. See [SEO audit](SEO-AUDIT.md) and [implementation report](SEO-REPORT.md) for decisions, measurement setup and follow-up work.

## Original Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
