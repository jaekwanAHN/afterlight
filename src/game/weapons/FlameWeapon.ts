import type { GameState } from "../core/GameState";
import type { Enemy } from "../entities/Enemy";
import type { SpatialGrid } from "../utils/SpatialGrid";
import { circlesOverlap } from "../utils/collision";
import { damageEnemy } from "../systems/CombatSystem";
import { WEAPON_CONFIG } from "../config/weaponConfig";
import { distanceSq } from "../utils/math";
export function dropFlames(state: GameState) {
  const w = state.weapons.flame;
  if (!w.level) return;
  const cfg = WEAPON_CONFIG.flame;
  const p = state.player;
  if (distanceSq(p, { x: w.lastX, y: w.lastY }) < cfg.dropDistance ** 2) return;
  w.lastX = p.x;
  w.lastY = p.y;
  if (state.flames.length >= cfg.maxPatches) state.flames.shift();
  state.sounds.push("flame");
  state.flames.push({
    x: p.x,
    y: p.y,
    radius: w.radius,
    damage: w.damage,
    life: w.duration,
    duration: w.duration,
    tick: 0,
    seed: state.nextId++,
  });
}
export function updateFlames(
  state: GameState,
  grid: SpatialGrid<Enemy>,
  dt: number,
) {
  const cfg = WEAPON_CONFIG.flame;
  for (const f of state.flames) {
    f.life -= dt;
    f.tick -= dt;
    if (f.tick > 0) continue;
    f.tick = cfg.tickInterval;
    for (const enemy of grid.query(f.x, f.y, f.radius + 24))
      if (!enemy.dead && circlesOverlap(f, enemy)) damageEnemy(enemy, f.damage);
  }
  state.flames = state.flames.filter((f) => f.life > 0);
}
