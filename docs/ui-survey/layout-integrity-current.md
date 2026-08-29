# Layout integrity · CURRENT

## Summary

| Rule | Affected states | Occurrences |
|---|---:|---:|
| text-clipped | 62 | 412 |
| text-overlap | 4 | 360 |

## By first selector

| Rule | First selector | Affected states | Occurrences |
|---|---|---:|---:|
| text-overlap | pre | 4 | 360 |
| text-clipped | span.wait-token:nth-of-type(2) | 60 | 288 |
| text-clipped | td.age-sex-cell.numeric:nth-of-type(3) | 60 | 60 |
| text-clipped | footer.colophon | 32 | 32 |
| text-clipped | #queue-announcer | 32 | 32 |

## First example per state and rule

| State | Rule | First selector · rect [x,y,w,h] | Second selector · rect |
|---|---|---|---|
| S0-header-NORMAL-1280x800-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S0-header-NORMAL-1280x800-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S0-header-NORMAL-1024x768-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S0-header-NORMAL-1024x768-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S1-queue-NORMAL-1280x800-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S1-queue-NORMAL-1280x800-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S1-queue-NORMAL-1024x768-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S1-queue-NORMAL-1024x768-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S2-inspector-empty-NORMAL-1280x800-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S2-inspector-empty-NORMAL-1280x800-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S2-inspector-empty-NORMAL-1024x768-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S2-inspector-empty-NORMAL-1024x768-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S2-inspector-pt0004-NORMAL-1280x800-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [139, 154, 62, 52] | — · — |
| S2-inspector-pt0004-NORMAL-1280x800-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [139, 154, 62, 52] | — · — |
| S2-inspector-pt0004-NORMAL-1024x768-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [139, 154, 62, 52] | — · — |
| S2-inspector-pt0004-NORMAL-1024x768-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [139, 154, 62, 52] | — · — |
| S2-inspector-pt0007-abstaining-NORMAL-1280x800-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [139, 154, 62, 52] | — · — |
| S2-inspector-pt0007-abstaining-NORMAL-1280x800-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [139, 154, 62, 52] | — · — |
| S2-inspector-pt0007-abstaining-NORMAL-1024x768-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [139, 154, 62, 52] | — · — |
| S2-inspector-pt0007-abstaining-NORMAL-1024x768-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [139, 154, 62, 52] | — · — |
| S5-audit-drawer-NORMAL-1280x800-light.png | text-overlap | pre · [913.4, 530, 174.3, 160] | summary · [913.4, 534, 174.3, 19] |
| S5-audit-drawer-NORMAL-1280x800-dark.png | text-overlap | pre · [913.4, 530, 174.3, 160] | summary · [913.4, 534, 174.3, 19] |
| S5-audit-drawer-NORMAL-1024x768-light.png | text-overlap | pre · [730.5, 514, 137.7, 160] | summary · [730.5, 518, 137.7, 19] |
| S5-audit-drawer-NORMAL-1024x768-dark.png | text-overlap | pre · [730.5, 514, 137.7, 160] | summary · [730.5, 518, 137.7, 19] |
| S6-fairness-NORMAL-1024x768-light.png | text-clipped | footer.colophon · [0, 746, 1024, 22] | — · — |
| S6-fairness-NORMAL-1024x768-dark.png | text-clipped | footer.colophon · [0, 746, 1024, 22] | — · — |
| S7-surge-banner-SURGE-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S7-surge-banner-SURGE-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S7-surge-banner-SURGE-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S7-surge-banner-SURGE-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S8-emergency-alert-NORMAL-1280x800-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S8-emergency-alert-NORMAL-1280x800-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S8-emergency-alert-NORMAL-1024x768-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S8-emergency-alert-NORMAL-1024x768-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S9-sim-console-NORMAL-1280x800-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S9-sim-console-NORMAL-1280x800-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S9-sim-console-NORMAL-1024x768-light.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S9-sim-console-NORMAL-1024x768-dark.png | text-clipped | td.age-sex-cell.numeric:nth-of-type(3) · [138, 154, 62, 52] | — · — |
| S1-queue-SURGE-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-SURGE-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-SURGE-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-SURGE-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-DEGRADED-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-DEGRADED-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-DEGRADED-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-DEGRADED-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-DEGRADED-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-DEGRADED-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-DEGRADED-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-DEGRADED-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-SURGE-DEGRADED-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-SURGE-DEGRADED-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-SURGE-DEGRADED-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-SURGE-DEGRADED-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-DEGRADED-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-DEGRADED-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-DEGRADED-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-DEGRADED-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S7-surge-banner-SURGE-DEGRADED-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S7-surge-banner-SURGE-DEGRADED-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S7-surge-banner-SURGE-DEGRADED-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S7-surge-banner-SURGE-DEGRADED-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
