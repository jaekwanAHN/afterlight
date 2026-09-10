export interface Projectile {
  id: number;
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  lifetime: number;
  dead: boolean;
}
