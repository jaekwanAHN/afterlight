import { expect, it } from "vitest";
import { createState } from "../src/game/core/GameState";
import { makeEnemy } from "../src/game/systems/EnemySpawnSystem";
import { UPGRADES, applyUpgrade } from "../src/game/upgrades/upgrades";
import { callStorm } from "../src/game/weapons/StormWeapon";
import { SpatialGrid } from "../src/game/utils/SpatialGrid";
import type { Enemy } from "../src/game/entities/Enemy";
function scene() {
  const s = createState();
  s.weapons.storm.level = 1;
  const inside = makeEnemy(s, "tank");
  inside.x = 100;
  inside.y = 0;
  const near = makeEnemy(s, "tank");
  near.x = 150;
  near.y = 0;
  const far = makeEnemy(s, "tank");
  far.x = 400;
  far.y = 0;
  const offscreen = makeEnemy(s, "tank");
  offscreen.x = 2000;
  offscreen.y = 0;
  s.enemies.push(inside, near, far, offscreen);
  const grid = new SpatialGrid<Enemy>();
  grid.rebuild(s.enemies);
  return { s, inside, near, far, offscreen, grid };
}
it("strikes a random on-screen enemy and splashes its neighbours", () => {
  const { s, inside, near, far, offscreen, grid } = scene();
  callStorm(s, grid, 0, () => 0);
  expect(inside.hp).toBe(inside.maxHp - s.weapons.storm.damage);
  expect(near.hp).toBe(near.maxHp - s.weapons.storm.damage);
  expect(far.hp).toBe(far.maxHp);
  expect(offscreen.hp).toBe(offscreen.maxHp);
  expect(s.effects.some((e) => e.kind === "strike")).toBe(true);
  expect(s.weapons.storm.timer).toBe(s.weapons.storm.cooldown);
});
it("never picks an off-screen target", () => {
  const s = createState();
  s.weapons.storm.level = 1;
  const offscreen = makeEnemy(s, "tank");
  offscreen.x = 2000;
  offscreen.y = 0;
  s.enemies.push(offscreen);
  const grid = new SpatialGrid<Enemy>();
  grid.rebuild(s.enemies);
  callStorm(s, grid, 0, () => 0.99);
  expect(offscreen.hp).toBe(offscreen.maxHp);
  expect(s.weapons.storm.timer).toBe(0);
});
it("upgrades cooldown, damage and range only after unlocking", () => {
  const s = createState();
  s.status = "levelup";
  s.choices = UPGRADES.filter((u) => u.id.startsWith("storm")).map((u) => ({
    ...u,
    rank: 1,
  }));
  expect(applyUpgrade(s, "storm-power")).toBe(false);
  expect(applyUpgrade(s, "storm")).toBe(true);
  const before = { ...s.weapons.storm };
  for (const id of ["storm-haste", "storm-power", "storm-range"]) {
    s.status = "levelup";
    s.choices = UPGRADES.filter((u) => u.id.startsWith("storm")).map((u) => ({
      ...u,
      rank: 1,
    }));
    expect(applyUpgrade(s, id)).toBe(true);
  }
  const w = s.weapons.storm;
  expect(w.cooldown).toBeLessThan(before.cooldown);
  expect(w.damage).toBeGreaterThan(before.damage);
  expect(w.radius).toBeGreaterThan(before.radius);
  expect(w.level).toBe(4);
});
