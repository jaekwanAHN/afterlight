import type { GameState } from "../core/GameState";
import {
  BOSS_CONFIG,
  ENEMY_CONFIG,
  SPAWN_CONFIG,
  difficultyAt,
} from "../config/enemyConfig";
import type { Enemy, EnemyKind } from "../entities/Enemy";
export function spawnPosition(
  state: GameState,
  random: () => number = Math.random,
) {
  const angle = random() * Math.PI * 2;
  const radius =
    Math.hypot(state.viewport.width / 2, state.viewport.height / 2) +
    SPAWN_CONFIG.margin;
  return {
    x: state.player.x + Math.cos(angle) * radius,
    y: state.player.y + Math.sin(angle) * radius,
  };
}
export function makeEnemy(
  state: GameState,
  kind: EnemyKind,
  random: () => number = Math.random,
): Enemy {
  const config = ENEMY_CONFIG[kind];
  const maxHp = config.maxHp * (1 + Math.max(0, state.elapsed - 300) / 240);
  return {
    id: state.nextId++,
    kind,
    ...spawnPosition(state, random),
    ...config,
    maxHp,
    hp: maxHp,
    bossIndex: 0,
    flash: 0,
    orbitHitAt: 0,
    beamHitAt: 0,
    pushX: 0,
    pushY: 0,
    dead: false,
  };
}
export function makeBoss(
  state: GameState,
  index: number,
  random: () => number = Math.random,
): Enemy {
  const boss = makeEnemy(state, "boss", random);
  const grow = (rate: number) => 1 + rate * (index - 1);
  boss.bossIndex = index;
  boss.maxHp = Math.round(ENEMY_CONFIG.boss.maxHp * grow(BOSS_CONFIG.hpGrowth));
  boss.hp = boss.maxHp;
  boss.moveSpeed = ENEMY_CONFIG.boss.moveSpeed * grow(BOSS_CONFIG.speedGrowth);
  boss.damage = Math.round(
    ENEMY_CONFIG.boss.damage * grow(BOSS_CONFIG.damageGrowth),
  );
  boss.expReward = Math.round(
    ENEMY_CONFIG.boss.expReward * grow(BOSS_CONFIG.hpGrowth),
  );
  return boss;
}
// One boss per minute mark; a late frame never skips one because the count is tracked, not the time.
export function spawnBosses(
  state: GameState,
  random: () => number = Math.random,
) {
  const due = Math.floor(state.elapsed / BOSS_CONFIG.interval);
  while (state.bossesSpawned < due) {
    state.bossesSpawned++;
    state.enemies.push(makeBoss(state, state.bossesSpawned, random));
    state.sounds.push("boss");
  }
}
export function spawnEnemies(
  state: GameState,
  dt: number,
  random: () => number = Math.random,
) {
  state.spawnTimer -= dt;
  if (state.spawnTimer > 0) return;
  const difficulty = difficultyAt(state.elapsed);
  state.spawnTimer = Math.max(
    SPAWN_CONFIG.minInterval,
    SPAWN_CONFIG.initialInterval / difficulty,
  );
  const count = 1 + Math.floor(state.elapsed / 120);
  for (
    let i = 0;
    i < count && state.enemies.length < SPAWN_CONFIG.maxEnemies;
    i++
  ) {
    const roll = random();
    const kind: EnemyKind =
      state.elapsed >= SPAWN_CONFIG.tankAt && roll < 0.18
        ? "tank"
        : state.elapsed >= SPAWN_CONFIG.fastAt && roll < 0.5
          ? "fast"
          : "normal";
    state.enemies.push(makeEnemy(state, kind, random));
  }
}
