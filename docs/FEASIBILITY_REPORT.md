# MapleCompanion feasibility decision

**Proceed with a noncommercial reference database. The complete vision has unresolved rights and coverage dependencies.** The static prototype imports real, attributed Classic World records, exposes both sides of documented relationships, and runs without paid infrastructure. Free hosting cannot supply missing observations or grant a license to game sprites.

## Findings

| Feature | Classification | Evidence and boundary |
| --- | --- | --- |
| Licensed database, ingestion, local indexing and public display | VERIFIED AND WORKING | Eleven published JSON exports plus selected immutable wiki revisions. `npm run import:data` rebuilds the graph from committed inputs without network access. The graph and adapted facts carry CC BY-NC-SA 4.0 attribution. Commercial use would require different rights. |
| Item, monster, map, NPC and quest navigation | VERIFIED AND WORKING | The Game database indexes each normalized edge in both directions. Green Mushroom Cap leads to Green Mushroom and its maps, and to How to Enjoy Mushrooms, which needs 15 caps, requires 30 kills and rewards 5 Bronze Ore. The links retain their own builds. |
| Complete game catalog with all properties | PARTIALLY VERIFIED | Includes equipment, scrolls, consumables, materials, stars, pets, pet gear, monsters, maps, shops, quests, class skills and professions. Coverage follows upstream exports. Numeric game IDs and stat blocks are sparse. Source-scoped identifiers keep unnumbered records addressable. There is no evidence that all server-side records are enumerable. |
| Crafting, quest costs, scrolls, equipment compatibility and NPC economics | PARTIALLY VERIFIED | Two revision-backed recipes produce Processed Wood. Item pages show exact quantities, build-specific shop asks, resale facts and compatibility when documented. Closed-test and launch-era claims retain different version labels. Many items have no published cost or use. |
| Community drop observations and expected-value math | VERIFIED AND WORKING | Axe Stump → Firewood records 17 drops in 37 kills in Founder's Access. The explorer exposes source and build, sample counts, a binary-trial confidence interval and an independent-kill calculator. Presence alone supplies no probability. |
| Complete official Classic World drop probabilities | NOT FEASIBLE UNDER CURRENT CONSTRAINTS | No reviewed freely redistributable official server-side drop table was established. Historical KMS tables and player reports cannot verify official probabilities. Rare drops, observation bias and build changes affect farming estimates. |
| Original game icons and sprites | TECHNICALLY POSSIBLE BUT BLOCKED | Twenty-six successful asset probes cover eleven categories on MapleStory.io MCW/1. API reachability and client caching headers do not supply the written rights required to ship the images. The resolver serves reviewed project illustrations and reports game art unavailable. See the asset audit for the precise grant needed. |
| Public character search | VERIFIED AND WORKING | ClassicRank's free CORS API supports explicit Windia lookups. TeamderApp returned Thief level 27 with a November 5 observation. The owner's later November 10 report of Assassin level 35 stays in the manual profile. API fame, ranking and timestamps can be displayed independently. A fresh retrieval cannot update an older observation. |
| Automatic current character level and avatar republishing | PARTIALLY VERIFIED | An authorized lookup can refresh published fields within the provider limit. No guaranteed scanner cadence or character ownership follows. The profile links to the provider. No avatar cache or unattended background polling is enabled. |
| Current FM inventory, completed sales and availability | TECHNICALLY POSSIBLE BUT BLOCKED | The reviewed sources did not establish a free, permitted redistribution path covering exact variants and completed transactions. No verified historical or live prices enter the graph. |
| Market comparison engine | VERIFIED AND WORKING | Exact version, world, item, stat/slot combination, unit, venue and evidence origin govern comparable sales. Fixtures exercise volume, median, gross and net estimates, relative volatility, age and scores. The score is a heuristic. |
| Free delivery and offline browsing | VERIFIED AND WORKING | Static assets and JSON build into `dist`. The PWA precaches the graph. Standard public-repository CI reconstructs and validates it offline before testing and building. Deployment settings and quotas are documented below. |

## Costs and refresh policy

Use GitHub's standard Linux runner on this public repository and Cloudflare Pages Free with a Pages subdomain. Pages documents 500 builds per month, one concurrent build, a 20-minute build limit, 20,000 files and 25 MiB per file on Free. This application serves static files without a Worker, D1, external search service or metered data pipeline. A normal visit reads the deployed snapshot. A character lookup is user initiated. [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) · [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)

Updates are explicit. A maintainer runs the authorized refresh, reviews source terms, version changes, graph differences and coverage, then commits the snapshot. CI uses cached inputs. No scheduled download or purchase is configured. A scheduled importer would need a run cap, permission for each source, conditional requests and checks that prevent a failed or incomplete refresh from publishing.

## Decision gates

1. Maintain a documented noncommercial deployment and preserve page-level attribution, build, origin and share-alike terms on every export.
2. Obtain a specific asset grant covering in-app display and, separately, offline caching and redistribution. Review each game build and numerical ID mapping before enabling an image.
3. Secure a free market agreement covering listing variants, timestamps, venue and completed sales before connecting the verified tab.
4. Expand version-matched observations and supplemental quest, shop and recipe facts. Keep unsupported rates and values unknown.

See the [source audit](DATA_SOURCES.md), [asset probes](ASSET_LICENSING.md), [full-dataset coverage](DATA_COVERAGE.md), [model](DATA_MODEL.md) and [roadmap](ROADMAP.md).
