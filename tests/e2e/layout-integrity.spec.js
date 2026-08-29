import { expect, test } from "@playwright/test";
import {
  openSurveyState,
  surveyFilename,
  surveyScreens,
  surveyThemes,
  surveyViewports
} from "./ui-survey.js";

test.setTimeout(120_000);

function inspectLayout() {
  function intersect(left, right) {
    const x = Math.max(left.left, right.left);
    const y = Math.max(left.top, right.top);
    const rightEdge = Math.min(left.right, right.right);
    const bottom = Math.min(left.bottom, right.bottom);
    return {
      left: x,
      top: y,
      right: rightEdge,
      bottom,
      width: rightEdge - x,
      height: bottom - y
    };
  }
  function visibleRect(element) {
    if (!element.checkVisibility()) return null;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" ||
        Number(style.opacity) === 0) return null;
    let rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    rect = intersect(rect, {
      left: 0,
      top: 0,
      right: innerWidth,
      bottom: innerHeight
    });
    for (let ancestor = element.parentElement; ancestor;
      ancestor = ancestor.parentElement) {
      const ancestorStyle = getComputedStyle(ancestor);
      const clipsX = ["auto", "hidden", "scroll", "clip"]
        .includes(ancestorStyle.overflowX);
      const clipsY = ["auto", "hidden", "scroll", "clip"]
        .includes(ancestorStyle.overflowY);
      if (!clipsX && !clipsY) continue;
      const ancestorRect = ancestor.getBoundingClientRect();
      rect = intersect(rect, {
        left: clipsX ? ancestorRect.left : rect.left,
        top: clipsY ? ancestorRect.top : rect.top,
        right: clipsX ? ancestorRect.right : rect.right,
        bottom: clipsY ? ancestorRect.bottom : rect.bottom
      });
    }
    return rect.width > 0 && rect.height > 0 ? rect : null;
  }
  function selector(element) {
    if (element.id) return "#" + element.id;
    const classes = [...element.classList].slice(0, 2)
      .map(name => "." + name).join("");
    const siblings = element.parentElement
      ? [...element.parentElement.children].filter(child =>
        child.tagName === element.tagName
      )
      : [];
    const nth = siblings.length > 1
      ? ":nth-of-type(" + (siblings.indexOf(element) + 1) + ")"
      : "";
    return element.tagName.toLowerCase() + classes + nth;
  }
  function box(source) {
    const rect = source instanceof Element
      ? source.getBoundingClientRect()
      : source;
    return {
      x: Math.round(rect.left * 10) / 10,
      y: Math.round(rect.top * 10) / 10,
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10,
      right: Math.round(rect.right * 10) / 10,
      bottom: Math.round(rect.bottom * 10) / 10
    };
  }
  const activeModal = [...document.querySelectorAll(
    '[aria-modal="true"]:not([hidden])'
  )].find(visibleRect);
  const root = activeModal ?? document.body;
  const elements = [root, ...root.querySelectorAll("*")]
    .filter(element => !element.closest(".sr-only") && visibleRect(element));
  const textOwners = elements.filter(element =>
    [...element.childNodes].some(node =>
      node.nodeType === Node.TEXT_NODE && node.textContent.trim()
    )
  );
  const defects = [];

  for (let leftIndex = 0; leftIndex < textOwners.length; leftIndex += 1) {
    const left = textOwners[leftIndex];
    const leftBox = visibleRect(left);
    for (let rightIndex = leftIndex + 1;
      rightIndex < textOwners.length; rightIndex += 1) {
      const right = textOwners[rightIndex];
      if (left.contains(right) || right.contains(left)) continue;
      const rightBox = visibleRect(right);
      const overlap = intersect(leftBox, rightBox);
      if (overlap.width > 1 && overlap.height > 1) {
        defects.push({
          rule: "text-overlap",
          first: selector(left),
          second: selector(right),
          firstRect: box(leftBox),
          secondRect: box(rightBox)
        });
      }
    }
  }

  for (const element of textOwners) {
    const style = getComputedStyle(element);
    // Opt-in, not inherited. An earlier version exempted anything with
    // text-overflow inside a [title] ancestor, and board.js sets a title on
    // the whole meta line — which exempted every state token in it. A
    // truncated token is not a word: "INS" cannot be read as INSUFFICIENT,
    // and the reader cannot tell it from a state they do not recognise.
    // Free text may ellipsis because the full value is reachable elsewhere;
    // it carries data-ellipsis="ok" to say so.
    const deliberateEllipsis = element.dataset.ellipsis === "ok";
    if (!deliberateEllipsis && element.clientWidth > 0 &&
        element.scrollWidth > element.clientWidth + 1) {
      defects.push({
        rule: "text-clipped",
        first: selector(element),
        second: null,
        firstRect: box(element),
        secondRect: null
      });
    }
    let positioned = element.parentElement;
    while (positioned && getComputedStyle(positioned).position === "static") {
      positioned = positioned.parentElement;
    }
    if (positioned) {
      const child = visibleRect(element);
      const parent = positioned.getBoundingClientRect();
      if (child.left < parent.left - 1 || child.top < parent.top - 1 ||
          child.right > parent.right + 1 ||
          child.bottom > parent.bottom + 1) {
        defects.push({
          rule: "positioned-containment",
          first: selector(element),
          second: selector(positioned),
          firstRect: box(child),
          secondRect: box(positioned)
        });
      }
    }
  }

  for (const element of elements) {
    if (element.getBoundingClientRect().right > innerWidth + 1) {
      defects.push({
        rule: "viewport-overflow",
        first: selector(element),
        second: "viewport",
        firstRect: box(element),
        secondRect: {
          x: 0,
          y: 0,
          width: innerWidth,
          height: innerHeight,
          right: innerWidth,
          bottom: innerHeight
        }
      });
    }
  }
  return defects;
}

