# Game artwork and display rights

Checked on **2026-11-10, 16:20–16:25 UTC**. The targeted test found **26 named assets across 11 categories** in MapleStory.io's Classic World dataset. All 26 had an accessible image response or embedded PNG. **Zero game sprites are approved for display in MapleCompanion.** The API and the copyright holder publish different conditions.

## Rights and source coverage

| Source | Evidence | Application decision |
| --- | --- | --- |
| MapleStory.io | The public API has a version registry and per-entity routes. Its OpenAPI license field reads “Unlicensed.” The site credits Nexon as owner of the served media, icons and descriptions and points to Nexon's terms. Its `/robots.txt` returned HTTP 404 JSON. [API and disclaimer](https://maplestory.io/) · [OpenAPI V3](https://maplestory.io/swagger/V3/swagger.json) · [Version registry](https://maplestory.io/api/wz) | Technical lookup worked without an account. The provider supplies no grant we could use to republish, embed or offline-cache the sprites in this app. |
| Nexon | The English IP guide covers game images, characters and monsters. Sections ④(4) and ⑤(2) address apps, including non-profit digital content, and require prior written consent for that use. It directs creators to customer support. [Game IP guide](https://m-page.nexon.com/term/716) · [Support](https://support.nexon.net) | No project-specific grant is on file. Obtain permission covering the intended assets, display, distribution and any offline copies before enabling those uses. |
| Nexon Open API | The platform supports external applications built with its registered APIs and requires attribution. Access requires registering an application for the supported game. [Access guide](https://openapi.nexon.com/guide/prepare-in-advance/) · [Request guide](https://openapi.nexon.com/en/guide/request-api/) | No Classic World icon API with a matching entitlement for these third-party assets was established. Keep provenance scoped to the provider that supplied the resource. |
| Regional and platform-specific policies | Nexon's Japan FAQ permits specified fan-site use under its Japanese copyright guidelines. The MapleStory Worlds terms address creator content made within that platform. [Japan FAQ](https://maplestory.nexon.co.jp/faq/23/) · [Worlds guide](https://m.nexon.com/terms/1030) | Neither page establishes permission for these Global Classic World files on a standalone PWA. |
| Fan databases | MapleStory Classic's published attribution distinguishes community-licensed structured data from Nexon-owned game artwork. MapleStory Network identifies itself as unofficial and reserves the right to restrict API access. [Attribution](https://maplestory-classic.com/legal/attribution) · [Developer disclaimer](https://maplestory.net/develop/disclaimer/) | Do not transfer the license of a database, an open-source extractor or an API implementation to the images it references. |

## Version and image probes

The registry returned ready, image-capable entries for `MCW/1` and `MCW/CBT2`. The former is the provider's Classic World version identifier. We found no authoritative mapping to a particular live game patch or update interval. `CBT2` is a separate dataset. We used bounded exact-name or two-result searches and specific ID lookups through the documented API. No archive, full sprite collection or map render was downloaded. [Version registry](https://maplestory.io/api/wz) · [API reference](https://maplestory.io/swagger/V3/swagger.json)

The table records 200 responses from the base URL `https://maplestory.io/api/MCW/1/`. Rows with `HEAD` used the response's `image/png` MIME and advertised content length. For skills, `GET` returned JSON with the named skill and an icon whose decoded first eight bytes matched the PNG signature. Skill sizes refer to that single decoded icon. These checks establish endpoint and metadata availability. They do not individually certify visual accuracy.

| Category | Name in MCW/1 | Route relative to base | Method | PNG bytes |
| --- | --- | --- | --- | ---: |
| Weapon | Sword | `item/1302000/icon` | HEAD | 626 |
| Weapon | Coconut Knife | `item/1332005/icon` | HEAD | 668 |
| Weapon | Hunter's Bow | `item/1452002/icon` | HEAD | 747 |
| Armor | Work Gloves | `item/1082000/icon` | HEAD | 877 |
| Armor | Steel Fingerless Gloves | `item/1082002/icon` | HEAD | 687 |
| Armor | Blue Duo | `item/1082006/icon` | HEAD | 752 |
| Armor | Black Swimming Cap | `item/1002008/icon` | HEAD | 767 |
| Scroll | Overall Armor DEF Scroll: Intermediate | `item/2040501/icon` | HEAD | 1,047 |
| Scroll | Gloves Magic Attack Scroll: Lesser | `item/2040804/icon` | HEAD | 1,078 |
| ETC | Jr. Sentinel Shellpiece | `item/4000000/icon` | HEAD | 791 |
| ETC | Red Snail Shell | `item/4000004/icon` | HEAD | 833 |
| Potion | Red Potion | `item/2000000/icon` | HEAD | 883 |
| Potion | Mana Elixir | `item/2000006/icon` | HEAD | 1,150 |
| Throwing stars | Subi Throwing Stars | `item/2070000/icon` | HEAD | 638 |
| Throwing stars | Tobi Throwing Stars | `item/2070004/icon` | HEAD | 694 |
| Pet | Brown Kitty | `pet/5000000/render/stand0` | HEAD | 1,199 |
| Pet | Brown Puppy | `pet/5000001/render/stand0` | HEAD | 1,143 |
| Monster | Snail | `mob/2/icon` | HEAD | 1,369 |
| Monster | Slime | `mob/7/icon` | HEAD | 2,296 |
| Monster | Orange Mushroom | `mob/9/icon` | HEAD | 2,620 |
| NPC | Athena Pierce | `npc/221/icon` | HEAD | 3,485 |
| NPC | Grendel the Really Old | `npc/313/icon` | HEAD | 5,493 |
| Skill | Power Strike | `job/100/skillbook/1001001` | GET | 665 |
| Skill | Lucky Seven | `job/400/skillbook/4001003` | GET | 688 |
| Map | Henesys | `map/10001000/minimap` | HEAD | 28,384 |
| Map | Ellinia | `map/10002000/minimap` | HEAD | 38,674 |

Three control lookups demonstrated the risk of importing old IDs. GMS/83 calls item 1082002 Work Gloves, while both MCW snapshots call it Steel Fingerless Gloves. The old Orange Mushroom ID 1210102 and Henesys ID 100000000 returned names in GMS/83 and HTTP 404 from both MCW name routes. The MCW/1 skill routes for legacy IDs 1001004 and 4001344 returned HTTP 500 on the general skill route. Looking up the selected MCW IDs within their job books succeeded. [GMS glove](https://maplestory.io/api/GMS/83/item/1082002/name) · [MCW glove](https://maplestory.io/api/MCW/1/item/1082002/name) · [MCW Orange Mushroom](https://maplestory.io/api/MCW/1/mob/9/name)

One Red Potion response had `Access-Control-Allow-Origin: *` and `Cache-Control: max-age=86400`. These are transport settings. The last-modified header and a one-day cache lifetime do not establish the age of the underlying game art or the provider's update schedule. A successful response grants no reuse rights. [Red Potion probe](https://maplestory.io/api/MCW/1/item/2000000/icon)

## Display behavior

The resolver accepts a namespaced entity ID and returns either an approved source, provenance and credit, or an unavailable result without an image URL. Only reviewed entries can return a renderable URL. Real entity pages therefore show a localized image-unavailable state and keep their name, data and links usable. They make no fallback request to MapleStory.io. An unavailable approved image also has a load-error state. [Resolver](../src/assets.ts) · [Renderer](../src/AssetImage.tsx) · [Tests](../tests/assets.test.ts)

MapleCompanion's autumn panorama and adventurer portrait are original generated illustrations. The four demo inventory icons are original drawings. They are approved in the illustration namespace only. They convey neither actual game appearance nor a verified player's appearance. Any future grant should be recorded alongside the exact source, version, IDs, attribution and permitted storage or embedding scope before its assets enter the resolver. [Project artwork](../public/art)
