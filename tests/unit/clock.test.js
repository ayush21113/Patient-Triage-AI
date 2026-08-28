import assert from "node:assert/strict";
import test from "node:test";
import { createClock } from "../../assets/js/clock.js";

const minute = 60_000;

test("60x advances one simulated hour per wall-clock minute", () => {
  const startAt = Date.parse("2026-08-23T14:00:00+05:30");
  const ticks = [];
  const clock = createClock(startAt, now => ticks.push(now));
  clock.setSpeed(60, 0);
  clock.run(0);
  clock.tick(minute);
  clock.pause(minute);

  assert.equal(clock.now(), startAt + 60 * minute);
  assert.equal(ticks.at(-1), clock.now());
});

test("pause freezes the clock and derived values", () => {
  let derivedValue = null;
  const clock = createClock(0, now => {
    derivedValue = now / minute;
  });
  clock.setSpeed(10, 0);
  clock.run(0);
  clock.tick(minute);
  clock.pause(minute);
  const pausedAt = clock.now();
  const pausedDerivedValue = derivedValue;

  clock.tick(2 * minute);
  assert.equal(clock.now(), pausedAt);
  assert.equal(derivedValue, pausedDerivedValue);
  assert.equal(clock.isRunning(), false);
});

test("a running speed change accounts for the old speed first", () => {
  const clock = createClock(0);
  clock.run(0);
  clock.setSpeed(10, minute);
  clock.tick(2 * minute);
  clock.pause(2 * minute);

  assert.equal(clock.now(), 11 * minute);
  assert.equal(clock.speed(), 10);
});

test("rejects speeds outside the documented controls", () => {
  const clock = createClock(0);
  assert.throws(() => clock.setSpeed(2, 0), /1, 10, or 60/);
});

test("the console jump advances fifteen minutes whether running or paused", () => {
  const paused = createClock(0);
  paused.advance(15 * minute, 0);
  assert.equal(paused.now(), 15 * minute);

  const running = createClock(0);
  running.run(0);
  running.advance(15 * minute, minute);
  assert.equal(running.now(), 16 * minute);
  running.pause(minute);
});
