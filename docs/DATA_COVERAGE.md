# Database coverage

Snapshot retrieved through 2026-11-10T16:27:05.573Z. All percentages below use the complete committed normalized graph. The second column includes both endpoints of a qualifying claim. The third column limits the denominator to all imported items. Demo fixtures are excluded.

| Kind | Records |
| --- | ---: |
| build | 3 |
| class | 4 |
| currency | 1 |
| item | 458 |
| map | 279 |
| monster | 62 |
| npc | 188 |
| patch | 1 |
| profession | 6 |
| quest | 276 |
| recipe | 2 |
| shop | 30 |
| skill | 78 |
| system | 1 |

Total: 1389 entities and 4043 relationship claims.

| Coverage | All entities | All items |
| --- | ---: | ---: |
| Approved original game image | 0 / 1389 (0.00%) | 0 / 458 (0.00%) |
| Drop relationship | 69 / 1389 (4.97%) | 49 / 458 (10.70%) |
| Numerical drop rate | 69 / 1389 (4.97%) | 49 / 458 (10.70%) |
| NPC sale price | 5 / 1389 (0.36%) | 4 / 458 (0.87%) |
| Quest relationship | 435 / 1389 (31.32%) | 4 / 458 (0.87%) |
| Authorized market history | 0 / 1389 (0.00%) | 0 / 458 (0.00%) |

## Quality checks

Blocking integrity errors: 0. Records without approved game imagery: 1389. Quests with no imported prerequisite, material or kill requirement: 100. These gaps remain unknown. The report counts known requirements and does not certify that a quest has every requirement.

Staleness uses a 90-day review threshold on source update timestamps. Re-run npm run data:check for the current count. Source-file modification dates measure snapshot age where individual observation dates are unavailable.

Run npm run data:report after import to regenerate this document.
