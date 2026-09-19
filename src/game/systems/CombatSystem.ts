import type { GameState } from "../core/GameState";
import type { Enemy } from "../entities/Enemy";
import type { SpatialGrid } from "../utils/SpatialGrid";
import { segmentHitsCircle } from "../utils/collision";
import { WEAPON_CONFIG } from "../config/weaponConfig";
import { distanceSq } from "../utils/math";
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
  const maxRadius = state.enemies.reduce(
    (radius, e) => Math.max(radius, e.radius),
    0,
  );
  const enemiesById = new Map(state.enemies.map((e) => [e.id, e]));
  for (const p of state.projectiles) {
    if (p.dead) continue;
    if (p.kind === "ricochet" && p.targetId !== undefined) {
      const target = enemiesById.get(p.targetId);
      if (target && !target.dead) {
        const angle = Math.atan2(target.y - p.y, target.x - p.x);
        const speed = Math.hypot(p.vx, p.vy);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      }
    }
    p.previousX = p.x;
    p.previousY = p.y;
    const step = Math.min(dt, Math.max(0, p.lifetime));
    p.x += p.vx * step;
    p.y += p.vy * step;
    p.lifetime -= dt;
    const from = { x: p.previousX, y: p.previousY };
    const dx = p.x - from.x,
      dy = p.y - from.y;
    const lengthSq = dx * dx + dy * dy;
    // Sort by first contact, so piercing hits follow flight order even across grid cells.
    const contactTime = (e: Enemy) => {
      const ox = from.x - e.x,
        oy = from.y - e.y;
      const c = ox * ox + oy * oy - (p.radius + e.radius) ** 2;
      if (c <= 0 || !lengthSq) return 0;
      const b = ox * dx + oy * dy;
      return Math.max(
        0,
        (-b - Math.sqrt(Math.max(0, b * b - lengthSq * c))) / lengthSq,
      );
    };
    const hits = grid
      .query(
        (from.x + p.x) / 2,
        (from.y + p.y) / 2,
        Math.hypot(dx, dy) / 2 + p.radius + maxRadius,
      )
      .filter(
        (e) =>
          !e.dead &&
          !p.hitIds?.has(e.id) &&
          segmentHitsCircle(from, p, e, p.radius),
      )
      .map((e) => ({ enemy: e, t: contactTime(e) }))
      .sort((a, b) => a.t - b.t || a.enemy.id - b.enemy.id);
    for (const { enemy, t } of hits) {
      damageEnemy(enemy, p.damage);
      (p.hitIds ??= new Set()).add(enemy.id);
      if (p.kind === "ricochet") {
        p.x = from.x + dx * t;
        p.y = from.y + dy * t;
        const range = WEAPON_CONFIG.ricochet.bounceRange;
        const next =
          (p.bounces ?? 0) > 0
            ? grid
                .query(enemy.x, enemy.y, range)
                .filter(
                  (e) =>
                    !e.dead &&
                    !p.hitIds!.has(e.id) &&
                    distanceSq(e, enemy) <= range ** 2,
                )
                .sort(
                  (a, b) =>
                    distanceSq(a, enemy) - distanceSq(b, enemy) || a.id - b.id,
                )[0]
            : undefined;
        if (next) {
          p.bounces!--;
          p.targetId = next.id;
          const angle = Math.atan2(next.y - p.y, next.x - p.x);
          const speed = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
        } else p.dead = true;
        break;
      }
      if ((p.pierce ?? 0) <= 0) {
        p.dead = true;
        break;
      }
      p.pierce!--;
    }
    if (p.lifetime <= 0) p.dead = true;
  }
  state.projectiles = state.projectiles.filter((p) => !p.dead);
}
export function collectDeaths(state: GameState) {
  let killed = false,
    bossKilled = false;
  for (const enemy of state.enemies) {
    if (!enemy.dead) continue;
    killed = true;
    if (enemy.kind === "boss") {
      bossKilled = true;
      state.pendingBossUpgrades++;
    }
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
        enemy.kind === "boss"
          ? "#ff5c8a"
          : enemy.kind === "tank"
            ? "#b395fc"
            : enemy.kind === "fast"
              ? "#ffb45c"
              : "#fa7183",
      life: 0.3,
      duration: 0.3,
    });
  }
  if (bossKilled) state.sounds.push("bossKill");
  else if (killed) state.sounds.push("kill");
  state.enemies = state.enemies.filter((e) => !e.dead);
}
export function updateEffects(state: GameState, dt: number) {
  for (const e of state.effects) e.life -= dt;
  state.effects = state.effects.filter((e) => e.life > 0);
}