for (const screen of surveyScreens) {
  for (const viewport of surveyViewports) {
    for (const theme of surveyThemes) {
      const state = surveyFilename(screen, viewport, theme);
      test(state, async ({ page }, testInfo) => {
        await page.setViewportSize(viewport);
        await page.emulateMedia({ colorScheme: theme });
        await openSurveyState(page, screen);
        const defects = await page.evaluate(inspectLayout);
        if (defects.length > 0) {
          await testInfo.attach("layout-defects", {
            body: JSON.stringify(defects, null, 2),
            contentType: "application/json"
          });
        }
        expect(
          defects,
          state + "\n" + JSON.stringify(defects.slice(0, 10), null, 2)
        ).toHaveLength(0);
      });
    }
  }
}

test("S6 fairness chart text clears marks at 2872x1526", async ({ page }) => {
  await page.setViewportSize({ width: 2872, height: 1526 });
  await page.goto("/");
  await page.locator("#queue-body tr").first().waitFor();
  await page.getByRole("button", { name: "Pause simulation" }).click();
  await page.getByRole("button", { name: "Surge ×3" }).click();
  await page.getByRole("button", { name: "t + 15 min" }).click();
  await page.getByRole("button", { name: "Lose monitors" }).click();
  await page.getByRole("button", { name: "Fairness" }).click();

  const collisions = await page.locator("#fairness-monitor").evaluate(root =>
    [...root.querySelectorAll(".fairness-bars")].flatMap(svg => {
      const texts = [...svg.querySelectorAll("text")];
      const marks = [...svg.querySelectorAll("rect, line")];
      return texts.flatMap(textNode => {
        const textRect = textNode.getBoundingClientRect();
        return marks.flatMap(mark => {
          const markRect = mark.getBoundingClientRect();
          const overlapWidth = Math.min(textRect.right, markRect.right) -
            Math.max(textRect.left, markRect.left);
          const overlapHeight = Math.min(textRect.bottom, markRect.bottom) -
            Math.max(textRect.top, markRect.top);
          const crossesLine = mark.tagName.toLowerCase() === "line" &&
            overlapWidth > 1 && markRect.y > textRect.top + 1 &&
            markRect.y < textRect.bottom - 1;
          if ((overlapWidth > 1 && overlapHeight > 1) || crossesLine) {
            return [{
              text: textNode.textContent,
              mark: mark.getAttribute("class")
            }];
          }
          return [];
        });
      });
    })
  );

  expect(collisions).toEqual([]);
});
