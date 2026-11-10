# Data sources

Access review conducted November 10, 2026. Only ClassicRank's public, single-character API passed the free browser-access check. The market, drops and quests use explicitly labeled local demonstration data in this milestone. None of the external sites below supplied the demo prices or probabilities.

## Character lookup

**ClassicRank, Windia.** A player may submit an exact character name to `GET https://classicrank.com/api/v1/characters/{name}`. Encode the name as one URL path segment and request only the displayed fields. The free tier allows 30 requests per minute per IP without signup or a key. Responses have a 30-second server cache. List ranks refresh each minute, while an individual character is observed when scanned or uploaded. Display visible credit linking to ClassicRank. [Developer reference](https://classicrank.com/developer)

At 15:40 UTC a single-name GET with a localhost origin returned HTTP 200, a JSON `data` object and `Access-Control-Allow-Origin: *`. Another lookup returned a JSON 404. These checks establish browser access and response shape. Neither response was copied into a fixture. The developer reference permits application lookups. The robots file excludes crawling `/api/`, account pages and scraper traps. A direct request to `/terms` returned 404. The published developer conditions and privacy policy describe access and removal. [Robots policy](https://classicrank.com/robots.txt) · [Privacy](https://classicrank.com/privacy)

Use `last_checked` for the provider observation time and the successful response time for local retrieval. Display the public source link. An old observation remains old after a new fetch. A missing or hidden name may return 404. On 429, respect `Retry-After`. An outage, malformed response or offline device cannot substantiate a profile. The provider's `verified` field describes scanner provenance. Looking up a name establishes no relationship between the character and the person searching. [Field and error definitions](https://classicrank.com/developer)

## Free Market

| Source | Access and reuse | Frequency and milestone disposition |
| --- | --- | --- |
| mesos.watch | The documented API at `https://api.mesos.watch` includes `GET /v1/listings`, `/v1/items/{id}/sales` and `/v1/prices`. It requires a paid Merchant plan and a personal token. Terms restrict large-scale copying. The API host's robots file disallows crawling. The website blocks several named crawlers and restricts some directories. [API](https://mesos.watch/api) · [Terms](https://mesos.watch/terms) · [Site robots](https://mesos.watch/robots.txt) · [API robots](https://api.mesos.watch/robots.txt) | The newest-listings snapshot refreshes every 30 seconds. Price summaries may be cached for 90 seconds. Shop observation time can be older and scanners can be offline. Disabled. No token, polling, snapshot or site scraping. |
| Cozy Market | The public site identifies itself as an FM price browser. Its robots file allows general crawling. Requests to the homepage, `/terms` and `/developers` received HTTP 403 browser challenges during the access check. No public developer contract, reuse grant or authenticated-free endpoint was established. [Website](https://cozy.markets/) · [Robots](https://cozy.markets/robots.txt) | Provider refresh cadence, transaction evidence, coverage and redistribution rights are unknown. Disabled until the operator supplies documented permission and an accessible free feed. |
| MapleMarket | Its documented JSON API requires the paid API plan and a server-side key. The terms restrict raw data republication. Its robots file excludes crawling `/api/`. [API documentation](https://maplemarket.fyi/docs/api) · [Terms](https://maplemarket.fyi/terms) · [Robots](https://maplemarket.fyi/robots.txt) | Observation coverage and timeliness are not guaranteed. No integration. |

A future FM provider must identify a Classic World FM channel and room, the item variant and remaining slots, unit or bundle basis, seller, and observation time. Sold-price comparisons require independent sale evidence on comparable variants. A disappearing listing alone cannot establish the sale price. Keep TM, ordinary map shops and NPC prices outside the FM sample. Scan timestamps, sample counts and assumptions must travel with derived price estimates.

## Drops and quests

| Source | Rights, endpoints and uncertainty | Update policy |
| --- | --- | --- |
| MaplelandHub | Article 3 of its Korean terms prohibits bulk duplication for redistribution and excessive automated load. Robots excludes `/api/` and blocks several automated clients. The Classic World drop guide distinguishes older KMS reference rates from field reports. No licensed data-export endpoint was established. [Terms](https://maplelandhub.com/terms) · [Robots](https://maplelandhub.com/robots.txt) · [Drop methodology](https://maplelandhub.pages.dev/classic/en/drop-table) | Community reports and corrections can change. No fixed publication interval established. Automated ingestion disabled. |
| MapleClassic Wiki | Its original prose and Cargo data have a noncommercial share-alike license. Each reused page needs attribution, a source link and a description of changes. The wiki requests that consumers avoid copying entire tables. Game sprites, icons and music have separate rights. Robots excludes the player-reports REST route, special pages and certain query URLs. [Reuse policy](https://mapleclassic.wiki/wiki/MapleWiki:About#Reusing_the_wiki) · [License](https://creativecommons.org/licenses/by-nc-sa/4.0/) · [Robots](https://mapleclassic.wiki/robots.txt) | Candidate for a small, attributed, separately licensed reference snapshot. Revisions follow edits and game patches, with no fixed refresh interval. Record the page revision, retrieval time, game version and license per imported row. The wiki distinguishes kill-tested rates from votes confirming an item can drop. [Drop-report method](https://mapleclassic.wiki/wiki/MapleWiki:Report_an_item_drop) |

## Local provenance

- **Demo** records are authored scenarios. Their prices, observations, sold samples, quest rewards and drop probabilities illustrate the interface. A fixed scenario date describes the fixture. There is no network fetch time.
- **Manual** character and inventory entries come from the player. The initial TeamderApp example comes from the project owner's November 10 context. Editing or saving it does not verify it.
- **Estimates** derive from displayed inputs such as success probability, kills per hour, sale assumptions and consumable costs. Unmeasured drop rates remain unknown for a real provider.
- **Provider** records need a source URL and successful fetch timestamp. Preserve the provider observation time separately where supplied. A missing source, an empty result and a network error are different outcomes.

The static app needs no paid service, account token or scheduled collection. Recheck the cited policies and field definitions before enabling another adapter.
