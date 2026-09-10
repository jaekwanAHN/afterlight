export type EnemyKind = "normal" | "fast" | "tank";
export interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  moveSpeed: number;
  damage: number;
  expReward: number;
  flash: number;
  orbitHitAt: number;
  dead: boolean;
}
