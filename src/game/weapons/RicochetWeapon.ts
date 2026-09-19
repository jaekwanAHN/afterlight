import type { GameState } from "../core/GameState";
import { WEAPON_CONFIG } from "../config/weaponConfig";
import { distanceSq } from "../utils/math";
export function fireRicochet(state: GameState, dt: number) {
  const w = state.weapons.ricochet;
  if (!w.level) return;
  w.timer = Math.max(0, w.timer - dt);
  if (w.timer > 0) return;
  const config = WEAPON_CONFIG.ricochet;
  const targets = state.enemies
    .filter((e) => !e.dead && distanceSq(e, state.player) <= config.range ** 2)
    .sort((a, b) => distanceSq(a, state.player) - distanceSq(b, state.player));
  if (!targets.length) return;
  w.timer = w.cooldown;
  state.sounds.push("bolt");
  let alive = state.projectiles.filter((p) => p.kind === "ricochet").length;
  for (let i = 0; i < w.count && alive < config.maxProjectiles; i++, alive++) {
    const target = targets[i % targets.length];
    const angle = Math.atan2(
      target.y - state.player.y,
      target.x - state.player.x,
    );
    state.projectiles.push({
      id: state.nextId++,
      kind: "ricochet",
      x: state.player.x,
      y: state.player.y,
      previousX: state.player.x,
      previousY: state.player.y,
      vx: Math.cos(angle) * w.speed,
      vy: Math.sin(angle) * w.speed,
      radius: config.radius,
      damage: w.damage,
      lifetime: config.lifetime,
      bounces: w.bounces,
      targetId: target.id,
      hitIds: new Set(),
      dead: false,
    });
  }
}
