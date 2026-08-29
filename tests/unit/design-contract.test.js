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

test("the anti-generic design bans remain enforced", () => {
  assert.doesNotMatch(css, /gradient|box-shadow|backdrop-filter/i);
  assert.doesNotMatch(`${css}\n${application}`, /\b(?:Inter|Roboto|Poppins|Montserrat|Nunito|Space Grotesk|Lucide|Feather|Heroicons|Font Awesome|Material Icons)\b/i);
  assert.doesNotMatch(css, /border-radius:\s*(?:[3-9]|\d{2,})px/i);
  const signalBackgrounds = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)]
    .filter(([, , declarations]) =>
      /background(?:-color)?:\s*var\(--sig-/.test(declarations)
    ).map(([, selector]) => selector.trim());
  assert.deepEqual(signalBackgrounds, [".band-p1"]);
});

test("colour literals stay inside the token block", () => {
  const lines = css.split("\n");
  const lastTokenLine = lines.findLastIndex(line =>
    line.includes("--sig-alarm-fill-ink")
  );
  assert.equal(lines.slice(lastTokenLine + 1).some(line =>
    /#[0-9a-f]{3,8}|rgba?\(/i.test(line)
  ), false);
});

test("only the two specified motion declarations exist", () => {
  assert.equal(css.match(/^(?:transition|animation):/gm)?.length, 2);
});
