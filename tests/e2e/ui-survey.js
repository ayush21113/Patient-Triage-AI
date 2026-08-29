export const surveyViewports = [
  { width: 1280, height: 800 },
  { width: 1024, height: 768 }
];

export const surveyThemes = ["light", "dark"];

export const surveyScreens = [
  { id: "S0", name: "header", mode: "NORMAL" },
  { id: "S1", name: "queue", mode: "NORMAL" },
  { id: "S2", name: "inspector-empty", mode: "NORMAL" },
  {
    id: "S2",
    name: "inspector-pt0004",
    mode: "NORMAL",
    open: page => page.locator(
      'tr[data-encounter-id="PT-0004"] .id-cell'
    ).click()
  },
  {
    id: "S2",
    name: "inspector-pt0007-abstaining",
    mode: "NORMAL",
    open: page => page.locator(
      'tr[data-encounter-id="PT-0007"] .id-cell'
    ).click()
  },
  {
    id: "S3",
    name: "arrival-capture",
    mode: "NORMAL",
    open: page => page.getByRole("button", { name: "+ Arrival" }).click()
  },
  {
    id: "S4",
    name: "reassessment",
    mode: "NORMAL",
    open: page => page.locator(
      'tr[data-encounter-id="PT-0004"] .vital-cell'
    ).first().click()
  },
  {
    id: "S5",
    name: "audit-drawer",
    mode: "NORMAL",
    open: page => page.getByRole("button", { name: "Audit" }).click()
  },
  {
    id: "S6",
    name: "fairness",
    mode: "NORMAL",
    open: page => page.getByRole("button", { name: "Fairness" }).click()
  },
  { id: "S7", name: "surge-banner", mode: "SURGE" },
  { id: "S8", name: "emergency-alert", mode: "NORMAL" },
  { id: "S9", name: "sim-console", mode: "NORMAL" },
  { id: "S1", name: "queue", mode: "SURGE" },
  { id: "S2", name: "inspector-empty", mode: "SURGE" },
  { id: "S1", name: "queue", mode: "DEGRADED" },
  { id: "S2", name: "inspector-empty", mode: "DEGRADED" },
  { id: "S1", name: "queue", mode: "SURGE+DEGRADED" },
  { id: "S2", name: "inspector-empty", mode: "SURGE+DEGRADED" },
  { id: "S7", name: "surge-banner", mode: "SURGE+DEGRADED" }
];

export async function openSurveyState(page, screen) {
  await page.goto("/");
  await page.locator("#queue-body tr").first().waitFor();
  await page.getByRole("button", { name: "Pause simulation" }).click();
  if (screen.mode.includes("SURGE")) {
    await page.getByRole("button", { name: "Surge ×3" }).click();
    await page.getByRole("button", { name: "t + 15 min" }).click();
    await page.locator("#mode-strip").filter({ hasText: "SURGE" })
      .waitFor({ state: "visible" });
  }
  if (screen.mode.includes("DEGRADED")) {
    await page.getByRole("button", { name: "Lose monitors" }).click();
    await page.locator("#mode-strip").filter({ hasText: "DEGRADED" })
      .waitFor({ state: "visible" });
  }
  await screen.open?.(page);
  await page.waitForTimeout(250);
}

export function surveyFilename(screen, viewport, theme) {
  return screen.id + "-" + screen.name + "-" +
    screen.mode.replace("+", "-") + "-" + viewport.width + "x" +
    viewport.height + "-" + theme + ".png";
}
