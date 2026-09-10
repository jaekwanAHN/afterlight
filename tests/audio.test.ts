import { expect, it } from "vitest";
import { Game } from "../src/game/core/Game";
import { createState } from "../src/game/core/GameState";
import { makeEnemy } from "../src/game/systems/EnemySpawnSystem";
import { collectDeaths } from "../src/game/systems/CombatSystem";
import { collectExperience } from "../src/game/systems/ExperienceSystem";
import { playerContacts } from "../src/game/systems/CollisionSystem";
import { SpatialGrid } from "../src/game/utils/SpatialGrid";
import { shouldPlay, type SoundEvent } from "../src/game/audio/soundEvents";
import type { Enemy } from "../src/game/entities/Enemy";
it("queues one kill sound per frame regardless of body count", () => {
  const s = createState();
  for (let i = 0; i < 5; i++) {
    const e = makeEnemy(s, "normal");
    e.dead = true;
    s.enemies.push(e);
  }
  collectDeaths(s);
  expect(s.sounds).toEqual(["kill"]);
});
it("emits pickup, hurt and gameover from their systems", () => {
  const s = createState();
  s.status = "playing";
  s.orbs.push({
    id: 1,
    x: 0,
    y: 0,
    radius: 4,
    value: 1,
    attracted: false,
    dead: false,
  });
  collectExperience(s, 0.01);
  const e = makeEnemy(s, "tank");
  e.x = 0;
  e.y = 0;
  e.damage = 999;
  s.enemies.push(e);
  const grid = new SpatialGrid<Enemy>();
  grid.rebuild(s.enemies);
  playerContacts(s, grid);
  expect(s.sounds).toEqual(["pickup", "hurt", "gameover"]);
});
it("drains the queue into the sink after each update and clears it", () => {
  const played: SoundEvent[] = [];
  const g = new Game(() => {});
  g.setSoundSink((e) => played.push(e));
  g.start();
  const e = makeEnemy(g.state, "normal");
  e.x = 200;
  e.y = 0;
  g.state.enemies.push(e);
  g.update(1 / 60, { x: 0, y: 0 });
  expect(played).toContain("bolt");
  expect(g.state.sounds).toHaveLength(0);
});
it("throttles rapid repeats of the same sound", () => {
  const last = {};
  expect(shouldPlay("kill", 0, last)).toBe(true);
  expect(shouldPlay("kill", 0.02, last)).toBe(false);
  expect(shouldPlay("pickup", 0.02, last)).toBe(true);
  expect(shouldPlay("kill", 0.1, last)).toBe(true);
});
