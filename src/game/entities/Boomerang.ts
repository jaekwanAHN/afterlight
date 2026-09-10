export interface Boomerang {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Unit launch direction; deceleration is applied against it until the throw reverses.
  dirX: number;
  dirY: number;
  radius: number;
  damage: number;
  speed: number;
  spin: number;
  lifetime: number;
  returning: boolean;
  // Each enemy takes one hit per pass, then becomes eligible again on the return leg.
  hit: Set<number>;
  dead: boolean;
}
