import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile("assets/css/board.css", "utf8");
const application = [
  await readFile("index.html", "utf8"),
  ...await Promise.all((await readFile("sw.js", "utf8"))
    .match(/"\.\/assets\/js\/[^"]+"/g)
    .map(path => readFile(path.slice(3, -1), "utf8")))
].join("\n");

test("the redesigned dashboard contract remains enforced", () => {
  assert.doesNotMatch(
    `${css}\n${application}`,
    /\b(?:Inter|Roboto|Poppins|Montserrat|Nunito|Space Grotesk|Lucide|Feather|Heroicons|Font Awesome|Material Icons)\b/i
  );
  assert.doesNotMatch(`${css}\n${application}`, /\b(?:avatar|patient-photo|patient-image|portrait)\b/i);
  assert.doesNotMatch(css, /\b(?:purple|violet|indigo)\b/i);
  assert.doesNotMatch(css, /#(?:a100ff|7400c0|6d28d9|7c3aed|8b5cf6|9333ea|a855f7)\b/i);
  assert.doesNotMatch(css, /background(?:-image)?:\s*[^;]*gradient/i);
  assert.doesNotMatch(`${css}\n${application}`, /(?:twemoji|emoji-mart|noto color emoji)/i);
});

test("only the two redesigned shadow values are used", () => {
  assert.deepEqual(
    [...css.matchAll(/--shadow-[\w-]+:/g)].map(match => match[0].slice(0, -1)),
    ["--shadow-sm", "--shadow-md"]
  );
  assert.equal(
    [...css.matchAll(/box-shadow:\s*([^;]+);/g)].every(([, value]) =>
      /^var\(--shadow-(?:sm|md)\)$/.test(value.trim())
    ),
    true
  );
});

test("radii come only from the four dashboard radius tokens", () => {
  const allowed = /^var\(--r-(?:sm|md|lg|badge)\)$/;
  assert.equal(
    [...css.matchAll(/border-radius:\s*([^;]+);/g)].every(([, value]) =>
      allowed.test(value.trim())
    ),
    true
  );
});

test("P1 remains the only filled band chip", () => {
  const filledBandSelectors = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)]
    .filter(([, selector, declarations]) =>
      /\.band-p\d/.test(selector) &&
      /background:\s*var\(--p\d\)/.test(declarations)
    ).map(([, selector]) => selector.trim());
  assert.deepEqual(filledBandSelectors, [".band-p1"]);
});

test("only the two specified motion declarations exist", () => {
  assert.equal(css.match(/^\s*(?:transition|animation):/gm)?.length, 2);
});
