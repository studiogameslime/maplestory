# Milestones

## 1 · Static companion

Acceptance criteria for the first release

- The eight sections support direct navigation on a phone or desktop. English is the default. Hebrew mirrors the layout and persists across reloads.
- The dashboard shows the user's character, clearly labeled sample FM listings, a price trend derived from comparable sales, and links to field tools.
- Market filters combine budget, sample confidence, weekly volume and item search. Each listing explains its sample distribution, modeled fee, liquidity, room and observation time. The verified feed can remain empty.
- Both sides of the drop index are searchable. Quests expose prerequisites, level, reward, EXP and estimated value and can be tracked locally.
- The player can edit a local character and request a separate public lookup. Missing names, stale observations, outages and rate limits have distinct outcomes.
- Hunt, scroll, consumable and portfolio calculations run locally. Saved values survive reloads. The production PWA can open offline after a successful initial cache.
- Lint, calculation and provider tests, and a production build run in CI. All shipped imagery has a documented origin. Provider access and deployment are documented.

## 2 · Licensed field references

- The feasibility prototype imports all eleven Classic Maple Wiki exports plus selected pinned wiki revisions. See [the coverage report](DATA_COVERAGE.md) for measured gaps. Expand the bounded supplemental collection only where the source, build and reuse rights are traceable. Record the source page, revision, retrieval timestamp, license and changes per entry. Review data and artwork rights separately.
- Retain the difference between confirmed drops, unknown probabilities, older-version estimates and measured Classic World rates. Verify mirrored UI and attribution offline.
- Offer optional screenshot-assisted local profile entry with review before saving. Keep public search independent of character ownership.

Before broader release, verify additional material and reward quantities against immutable revisions, increase the number of entities with numerical game IDs, and add regression cases for inconsistent builds. Acceptance requires a reproducible graph, zero broken references, updated full-dataset coverage and visible uncertainty in both languages. Original game sprites require express rights for display and offline distribution.

## 3 · Verified FM observations

- Obtain a free feed whose owner explicitly permits browser access or static republication. Confirm the venue, unit, variant, remaining slots and completed-sale evidence.
- Add an adapter with contract tests, a hard request budget, cache expiry and handling for partial scans, source errors, retries and old records. Disable ingestion if access terms change.
- On the dashboard, surface qualifying verified deals with source and timestamps. Test fee assumptions, liquidity thresholds and estimates against traceable comparable sales.

## 4 · Player workflow refinement

- Support position edits and partial sales, preserving cost basis and quantities across realized and outstanding holdings.
- Link licensed drops and observed net sale prices to Hunt inputs with editable assumptions. Measure keyboard, touch, screen-reader and offline workflows in both languages before release.
