import { expect, it } from "vitest";
import { Game } from "../src/game/core/Game";
import { makeEnemy } from "../src/game/systems/EnemySpawnSystem";
import { WEAPON_CONFIG } from "../src/game/config/weaponConfig";
it("simulates 500 enemies, 200 projectiles and 300 orbs without invalid state", () => {
  const g = new Game(() => {});
  g.start();
  const s = g.state;
  s.spawnTimer = 999;
  s.player.hp = s.player.maxHp = 1e6;
  s.player.expToNextLevel = 1e9;
  s.enemies = Array.from({ length: 520 }, (_, i) => {
    const e = makeEnemy(s, i % 3 === 0 ? "tank" : "normal");
    const a = i * 2.399963;
    e.x = Math.cos(a) * (50 + (i % 500));
    e.y = Math.sin(a) * (50 + (i % 500));
    e.hp = e.maxHp = 1e6;
    return e;
  });
  s.projectiles = Array.from({ length: 220 }, (_, i) => ({
    id: s.nextId++,
    x: Math.cos(i) * 200,
    y: Math.sin(i) * 200,
    previousX: 0,
    previousY: 0,
    vx: Math.cos(i) * WEAPON_CONFIG.bolt.projectileSpeed,
    vy: Math.sin(i) * WEAPON_CONFIG.bolt.projectileSpeed,
    radius: 5,
    damage: 10,
    lifetime: 10,
    dead: false,
  }));
  s.orbs = Array.from({ length: 320 }, (_, i) => ({
    id: s.nextId++,
    x: 1000 + i,
    y: 1000,
    radius: 4,
    value: 1,
    attracted: false,
    dead: false,
  }));
  const template = s.projectiles.map((p) => ({ ...p }));
  const timings: number[] = [];
  for (let i = 0; i < 180; i++) {
    s.projectiles = template.map((p) => ({ ...p }));
    const start = performance.now();
    g.update(1 / 60, { x: 0, y: 0 });
    timings.push(performance.now() - start);
  }
  timings.sort((a, b) => a - b);
  console.info(
    `Simulation load: 520 enemies / 220 projectiles / 320 orbs; median=${timings[90].toFixed(2)}ms p95=${timings[171].toFixed(2)}ms (renderer excluded)`,
  );
  expect(s.enemies).toHaveLength(520);
  expect(s.orbs).toHaveLength(320);
  expect(
    s.enemies.every((e) => Number.isFinite(e.x) && Number.isFinite(e.y)),
  ).toBe(true);
  expect(s.player.hp).toBeGreaterThan(0);
}, 15000);
