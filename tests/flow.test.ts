import { expect, it } from "vitest";
import { Game } from "../src/game/core/Game";
it("pauses time and fully resets on restart", () => {
  const g = new Game(() => {});
  g.start();
  g.update(0.05, { x: 1, y: 0 });
  expect(g.state.player.x).toBeGreaterThan(0);
  g.pause();
  const time = g.state.elapsed;
  g.update(1, { x: 1, y: 0 });
  expect(g.state.elapsed).toBe(time);
  g.start();
  expect(g.state.elapsed).toBe(0);
  expect(g.state.player.hp).toBe(100);
  expect(g.state.player.x).toBe(0);
  expect(g.state.enemies).toHaveLength(0);
  expect(g.state.weapons.orbit.level).toBe(0);
});
it("wins at 600 seconds and stops simulation", () => {
  const g = new Game(() => {});
  g.start();
  g.state.elapsed = 599.99;
  g.update(0.05, { x: 0, y: 0 });
  expect(g.state.status).toBe("victory");
  expect(g.state.elapsed).toBe(600);
  g.update(1, { x: 1, y: 0 });
  expect(g.state.player.x).toBe(0);
});
it("freezes on game over", () => {
  const g = new Game(() => {});
  g.start();
  g.state.player.hp = 0;
  g.update(0.02, { x: 0, y: 0 });
  expect(g.state.status).toBe("gameover");
  const time = g.state.elapsed;
  g.update(1, { x: 1, y: 0 });
  expect(g.state.elapsed).toBe(time);
});

it("preserves viewport across home and restart", () => {
  const g = new Game(() => {});
  g.state.viewport = { width: 390, height: 844 };
  g.home();
  g.start();
  expect(g.state.viewport).toEqual({ width: 390, height: 844 });
});
it("clamps long gaps and throttles React snapshots", () => {
  let calls = 0;
  const g = new Game(() => calls++);
  g.start();
  g.update(60, { x: 1, y: 0 });
  expect(g.state.elapsed).toBeCloseTo(0.05);
  expect(g.state.player.x).toBeCloseTo(11);
  calls = 0;
  for (let i = 0; i < 60; i++) g.update(1 / 60, { x: 0, y: 0 });
  expect(calls).toBeLessThanOrEqual(11);
});
it("produces equal movement at different frame rates", () => {
  const a = new Game(() => {}),
    b = new Game(() => {});
  a.start();
  b.start();
  for (let i = 0; i < 60; i++) a.update(1 / 60, { x: 1, y: 0 });
  for (let i = 0; i < 144; i++) b.update(1 / 144, { x: 1, y: 0 });
  expect(a.state.player.x).toBeCloseTo(b.state.player.x, 5);
});
