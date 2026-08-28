import { on } from "../util/dom.js";

const FIFTEEN_MINUTES = 15 * 60_000;

export function bindSimulationConsole(console, simulation) {
  const clock = simulation.clock;
  const toggle = console.querySelector("#clock-toggle");
  const speedControls = [...console.querySelectorAll(".speed-control")];
  const surge = console.querySelector("#surge-control");
  const degraded = console.querySelector("#degraded-control");

  function reflectClock() {
    const running = clock.isRunning();
    toggle.textContent = running ? "❚❚" : "▶";
    toggle.setAttribute(
      "aria-label",
      running ? "Pause simulation" : "Run simulation"
    );
    for (const control of speedControls) {
      control.setAttribute(
        "aria-pressed",
        String(Number(control.dataset.speed) === clock.speed())
      );
    }
  }

  on(toggle, "click", () => {
    if (clock.isRunning()) clock.pause();
    else clock.run();
    reflectClock();
  });
  for (const control of speedControls) {
    on(control, "click", () => {
      clock.setSpeed(Number(control.dataset.speed));
      reflectClock();
    });
  }
  on(surge, "click", () => {
    simulation.startSurge();
    surge.disabled = true;
  });
  on(degraded, "click", () => {
    simulation.enterDegraded();
    degraded.disabled = true;
  });
  on(console.querySelector("#reset-control"), "click", () =>
    location.reload()
  );
  on(console.querySelector("#jump-control"), "click", () =>
    clock.advance(FIFTEEN_MINUTES)
  );
  reflectClock();
}
