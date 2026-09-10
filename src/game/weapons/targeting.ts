import type { GameState } from "../core/GameState";
import type { Enemy } from "../entities/Enemy";
import { distanceSq } from "../utils/math";
export function nearestEnemy(state: GameState, range: number) {
  let nearest: Enemy | null = null;
  let best = range ** 2;
  for (const enemy of state.enemies) {
    if (enemy.dead) continue;
    const d = distanceSq(enemy, state.player);
    if (d < best) {
      best = d;
      nearest = enemy;
    }
  }
  return nearest;
}
