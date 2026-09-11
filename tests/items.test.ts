import { expect, it } from "vitest";
import { createState } from "../src/game/core/GameState";
import { makeEnemy } from "../src/game/systems/EnemySpawnSystem";
import { collectExperience } from "../src/game/systems/ExperienceSystem";
import { collectDeaths } from "../src/game/systems/CombatSystem";
import {
  collectItems,
  healPlayer,
  nextItemDelay,
  spawnItems,
} from "../src/game/systems/ItemSystem";
import { ITEM_CONFIG } from "../src/game/config/itemConfig";
import type { GameState } from "../src/game/core/GameState";
import type { ItemKind } from "../src/game/entities/Item";
function item(s: GameState, kind: ItemKind, x = 0, y = 0) {
  const i = {
    id: s.nextId++,
    kind,
    x,
    y,
    radius: ITEM_CONFIG.radius,
    dead: false,
  };
  s.items.push(i);
  return i;
}
it("spawns about once per 50s, never before the first window, and keeps piling up", () => {
  const s = createState();
  spawnItems(s, ITEM_CONFIG.firstAt - 1, () => 0.5);
  expect(s.items).toHaveLength(0);
  spawnItems(s, 1, () => 0.5);
  expect(s.items).toHaveLength(1);
  const delay = nextItemDelay(() => 0.5);
  expect(delay).toBe(50);
  expect(nextItemDelay(() => 0)).toBe(ITEM_CONFIG.minInterval);
  expect(nextItemDelay(() => 1)).toBe(ITEM_CONFIG.maxInterval);
  expect(s.itemTimer).toBe(delay);
  // No cap on alive items: uncollected ones simply accumulate.
  for (let i = 0; i < 5; i++) spawnItems(s, delay, () => 0.5);
  expect(s.items).toHaveLength(6);
  const half = Math.hypot(s.viewport.width, s.viewport.height) / 2;
  for (const i of s.items) {
    const d = Math.hypot(i.x - s.player.x, i.y - s.player.y);
    expect(d).toBeGreaterThanOrEqual(half * ITEM_CONFIG.spawnMin - 1);
    expect(d).toBeLessThanOrEqual(half * ITEM_CONFIG.spawnMax + 1);
  }
});
it("magnet pulls every orb on the field to the player", () => {
  const s = createState();
  s.status = "playing";
  for (let i = 0; i < 3; i++)
    s.orbs.push({
      id: i,
      x: 3000 * (i + 1),
      y: -2000,
      radius: 4,
      value: 2,
      attracted: false,
      dead: false,
    });
  item(s, "magnet");
  collectItems(s);
  expect(s.items).toHaveLength(0);
  expect(s.orbs.every((o) => o.attracted)).toBe(true);
  expect(s.sounds).toContain("magnet");
  for (let i = 0; i < 600 && s.orbs.length; i++) collectExperience(s, 1 / 60);
  expect(s.orbs).toHaveLength(0);
  expect(s.player.exp).toBe(6);
});
it("bomb kills only enemies on screen and they still drop experience", () => {
  const s = createState();
  const near = makeEnemy(s, "tank");
  near.x = 300;
  near.y = 100;
  const far = makeEnemy(s, "tank");
  far.x = 3000;
  far.y = 0;
  s.enemies.push(near, far);
  item(s, "bomb");
  collectItems(s);
  expect(near.dead).toBe(true);
  expect(far.dead).toBe(false);
  expect(s.effects.some((e) => e.kind === "blast")).toBe(true);
  expect(s.sounds).toContain("bomb");
  collectDeaths(s);
  expect(s.kills).toBe(1);
  expect(s.orbs).toHaveLength(1);
});
it("every item kind can spawn with equal odds", () => {
  const kinds = new Set<ItemKind>();
  for (const r of [0, 0.34, 0.67, 0.999]) {
    const s = createState();
    spawnItems(s, ITEM_CONFIG.firstAt, () => r);
    kinds.add(s.items[0].kind);
  }
  expect([...kinds].sort()).toEqual(["bomb", "heal", "magnet"]);
});
it("items never expire and are ignored when out of reach", () => {
  const s = createState();
  item(s, "bomb", 500, 0);
  for (let i = 0; i < 60 * 600; i++) collectItems(s);
  expect(s.items).toHaveLength(1);
  expect(s.sounds).toHaveLength(0);
});
it("heal restores a share of max HP without overflowing", () => {
  const s = createState();
  s.player.maxHp = 200;
  s.player.hp = 50;
  item(s, "heal");
  collectItems(s);
  expect(s.items).toHaveLength(0);
  expect(s.player.hp).toBe(50 + 200 * ITEM_CONFIG.healFraction);
  expect(s.sounds).toContain("heal");
  expect(s.effects).toHaveLength(1);
  s.player.hp = 190;
  healPlayer(s);
  expect(s.player.hp).toBe(200);
});
