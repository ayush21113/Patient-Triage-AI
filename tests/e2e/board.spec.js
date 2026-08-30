import { readFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const axeSource = await readFile(fileURLToPath(
  new URL("../node_modules/axe-core/axe.min.js", import.meta.url)
), "utf8");

async function tabTo(page, locator) {
  for (let count = 0; count < 100; count += 1) {
    await page.keyboard.press("Tab");
    if (await locator.evaluate(node => node === document.activeElement)) return;
  }
  throw new Error("Keyboard focus did not reach the requested control");
}

async function axeViolations(page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => (await axe.run()).violations);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#queue-body tr")).toHaveCount(20);
});

test("captures normal-mode audit evidence before degraded mode", async ({ page }) => {
  const evidence = fileURLToPath(new URL("./.playwright/", import.meta.url));
  await mkdir(evidence, { recursive: true });
  for (const [width, height] of [[1280, 800], [1024, 768]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator("#queue-body tr")).toHaveCount(20);
    await page.screenshot({
      path: `${evidence}ui-rework-normal-${width}x${height}.png`
    });
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole("button", { name: "Lose monitors" }).click();
  await page.screenshot({ path: `${evidence}ui-rework-degraded-1280x800.png` });
});

test("the 1024 drawer cannot obscure visible queue rows", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  const intersections = await page.locator("#queue-body tr").evaluateAll(rows => {
    const rail = document.querySelector(".queue-rail").getBoundingClientRect();
    const blockers = ["#inspector", ".simulation-console", ".colophon"]
      .map(selector => document.querySelector(selector).getBoundingClientRect());
    return rows.filter(row => {
      const box = row.getBoundingClientRect();
      const top = Math.max(box.top, rail.top);
      const bottom = Math.min(box.bottom, rail.bottom);
      return bottom > top && blockers.some(blocker =>
        top < blocker.bottom && bottom > blocker.top
      );
    }).map(row => row.dataset.encounterId);
  });
  expect(intersections).toEqual([]);
});

test("queue text stays inside its two-line row without overlap", async ({ page }) => {
  const defects = await page.locator("#queue-body tr:not(.row-collapsed)")
    .evaluateAll(rows => rows.flatMap(row => {
      const cell = row.querySelector(".complaint-cell").getBoundingClientRect();
      const complaint = row.querySelector(".complaint-text")
        .getBoundingClientRect();
      const detailNode = row.querySelector(".row-detail");
      const detail = detailNode.getBoundingClientRect();
      const problems = [];
      if (!detailNode.hidden && complaint.bottom > detail.top + 0.5) {
        problems.push("complaint overlaps meta");
      }
      if (complaint.left < cell.left || complaint.right > cell.right + 0.5 ||
          (!detailNode.hidden && (detail.left < cell.left ||
            detail.right > cell.right + 0.5))) {
        problems.push("complaint content leaves column");
      }
      if ([...row.querySelectorAll("*")].some(node =>
        getComputedStyle(node).position === "absolute")) {
        problems.push("absolute positioning in queue row");
      }
      return problems.map(problem => `${row.dataset.encounterId}: ${problem}`);
    }));
  expect(defects).toEqual([]);
});

test("confidence and provisional-band tokens are fully readable", async ({ page }) => {
  const clipped = await page.locator(".confidence-cell").evaluateAll(cells =>
    cells.filter(cell => cell.scrollWidth > cell.clientWidth).map(cell =>
      `${cell.parentElement.dataset.encounterId}: ${cell.textContent}`
    )
  );
  expect(clipped).toEqual([]);
  const provisional = page.locator(".band-abstaining").first();
  await expect(provisional).toContainText(/⊘\s*P[1-5]/);
  expect(await provisional.locator(".provisional-band").evaluate(node =>
    Number.parseFloat(getComputedStyle(node).fontSize)
  )).toBeGreaterThanOrEqual(10);
});

test("degraded mode stays ordered and concise", async ({ page }) => {
  await page.getByRole("button", { name: "Lose monitors" }).click();
  await expect(page.locator("#mode-strip")).toHaveText(
    /DEGRADED — no monitors · 19 of 20 cannot be discriminated · entered \d{2}:\d{2}/
  );
  expect(await page.locator("#mode-strip").evaluate(node =>
    node.scrollHeight <= node.clientHeight
  )).toBe(true);
  await expect(page.locator("#unobtainable-note")).toBeHidden();
  const bands = await page.locator("#queue-body .band-chip").allTextContents();
  const acuity = bands.map(value => Number(value.match(/P([1-5])/)?.[1]));
  expect(acuity).toEqual([...acuity].sort((left, right) => left - right));
  await expect(page.locator("#inspector")).toContainText(
    "Cannot discriminate · by boundary"
  );
});

