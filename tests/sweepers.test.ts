import { expect, it } from "vitest";
import { createState } from "../src/game/core/GameState";
import { makeEnemy } from "../src/game/systems/EnemySpawnSystem";
import { moveEnemies } from "../src/game/systems/EnemyMovementSystem";
import { UPGRADES } from "../src/game/upgrades/upgrades";
import {
  beamLength,
  beamReach,
  updateBeams,
} from "../src/game/weapons/BeamWeapon";
import { WEAPON_CONFIG } from "../src/game/config/weaponConfig";
import { fireNova, updateNovas } from "../src/game/weapons/NovaWeapon";
import { dropFlames, updateFlames } from "../src/game/weapons/FlameWeapon";
import { SpatialGrid } from "../src/game/utils/SpatialGrid";
import type { GameState } from "../src/game/core/GameState";
import type { Enemy } from "../src/game/entities/Enemy";
function place(
  s: GameState,
  x: number,
  y: number,
  kind: "tank" | "normal" = "tank",
) {
  const e = makeEnemy(s, kind);
  e.x = x;
  e.y = y;
  s.enemies.push(e);
  return e;
}
function gridOf(s: GameState) {
  const grid = new SpatialGrid<Enemy>();
  grid.rebuild(s.enemies);
  return grid;
}
it("beam charges, fires one burst along its line, then fades", () => {
  const s = createState();
  s.weapons.beam.level = 1;
  const near = place(s, 100, 0);
  const far = place(s, 600, 0);
  const off = place(s, 0, 300);
  updateBeams(s, 0);
  expect(s.sounds).toEqual(["beamCharge"]);
  expect(s.weapons.beam.charge).toBe(WEAPON_CONFIG.beam.chargeTime);
  expect(near.hp).toBe(near.maxHp);
  updateBeams(s, WEAPON_CONFIG.beam.chargeTime);
  expect(s.sounds).toEqual(["beamCharge", "beamFire"]);
  const dmg = s.weapons.beam.damage;
  expect(near.hp).toBe(near.maxHp - dmg);
  expect(far.hp).toBe(far.maxHp - dmg);
  expect(off.hp).toBe(off.maxHp);
  expect(s.beams).toHaveLength(1);
  expect(s.weapons.beam.timer).toBe(s.weapons.beam.cooldown);
  // Fading visual deals no further damage and disappears.
  updateBeams(s, WEAPON_CONFIG.beam.fadeDuration / 2);
  expect(s.beams[0].life).toBeCloseTo(WEAPON_CONFIG.beam.fadeDuration / 2);
  expect(near.hp).toBe(near.maxHp - dmg);
  updateBeams(s, 1);
  expect(s.beams).toHaveLength(0);
  expect(s.sounds).toHaveLength(2);
});
it("beam always reaches the visible edge of the viewport", () => {
  const s = createState();
  s.viewport = { width: 1000, height: 600 };
  const over = WEAPON_CONFIG.beam.overshoot;
  expect(beamLength(s, 0)).toBeCloseTo(500 + over);
  expect(beamLength(s, Math.PI)).toBeCloseTo(500 + over);
  expect(beamLength(s, Math.PI / 2)).toBeCloseTo(300 + over);
  expect(beamLength(s, Math.atan2(300, 500))).toBeCloseTo(
    Math.hypot(500, 300) + over,
  );
  expect(beamReach(s)).toBeCloseTo(Math.hypot(500, 300) + over);
  // A taller viewport (portrait phone) stretches the vertical beam instead.
  s.viewport = { width: 400, height: 800 };
  expect(beamLength(s, Math.PI / 2)).toBeCloseTo(400 + over);
  expect(beamLength(s, 0)).toBeCloseTo(200 + over);
  // Damage covers the whole line, so an enemy just inside the far edge is hit.
  s.weapons.beam.level = 1;
  const edge = place(s, 0, 390);
  const beyond = place(s, 0, 400 + over + edge.radius + s.weapons.beam.width);
  updateBeams(s, 0);
  updateBeams(s, WEAPON_CONFIG.beam.chargeTime);
  expect(edge.hp).toBe(edge.maxHp - s.weapons.beam.damage);
  expect(beyond.hp).toBe(beyond.maxHp);
});
it("beam stays quiet without a target and fans out with extra beams", () => {
  const s = createState();
  s.weapons.beam.level = 1;
  updateBeams(s, 5);
  expect(s.sounds).toHaveLength(0);
  s.weapons.beam.count = 3;
  place(s, 300, 0);
  updateBeams(s, 0);
  updateBeams(s, WEAPON_CONFIG.beam.chargeTime);
  expect(s.beams.map((b) => b.angle)).toEqual([
    -WEAPON_CONFIG.beam.spread,
    0,
    WEAPON_CONFIG.beam.spread,
  ]);
});
it("nova strikes each enemy once and knocks it away from the player", () => {
  const s = createState();
  s.weapons.nova.level = 1;
  const e = place(s, 120, 0);
  const grid = gridOf(s);
  fireNova(s, 0);
  expect(s.novas).toHaveLength(1);
  expect(s.sounds).toContain("nova");
  for (let i = 0; i < 60 && s.novas.length; i++) updateNovas(s, grid, 1 / 60);
  expect(e.hp).toBe(e.maxHp - s.weapons.nova.damage);
  expect(e.pushX).toBeGreaterThan(0);
  const before = e.x;
  moveEnemies(s, grid, 1 / 60);
  expect(e.x).toBeGreaterThan(before);
  expect(s.novas).toHaveLength(0);
});
it("flame patches drop only while walking and burn over time", () => {
  const s = createState();
  s.weapons.flame.level = 1;
  dropFlames(s);
  expect(s.flames).toHaveLength(0);
  s.player.x = 60;
  dropFlames(s);
  dropFlames(s);
  expect(s.flames).toHaveLength(1);
  s.player.x = 160;
  dropFlames(s);
  expect(s.flames).toHaveLength(2);
  const e = place(s, 160, 0);
  const grid = gridOf(s);
  updateFlames(s, grid, 0);
  expect(e.hp).toBe(e.maxHp - s.weapons.flame.damage);
  updateFlames(s, grid, 0.1);
  expect(e.hp).toBe(e.maxHp - s.weapons.flame.damage);
  updateFlames(s, grid, 10);
  expect(s.flames).toHaveLength(0);
});
it("unlocks each sweeper and grows every advertised stat", () => {
  const s = createState();
  const apply = (id: string) => UPGRADES.find((u) => u.id === id)!.apply(s);
  apply("beam");
  apply("nova");
  apply("flame");
  const b = { ...s.weapons.beam },
    n = { ...s.weapons.nova },
    f = { ...s.weapons.flame };
  for (const id of [
    "beam-power",
    "beam-width",
    "beam-haste",
    "beam-count",
    "nova-power",
    "nova-range",
    "nova-haste",
    "nova-knockback",
    "flame-power",
    "flame-radius",
    "flame-duration",
  ])
    apply(id);
  expect(s.weapons.beam.damage).toBeGreaterThan(b.damage);
  expect(s.weapons.beam.width).toBeGreaterThan(b.width);
  expect(s.weapons.beam.cooldown).toBeLessThan(b.cooldown);
  expect(s.weapons.beam.count).toBe(2);
  expect(s.weapons.nova.damage).toBeGreaterThan(n.damage);
  expect(s.weapons.nova.maxRadius).toBeGreaterThan(n.maxRadius);
  expect(s.weapons.nova.cooldown).toBeLessThan(n.cooldown);
  expect(s.weapons.nova.knockback).toBeGreaterThan(n.knockback);
  expect(s.weapons.flame.damage).toBeGreaterThan(f.damage);
  expect(s.weapons.flame.radius).toBeGreaterThan(f.radius);
  expect(s.weapons.flame.duration).toBeGreaterThan(f.duration);
});
