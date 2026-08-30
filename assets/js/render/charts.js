const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function htmlElement(tagName, attributes = {}) {
  const node = document.createElement(tagName);
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value);
  }
  return node;
}

function svgElement(tagName, attributes = {}) {
  const node = document.createElementNS(SVG_NAMESPACE, tagName);
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value);
  }
  return node;
}

function bandFor(row, overrides = {}) {
  const map = overrides ?? {};
  return map[row?.encounter?.encounter_id]?.band ??
    row?.assessment?.band ?? row?.assessment?.provisionalBand ?? "P5";
}

export function bandDistributionDonut(board = [], overrides = {}) {
  const bands = ["P1", "P2", "P3", "P4", "P5"];
  const counts = Object.fromEntries(bands.map(band => [band, 0]));
  const safeBoard = board ?? [];
  for (const row of safeBoard) {
    const b = bandFor(row, overrides);
    if (counts[b] !== undefined) counts[b] += 1;
    else counts["P5"] += 1;
  }
  const total = safeBoard.length || 1;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const card = htmlElement("section", { class: "donut-card" });
  const svg = svgElement("svg", {
    class: "band-donut",
    viewBox: "0 0 92 92",
    role: "img",
    "aria-label": `Band distribution for ${board.length} waiting patients`
  });
  svg.append(svgElement("circle", {
    class: "donut-ring",
    cx: 46,
    cy: 46,
    r: radius,
    stroke: "var(--border)"
  }));
  for (const band of bands) {
    if (counts[band] === 0) continue;
    const length = counts[band] / total * circumference;
    svg.append(svgElement("circle", {
      class: `donut-ring donut-${band.toLowerCase()}`,
      cx: 46,
      cy: 46,
      r: radius,
      "stroke-dasharray": `${length} ${circumference - length}`,
      "stroke-dashoffset": -offset,
      transform: "rotate(-90 46 46)"
    }));
    offset += length;
  }
  const totalNode = svgElement("text", {
    class: "donut-total",
    x: 46,
    y: 40,
    "text-anchor": "middle",
    "dominant-baseline": "central"
  });
  totalNode.textContent = String(board.length);
  const labelNode = svgElement("text", {
    class: "donut-label",
    x: 46,
    y: 56,
    "text-anchor": "middle",
    "dominant-baseline": "central"
  });
  labelNode.textContent = "WAITING";
  svg.append(totalNode, labelNode);

  const legend = htmlElement("div", { class: "band-donut-legend" });
  for (const band of bands) {
    if (counts[band] === 0) continue;
    const item = htmlElement("div", { class: "legend-item" });
    const swatch = htmlElement("span", {
      class: `legend-swatch donut-${band.toLowerCase()}`
    });
    const pct = Math.round(counts[band] / total * 100);
    const textNode = htmlElement("span", { class: "legend-text" });
    textNode.textContent = `${band}: ${counts[band]} (${pct}%)`;
    item.append(swatch, textNode);
    legend.append(item);
  }
  card.append(svg, legend);
  return card;
}

export function derivationContributionBar(assessment, protocol) {
  const weights = protocol.combination.layerWeights;
  const layers = [
    ["L1 physiology", assessment.derivation.physiology.score * weights.physiology, "l1"],
    ["L2 presentation", assessment.derivation.presentation.score * weights.presentation, "l2"],
    ["L3 hazard", assessment.derivation.hazard.score * weights.hazard, "l3"]
  ];
  const total = layers.reduce((sum, [, value]) => sum + value, 0) || 1;
  const shell = htmlElement("div", { class: "contribution-bar" });
  const track = htmlElement("div", {
    class: "contribution-track",
    role: "img",
    "aria-label": "Weighted contribution to the priority index"
  });
  const legend = htmlElement("div", { class: "contribution-legend" });
  for (const [label, value, key] of layers) {
    const segment = htmlElement("span", {
      class: `contribution-segment contribution-${key}`,
      style: `width: ${(value / total) * 100}%`
    });
    const item = htmlElement("div", { class: "contribution-legend-item" });
    const swatch = htmlElement("span", { class: `legend-swatch contribution-${key}` });
    const text = htmlElement("span", { class: "legend-text" });
    text.textContent = `${label} ${value.toFixed(1)}`;
    item.append(swatch, text);
    track.append(segment);
    legend.append(item);
  }
  shell.append(track, legend);
  return shell;
}

