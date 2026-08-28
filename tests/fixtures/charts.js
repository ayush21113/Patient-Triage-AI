import {
  confidenceBand,
  fairnessBars,
  sparkline
} from "/assets/js/render/charts.js";

const protocol = await fetch("/assets/data/protocol.v1.json")
  .then(response => response.json());
const root = document.querySelector("#charts");
root.append(
  confidenceBand(63.4, [55.1, 71.7], protocol.bandThresholds),
  sparkline([120, 122, 124, 127, 129, 132]),
  sparkline([96, 96, 95, 95, 94, 94, 93, 92]),
  fairnessBars([
    { label: "Women 45–65", value: 2.3, worstServed: true },
    { label: "Board rate", value: 1, worstServed: false }
  ])
);
