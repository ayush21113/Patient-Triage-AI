import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const config = JSON.parse(await readFile(new URL(
  "../../vercel.json",
  import.meta.url
)));

function headersFor(source) {
  return Object.fromEntries(config.headers.find(rule =>
    rule.source === source
  ).headers.map(({ key, value }) => [key, value]));
}

test("Vercel config is static-only and matches the required headers", () => {
  assert.equal(config.cleanUrls, true);
  assert.equal("buildCommand" in config, false);
  assert.equal("outputDirectory" in config, false);
  assert.deepEqual(headersFor("/sw.js"), {
    "Cache-Control": "no-cache"
  });
  assert.deepEqual(headersFor("/assets/(.*)"), {
    "Cache-Control": "public, max-age=31536000, immutable"
  });
  assert.deepEqual(headersFor("/(.*)"), {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Strict-Transport-Security": "max-age=63072000"
  });
});
