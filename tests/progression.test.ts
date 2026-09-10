import { expect, it } from "vitest";
import { createState } from "../src/game/core/GameState";
import {
  collectExperience,
  compactOrbs,
} from "../src/game/systems/ExperienceSystem";
import { checkLevel, expThreshold } from "../src/game/systems/LevelSystem";
import {
  UPGRADES,
  chooseUpgrades,
  applyUpgrade,
} from "../src/game/upgrades/upgrades";
import { pickRandom } from "../src/game/utils/random";
it("scales experience thresholds", () => {
  expect(expThreshold(1)).toBe(10);
  expect(expThreshold(4)).toBe(19);
});
it("offers unique uncapped upgrades including endgame fallbacks", () => {
  const s = createState();
  for (const u of UPGRADES)
    if (Number.isFinite(u.maxLevel)) s.upgradeLevels[u.id] = u.maxLevel;
  const choices = chooseUpgrades(s);
  expect(new Set(choices.map((c) => c.id)).size).toBe(3);
  expect(choices.every((c) => !Number.isFinite(c.maxLevel))).toBe(true);
});
it("random sampling leaves source unchanged", () => {
  const a = [1, 2, 3, 4];
  expect(new Set(pickRandom(a, 3)).size).toBe(3);
  expect(a).toEqual([1, 2, 3, 4]);
});
it("collects gems and carries excess experience across multiple levels", () => {
  const s = createState();
  s.status = "playing";
  s.orbs.push({
    id: 1,
    x: 0,
    y: 0,
    radius: 4,
    value: 25,
    attracted: false,
    dead: false,
  });
  collectExperience(s, 0.01);
  checkLevel(s);
  expect(s.status).toBe("levelup");
  expect(s.player.exp).toBe(15);
  expect(applyUpgrade(s, "invalid")).toBe(false);
  applyUpgrade(s, s.choices[0].id);
  checkLevel(s);
  expect(s.player.level).toBe(3);
  expect(s.player.exp).toBe(3);
});
it("applies actual damage upgrade exactly once", () => {
  const s = createState();
  s.status = "levelup";
  s.choices = [{ ...UPGRADES[0], rank: 1 }];
  expect(applyUpgrade(s, "power")).toBe(true);
  expect(s.weapons.bolt.damage).toBe(12);
  expect(applyUpgrade(s, "power")).toBe(false);
});
it("compacts gems without losing experience", () => {
  const s = createState();
  s.orbs = Array.from({ length: 1300 }, (_, id) => ({
    id,
    x: 1000,
    y: 1000,
    radius: 4,
    value: 3,
    attracted: false,
    dead: false,
  }));
  compactOrbs(s);
  expect(s.orbs).toHaveLength(1);
  expect(s.orbs[0].value).toBe(3900);
});
