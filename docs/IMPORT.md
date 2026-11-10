# Rebuilding the Classic World database

The browser reads one local file, `public/data/atlas.json`. Builds and tests work offline after dependencies are installed. There is no collection service, API key, paid tier or background polling.

## Reproduce the committed snapshot

Use Node 22.12 or newer from the repository root.

```sh
npm ci
npm run import:data
npm run data:check
```

The importer verifies a SHA-256 digest for each captured export, normalizes its rows, applies a small revision-pinned supplement, and checks for duplicate record identities and dangling edges. The output is reproducible from the committed inputs. `data:check` validates claims and checks the coverage report against the generated graph.

To review a **new** upstream snapshot, run the following commands.

```sh
npm run import:data -- --refresh
npm run data:report
npm run data:check
```

Refresh fetches the eleven documented JSON exports in sequence, then requests the pinned wiki revisions in one batch. A later wiki revision requires an explicit change to the revision list. Compare the archive, projected supplement, derived graph and coverage report in the same change. No live FM or character data enters this importer.

## Source files and attribution

Classic Maple Wiki explicitly offers its datasets for download. The source archive at `data/classicmaple-exports.json.gz` contains the exact response text for each file, source URL, SHA-256 digest, HTTP modification timestamp and successful retrieval timestamp. The site's robots policy allows its public pages. Its open-data documentation and license supply the basis for reuse. [Open-data directory](https://classicmaple.wiki/contributing/#open-data) · [Usage terms](https://classicmaple.wiki/legal/) · [Robots policy](https://classicmaple.wiki/robots.txt)

| Source download | Imported information |
| --- | --- |
| [Items](https://classicmaple.wiki/data/items.json), [monsters](https://classicmaple.wiki/data/monsters.json) | Item categories and recorded requirements, monster stats, observed drop samples and stated quantity ranges |
| [Maps](https://classicmaple.wiki/data/maps.json), [NPCs](https://classicmaple.wiki/data/npcs.json), [shops](https://classicmaple.wiki/data/shops.json) | Map exits, spawn locations, NPC locations, shopkeepers and inventory |
| [Quests](https://classicmaple.wiki/data/quests.json) | Givers, turn-ins, starting maps, prerequisites, subsequent quests and entities referenced in steps |
| [Classes](https://classicmaple.wiki/data/classes.json), [professions](https://classicmaple.wiki/data/professions.json), [systems](https://classicmaple.wiki/data/systems.json) | Job families, their nested skills, skill branches, professions and system requirements |
| [Patches](https://classicmaple.wiki/data/patches.json), [builds](https://classicmaple.wiki/data/builds.json) | Published build identities, release dates and referenced patch information |

**Classic Maple Wiki contributors and MapleClassic Wiki contributors** created the source data. MapleCompanion adapts their work by selecting factual fields, assigning local graph IDs, linking records, retaining evidence and adding selected wiki-revision facts. The source archive, supplement, and adapted database are available under **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International**. Each adapted record carries its source link. Use the linked original page's history to identify its editors. Rights to MapleStory names, artwork and music remain with their respective owners. No upstream sprites or minimap images are included. [Classic Maple Wiki credits](https://classicmaple.wiki/credits/) · [MapleClassic Wiki reuse terms](https://mapleclassic.wiki/wiki/MapleWiki:About#Reusing_the_wiki) · [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Interpreting a row

- `id` namespaces the provider's stable key by entity type. Shop and NPC records can describe the same named character while serving distinct roles. Numeric `gameId` is populated only when supported by a source for Classic World. Sprite URLs from another client version do not establish that ID.
- `version` preserves the published source build or an explicit unknown. Closed Online Test 2, Founder's Access and later wiki revisions can describe different game states. Keep the version on each fact or relationship when comparing values.
- `status` retains the upstream verification flag. The bulk entity records are largely marked unverified by the publisher. The source's sample-based drop rows include their own community evidence, build and observation time.
- `updated` uses a record verification timestamp where supplied. Otherwise it records the upstream export's HTTP `Last-Modified` time. Drop observations have their observation time, and revision-pinned wiki assertions carry the revision timestamp. `fetched` is the time MapleCompanion received the source. An export's modification date cannot date an in-game observation.
- `rate` is a percentage from 0 to 100. The source provides `sampleKills`, `sampleDrops` and a date for measured rates. A quantity range describes stack size per successful drop. The historical sample is not an official game probability.
- A shop listing can substantiate stock without substantiating a price. A quest step mentioning a monster does not specify a kill requirement. Imported edges distinguish these claims. Absence from the export leaves a fact unknown.

The normalized graph contains all source entities from the eleven downloads. Published sources have different game-build coverage, and the supplement fills selected gaps. See the generated [coverage report](DATA_COVERAGE.md) for exact counts and missing fields, and the [supplement notes](SUPPLEMENT.md) for revision selection.
