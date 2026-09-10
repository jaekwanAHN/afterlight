import type { GameState } from "../core/GameState";
import type { Enemy } from "../entities/Enemy";
import type { SpatialGrid } from "../utils/SpatialGrid";
import { damageEnemy } from "../systems/CombatSystem";
import { WEAPON_CONFIG } from "../config/weaponConfig";
export function fireNova(state: GameState, dt: number) {
  const w = state.weapons.nova;
  if (!w.level) return;
  w.timer = Math.max(0, w.timer - dt);
  if (w.timer > 0 || !state.enemies.length) return;
  w.timer = w.cooldown;
  state.sounds.push("nova");
  state.novas.push({
    x: state.player.x,
    y: state.player.y,
    radius: 0,
    maxRadius: w.maxRadius,
    damage: w.damage,
    knockback: w.knockback,
    hit: new Set(),
    dead: false,
  });
}
// The shockwave ring expands outward; each enemy is struck once as the ring crosses it.
export function updateNovas(
  state: GameState,
  grid: SpatialGrid<Enemy>,
  dt: number,
) {
  const cfg = WEAPON_CONFIG.nova;
  for (const n of state.novas) {
    const previous = n.radius;
    n.radius = Math.min(n.maxRadius, n.radius + cfg.expandSpeed * dt);
    for (const enemy of grid.query(n.x, n.y, n.radius + 24)) {
      if (enemy.dead || n.hit.has(enemy.id)) continue;
      const dx = enemy.x - n.x,
        dy = enemy.y - n.y,
        d = Math.hypot(dx, dy);
      if (d > n.radius + enemy.radius || d < previous - cfg.thickness) continue;
      n.hit.add(enemy.id);
      damageEnemy(enemy, n.damage);
      const nx = d ? dx / d : 1,
        ny = d ? dy / d : 0;
      enemy.pushX += nx * n.knockback;
      enemy.pushY += ny * n.knockback;
    }
    if (n.radius >= n.maxRadius) n.dead = true;
  }
  state.novas = state.novas.filter((n) => !n.dead);
}
