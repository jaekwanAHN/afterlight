import type { GameState } from "../core/GameState";
import type { Enemy } from "../entities/Enemy";
import type { SpatialGrid } from "../utils/SpatialGrid";
import { segmentHitsCircle } from "../utils/collision";
export function damageEnemy(enemy: Enemy, damage: number) {
  if (enemy.dead) return;
  enemy.hp = Math.max(0, enemy.hp - damage);
  enemy.flash = 0.1;
  if (enemy.hp <= 0) enemy.dead = true;
}
export function updateProjectiles(
  state: GameState,
  grid: SpatialGrid<Enemy>,
  dt: number,
) {
  for (const p of state.projectiles) {
    p.previousX = p.x;
    p.previousY = p.y;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.lifetime -= dt;
    const candidates = grid.query(
      (p.x + p.previousX) / 2,
      (p.y + p.previousY) / 2,
      Math.hypot(p.x - p.previousX, p.y - p.previousY) / 2 + p.radius + 24,
    );
    let target: Enemy | undefined;
    let nearest = Infinity;
    for (const e of candidates) {
      if (
        !e.dead &&
        segmentHitsCircle({ x: p.previousX, y: p.previousY }, p, e, p.radius)
      ) {
        const d = (e.x - p.previousX) ** 2 + (e.y - p.previousY) ** 2;
        if (d < nearest) {
          nearest = d;
          target = e;
        }
      }
    }
    if (target) {
      damageEnemy(target, p.damage);
      p.dead = true;
    }
    if (p.lifetime <= 0) p.dead = true;
  }
  state.projectiles = state.projectiles.filter((p) => !p.dead);
}
export function collectDeaths(state: GameState) {
  for (const enemy of state.enemies) {
    if (!enemy.dead) continue;
    state.kills++;
    state.orbs.push({
      id: state.nextId++,
      x: enemy.x,
      y: enemy.y,
      radius: 4,
      value: enemy.expReward,
      attracted: false,
      dead: false,
    });
    state.effects.push({
      x: enemy.x,
      y: enemy.y,
      radius: enemy.radius,
      color:
        enemy.kind === "tank"
          ? "#b395fc"
          : enemy.kind === "fast"
            ? "#ffb45c"
            : "#fa7183",
      life: 0.3,
      duration: 0.3,
    });
  }
  state.enemies = state.enemies.filter((e) => !e.dead);
}
export function updateEffects(state: GameState, dt: number) {
  for (const e of state.effects) e.life -= dt;
  state.effects = state.effects.filter((e) => e.life > 0);
}
