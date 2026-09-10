export interface Nova {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  damage: number;
  knockback: number;
  hit: Set<number>;
  dead: boolean;
}
