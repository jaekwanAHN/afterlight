import type { GameState } from "../core/GameState";
import { distanceSq, normalize } from "../utils/math";
export function collectExperience(state: GameState, dt: number) {
  const p = state.player;
  let collected = false;
  for (const orb of state.orbs) {
    const d = distanceSq(orb, p);
    if (d <= p.pickupRadius ** 2) orb.attracted = true;
    if (!orb.attracted) continue;
    const step = (380 + Math.sqrt(d) * 4) * dt;
    if (d <= (p.radius + orb.radius + step) ** 2) {
      p.exp += orb.value;
      orb.dead = true;
      collected = true;
    } else {
      const direction = normalize(p.x - orb.x, p.y - orb.y);
      orb.x += direction.x * step;
      orb.y += direction.y * step;
    }
  }
  if (collected) state.sounds.push("pickup");
  state.orbs = state.orbs.filter((o) => !o.dead);
}
// Merge distant drops only when the field is crowded; no experience value is discarded.
export function compactOrbs(state: GameState) {
  if (state.orbs.length < 1200) return;
  const cells = new Map<string, (typeof state.orbs)[number]>();
  state.orbs = state.orbs.filter((orb) => {
    if (orb.attracted || distanceSq(orb, state.player) < 400 ** 2) return true;
    const key = `${Math.floor(orb.x / 120)},${Math.floor(orb.y / 120)}`;
    const existing = cells.get(key);
    if (existing) {
      existing.value += orb.value;
      existing.radius = 6;
      return false;
    }
    cells.set(key, orb);
    return true;
  });
}
