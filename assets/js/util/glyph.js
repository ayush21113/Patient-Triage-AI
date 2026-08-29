// Confidence marks are drawn, not typed.
//
// IBM Plex contains none of U+25CF U+25D1 U+25D0 U+25CB, so a text glyph here
// resolves to whatever the device happens to substitute — on Windows the
// half-filled circles render as unrelated characters. The mark is one of the
// three carriers of confidence (UIUX 3.2), and a carrier that changes shape
// per device is not a carrier. These are 1em inline SVG in currentColor and
// render identically everywhere.

const NS = "http://www.w3.org/2000/svg";

// fill fraction of the disc, left to right: 1 = full, 0.5 = half, 0 = empty
const FILL = {
  ESTABLISHED: 1,
  PROBABLE: 0.5,
  UNRESOLVED: 0.5,
  UNRESOLVABLE: 0.5,
  INSUFFICIENT: 0
};

export function confidenceMark(confidence) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 12 12");
  svg.setAttribute("class", "glyph");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  const ring = document.createElementNS(NS, "circle");
  ring.setAttribute("cx", "6");
  ring.setAttribute("cy", "6");
  ring.setAttribute("r", "4.5");
  ring.setAttribute("fill", "none");
  ring.setAttribute("stroke", "currentColor");
  svg.append(ring);

  const fill = FILL[confidence] ?? 0;
  if (fill === 1) {
    const disc = document.createElementNS(NS, "circle");
    disc.setAttribute("cx", "6");
    disc.setAttribute("cy", "6");
    disc.setAttribute("r", "4.5");
    disc.setAttribute("fill", "currentColor");
    svg.append(disc);
  } else if (fill > 0) {
    // PROBABLE fills the right half, UNRESOLVED the left, so the two states
    // are distinguishable at a glance and not only by their text token
    const right = confidence === "PROBABLE";
    const half = document.createElementNS(NS, "path");
    half.setAttribute("d", right
      ? "M6 1.5 A4.5 4.5 0 0 1 6 10.5 Z"
      : "M6 1.5 A4.5 4.5 0 0 0 6 10.5 Z");
    half.setAttribute("fill", "currentColor");
    svg.append(half);
  }
  return svg;
}
