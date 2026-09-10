import type { Vec2 } from "./math";
export interface Circle extends Vec2 {
  radius: number;
}
export function circlesOverlap(a: Circle, b: Circle) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 <= (a.radius + b.radius) ** 2;
}
// Swept circle check prevents fast projectiles passing through an enemy between frames.
export function segmentHitsCircle(
  from: Vec2,
  to: Vec2,
  target: Circle,
  radius: number,
) {
  const dx = to.x - from.x,
    dy = to.y - from.y;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq
    ? Math.max(
        0,
        Math.min(
          1,
          ((target.x - from.x) * dx + (target.y - from.y) * dy) / lengthSq,
        ),
      )
    : 0;
  return (
    (from.x + dx * t - target.x) ** 2 + (from.y + dy * t - target.y) ** 2 <=
    (target.radius + radius) ** 2
  );
}
