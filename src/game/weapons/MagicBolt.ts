import type { GameState } from "../core/GameState";
import { WEAPON_CONFIG } from "../config/weaponConfig";
import { distanceSq } from "../utils/math";
export function fireMagicBolt(state: GameState, dt: number) {
  const w = state.weapons.bolt;
  w.timer = Math.max(0, w.timer - dt);
  if (w.timer > 0) return;
  let nearest = null;
  let best = WEAPON_CONFIG.bolt.range ** 2;
  for (const enemy of state.enemies) {
    if (enemy.dead) continue;
    const d = distanceSq(enemy, state.player);
    if (d < best) {
      best = d;
      nearest = enemy;
    }
  }
  if (!nearest) return;
  w.timer = w.cooldown;
  const angle = Math.atan2(
    nearest.y - state.player.y,
    nearest.x - state.player.x,
  );
  for (
    let i = 0;
    i < w.projectileCount &&
    state.projectiles.length < WEAPON_CONFIG.bolt.maxProjectiles;
    i++
  ) {
    const a =
      angle + (i - (w.projectileCount - 1) / 2) * WEAPON_CONFIG.bolt.spread;
    state.projectiles.push({
      id: state.nextId++,
      x: state.player.x,
      y: state.player.y,
      previousX: state.player.x,
      previousY: state.player.y,
      vx: Math.cos(a) * w.projectileSpeed,
      vy: Math.sin(a) * w.projectileSpeed,
      radius: WEAPON_CONFIG.bolt.radius,
      damage: w.damage,
      lifetime: WEAPON_CONFIG.bolt.lifetime,
      dead: false,
    });
  }
}