test("keyboard path covers capture, override and audit export", async ({ page }) => {
  const arrival = page.getByRole("button", { name: "+ Arrival" });
  await tabTo(page, arrival);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Arrival capture" }))
    .toBeVisible();
  await page.keyboard.type("Keyboard arrival");

  const alert = page.getByRole("button", { name: "A", exact: true });
  await tabTo(page, alert);
  await page.keyboard.press("Enter");
  const admit = page.getByRole("button", { name: "Admit to queue" });
  await tabTo(page, admit);
  await page.keyboard.press("Enter");
  await expect(page.locator("#queue-body tr")).toHaveCount(21);

  const queueEntry = page.locator('#queue-body tr[tabindex="0"]');
  await tabTo(page, queueEntry);
  for (let count = 0; count < 8; count += 1) {
    await page.keyboard.press("ArrowDown");
  }
  await page.keyboard.press("Shift+ArrowUp");
  await page.keyboard.press("Enter");

  await page.keyboard.press("a");
  const exportJson = page.getByRole("button", { name: "Export JSON" });
  await expect(exportJson).toBeVisible();
  await tabTo(page, exportJson);
  const download = page.waitForEvent("download");
  await page.keyboard.press("Enter");
  await download;
});

test("axe reports zero violations on the board", async ({ page }) => {
  expect(await axeViolations(page)).toEqual([]);
});

test("axe reports zero violations on the dark board", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  expect(await axeViolations(page)).toEqual([]);
});

test("axe reports zero violations on the fairness monitor", async ({ page }) => {
  await page.keyboard.press("f");
  await expect(page.locator("#fairness-monitor")).toBeVisible();
  expect(await axeViolations(page)).toEqual([]);
});

test("axe reports zero violations in the audit drawer", async ({ page }) => {
  await page.keyboard.press("a");
  await expect(page.locator("#audit-drawer")).toBeVisible();
  expect(await axeViolations(page)).toEqual([]);
});

test("axe reports zero violations in arrival capture", async ({ page }) => {
  const arrival = page.getByRole("button", { name: "+ Arrival" });
  await tabTo(page, arrival);
  await page.keyboard.press("Enter");
  expect(await axeViolations(page)).toEqual([]);
});

test("the complete interface remains reachable at 200 percent", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 400 });
  const pageWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }));
  expect(pageWidth.scroll).toBe(pageWidth.client);

  const arrival = page.getByRole("button", { name: "+ Arrival" });
  await tabTo(page, arrival);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Arrival capture" }))
    .toBeVisible();
  const alert = page.getByRole("button", { name: "A", exact: true });
  await tabTo(page, alert);
  await page.keyboard.press("Enter");
  const admit = page.getByRole("button", { name: "Admit to queue" });
  await tabTo(page, admit);
  await expect(admit).toBeInViewport();
});

test("states remain named under simulated deuteranopia", async ({ page }) => {
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setEmulatedVisionDeficiency", {
    type: "deuteranopia"
  });
  await expect(page.locator(".row-pinned").first()).toContainText("LOCKED");
  await expect(page.locator(".row-abstaining").first())
    .toContainText(/RESOLVE|ESCALATE|INSUFFICIENT/);
  const bands = await page.locator(".band-chip").allTextContents();
  expect(bands.every(value => /P[1-5]/.test(value))).toBe(true);
});

test("a resolving answer re-scores and enters the audit chain", async ({ page }) => {
  const row = page.locator("#queue-body tr", { hasText: "PT-0007" });
  await row.locator(".id-cell").click();
  await expect(page.getByText("One question would resolve this")).toBeVisible();
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await expect(page.locator("#inspector")).toContainText("PROBABLE");
  await expect(page.getByText("One question would resolve this")).toHaveCount(0);
  await page.keyboard.press("a");
  await expect(page.locator("#audit-drawer")).toContainText(
    "QUESTION_ANSWERED"
  );
});
