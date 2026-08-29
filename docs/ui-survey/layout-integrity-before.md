# Layout integrity · BEFORE

## Summary

| Rule | Affected states | Occurrences |
|---|---:|---:|
| text-overlap | 76 | 19233 |
| text-clipped | 74 | 2408 |
| positioned-containment | 38 | 5894 |

## First example per state and rule

| State | Rule | First selector · rect [x,y,w,h] | Second selector · rect |
|---|---|---|---|
| S0-header-NORMAL-1280x800-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S0-header-NORMAL-1280x800-light.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S0-header-NORMAL-1280x800-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S0-header-NORMAL-1280x800-dark.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S0-header-NORMAL-1024x768-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S0-header-NORMAL-1024x768-light.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S0-header-NORMAL-1024x768-light.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S0-header-NORMAL-1024x768-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S0-header-NORMAL-1024x768-dark.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S0-header-NORMAL-1024x768-dark.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S1-queue-NORMAL-1280x800-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S1-queue-NORMAL-1280x800-light.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S1-queue-NORMAL-1280x800-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S1-queue-NORMAL-1280x800-dark.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S1-queue-NORMAL-1024x768-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S1-queue-NORMAL-1024x768-light.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S1-queue-NORMAL-1024x768-light.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S1-queue-NORMAL-1024x768-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S1-queue-NORMAL-1024x768-dark.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S1-queue-NORMAL-1024x768-dark.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S2-inspector-empty-NORMAL-1280x800-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S2-inspector-empty-NORMAL-1280x800-light.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S2-inspector-empty-NORMAL-1280x800-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S2-inspector-empty-NORMAL-1280x800-dark.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S2-inspector-empty-NORMAL-1024x768-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S2-inspector-empty-NORMAL-1024x768-light.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S2-inspector-empty-NORMAL-1024x768-light.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S2-inspector-empty-NORMAL-1024x768-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S2-inspector-empty-NORMAL-1024x768-dark.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S2-inspector-empty-NORMAL-1024x768-dark.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S2-inspector-pt0004-NORMAL-1280x800-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S2-inspector-pt0004-NORMAL-1280x800-light.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S2-inspector-pt0004-NORMAL-1280x800-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S2-inspector-pt0004-NORMAL-1280x800-dark.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S2-inspector-pt0004-NORMAL-1024x768-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S2-inspector-pt0004-NORMAL-1024x768-light.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S2-inspector-pt0004-NORMAL-1024x768-light.png | positioned-containment | span.band-chip.band-p2 · [1, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S2-inspector-pt0004-NORMAL-1024x768-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S2-inspector-pt0004-NORMAL-1024x768-dark.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S2-inspector-pt0004-NORMAL-1024x768-dark.png | positioned-containment | span.band-chip.band-p2 · [1, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S2-inspector-pt0007-abstaining-NORMAL-1280x800-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S2-inspector-pt0007-abstaining-NORMAL-1280x800-light.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S2-inspector-pt0007-abstaining-NORMAL-1280x800-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S2-inspector-pt0007-abstaining-NORMAL-1280x800-dark.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S2-inspector-pt0007-abstaining-NORMAL-1024x768-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S2-inspector-pt0007-abstaining-NORMAL-1024x768-light.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S2-inspector-pt0007-abstaining-NORMAL-1024x768-light.png | positioned-containment | span.band-chip.band-p2 · [1, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S2-inspector-pt0007-abstaining-NORMAL-1024x768-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S2-inspector-pt0007-abstaining-NORMAL-1024x768-dark.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S2-inspector-pt0007-abstaining-NORMAL-1024x768-dark.png | positioned-containment | span.band-chip.band-p2 · [1, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S3-arrival-capture-NORMAL-1280x800-light.png | text-overlap | button · [1158.2, 8, 112.8, 44] | button · [1180.5, 35, 53.7, 44] |
| S3-arrival-capture-NORMAL-1280x800-light.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S3-arrival-capture-NORMAL-1280x800-dark.png | text-overlap | button · [1158.2, 8, 112.8, 44] | button · [1180.5, 35, 53.7, 44] |
| S3-arrival-capture-NORMAL-1280x800-dark.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S3-arrival-capture-NORMAL-1024x768-light.png | text-overlap | button · [902.2, 8, 112.8, 44] | button · [924.5, 35, 53.7, 44] |
| S3-arrival-capture-NORMAL-1024x768-light.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S3-arrival-capture-NORMAL-1024x768-light.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S3-arrival-capture-NORMAL-1024x768-dark.png | text-overlap | button · [902.2, 8, 112.8, 44] | button · [924.5, 35, 53.7, 44] |
| S3-arrival-capture-NORMAL-1024x768-dark.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S3-arrival-capture-NORMAL-1024x768-dark.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S4-reassessment-NORMAL-1280x800-light.png | text-overlap | button · [1158.2, 8, 112.8, 44] | button · [1180.5, 35, 53.7, 44] |
| S4-reassessment-NORMAL-1280x800-light.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S4-reassessment-NORMAL-1280x800-dark.png | text-overlap | button · [1158.2, 8, 112.8, 44] | button · [1180.5, 35, 53.7, 44] |
| S4-reassessment-NORMAL-1280x800-dark.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S4-reassessment-NORMAL-1024x768-light.png | text-overlap | button · [902.2, 8, 112.8, 44] | button · [924.5, 35, 53.7, 44] |
| S4-reassessment-NORMAL-1024x768-light.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S4-reassessment-NORMAL-1024x768-light.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S4-reassessment-NORMAL-1024x768-dark.png | text-overlap | button · [902.2, 8, 112.8, 44] | button · [924.5, 35, 53.7, 44] |
| S4-reassessment-NORMAL-1024x768-dark.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S4-reassessment-NORMAL-1024x768-dark.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S5-audit-drawer-NORMAL-1280x800-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S5-audit-drawer-NORMAL-1280x800-light.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · [913, 400, 174.3, 160] |
| S5-audit-drawer-NORMAL-1280x800-light.png | positioned-containment | pre · [913.4, 660, 174.3, 160] | #audit-drawer · [913, 400, 174.3, 160] |
| S5-audit-drawer-NORMAL-1280x800-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S5-audit-drawer-NORMAL-1280x800-dark.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · [913, 400, 174.3, 160] |
| S5-audit-drawer-NORMAL-1280x800-dark.png | positioned-containment | pre · [913.4, 660, 174.3, 160] | #audit-drawer · [913, 400, 174.3, 160] |
| S5-audit-drawer-NORMAL-1024x768-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S5-audit-drawer-NORMAL-1024x768-light.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S5-audit-drawer-NORMAL-1024x768-light.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S5-audit-drawer-NORMAL-1024x768-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S5-audit-drawer-NORMAL-1024x768-dark.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S5-audit-drawer-NORMAL-1024x768-dark.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S6-fairness-NORMAL-1280x800-light.png | text-overlap | text.fairness-value:nth-of-type(2) · [299.4, 273.2, 155.1, 14] | text:nth-of-type(1) · [429.2, 273.2, 96.5, 14] |
| S6-fairness-NORMAL-1280x800-dark.png | text-overlap | text.fairness-value:nth-of-type(2) · [299.4, 273.2, 155.1, 14] | text:nth-of-type(1) · [429.2, 273.2, 96.5, 14] |
| S6-fairness-NORMAL-1024x768-light.png | text-overlap | text.fairness-value:nth-of-type(2) · [239.7, 273.4, 122.1, 10] | text:nth-of-type(1) · [344.7, 273.4, 76, 10] |
| S6-fairness-NORMAL-1024x768-light.png | text-clipped | footer.colophon · [0, 746, 1024, 22] | — · — |
| S6-fairness-NORMAL-1024x768-dark.png | text-overlap | text.fairness-value:nth-of-type(2) · [239.7, 273.4, 122.1, 10] | text:nth-of-type(1) · [344.7, 273.4, 76, 10] |
| S6-fairness-NORMAL-1024x768-dark.png | text-clipped | footer.colophon · [0, 746, 1024, 22] | — · — |
| S7-surge-banner-SURGE-1280x800-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 194, 22.7, 14] |
| S7-surge-banner-SURGE-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S7-surge-banner-SURGE-1280x800-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 194, 22.7, 14] |
| S7-surge-banner-SURGE-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S7-surge-banner-SURGE-1024x768-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 194, 22.7, 14] |
| S7-surge-banner-SURGE-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S7-surge-banner-SURGE-1024x768-light.png | positioned-containment | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 790.9, 54, 12] | #board-region · [0, 130, 1024, 12] |
| S7-surge-banner-SURGE-1024x768-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 194, 22.7, 14] |
| S7-surge-banner-SURGE-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S7-surge-banner-SURGE-1024x768-dark.png | positioned-containment | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 821.9, 54, 12] | #board-region · [0, 130, 1024, 12] |
| S8-emergency-alert-NORMAL-1280x800-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S8-emergency-alert-NORMAL-1280x800-light.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S8-emergency-alert-NORMAL-1280x800-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S8-emergency-alert-NORMAL-1280x800-dark.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S8-emergency-alert-NORMAL-1024x768-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S8-emergency-alert-NORMAL-1024x768-light.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S8-emergency-alert-NORMAL-1024x768-light.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S8-emergency-alert-NORMAL-1024x768-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S8-emergency-alert-NORMAL-1024x768-dark.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S8-emergency-alert-NORMAL-1024x768-dark.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S9-sim-console-NORMAL-1280x800-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S9-sim-console-NORMAL-1280x800-light.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S9-sim-console-NORMAL-1280x800-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 168, 22.7, 14] |
| S9-sim-console-NORMAL-1280x800-dark.png | text-clipped | #unobtainable-note · [328, 141, 40, 12] | — · — |
| S9-sim-console-NORMAL-1024x768-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S9-sim-console-NORMAL-1024x768-light.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S9-sim-console-NORMAL-1024x768-light.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S9-sim-console-NORMAL-1024x768-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 174, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 168, 22.7, 14] |
| S9-sim-console-NORMAL-1024x768-dark.png | text-clipped | #unobtainable-note · [559, 141, 40, 12] | — · [0, 104, 84, 52] |
| S9-sim-console-NORMAL-1024x768-dark.png | positioned-containment | span.band-chip.band-p2 · [0, 687, 54, 26] | #board-region · [0, 104, 84, 52] |
| S1-queue-SURGE-1280x800-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 194, 22.7, 14] |
| S1-queue-SURGE-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-SURGE-1280x800-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 194, 22.7, 14] |
| S1-queue-SURGE-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-SURGE-1024x768-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 194, 22.7, 14] |
| S1-queue-SURGE-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S1-queue-SURGE-1024x768-light.png | positioned-containment | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 821.8, 54, 12] | #board-region · [0, 130, 1024, 12] |
| S1-queue-SURGE-1024x768-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 194, 22.7, 14] |
| S1-queue-SURGE-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S1-queue-SURGE-1024x768-dark.png | positioned-containment | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 790.9, 54, 12] | #board-region · [0, 130, 1024, 12] |
| S2-inspector-empty-SURGE-1280x800-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 194, 22.7, 14] |
| S2-inspector-empty-SURGE-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-1280x800-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [437, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [464, 194, 22.7, 14] |
| S2-inspector-empty-SURGE-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-1024x768-light.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 194, 22.7, 14] |
| S2-inspector-empty-SURGE-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S2-inspector-empty-SURGE-1024x768-light.png | positioned-containment | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 821.9, 54, 12] | #board-region · [0, 130, 1024, 12] |
| S2-inspector-empty-SURGE-1024x768-dark.png | text-overlap | span.vital-unit:nth-of-type(3) · [668, 200, 33.2, 14] | span.vital-value:nth-of-type(2) · [695, 194, 22.7, 14] |
| S2-inspector-empty-SURGE-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S2-inspector-empty-SURGE-1024x768-dark.png | positioned-containment | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 821.8, 54, 12] | #board-region · [0, 130, 1024, 12] |
| S1-queue-DEGRADED-1280x800-light.png | text-overlap | td.id-cell.numeric:nth-of-type(2) · [54, 700, 84, 52] | span · [14, 750, 6, 52] |
| S1-queue-DEGRADED-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-DEGRADED-1280x800-dark.png | text-overlap | td.id-cell.numeric:nth-of-type(2) · [54, 700, 84, 52] | span · [14, 750, 6, 52] |
| S1-queue-DEGRADED-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-DEGRADED-1024x768-light.png | text-overlap | span.abstention-mark:nth-of-type(1) · [7.1, 507, 22.8, 22] | #inspector-heading · [20, 494.2, 1, 12] |
| S1-queue-DEGRADED-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 14, 12] |
| S1-queue-DEGRADED-1024x768-light.png | positioned-containment | span.abstention-mark:nth-of-type(1) · [7.1, 715, 22.8, 22] | #board-region · [0, 130, 14, 12] |
| S1-queue-DEGRADED-1024x768-dark.png | text-overlap | span.abstention-mark:nth-of-type(1) · [7.1, 507, 22.8, 22] | #inspector-heading · [20, 494.2, 1, 12] |
| S1-queue-DEGRADED-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 14, 12] |
| S1-queue-DEGRADED-1024x768-dark.png | positioned-containment | span.abstention-mark:nth-of-type(1) · [7.1, 715, 22.8, 22] | #board-region · [0, 130, 14, 12] |
| S2-inspector-empty-DEGRADED-1280x800-light.png | text-overlap | td.id-cell.numeric:nth-of-type(2) · [54, 700, 84, 52] | span · [14, 750, 6, 52] |
| S2-inspector-empty-DEGRADED-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-DEGRADED-1280x800-dark.png | text-overlap | td.id-cell.numeric:nth-of-type(2) · [54, 700, 84, 52] | span · [14, 750, 6, 52] |
| S2-inspector-empty-DEGRADED-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-DEGRADED-1024x768-light.png | text-overlap | span.abstention-mark:nth-of-type(1) · [7.1, 507, 22.8, 22] | #inspector-heading · [20, 494.2, 1, 12] |
| S2-inspector-empty-DEGRADED-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 14, 12] |
| S2-inspector-empty-DEGRADED-1024x768-light.png | positioned-containment | span.abstention-mark:nth-of-type(1) · [7.1, 715, 22.8, 22] | #board-region · [0, 130, 14, 12] |
| S2-inspector-empty-DEGRADED-1024x768-dark.png | text-overlap | span.abstention-mark:nth-of-type(1) · [7.1, 507, 22.8, 22] | #inspector-heading · [20, 494.2, 1, 12] |
| S2-inspector-empty-DEGRADED-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 14, 12] |
| S2-inspector-empty-DEGRADED-1024x768-dark.png | positioned-containment | span.abstention-mark:nth-of-type(1) · [7.1, 715, 22.8, 22] | #board-region · [0, 130, 14, 12] |
| S1-queue-SURGE-DEGRADED-1280x800-light.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 553.1, 54, 12] | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 555.8, 54, 12] |
| S1-queue-SURGE-DEGRADED-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-SURGE-DEGRADED-1280x800-dark.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 552.9, 54, 12] | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 555.7, 54, 12] |
| S1-queue-SURGE-DEGRADED-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S1-queue-SURGE-DEGRADED-1024x768-light.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 487.4, 54, 12] | #inspector-heading · [20, 494.2, 984, 12] |
| S1-queue-SURGE-DEGRADED-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S1-queue-SURGE-DEGRADED-1024x768-light.png | positioned-containment | span.collapsed-band.band-text-p3:nth-of-type(1) · [9, 735.9, 54, 12] | #board-region · [0, 130, 1024, 12] |
| S1-queue-SURGE-DEGRADED-1024x768-dark.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 552.8, 54, 12] | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 555.6, 54, 12] |
| S1-queue-SURGE-DEGRADED-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S1-queue-SURGE-DEGRADED-1024x768-dark.png | positioned-containment | span.collapsed-band.band-text-p3:nth-of-type(1) · [9, 721.6, 54, 12] | #board-region · [0, 130, 1024, 12] |
| S2-inspector-empty-SURGE-DEGRADED-1280x800-light.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 548.9, 54, 12] | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 544, 84, 12] |
| S2-inspector-empty-SURGE-DEGRADED-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-DEGRADED-1280x800-dark.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 552.9, 54, 12] | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 555.7, 54, 12] |
| S2-inspector-empty-SURGE-DEGRADED-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S2-inspector-empty-SURGE-DEGRADED-1024x768-light.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 470.9, 54, 12] | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 464, 84, 12] |
| S2-inspector-empty-SURGE-DEGRADED-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S2-inspector-empty-SURGE-DEGRADED-1024x768-light.png | positioned-containment | span.collapsed-band.band-text-p3:nth-of-type(1) · [9, 711.5, 54, 12] | #board-region · [0, 130, 1024, 12] |
| S2-inspector-empty-SURGE-DEGRADED-1024x768-dark.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 487.4, 54, 12] | #inspector-heading · [20, 494.2, 984, 12] |
| S2-inspector-empty-SURGE-DEGRADED-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S2-inspector-empty-SURGE-DEGRADED-1024x768-dark.png | positioned-containment | span.collapsed-band.band-text-p3:nth-of-type(1) · [9, 735.8, 54, 12] | #board-region · [0, 130, 1024, 12] |
| S7-surge-banner-SURGE-DEGRADED-1280x800-light.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 536.7, 54, 12] | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 544, 84, 12] |
| S7-surge-banner-SURGE-DEGRADED-1280x800-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S7-surge-banner-SURGE-DEGRADED-1280x800-dark.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 535.9, 54, 12] | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 544, 84, 12] |
| S7-surge-banner-SURGE-DEGRADED-1280x800-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · — |
| S7-surge-banner-SURGE-DEGRADED-1024x768-light.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 487.3, 54, 12] | #inspector-heading · [20, 494.2, 984, 12] |
| S7-surge-banner-SURGE-DEGRADED-1024x768-light.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S7-surge-banner-SURGE-DEGRADED-1024x768-light.png | positioned-containment | span.collapsed-band.band-text-p3:nth-of-type(1) · [9, 735.6, 54, 12] | #board-region · [0, 130, 1024, 12] |
| S7-surge-banner-SURGE-DEGRADED-1024x768-dark.png | text-overlap | span.collapsed-band.band-text-p2:nth-of-type(1) · [9, 487.3, 54, 12] | #inspector-heading · [20, 494.2, 984, 12] |
| S7-surge-banner-SURGE-DEGRADED-1024x768-dark.png | text-clipped | #queue-announcer · [0, 143, 1, 1] | — · [0, 130, 1024, 12] |
| S7-surge-banner-SURGE-DEGRADED-1024x768-dark.png | positioned-containment | span.collapsed-band.band-text-p3:nth-of-type(1) · [9, 757.3, 54, 12] | #board-region · [0, 130, 1024, 12] |
