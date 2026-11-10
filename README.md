# MapleCompanion

A mobile-first MapleStory Classic World PWA built with React, TypeScript, Vite, Tailwind CSS and vite-plugin-pwa. The app runs on static hosting. English and Hebrew are available throughout, with a persistent language preference and mirrored RTL layout.

## Run locally

Use Node.js 22.12 or later in the 22.x line and npm. Run the following in the repository root.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. To check the installable production version, run the following commands.

```sh
npm run lint
npm test
npm run build
npm run preview
```

Open the preview in a browser on localhost or serve the build over HTTPS. After the first successful service-worker installation, the dashboard, sample data, locally saved profile and planning tools work offline. Use the browser's install action or Add to Home Screen where supported. Public lookups need a network connection.

## Real-data proof of concept

Open **Game database** at `/database` to search the imported Classic World graph by name or ID. Try **Green Mushroom Cap** to follow a monster drop to its maps, a quest to its material quantities and rewards, or **Processed Wood** to inspect recipes. Market Sniper and the original field-tool demonstrations remain labeled scenarios. Public character lookup is independent of both.

```sh
npm run import:data
npm run data:report
npm run data:check
```

The default import replays committed source inputs offline. An explicit `npm run import:data -- --refresh` retrieves the approved endpoints. Inspect graph and coverage changes before publishing. The adapted database is distributed under CC BY-NC-SA 4.0. See the [feasibility decision](docs/FEASIBILITY_REPORT.md), [data model](docs/DATA_MODEL.md), [coverage](docs/DATA_COVERAGE.md) and [asset rights audit](docs/ASSET_LICENSING.md).

## First milestone

| Section | What works |
| --- | --- |
| Dashboard | Manual character summary, sample Free Market watchlist, selectable daily median sold-price trends and quick access to field tools. |
| Market Sniper | Filter by budget, item, seven-day volume and confidence. Open a listing for exact variant, slots, venue, seller, observation time, quartiles, risk and fee-adjusted estimates. The verified tab explains feed availability. |
| Drop Atlas | Search by monster, item or map, limit results by level and inspect the provenance and certainty of a sample drop rate. |
| Quest Journal | Filter by level, rank by estimated reward value, inspect prerequisites and EXP, and track quests locally. |
| Hunt Planner | Model hourly EXP, base mesos, expected drops and potion spend using editable assumptions. |
| Character | Edit a manual profile or initiate a free, exact-name Windia lookup from ClassicRank. The public result carries a source, observation time and fetch time. |
| Portfolio | Record manual holdings and completed sales with unit values and quantities. See realized and unrealized totals separately. |
| Calculators | Compute the probability of at least one scroll success, expected net upgrade value and mesos per recovered HP or MP. |

The market and field catalogs contain explicitly labeled, authored demo scenarios. The TeamderApp starting profile records the owner's November 10, 2026 example. A public lookup does not establish ownership. Profile edits, language, budget, tracked quests and positions stay in the browser's local storage. The app sends a name to ClassicRank only when the player submits a lookup.

## Deploy to Cloudflare Pages

Connect the GitHub repository `studiogameslime/maplestory` to a Cloudflare **Pages** project on the Free plan. Select `main` as the production branch, leave the root at the repository root, set the build command to `npm run build` and set the build output directory to `dist`. Select Node 22.12+ (for example, set `NODE_VERSION=22.23.4`). Use the included Pages subdomain. The app needs no Functions, database, billing integration, custom domain or API key. [Cloudflare React guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)

After deployment, open `/market/work-gloves` directly, check that the manifest and service worker load, then revisit the app offline. GitHub Actions independently runs lint, tests and the production build on pushes and pull requests.

## Sources and artwork

The [data-source audit](docs/DATA_SOURCES.md) records API access, terms, robots policies, freshness and integration decisions. The [roadmap](docs/ROADMAP.md) lists acceptance criteria and subsequent milestones. [AGENTS.md](AGENTS.md) contains the project requirements.

The village panorama and adventurer portrait are original generated artwork. Inventory icons and the maple-leaf mark are original drawings. Lucide provides interface icons. Inter and Space Grotesk are bundled locally. Their license notices are in [public/licenses](public/licenses). MapleCompanion is an unofficial fan project.
