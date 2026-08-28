import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial", timeout: 120_000 });

for (let rehearsal = 1; rehearsal <= 3; rehearsal += 1) {
 test(`five-minute demo rehearsal ${rehearsal}`, async ({ page, context }) => {
  const startedAt = Date.now();
  await page.goto("/");

  await expect(page.locator("#queue-body tr")).toHaveCount(20);

  await page.locator('tr[data-encounter-id="PT-0004"] .id-cell').click();
  await expect(page.locator("#inspector")).toContainText(
   "BAND SET BY PRESENTATION FLOOR"
  );

  await page.locator('tr[data-encounter-id="PT-0011"] .id-cell').click();
  await expect(page.locator("#inspector")).toContainText(
   "Age-banded parameter sum"
  );

  await page.locator('tr[data-encounter-id="PT-0007"] .id-cell').click();
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await expect(page.locator("#inspector")).toContainText("PROBABLE");

  await page.getByRole("button", { name: "60×", exact: true }).click();
  await page.waitForTimeout(45_500);
  await expect(
   page.locator('tr[data-encounter-id="PT-0002"] .band-chip')
  ).toContainText("P2");

  const source = page.locator('tr[data-encounter-id="PT-0020"] .id-cell');
  const target = page.locator("#queue-body tr").nth(1).locator(".id-cell");
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  await page.mouse.move(
   sourceBox.x + sourceBox.width / 2,
   sourceBox.y + sourceBox.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
   targetBox.x + targetBox.width / 2,
   targetBox.y + targetBox.height / 2
  );
  await page.mouse.up();
  await expect(page.locator("#queue-body tr").nth(1)).toContainText("PT-0020");
  await page.keyboard.press("a");
  await expect(page.locator("#audit-drawer")).toContainText("OVERRIDE");
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "Surge ×3" }).click();
  await expect(page.locator("#mode-strip")).toContainText("SURGE", {
   timeout: 20_000
  });
  await page.getByRole("button", { name: "Pause simulation" }).click();

  await page.getByRole("button", { name: "Lose monitors" }).click();
  await expect(page.locator("#mode-strip")).toContainText("DEGRADED");
  await expect(page.locator("#mode-strip")).toContainText("no monitors");

  await page.getByRole("button", { name: "Fairness" }).click();
  await expect(page.getByRole("heading", { name: "Fairness monitor" }))
   .toBeVisible();
  await expect(page.locator(".fairness-headline")).not.toBeEmpty();

  await page.evaluate(async () => {
   await navigator.serviceWorker.ready;
   while (!navigator.serviceWorker.controller) {
    await new Promise(resolve => setTimeout(resolve, 25));
   }
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#queue-body tr")).toHaveCount(20);
  await context.setOffline(false);

  const elapsed = Date.now() - startedAt;
  console.log(`demo rehearsal ${rehearsal}: ${(elapsed / 1_000).toFixed(1)}s`);
  expect(elapsed).toBeLessThan(5 * 60_000);
 });
}
