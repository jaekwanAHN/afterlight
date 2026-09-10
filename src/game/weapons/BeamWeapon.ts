import type { GameState } from "../core/GameState";
import { segmentHitsCircle } from "../utils/collision";
import { damageEnemy } from "../systems/CombatSystem";
import { WEAPON_CONFIG } from "../config/weaponConfig";
export function beamSegments(state: GameState) {
  const w = state.weapons.beam;
  if (!w.level) return [];
  const p = state.player;
  return Array.from({ length: w.count }, (_, i) => {
    const angle = w.angle + (i * Math.PI * 2) / w.count;
    return {
      x: p.x + Math.cos(angle) * WEAPON_CONFIG.beam.length,
      y: p.y + Math.sin(angle) * WEAPON_CONFIG.beam.length,
    };
  });
}
// Beams sweep the whole field, so every enemy is tested directly instead of via the grid.
export function updateBeams(state: GameState, dt: number) {
  const w = state.weapons.beam;
  if (!w.level) return;
  w.angle = (w.angle + w.speed * dt) % (Math.PI * 2);
  const ends = beamSegments(state);
  const half = w.width / 2;
  for (const enemy of state.enemies) {
    if (enemy.dead || state.elapsed < enemy.beamHitAt) continue;
    for (const end of ends) {
      if (segmentHitsCircle(state.player, end, enemy, half)) {
        damageEnemy(enemy, w.damage);
        enemy.beamHitAt = state.elapsed + WEAPON_CONFIG.beam.hitInterval;
        break;
      }
    }
  }
}
