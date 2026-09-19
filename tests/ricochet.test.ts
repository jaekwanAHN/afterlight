import { expect, it } from "vitest";
import { createState } from "../src/game/core/GameState";
import { makeEnemy } from "../src/game/systems/EnemySpawnSystem";
import { updateProjectiles } from "../src/game/systems/CombatSystem";
import { fireRicochet } from "../src/game/weapons/RicochetWeapon";
import { SpatialGrid } from "../src/game/utils/SpatialGrid";
import {
  UPGRADES,
  applyUpgrade,
  chooseUpgrades,
} from "../src/game/upgrades/upgrades";
function setup(
  points = [
    [60, 0],
    [120, 60],
    [180, 0],
    [240, 60],
  ],
) {
  const s = createState();
  for (const [x, y] of points) {
    const e = makeEnemy(s, "tank");
    e.x = x;
    e.y = y;
    s.enemies.push(e);
  }
  const grid = new SpatialGrid<(typeof s.enemies)[number]>();
  grid.rebuild(s.enemies);
  return { s, grid };
}
it("requires an unlock and fires upgraded count and damage on cooldown", () => {
  const { s } = setup();
  fireRicochet(s, 0);
  expect(s.projectiles).toHaveLength(0);
  for (const id of [
    "ricochet",
    "ricochet-count",
    "ricochet-power",
    "ricochet-bounces",
  ]) {
    const upgrade = UPGRADES.find((u) => u.id === id)!;
    s.status = "levelup";
    s.choices = [{ ...upgrade, rank: 1 }];
    expect(applyUpgrade(s, id)).toBe(true);
  }
  fireRicochet(s, 0);
  expect(s.projectiles).toHaveLength(2);
  expect(s.projectiles.map((p) => p.damage)).toEqual([20, 20]);
  expect(s.projectiles.map((p) => p.bounces)).toEqual([3, 3]);
  expect(new Set(s.projectiles.map((p) => p.targetId)).size).toBe(2);
  fireRicochet(s, 0);
  expect(s.projectiles).toHaveLength(2);
  fireRicochet(s, s.weapons.ricochet.cooldown);
  expect(s.projectiles).toHaveLength(4);
});
it("bounces twice to distinct nearby enemies then expires", () => {
  const { s, grid } = setup();
  s.weapons.ricochet.level = 1;
  fireRicochet(s, 0);
  for (let i = 0; i < 120; i++) updateProjectiles(s, grid, 1 / 60);
  expect(s.enemies.map((e) => e.hp)).toEqual([44, 44, 44, 60]);
  expect(s.projectiles).toHaveLength(0);
});
it("does not bounce back to a hit target or to an out-of-range enemy", () => {
  const { s, grid } = setup([
    [60, 0],
    [120, 0],
    [800, 0],
  ]);
  s.weapons.ricochet.level = 1;
  fireRicochet(s, 0);
  for (let i = 0; i < 120; i++) updateProjectiles(s, grid, 1 / 60);
  expect(s.enemies.map((e) => e.hp)).toEqual([44, 44, 60]);
  expect(s.projectiles).toHaveLength(0);
});
it("can bounce after a lethal hit and ignores dead enemies", () => {
  const { s, grid } = setup();
  s.weapons.ricochet.level = 1;
  s.enemies[0].hp = 1;
  s.enemies[1].dead = true;
  fireRicochet(s, 0);
  for (let i = 0; i < 120; i++) updateProjectiles(s, grid, 1 / 60);
  expect(s.enemies.map((e) => e.hp)).toEqual([0, 60, 44, 44]);
});
it("gates ricochet enhancements until unlocked and applies bolt piercing", () => {
  const s = createState();
  for (const u of UPGRADES)
    if (!u.requires && u.id !== "ricochet") s.upgradeLevels[u.id] = u.maxLevel;
  expect(chooseUpgrades(s).some((c) => c.id.startsWith("ricochet-"))).toBe(
    false,
  );
  const upgrade = UPGRADES.find((u) => u.id === "bolt-pierce")!;
  s.upgradeLevels[upgrade.id] = 0;
  s.status = "levelup";
  s.choices = [{ ...upgrade, rank: 1 }];
  expect(applyUpgrade(s, upgrade.id)).toBe(true);
  expect(s.weapons.bolt.pierce).toBe(1);
});
