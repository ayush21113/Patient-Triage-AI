import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? filesBelow(path) : [path];
  }))).flat();
}

test("precache covers the complete application asset surface", async () => {
  const source = await readFile(new URL("../../sw.js", import.meta.url), "utf8");
  const manifest = JSON.parse(source.match(
    /const PRECACHE = (\[[\s\S]*?\]);/
  )[1]);
  const assetRoot = new URL("../../assets", import.meta.url);
  const deployedAssets = (await filesBelow(fileURLToPath(assetRoot)))
    .map(path => `./assets/${path.replaceAll("\\", "/").split("/assets/")[1]}`)
    .sort();
  assert.deepEqual(
    manifest.filter(path => path.startsWith("./assets/")).sort(),
    deployedAssets
  );
  assert.ok(manifest.includes("./"));
  assert.ok(manifest.includes("./index.html"));
  assert.ok(manifest.includes("./manifest.webmanifest"));
  for (const path of manifest.filter(path => path !== "./")) {
    await access(new URL(`../../${path.slice(2)}`, import.meta.url));
  }
});

test("manifest is a standalone landscape tablet installation", async () => {
  const manifest = JSON.parse(await readFile(new URL(
    "../../manifest.webmanifest",
    import.meta.url
  )));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.orientation, "landscape");
  assert.equal(manifest.theme_color, "#F2F0EA");
  assert.ok(manifest.icons.some(icon =>
    icon.purpose.split(" ").includes("maskable")
  ));
  await access(new URL(`../../${manifest.icons[0].src}`, import.meta.url));
});

test("service worker is versioned, cache-first and cleans old caches", async () => {
  const source = await readFile(new URL("../../sw.js", import.meta.url), "utf8");
  assert.match(source, /patienttriage-v\d+/);
  assert.match(source, /cached \?\? fetch\(event\.request\)/);
  assert.match(source, /name !== CACHE_NAME/);
  assert.match(source, /caches\.delete/);
  assert.match(source, /new Request\(path, \{ cache: "reload" \}\)/);
});
