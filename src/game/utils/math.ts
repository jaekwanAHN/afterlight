export interface Vec2 {
  x: number;
  y: number;
}
export function normalize(x: number, y: number): Vec2 {
  const length = Math.hypot(x, y);
  return length > 0 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
}
export function distanceSq(a: Vec2, b: Vec2) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}
export function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}
