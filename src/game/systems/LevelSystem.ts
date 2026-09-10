import type { GameState } from "../core/GameState";
import { chooseUpgrades } from "../upgrades/upgrades";
export function expThreshold(level: number) {
  return Math.floor(10 * Math.pow(1.25, level - 1));
}
export function checkLevel(
  state: GameState,
  random: () => number = Math.random,
) {
  if (
    state.status !== "playing" ||
    state.player.exp < state.player.expToNextLevel
  )
    return;
  state.player.exp -= state.player.expToNextLevel;
  state.player.level++;
  state.player.expToNextLevel = expThreshold(state.player.level);
  state.choices = chooseUpgrades(state, random);
  state.status = "levelup";
}
