import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import {
  openSurveyState,
  surveyFilename,
  surveyScreens,
  surveyThemes,
  surveyViewports
} from "./ui-survey.js";

const baseURL = process.env.PATIENT_TRIAGE_URL ?? "http://127.0.0.1:4190";
const outputDirectory = fileURLToPath(
  new URL("../../docs/ui-survey/", import.meta.url)
);

async function capture(browser, screen, viewport, theme) {
  const context = await browser.newContext({
    viewport,
    colorScheme: theme,
    baseURL
  });
  const page = await context.newPage();
  await openSurveyState(page, screen);
  const filename = surveyFilename(screen, viewport, theme);
  await page.screenshot({
    path: outputDirectory + filename,
    fullPage: true
  });
  await context.close();
  return filename;
}

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const screen of surveyScreens) {
    for (const viewport of surveyViewports) {
      for (const theme of surveyThemes) {
        console.log(await capture(browser, screen, viewport, theme));
      }
    }
  }
} finally {
  await browser.close();
}