export function confidenceBand(point, interval, bandThresholds) {
  const width = 300;
  const y = 10;
  const x = value => value / 100 * width;
  const svg = svgElement("svg", {
    class: "confidence-band",
    viewBox: `0 0 ${width} 20`,
    role: "img",
    "aria-label": `Priority Index ${point}; interval ${interval[0]} to ${interval[1]}`
  });
  svg.append(svgElement("line", {
    class: "confidence-span",
    x1: x(interval[0]),
    x2: x(interval[1]),
    y1: y,
    y2: y
  }));
  for (const threshold of Object.values(bandThresholds)) {
    svg.append(svgElement("line", {
      class: "band-boundary",
      x1: x(threshold),
      x2: x(threshold),
      y1: 4,
      y2: 16
    }));
  }
  svg.append(svgElement("rect", {
    class: "confidence-marker",
    x: x(point) - 3.5,
    y: y - 3.5,
    width: 7,
    height: 7
  }));
  return svg;
}

export function sparkline(values) {
  if (values.length < 6) return null;
  const points = values.slice(-8);
  const width = 28;
  const height = 14;
  const minimum = Math.min(...points);
  const maximum = Math.max(...points);
  const range = maximum - minimum || 1;
  const coordinates = points.map((value, index) => ({
    x: index / (points.length - 1) * width,
    y: height - (value - minimum) / range * height
  }));
  const svg = svgElement("svg", {
    class: "sparkline",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": `${points.length}-reading trend`
  });
  svg.append(svgElement("polyline", {
    points: coordinates.map(({ x, y }) => `${x},${y}`).join(" ")
  }));
  const terminal = coordinates.at(-1);
  svg.append(svgElement("circle", {
    cx: terminal.x,
    cy: terminal.y,
    r: 2
  }));
  return svg;
}

export function fairnessBars(groups) {
  const width = 800;
  const rowHeight = 32;
  const labelWidth = 180;
  const barWidth = 360;
  const maximum = Math.max(...groups.map(({ value }) => value), 1);
  const svg = svgElement("svg", {
    class: "fairness-bars",
    viewBox: `0 0 ${width} ${groups.length * rowHeight}`,
    role: "img",
    "aria-label": "Subgroup upgrade-rate comparison"
  });
  groups.forEach(({ label, value, worstServed }, index) => {
    const y = index * rowHeight;
    const className = worstServed ? "fairness-worst" : "fairness-bar";
    const labelNode = svgElement("text", {
      class: "fairness-label-text",
      x: 0,
      y: y + 18
    });
    labelNode.textContent = label;
    svg.append(labelNode, svgElement("line", {
      class: "fairness-baseline",
      x1: labelWidth,
      x2: labelWidth + barWidth,
      y1: y + 14,
      y2: y + 14
    }), svgElement("rect", {
      class: className,
      x: labelWidth,
      y: y + 7,
      width: Math.max(value / maximum * barWidth, 2),
      height: 14,
      rx: 3
    }));
    const valueNode = svgElement("text", {
      class: "fairness-value",
      x: labelWidth + (value / maximum * barWidth) + 8,
      y: y + 18
    });
    valueNode.textContent = `${value}%`;
    svg.append(valueNode);
  });
  return svg;
}

export function priorityDistributionBars(groups) {
  const bands = ["P1", "P2", "P3", "P4", "P5"];
  const width = 800;
  const rowHeight = 32;
  const labelWidth = 180;
  const barWidth = 360;
  const svg = svgElement("svg", {
    class: "fairness-bars priority-distribution",
    viewBox: `0 0 ${width} ${groups.length * rowHeight}`,
    role: "img",
    "aria-label": "Assigned priority distribution by subgroup"
  });
  groups.forEach(({ label, distribution, n }, index) => {
    const y = index * rowHeight;
    const labelNode = svgElement("text", {
      class: "fairness-label-text",
      x: 0,
      y: y + 18
    });
    labelNode.textContent = label;
    svg.append(labelNode);
    let x = labelWidth;
    for (const band of bands) {
      const count = distribution[band];
      if (count === 0) continue;
      const segmentWidth = count / n * barWidth;
      const segment = svgElement("rect", {
        class: `priority-segment priority-${band.toLowerCase()}`,
        x,
        y: y + 7,
        width: segmentWidth,
        height: 14,
        rx: 2
      });
      segment.append(svgElement("title"));
      segment.firstChild.textContent = `${band}: ${count}`;
      svg.append(segment);
      x += segmentWidth;
    }
    const valueNode = svgElement("text", {
      class: "fairness-value",
      x: labelWidth + barWidth + 12,
      y: y + 18
    });
    valueNode.textContent = bands.filter(band => distribution[band])
      .map(band => `${band} ${distribution[band]}`).join(" · ");
    svg.append(valueNode);
  });
  return svg;
}
