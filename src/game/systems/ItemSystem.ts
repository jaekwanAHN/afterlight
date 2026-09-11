import type { GameState } from "../core/GameState";
import type { ItemKind } from "../entities/Item";
import { ITEM_CONFIG } from "../config/itemConfig";
import { circlesOverlap } from "../utils/collision";
const ITEM_KINDS: ItemKind[] = ["magnet", "bomb", "heal"];
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
  const kind =
    ITEM_KINDS[
      Math.min(ITEM_KINDS.length - 1, Math.floor(random() * ITEM_KINDS.length))
    ];
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
    dead: false,
  });
}
// Items never expire: they stay on the field until the player walks over them.
export function collectItems(state: GameState) {
  const p = state.player;
  for (const item of state.items) {
    if (!circlesOverlap(p, item)) continue;
    item.dead = true;
    if (item.kind === "magnet") activateMagnet(state);
    else if (item.kind === "bomb") detonateBomb(state);
    else healPlayer(state);
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
export function healPlayer(state: GameState) {
  const p = state.player;
  p.hp = Math.min(p.maxHp, p.hp + p.maxHp * ITEM_CONFIG.healFraction);
  // Reuses the generic burst effect: an expanding green ring around the player.
  state.effects.push({
    x: p.x,
    y: p.y,
    radius: 30,
    color: "#8cf5a6",
    life: 0.5,
    duration: 0.5,
  });
  state.sounds.push("heal");
}
