import type { GameState } from "../core/GameState";
import type { Enemy } from "../entities/Enemy";
import type { SpatialGrid } from "../utils/SpatialGrid";
import { circlesOverlap } from "../utils/collision";
import { damageEnemy } from "../systems/CombatSystem";
import { WEAPON_CONFIG } from "../config/weaponConfig";
// Picks a random enemy currently on screen and blasts everything around it.
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
  const target = visible[Math.floor(random() * visible.length)];
  const area = { x: target.x, y: target.y, radius: w.radius };
  for (const enemy of grid.query(area.x, area.y, area.radius + 24))
    if (!enemy.dead && circlesOverlap(area, enemy))
      damageEnemy(enemy, w.damage);
  state.effects.push({
    kind: "strike",
    x: area.x,
    y: area.y,
    radius: area.radius,
    color: "#ffd166",
    life: WEAPON_CONFIG.storm.flashDuration,
    duration: WEAPON_CONFIG.storm.flashDuration,
  });
}
