import { readFile } from "node:fs/promises";
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
