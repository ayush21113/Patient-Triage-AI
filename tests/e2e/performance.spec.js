import { expect, test } from "@playwright/test";

test("cold load is interactive within two seconds", async ({ page }) => {
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("/");
  await expect(page.locator("#queue-body tr")).toHaveCount(20);
  const interactiveAt = await page.evaluate(() => performance.now());
  expect(interactiveAt).toBeLessThan(2_000);
});

test("a simulation tick produces no task over 50 ms", async ({ page }) => {
  await page.addInitScript(() => {
    window.__longTasks = [];
    new PerformanceObserver(entries => {
      window.__longTasks.push(...entries.getEntries().map(entry =>
        entry.duration
      ));
    }).observe({ type: "longtask", buffered: true });
  });
  await page.goto("/");
  await expect(page.locator("#queue-body tr")).toHaveCount(20);
  await page.evaluate(() => { window.__longTasks.length = 0; });
  await page.waitForTimeout(2_200);
  const longTasks = await page.evaluate(() => window.__longTasks);
  expect(longTasks).toEqual([]);
});
