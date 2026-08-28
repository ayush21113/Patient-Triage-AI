const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function svgElement(tagName, attributes = {}) {
  const node = document.createElementNS(SVG_NAMESPACE, tagName);
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value);
  }
  return node;
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
  const width = 300;
  const rowHeight = 25;
  const labelWidth = 112;
  const barWidth = 140;
  const maximum = Math.max(...groups.map(({ value }) => value), 1);
  const svg = svgElement("svg", {
    class: "fairness-bars",
    viewBox: `0 0 ${width} ${groups.length * rowHeight}`,
    role: "img",
    "aria-label": "Subgroup upgrade-rate comparison"
  });
  groups.forEach(({ label, value, worstServed }, index) => {
    const y = index * rowHeight + 5;
    const className = worstServed ? "fairness-worst" : "fairness-bar";
    const labelNode = svgElement("text", { x: 0, y: y + 9 });
    labelNode.textContent = label;
    svg.append(labelNode, svgElement("line", {
      class: "fairness-baseline",
      x1: labelWidth,
      x2: labelWidth + barWidth,
      y1: y + 5,
      y2: y + 5
    }), svgElement("rect", {
      class: className,
      x: labelWidth,
      y,
      width: value / maximum * barWidth,
      height: 10
    }));
    const valueNode = svgElement("text", {
      class: "fairness-value",
      x: labelWidth + value / maximum * barWidth + 4,
      y: y + 9
    });
    valueNode.textContent = `${value}%`;
    svg.append(valueNode);
  });
  return svg;
}

export function priorityDistributionBars(groups) {
  const bands = ["P1", "P2", "P3", "P4", "P5"];
  const width = 420;
  const rowHeight = 25;
  const labelWidth = 112;
  const barWidth = 180;
  const svg = svgElement("svg", {
    class: "fairness-bars priority-distribution",
    viewBox: `0 0 ${width} ${groups.length * rowHeight}`,
    role: "img",
    "aria-label": "Assigned priority distribution by subgroup"
  });
  groups.forEach(({ label, distribution, n }, index) => {
    const y = index * rowHeight + 5;
    const labelNode = svgElement("text", { x: 0, y: y + 9 });
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
        y,
        width: segmentWidth,
        height: 10
      });
      segment.append(svgElement("title"));
      segment.firstChild.textContent = `${band}: ${count}`;
      svg.append(segment);
      x += segmentWidth;
    }
    const valueNode = svgElement("text", {
      class: "fairness-value",
      x: labelWidth + barWidth + 5,
      y: y + 9
    });
    valueNode.textContent = bands.filter(band => distribution[band])
      .map(band => `${band} ${distribution[band]}`).join(" · ");
    svg.append(valueNode);
  });
  return svg;
}
