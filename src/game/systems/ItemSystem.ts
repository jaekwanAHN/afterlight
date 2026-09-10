import type { GameState } from "../core/GameState";
import type { ItemKind } from "../entities/Item";
import { ITEM_CONFIG } from "../config/itemConfig";
import { circlesOverlap } from "../utils/collision";
export function nextItemDelay(random: () => number = Math.random) {
  return (
    ITEM_CONFIG.minInterval +
    random() * (ITEM_CONFIG.maxInterval - ITEM_CONFIG.minInterval)
  );
}
export function spawnItems(
  state: GameState,
  dt: number,
  random: () => number = Math.random,
) {
  state.itemTimer -= dt;
  if (state.itemTimer > 0) return;
  state.itemTimer = nextItemDelay(random);
  if (state.items.length >= ITEM_CONFIG.maxAlive) return;
  const kind: ItemKind = random() < 0.5 ? "magnet" : "bomb";
  const half = Math.hypot(state.viewport.width, state.viewport.height) / 2;
  const distance =
    half *
    (ITEM_CONFIG.spawnMin +
      random() * (ITEM_CONFIG.spawnMax - ITEM_CONFIG.spawnMin));
  const angle = random() * Math.PI * 2;
  state.items.push({
    id: state.nextId++,
    kind,
    x: state.player.x + Math.cos(angle) * distance,
    y: state.player.y + Math.sin(angle) * distance,
    radius: ITEM_CONFIG.radius,
    life: ITEM_CONFIG.lifetime,
    dead: false,
  });
}
export function collectItems(state: GameState, dt: number) {
  const p = state.player;
  for (const item of state.items) {
    item.life -= dt;
    if (item.life <= 0) {
      item.dead = true;
      continue;
    }
    if (!circlesOverlap(p, item)) continue;
    item.dead = true;
    if (item.kind === "magnet") activateMagnet(state);
    else detonateBomb(state);
  }
  state.items = state.items.filter((i) => !i.dead);
}
// Every orb on the field flies to the player; ExperienceSystem handles the pull.
export function activateMagnet(state: GameState) {
  for (const orb of state.orbs) orb.attracted = true;
  state.sounds.push("magnet");
}
// Kills everything on screen. Bodies still drop experience through collectDeaths.
export function detonateBomb(state: GameState) {
  const halfW = state.viewport.width / 2,
    halfH = state.viewport.height / 2;
  for (const e of state.enemies)
    if (
      !e.dead &&
      Math.abs(e.x - state.player.x) <= halfW &&
      Math.abs(e.y - state.player.y) <= halfH
    ) {
      e.hp = 0;
      e.dead = true;
    }
  state.effects.push({
    kind: "blast",
    x: state.player.x,
    y: state.player.y,
    radius: Math.hypot(halfW, halfH),
    color: "#ffb35c",
    life: ITEM_CONFIG.blastDuration,
    duration: ITEM_CONFIG.blastDuration,
  });
  state.sounds.push("bomb");
}
