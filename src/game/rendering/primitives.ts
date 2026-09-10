export function circle(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string,
) {
  c.fillStyle = fill;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}
export function diamond(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string,
) {
  c.fillStyle = fill;
  c.beginPath();
  c.moveTo(x, y - r);
  c.lineTo(x + r * 0.7, y);
  c.lineTo(x, y + r);
  c.lineTo(x - r * 0.7, y);
  c.closePath();
  c.fill();
}
export function ring(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  width = 1,
) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.stroke();
}
