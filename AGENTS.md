# MapleCompanion — Codex Agent Instructions

## Mission
Build a polished, mobile-first, installable PWA for **MapleStory Classic World**. The product helps players discover profitable Free Market listings, compare sold prices and liquidity, find monster drops and quests, calculate training profitability, and look up characters.

## Non-negotiable constraints
- **Zero ongoing paid infrastructure**: no paid APIs, servers, subscriptions, or domains. Free tiers only; design for limits and no automatic overages.
- Never invent live listings, prices, drop rates, character data, or event facts. Clearly distinguish demo fixtures, estimates, and verified source data, with source URL and fetched timestamp.
- Do not scrape or bulk-copy sites without permission. Audit API availability, robots.txt and terms for mesos.watch, cozy.markets, ClassicRank and drop-table sources. If not permitted or unavailable, implement adapters with graceful disabled states and document the blocker.
- Do not claim to verify a player's ownership merely from their character name. Public lookup is not account linking.
- Do not add proprietary MapleStory sprites/artwork without checking reuse rights; create original visual elements or use permitted assets with attribution.
- Never commit secrets. Do not add payment services.
- Keep the repo separate from Teamder.

## Stack
- React + TypeScript + Vite, Tailwind CSS, PWA (vite-plugin-pwa).
- Responsive desktop/mobile, dark fantasy/pixel-inspired visual design, readable data-heavy interface.
- Hebrew RTL and English LTR with a visible language switch. Default English for global audience, remember user preference.
- Client-side calculations, localStorage/IndexedDB for preferences, static JSON snapshots when licensed, Cloudflare Pages-compatible build.
- Strong typing and modular provider adapters; unit tests for pricing/profit calculations.

## Main sections
1. Dashboard: character summary, latest verified deals, price trends, quick access to tools.
2. Market Sniper: listing cards with item, exact stats/slots, asking price, comparable sold-price distribution, trade volume, estimated net margin, risk, seller/channel/FM room, observed_at and data freshness. Filters by budget, liquidity and confidence. Never confuse TM with FM or ordinary map shops.
3. Drops: searchable monster/item cross-reference, drop-rate confidence and source, maps, level filters.
4. Quests: prerequisites, rewards, EXP, estimated reward value and source.
5. Hunt: expected EXP/mesos per hour, potion costs, drop probabilities; label assumptions.
6. Character: search external rankings where authorized; show public profile freshness; manual override and screenshot-assisted input later.
7. Portfolio: manual inventory and realized/unrealized profits.
8. Calculators: scroll upgrade odds, expected value, consumable cost efficiency.

## First implementation milestone
- Scaffold a working project with npm scripts dev/build/test/lint.
- Build a visually compelling responsive dashboard based on the agreed dark MapleStory-inspired concept.
- Implement routing/navigation, language toggle, budget input, filters, empty/loading/error/stale states.
- Use explicitly labeled demo fixtures until approved live providers work. No fake “live now” claims.
- Write docs/DATA_SOURCES.md with verified endpoints, access restrictions, update frequencies, and uncertainty.
- Write docs/ROADMAP.md with milestones and acceptance criteria.
- Add GitHub Actions CI for lint, tests and build.
- Document Cloudflare Pages deployment (build: npm run build, output: dist).

## Quality and execution
Work autonomously on implementation, tests, and documentation. Make focused commits. Do not block on cosmetic decisions; use sensible defaults. Run npm install, npm run build, npm test and lint, fix failures. Never claim a test ran unless it did. If a source is blocked, continue implementing independent features and report exact blockers.

## User context
The owner's example character is TeamderApp, Assassin level 35 as of Nov 10, 2026. This is user-supplied context, **not** a verified API response and should never appear as a live lookup result.
