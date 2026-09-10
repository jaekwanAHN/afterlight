import type { GameState } from "../core/GameState";
import { segmentHitsCircle } from "../utils/collision";
import { damageEnemy } from "../systems/CombatSystem";
import { WEAPON_CONFIG } from "../config/weaponConfig";
import { nearestEnemy } from "./targeting";
export function beamEnd(state: GameState, angle: number) {
  return {
    x: state.player.x + Math.cos(angle) * WEAPON_CONFIG.beam.length,
    y: state.player.y + Math.sin(angle) * WEAPON_CONFIG.beam.length,
  };
}
// Cooldown → charge → one burst that damages everything on its line → visual fade.
export function updateBeams(state: GameState, dt: number) {
  const w = state.weapons.beam;
  const cfg = WEAPON_CONFIG.beam;
  for (const b of state.beams) b.life -= dt;
  state.beams = state.beams.filter((b) => b.life > 0);
  if (!w.level) return;
  if (w.charge > 0) {
    w.charge = Math.max(0, w.charge - dt);
    if (w.charge > 0) return;
    fire(state);
    return;
  }
  w.timer = Math.max(0, w.timer - dt);
  if (w.timer > 0 || !nearestEnemy(state, cfg.length)) return;
  w.charge = cfg.chargeTime;
  state.sounds.push("beamCharge");
}
function fire(state: GameState) {
  const w = state.weapons.beam;
  const cfg = WEAPON_CONFIG.beam;
  const p = state.player;
  const target = nearestEnemy(state, cfg.length);
  const base = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.facing;
  w.timer = w.cooldown;
  state.sounds.push("beamFire");
  const half = w.width / 2;
  for (let i = 0; i < w.count; i++) {
    const angle = base + (i - (w.count - 1) / 2) * cfg.spread;
    const end = beamEnd(state, angle);
    for (const enemy of state.enemies)
      if (!enemy.dead && segmentHitsCircle(p, end, enemy, half))
        damageEnemy(enemy, w.damage);
    state.beams.push({
      angle,
      width: w.width,
      life: cfg.fadeDuration,
      duration: cfg.fadeDuration,
    });
  }
}
