import type { GameState } from "../core/GameState";
import type { Enemy } from "../entities/Enemy";
import type { SpatialGrid } from "../utils/SpatialGrid";
import { circlesOverlap } from "../utils/collision";
import { damageEnemy } from "../systems/CombatSystem";
import { WEAPON_CONFIG } from "../config/weaponConfig";
import { nearestEnemy } from "./targeting";
export function throwBoomerangs(state: GameState, dt: number) {
  const w = state.weapons.boomerang;
  if (!w.level) return;
  w.timer = Math.max(0, w.timer - dt);
  if (w.timer > 0) return;
  const nearest = nearestEnemy(state, WEAPON_CONFIG.boomerang.range);
  if (!nearest) return;
  w.timer = w.cooldown;
  state.sounds.push("boomerang");
  const angle = Math.atan2(
    nearest.y - state.player.y,
    nearest.x - state.player.x,
  );
  for (let i = 0; i < w.count; i++) {
    const a = angle + (i - (w.count - 1) / 2) * WEAPON_CONFIG.boomerang.spread;
    const dirX = Math.cos(a),
      dirY = Math.sin(a);
    state.boomerangs.push({
      id: state.nextId++,
      x: state.player.x,
      y: state.player.y,
      vx: dirX * w.speed,
      vy: dirY * w.speed,
      dirX,
      dirY,
      radius: WEAPON_CONFIG.boomerang.radius,
      damage: w.damage,
      speed: w.speed,
      spin: 0,
      lifetime: WEAPON_CONFIG.boomerang.lifetime,
      returning: false,
      hit: new Set(),
      dead: false,
    });
  }
}
export function updateBoomerangs(
  state: GameState,
  grid: SpatialGrid<Enemy>,
  dt: number,
) {
  const cfg = WEAPON_CONFIG.boomerang;
  const p = state.player;
  for (const b of state.boomerangs) {
    if (!b.returning) {
      b.vx -= b.dirX * cfg.returnAccel * dt;
      b.vy -= b.dirY * cfg.returnAccel * dt;
      if (b.vx * b.dirX + b.vy * b.dirY <= 0) {
        b.returning = true;
        b.hit.clear();
      }
    } else {
      // Home toward the player so the catch works even while they keep moving.
      const dx = p.x - b.x,
        dy = p.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= p.radius + b.radius) {
        b.dead = true;
        continue;
      }
      b.vx = (dx / dist) * b.speed;
      b.vy = (dy / dist) * b.speed;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.spin += cfg.spin * dt;
    b.lifetime -= dt;
    if (b.lifetime <= 0) b.dead = true;
    for (const enemy of grid.query(b.x, b.y, b.radius + 24)) {
      if (enemy.dead || b.hit.has(enemy.id) || !circlesOverlap(b, enemy))
        continue;
      damageEnemy(enemy, b.damage);
      b.hit.add(enemy.id);
    }
  }
  state.boomerangs = state.boomerangs.filter((b) => !b.dead);
}
