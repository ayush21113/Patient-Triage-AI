const TICK_MILLISECONDS = 1_000;
const SPEEDS = [1, 10, 60];

export function createClock(startAt, onTick = () => {}) {
  let simulatedNow = typeof startAt === "number"
    ? startAt
    : Date.parse(startAt);
  let speed = 1;
  let running = false;
  let lastWallAt = null;
  let timer = null;

  function tick(wallAt = Date.now()) {
    if (!running) return;
    simulatedNow += (wallAt - lastWallAt) * speed;
    lastWallAt = wallAt;
    onTick(simulatedNow);
  }

  function run(wallAt = Date.now()) {
    if (running) return;
    running = true;
    lastWallAt = wallAt;
    timer = setInterval(tick, TICK_MILLISECONDS);
  }

  function pause(wallAt = Date.now()) {
    if (!running) return;
    tick(wallAt);
    running = false;
    clearInterval(timer);
    timer = null;
  }

  function setSpeed(nextSpeed, wallAt = Date.now()) {
    if (!SPEEDS.includes(nextSpeed)) {
      throw new Error("Clock speed must be 1, 10, or 60");
    }
    if (running) tick(wallAt);
    speed = nextSpeed;
  }

  function advance(milliseconds, wallAt = Date.now()) {
    if (running) {
      simulatedNow += (wallAt - lastWallAt) * speed;
      lastWallAt = wallAt;
    }
    simulatedNow += milliseconds;
    onTick(simulatedNow);
  }

  return {
    now: () => simulatedNow,
    isRunning: () => running,
    speed: () => speed,
    run,
    pause,
    setSpeed,
    advance,
    tick
  };
}
