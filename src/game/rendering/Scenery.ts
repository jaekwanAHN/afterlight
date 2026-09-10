import { GAME_CONFIG } from "../config/gameConfig";
import { circle, ring } from "./primitives";
// Deterministic world decoration: scrolling never causes terrain to jump or flicker.
function noise(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
export function drawScenery(
  c: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  showGrid: boolean,
) {
  if (showGrid) {
    const grid = GAME_CONFIG.backgroundGrid;
    c.strokeStyle = "#182b2d";
    c.lineWidth = 0.6;
    c.beginPath();
    for (let x = Math.floor(left / grid) * grid; x < left + width; x += grid) {
      c.moveTo(x, top);
      c.lineTo(x, top + height);
    }
    for (let y = Math.floor(top / grid) * grid; y < top + height; y += grid) {
      c.moveTo(left, y);
      c.lineTo(left + width, y);
    }
    c.stroke();
  }
  const cell = 240;
  for (
    let ix = Math.floor(left / cell) - 1;
    ix < Math.ceil((left + width) / cell) + 1;
    ix++
  )
    for (
      let iy = Math.floor(top / cell) - 1;
      iy < Math.ceil((top + height) / cell) + 1;
      iy++
    ) {
      const n = noise(ix, iy),
        x = ix * cell + noise(ix + 3, iy) * 150,
        y = iy * cell + noise(ix, iy + 7) * 150;
      if (n > 0.79) {
        c.save();
        c.translate(x, y);
        c.rotate(n * 5);
        c.fillStyle = "#172a2b";
        c.strokeStyle = "#253b39";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(-12, -18);
        c.lineTo(8, -24);
        c.lineTo(19, 0);
        c.lineTo(9, 16);
        c.lineTo(-17, 11);
        c.closePath();
        c.fill();
        c.stroke();
        c.beginPath();
        c.moveTo(-12, -18);
        c.lineTo(0, -2);
        c.lineTo(19, 0);
        c.moveTo(0, -2);
        c.lineTo(9, 16);
        c.stroke();
        c.restore();
      } else if (n > 0.52) {
        c.strokeStyle = "#294139";
        c.lineWidth = 1;
        c.beginPath();
        for (let k = 0; k < 4; k++) {
          const bx = x + k * 5;
          c.moveTo(bx, y);
          c.lineTo(bx - 4 + k, y - 8 - noise(ix + k, iy) * 10);
        }
        c.stroke();
      } else if (n < 0.12) {
        ring(c, x, y, 30, "#1b302e");
        ring(c, x, y, 23, "#1b302e");
        c.strokeStyle = "#263932";
        c.strokeRect(x - 5, y - 5, 10, 10);
      }
      circle(c, x + 45, y + 23, 1, "#45614c");
      circle(c, x - 32, y + 61, 1, "#243d38");
    }
  // A landmark at the origin gives the endless field a memorable starting point.
  ring(c, 0, 0, 152, "#28443c", 2);
  ring(c, 0, 0, 160, "#172f2b");
  ring(c, 0, 0, 112, "#1d3530");
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    c.save();
    c.translate(Math.cos(a) * 135, Math.sin(a) * 135);
    c.rotate(a);
    c.fillStyle = "#375346";
    c.fillRect(-3, -1, 6, 2);
    c.restore();
  }
}
