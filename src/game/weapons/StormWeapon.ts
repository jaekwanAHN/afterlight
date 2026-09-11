import type { GameState } from "../core/GameState";
import type { Enemy } from "../entities/Enemy";
import type { SpatialGrid } from "../utils/SpatialGrid";
import { circlesOverlap } from "../utils/collision";
import { damageEnemy } from "../systems/CombatSystem";
import { WEAPON_CONFIG } from "../config/weaponConfig";
// Picks `count` distinct random enemies on screen and blasts everything around each.
export function callStorm(
  state: GameState,
  grid: SpatialGrid<Enemy>,
  dt: number,
  random: () => number = Math.random,
) {
  const w = state.weapons.storm;
  if (!w.level) return;
  w.timer = Math.max(0, w.timer - dt);
  if (w.timer > 0) return;
  const halfW = state.viewport.width / 2,
    halfH = state.viewport.height / 2;
  const visible = state.enemies.filter(
    (e) =>
      !e.dead &&
      Math.abs(e.x - state.player.x) <= halfW &&
      Math.abs(e.y - state.player.y) <= halfH,
  );
  if (!visible.length) return;
  w.timer = w.cooldown;
  state.sounds.push("storm");
  // Partial Fisher-Yates: each pick is moved past `end` so it can't be chosen again.
  let end = visible.length;
  for (let i = 0; i < w.count && end > 0; i++) {
    const idx = Math.min(end - 1, Math.floor(random() * end));
    const target = visible[idx];
    visible[idx] = visible[--end];
    strike(state, grid, target.x, target.y);
  }
}
function strike(
  state: GameState,
  grid: SpatialGrid<Enemy>,
  x: number,
  y: number,
) {
  const w = state.weapons.storm;
  const area = { x, y, radius: w.radius };
  for (const enemy of grid.query(x, y, w.radius + 24))
    if (!enemy.dead && circlesOverlap(area, enemy))
      damageEnemy(enemy, w.damage);
  state.effects.push({
    kind: "strike",
    x,
    y,
    radius: w.radius,
    color: "#ffd166",
    life: WEAPON_CONFIG.storm.flashDuration,
    duration: WEAPON_CONFIG.storm.flashDuration,
  });
}
