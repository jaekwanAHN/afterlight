import { expect, it } from "vitest";
import { createState } from "../src/game/core/GameState";
import { makeEnemy } from "../src/game/systems/EnemySpawnSystem";
import { UPGRADES, chooseUpgrades } from "../src/game/upgrades/upgrades";
import {
  throwBoomerangs,
  updateBoomerangs,
} from "../src/game/weapons/BoomerangWeapon";
import { SpatialGrid } from "../src/game/utils/SpatialGrid";
import type { Enemy } from "../src/game/entities/Enemy";
function armed() {
  const s = createState();
  s.weapons.boomerang.level = 1;
  const e = makeEnemy(s, "tank");
  e.x = 120;
  e.y = 0;
  s.enemies.push(e);
  const grid = new SpatialGrid<Enemy>();
  grid.rebuild([e]);
  return { s, e, grid };
}
it("stays idle until unlocked", () => {
  const s = createState();
  s.enemies.push(makeEnemy(s, "normal"));
  throwBoomerangs(s, 0);
  expect(s.boomerangs).toHaveLength(0);
});
it("flies out, hits once per pass, turns back and is caught", () => {
  const { s, e, grid } = armed();
  throwBoomerangs(s, 0);
  expect(s.boomerangs).toHaveLength(1);
  const b = s.boomerangs[0];
  expect(b.vx).toBeGreaterThan(0);
  let maxX = 0;
  for (let i = 0; i < 600 && s.boomerangs.length; i++) {
    updateBoomerangs(s, grid, 1 / 60);
    if (s.boomerangs[0]) maxX = Math.max(maxX, s.boomerangs[0].x);
  }
  expect(maxX).toBeGreaterThan(e.x);
  expect(s.boomerangs).toHaveLength(0);
  // One hit going out, one hit coming back.
  expect(e.hp).toBe(e.maxHp - s.weapons.boomerang.damage * 2);
});
it("upgrades every advertised attribute and gates them behind the unlock", () => {
  const s = createState();
  const seen = () => new Set(chooseUpgrades(s).map((c) => c.id));
  for (let i = 0; i < 20; i++)
    for (const id of seen()) expect(id.startsWith("boomerang-")).toBe(false);
  UPGRADES.find((u) => u.id === "boomerang")!.apply(s);
  s.upgradeLevels.boomerang = 1;
  const before = { ...s.weapons.boomerang };
  for (const id of [
    "boomerang-speed",
    "boomerang-haste",
    "boomerang-power",
    "boomerang-count",
  ])
    UPGRADES.find((u) => u.id === id)!.apply(s);
  const w = s.weapons.boomerang;
  expect(w.speed).toBeGreaterThan(before.speed);
  expect(w.cooldown).toBeLessThan(before.cooldown);
  expect(w.damage).toBeGreaterThan(before.damage);
  expect(w.count).toBe(before.count + 1);
  expect(w.level).toBe(5);
});
