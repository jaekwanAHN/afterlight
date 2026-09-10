import { expect, it } from "vitest";
import { Game } from "../src/game/core/Game";
import { createState } from "../src/game/core/GameState";
import { makeEnemy } from "../src/game/systems/EnemySpawnSystem";
import { moveEnemies } from "../src/game/systems/EnemyMovementSystem";
import { UPGRADES } from "../src/game/upgrades/upgrades";
import { beamSegments, updateBeams } from "../src/game/weapons/BeamWeapon";
import { fireNova, updateNovas } from "../src/game/weapons/NovaWeapon";
import { dropFlames, updateFlames } from "../src/game/weapons/FlameWeapon";
import { SpatialGrid } from "../src/game/utils/SpatialGrid";
import type { GameState } from "../src/game/core/GameState";
import type { SoundEvent } from "../src/game/audio/soundEvents";
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
it("beam burns everything along its line at a limited tick rate", () => {
  const s = createState();
  s.weapons.beam.level = 1;
  expect(beamSegments(s)).toHaveLength(1);
  const near = place(s, 100, 0);
  const far = place(s, 600, 0);
  const off = place(s, 0, 300);
  updateBeams(s, 0);
  updateBeams(s, 0);
  const dmg = s.weapons.beam.damage;
  expect(near.hp).toBe(near.maxHp - dmg);
  expect(far.hp).toBe(far.maxHp - dmg);
  expect(off.hp).toBe(off.maxHp);
  s.elapsed = 0.25;
  updateBeams(s, 0);
  expect(near.hp).toBe(near.maxHp - dmg * 2);
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
    "beam-speed",
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
  expect(s.weapons.beam.speed).toBeGreaterThan(b.speed);
  expect(s.weapons.beam.count).toBe(2);
  expect(beamSegments(s)).toHaveLength(2);
  expect(s.weapons.nova.damage).toBeGreaterThan(n.damage);
  expect(s.weapons.nova.maxRadius).toBeGreaterThan(n.maxRadius);
  expect(s.weapons.nova.cooldown).toBeLessThan(n.cooldown);
  expect(s.weapons.nova.knockback).toBeGreaterThan(n.knockback);
  expect(s.weapons.flame.damage).toBeGreaterThan(f.damage);
  expect(s.weapons.flame.radius).toBeGreaterThan(f.radius);
  expect(s.weapons.flame.duration).toBeGreaterThan(f.duration);
});
it("beam hum starts and stops with game status", () => {
  const played: SoundEvent[] = [];
  const g = new Game(() => {});
  g.setSoundSink((e) => played.push(e));
  g.start();
  expect(played).not.toContain("beamOn");
  g.state.weapons.beam.level = 1;
  g.pause();
  expect(played).not.toContain("beamOn");
  g.togglePause();
  expect(played.at(-1)).toBe("beamOn");
  g.pause();
  expect(played.at(-1)).toBe("beamOff");
  g.togglePause();
  g.home();
  expect(played.filter((e) => e === "beamOff")).toHaveLength(2);
});
