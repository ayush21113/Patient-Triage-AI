import { renderBoard } from "/assets/js/render/board.js";
import { assessBoard } from "/assets/js/sim/board.js";

const [cohort, protocol] = await Promise.all([
  fetch("/assets/data/cohort.json").then(response => response.json()),
  fetch("/assets/data/protocol.v1.json").then(response => response.json())
]);
const startAt = Date.parse(cohort.boardStartsAt);
const minute = 60_000;
const tableBody = document.querySelector("#queue-body");
const movementPersistence = [];

function recordMovement() {
  movementPersistence.push(document.querySelector(
    '[data-encounter-id="PT-0002"]'
  ).classList.contains("row-moved"));
  document.body.dataset.movementPersistence = JSON.stringify(
    movementPersistence
  );
}

function renderAt(atMinute) {
  const now = startAt + atMinute * minute;
  renderBoard(tableBody, assessBoard(cohort, protocol, now), now);
}

renderAt(0);
setTimeout(() => {
  renderAt(30);
  recordMovement();
  document.body.dataset.phase = "movement";
}, 200);
setTimeout(() => {
  renderAt(31);
  recordMovement();
  document.body.dataset.phase = "persisted-2";
}, 500);
setTimeout(() => {
  renderAt(32);
  recordMovement();
  document.body.dataset.phase = "persisted-3";
}, 800);
setTimeout(() => {
  renderAt(33);
  recordMovement();
  document.body.dataset.phase = "cleared";
}, 1100);
