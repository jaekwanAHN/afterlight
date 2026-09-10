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
