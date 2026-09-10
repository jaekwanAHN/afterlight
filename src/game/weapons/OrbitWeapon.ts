import type { GameState } from "../core/GameState";
import type { Enemy } from "../entities/Enemy";
import type { SpatialGrid } from "../utils/SpatialGrid";
import { circlesOverlap } from "../utils/collision";
import { damageEnemy } from "../systems/CombatSystem";
import { WEAPON_CONFIG } from "../config/weaponConfig";
export function orbitPositions(state: GameState) {
  const w = state.weapons.orbit;
  if (!w.level) return [];
  return Array.from({ length: w.count }, (_, i) => {
    const angle = w.angle + (i * Math.PI * 2) / w.count;
    return {
      x: state.player.x + Math.cos(angle) * w.distance,
      y: state.player.y + Math.sin(angle) * w.distance,
      radius: w.radius,
    };
  });
}
export function updateOrbit(
  state: GameState,
  grid: SpatialGrid<Enemy>,
  dt: number,
) {
  const w = state.weapons.orbit;
  if (!w.level) return;
  w.angle = (w.angle + w.speed * dt) % (Math.PI * 2);
  for (const orb of orbitPositions(state))
    for (const enemy of grid.query(orb.x, orb.y, orb.radius + 24)) {
      if (
        !enemy.dead &&
        state.elapsed >= enemy.orbitHitAt &&
        circlesOverlap(orb, enemy)
      ) {
        damageEnemy(enemy, w.damage);
        enemy.orbitHitAt = state.elapsed + WEAPON_CONFIG.orbit.hitInterval;
      }
    }
}
