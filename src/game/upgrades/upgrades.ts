import type { Upgrade, UpgradeChoice } from "./upgradeTypes";
import type { GameState } from "../core/GameState";
import { pickRandom } from "../utils/random";
import { BOLT_UPGRADES } from "./bolt";
import { ORBIT_UPGRADES } from "./orbit";
import { BOOMERANG_UPGRADES } from "./boomerang";
import { STORM_UPGRADES } from "./storm";
import { BEAM_UPGRADES } from "./beam";
import { NOVA_UPGRADES } from "./nova";
import { FLAME_UPGRADES } from "./flame";
import { PASSIVE_UPGRADES } from "./passive";
// One file per weapon; register new weapons here so level-ups can offer them.
export const UPGRADES: Upgrade[] = [
  ...BOLT_UPGRADES,
  ...ORBIT_UPGRADES,
  ...BOOMERANG_UPGRADES,
  ...STORM_UPGRADES,
  ...BEAM_UPGRADES,
  ...NOVA_UPGRADES,
  ...FLAME_UPGRADES,
  ...PASSIVE_UPGRADES,
];
export function chooseUpgrades(
  state: GameState,
  random: () => number = Math.random,
): UpgradeChoice[] {
  let candidates = UPGRADES.filter(
    (u) =>
      (state.upgradeLevels[u.id] ?? 0) < u.maxLevel &&
      (!u.requires || (state.upgradeLevels[u.requires] ?? 0) > 0),
  );
  const main = candidates.filter((u) => !u.fallback);
  if (main.length >= 3) candidates = main;
  return pickRandom(candidates, 3, random).map((u) => ({
    id: u.id,
    name: u.name,
    description: u.description,
    category: u.category,
    icon: u.icon,
    rank: (state.upgradeLevels[u.id] ?? 0) + 1,
    maxLevel: u.maxLevel,
  }));
}
export function applyUpgrade(state: GameState, id: string) {
  if (state.status !== "levelup" || !state.choices.some((c) => c.id === id))
    return false;
  const upgrade = UPGRADES.find((u) => u.id === id);
  if (
    !upgrade ||
    (state.upgradeLevels[id] ?? 0) >= upgrade.maxLevel ||
    (upgrade.requires && !(state.upgradeLevels[upgrade.requires] ?? 0))
  )
    return false;
  upgrade.apply(state);
  state.upgradeLevels[id] = (state.upgradeLevels[id] ?? 0) + 1;
  state.choices = [];
  state.status = "playing";
  state.sounds.push("select");
  return true;
}
