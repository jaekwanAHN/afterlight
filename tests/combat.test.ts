import { expect, it } from "vitest";
import { createState } from "../src/game/core/GameState";
import { makeEnemy } from "../src/game/systems/EnemySpawnSystem";
import { fireMagicBolt } from "../src/game/weapons/MagicBolt";
import {
  collectDeaths,
  damageEnemy,
  updateProjectiles,
} from "../src/game/systems/CombatSystem";
import { SpatialGrid } from "../src/game/utils/SpatialGrid";
it("auto targets, damages, kills and drops experience once", () => {
  const s = createState();
  const e = makeEnemy(s, "normal");
  e.x = 25;
  e.y = 0;
  s.enemies.push(e);
  s.weapons.bolt.damage = 20;
  fireMagicBolt(s, 0.1);
  const grid = new SpatialGrid<typeof e>();
  grid.rebuild(s.enemies);
  updateProjectiles(s, grid, 0.1);
  expect(e.hp).toBe(0);
  collectDeaths(s);
  collectDeaths(s);
  expect(s.enemies).toHaveLength(0);
  expect(s.orbs).toHaveLength(1);
  expect(s.kills).toBe(1);
  expect(s.projectiles).toHaveLength(0);
});
it("clamps damage and ignores dead targets", () => {
  const e = makeEnemy(createState(), "normal");
  damageEnemy(e, 100);
  damageEnemy(e, 5);
  expect(e.hp).toBe(0);
  expect(e.dead).toBe(true);
});

it("pierces in flight order and hits each enemy only once", () => {
  const s = createState();
  const enemies = [40, 80, 120].map((x) => {
    const e = makeEnemy(s, "tank");
    e.x = x;
    e.y = 0;
    return e;
  });
  s.enemies.push(...enemies.toReversed());
  s.weapons.bolt.pierce = 1;
  fireMagicBolt(s, 0);
  const grid = new SpatialGrid<(typeof enemies)[number]>();
  grid.rebuild(s.enemies);
  updateProjectiles(s, grid, 0.04);
  expect(enemies[0].hp).toBe(50);
  updateProjectiles(s, grid, 0.04);
  expect(enemies[0].hp).toBe(50);
  updateProjectiles(s, grid, 0.2);
  expect(enemies.map((e) => e.hp)).toEqual([50, 50, 60]);
  expect(s.projectiles).toHaveLength(0);
});
it("an unupgraded bolt stops at the first target in a long frame", () => {
  const s = createState();
  for (const x of [100, 40]) {
    const e = makeEnemy(s, "tank");
    e.x = x;
    e.y = 0;
    s.enemies.push(e);
  }
  fireMagicBolt(s, 0);
  const grid = new SpatialGrid<(typeof s.enemies)[number]>();
  grid.rebuild(s.enemies);
  updateProjectiles(s, grid, 0.3);
  expect(s.enemies.map((e) => e.hp)).toEqual([60, 50]);
});
