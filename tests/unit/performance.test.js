import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readdir, stat } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import test from "node:test";
import { gzipSync } from "node:zlib";
import { score } from "../../assets/js/engine/index.js";
import { assessBoard } from "../../assets/js/sim/board.js";
import { projectCohort } from "../../assets/js/sim/cohort.js";

const protocol = JSON.parse(await readFile(new URL(
  "../../assets/data/protocol.v1.json",
  import.meta.url
)));
const cohort = JSON.parse(await readFile(new URL(
  "../../assets/data/cohort.json",
  import.meta.url
)));
const now = Date.parse(cohort.boardStartsAt);

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? filesIn(path) : [path];
  }))).flat();
}

test("deployed source and transfer sizes remain within budget", async () => {
  const assetFiles = await filesIn("assets");
  const deployedFiles = [
    "index.html",
    "sw.js",
    "manifest.webmanifest",
    ...assetFiles
  ];
  const javascriptFiles = assetFiles.filter(path => path.endsWith(".js"));
  const javascriptBytes = (await Promise.all(javascriptFiles.map(path =>
    stat(path)
  ))).reduce((total, file) => total + file.size, 0);
  const transferredBytes = (await Promise.all(deployedFiles.map(async path =>
    gzipSync(await readFile(path), { level: 9 }).length
  ))).reduce((total, size) => total + size, 0);

  assert.ok(transferredBytes <= 120_000);
  assert.ok(javascriptBytes <= 135_000);
  assert.ok((await stat("assets/css/board.css")).size <= 22_000);
});

test("single-patient scoring remains under 10 ms", () => {
  const encounter = projectCohort(cohort, 0)[0];
  for (let count = 0; count < 100; count += 1) {
    score(encounter, protocol, now);
  }
  const startedAt = performance.now();
  for (let count = 0; count < 1_000; count += 1) {
    score(encounter, protocol, now);
  }
  assert.ok((performance.now() - startedAt) / 1_000 < 10);
});

test("a 60-encounter board recomputes under 100 ms", () => {
  const sixty = {
    ...cohort,
    encounters: Array.from({ length: 3 }, (_, copy) =>
      cohort.encounters.map(encounter => ({
        ...encounter,
        encounterId: `${encounter.encounterId}-${copy}`
      }))).flat()
  };
  for (let count = 0; count < 10; count += 1) {
    assessBoard(sixty, protocol, now);
  }
  const startedAt = performance.now();
  for (let count = 0; count < 100; count += 1) {
    assessBoard(sixty, protocol, now);
  }
  assert.ok((performance.now() - startedAt) / 100 < 100);
});
