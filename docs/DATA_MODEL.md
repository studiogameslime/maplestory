# Game database model

The PWA reads a versioned static graph at `/data/atlas.json`. Its entity and edge arrays can be loaded into SQL tables without relying on array positions. The import collects source claims and preserves their build rather than assigning one universal value to an item.

| Relation | Identity and fields |
| --- | --- |
| Entity | Namespaced stable source ID, kind, display name, optional game ID, category, description, properties, source URL, game version, verification status, update and retrieval timestamps |
| Fact | Entity ID plus property name, value and evidence. A price, numerical ID or other supplemental fact can carry a different version from the entity's original reference. |
| Edge | From ID, relationship type, to ID and evidence. A claim may also have quantity, unit price, drop probability, sample size or observation date. Multiple sources or builds may describe the same pair. |
| Market observation | Separate from the game graph. Identity includes game version, world, item ID, exact stats, remaining slots and unit basis. A quote records FM room, channel, seller and observation time. Sold observations require independent sale evidence. |
| Asset grant | Resolver decisions are separate from entity existence. An HTTP response or numerical game ID does not grant display or redistribution permission. |

Shop inventories connect items to shops. Shopkeeper and location edges connect those shops to NPCs and maps. Monster drops and spawns let the browser traverse an item to a monster and then its maps. Quest and recipe relationships retain direction and quantities. The browser indexes both endpoints of each claim once. A single source claim powers both directions.

Unknown fields stay absent. A missing shop price, unreported drop, unknown quantity or empty quest requirement list cannot be interpreted as zero. Game build, source modification time, field observation date and local retrieval time describe different events. An upstream “verified” status describes the contributor's verification process. It does not make a probability official.

## Calculations

For independently observed kills with one successful drop unit per trial and probability p, expected kills per unit are 1/p. The chance of at least one success in n kills is 1 − (1 − p)ⁿ. Expected drop revenue per kill is p × net unit value. Multiply by kills per hour for hourly drop revenue. For a requirement of q units, expected hours are q / (p × kills per hour). Unavailable probabilities leave estimates blank. Sample-based predictions apply to the source build and the user's stated assumptions. Wilson 95% intervals model binary trials and do not account for reporting bias, changing builds or drop boosts.

FM comparisons first filter on matching variant, venue, data origin and the seven-day window through the observation. Gross profit is the median sold price less the ask. Net profit additionally subtracts an assumed resale fee. Relative price volatility uses the population standard deviation divided by mean sale price. The illustrative liquidity score rises linearly to 100 at 28 sales per week. The evidence score multiplies liquidity by freshness (linear decay to zero after 24 hours) and divides by one plus relative volatility. These are scenario scoring rules, not calibrated probabilities that a listing is still available.

## Storage and scale

The current graph is small enough for one static request, a map keyed by entity ID, an adjacency index and normalized search strings in browser memory. Search covers names, identifiers and categories. Results render in pages of 60. Build validation rejects broken references and unsupported builds before CI accepts a release. A larger permitted feed can retain the same IDs while partitioning data by kind or moving the same entities, facts and edges to SQLite. No external search or database service is required.
