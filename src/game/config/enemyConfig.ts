import type { EnemyKind } from "../entities/Enemy";
export const ENEMY_CONFIG: Record<
  EnemyKind,
  {
    maxHp: number;
    moveSpeed: number;
    damage: number;
    expReward: number;
    radius: number;
    color: string;
  }
> = {
  normal: {
    maxHp: 20,
    moveSpeed: 60,
    damage: 10,
    expReward: 1,
    radius: 15,
    color: "#fa7183",
  },
  fast: {
    maxHp: 12,
    moveSpeed: 100,
    damage: 8,
    expReward: 1,
    radius: 11,
    color: "#ffb45c",
  },
  tank: {
    maxHp: 60,
    moveSpeed: 35,
    damage: 15,
    expReward: 3,
    radius: 24,
    color: "#b395fc",
  },
  boss: {
    maxHp: 450,
    moveSpeed: 48,
    damage: 25,
    expReward: 40,
    radius: 38,
    color: "#ff5c8a",
  },
};
export const BOSS_CONFIG = {
  interval: 60,
  // Per-boss growth applied to the base stats: boss n gets (1 + rate · (n − 1)).
  hpGrowth: 0.55,
  speedGrowth: 0.12,
  damageGrowth: 0.1,
};
export const SPAWN_CONFIG = {
  initialInterval: 0.8,
  minInterval: 0.075,
  margin: 70,
  maxEnemies: 900,
  fastAt: 60,
  tankAt: 180,
  separationStrength: 45,
  maxSeparationNeighbors: 16,
  knockbackDecay: 6,
};
export function difficultyAt(elapsed: number) {
  return 1 + elapsed / 120;
}
