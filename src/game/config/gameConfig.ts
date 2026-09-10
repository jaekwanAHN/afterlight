export const GAME_CONFIG = {
  duration: 600,
  maxDelta: 0.05,
  fixedStep: 1 / 60,
  hudInterval: 0.1,
  player: {
    maxHp: 100,
    moveSpeed: 220,
    radius: 14,
    pickupRadius: 60,
    invincibleDuration: 0.5,
  },
  gridSize: 64,
  backgroundGrid: 80,
  maxDpr: 2,
} as const;
