import type { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";
import type { Item } from "../entities/Item";
import { ITEM_CONFIG } from "../config/itemConfig";
import { ENEMY_CONFIG } from "../config/enemyConfig";
import { circle, diamond, ring } from "./primitives";
export function drawEnemy(
  c: CanvasRenderingContext2D,
  e: Enemy,
  effects: boolean,
) {
  const color = e.flash > 0 && effects ? "#ffffff" : ENEMY_CONFIG[e.kind].color;
  c.save();
  c.translate(e.x, e.y);
  circle(c, 2, 5, e.radius + 2, "#050b1099");
  if (e.kind === "boss") {
    // Jagged crown silhouette so a boss reads instantly among the crowd.
    ring(c, 0, 0, e.radius + 10, color + "33", 6);
    c.fillStyle = "#3a1230";
    c.strokeStyle = color;
    c.lineWidth = 3;
    c.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const r = i % 2 ? e.radius : e.radius + 9;
      const x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.fill();
    c.stroke();
    ring(c, 0, 0, e.radius * 0.55, "#ff9ab8", 2);
    circle(c, -9, -4, 4, color);
    circle(c, 9, -4, 4, color);
    c.fillStyle = "#ffd6e2";
    c.fillRect(-12, 8, 24, 3);
  } else if (e.kind === "fast") {
    c.fillStyle = "#532c24";
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, -e.radius - 3);
    c.lineTo(e.radius, 5);
    c.lineTo(0, e.radius);
    c.lineTo(-e.radius, 5);
    c.closePath();
    c.fill();
    c.stroke();
  } else if (e.kind === "tank") {
    c.fillStyle = "#302840";
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = Math.cos(a) * e.radius,
        y = Math.sin(a) * e.radius;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.fill();
    c.stroke();
    ring(c, 0, 0, e.radius - 6, "#8260a7");
  } else {
    circle(c, 0, 0, e.radius, "#40202d");
    ring(c, 0, 0, e.radius, color, 1.5);
    c.fillStyle = "#783244";
    c.beginPath();
    c.moveTo(-e.radius + 2, -6);
    c.lineTo(-e.radius - 2, -e.radius - 5);
    c.lineTo(-3, -e.radius + 2);
    c.fill();
    c.beginPath();
    c.moveTo(e.radius - 2, -6);
    c.lineTo(e.radius + 2, -e.radius - 5);
    c.lineTo(3, -e.radius + 2);
    c.fill();
  }
  if (e.kind !== "boss") {
    circle(c, -4, -1, 2, color);
    circle(c, 4, -1, 2, color);
  }
  if (e.hp < e.maxHp) {
    c.fillStyle = "#10191e";
    c.fillRect(-e.radius, -e.radius - 10, e.radius * 2, 3);
    c.fillStyle = color;
    c.fillRect(-e.radius, -e.radius - 10, (e.radius * 2 * e.hp) / e.maxHp, 3);
  }
  c.restore();
}
export function drawItem(
  c: CanvasRenderingContext2D,
  item: Item,
  time: number,
) {
  // Blink during the last seconds so the player knows it is about to vanish.
  if (item.life < ITEM_CONFIG.blinkFor && Math.floor(time * 6) % 2) return;
  const bob = Math.sin(time * 3 + item.id) * 3;
  const glow = item.kind === "magnet" ? "#7fd4ff" : "#ff8a5c";
  c.save();
  c.translate(item.x, item.y + bob);
  circle(c, 0, 6 - bob, item.radius + 1, "#040b1099");
  ring(c, 0, 0, item.radius + 8 + Math.sin(time * 4) * 2, glow + "55", 2);
  circle(c, 0, 0, item.radius + 4, glow + "22");
  if (item.kind === "magnet") {
    c.strokeStyle = "#5fb8ff";
    c.lineWidth = 6;
    c.lineCap = "butt";
    c.beginPath();
    c.arc(0, -2, 8, Math.PI, 0);
    c.stroke();
    c.beginPath();
    c.moveTo(-8, -2);
    c.lineTo(-8, 8);
    c.moveTo(8, -2);
    c.lineTo(8, 8);
    c.stroke();
    c.fillStyle = "#e9f6ff";
    c.fillRect(-11, 5, 6, 4);
    c.fillRect(5, 5, 6, 4);
  } else {
    circle(c, 0, 2, 10, "#2a1f2b");
    ring(c, 0, 2, 10, "#ff9d6b", 1.5);
    circle(c, -3, -1, 3, "#5a4757");
    c.strokeStyle = "#d9c7a0";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(4, -6);
    c.quadraticCurveTo(9, -12, 13, -10);
    c.stroke();
    circle(c, 13, -10, 2.5 + Math.sin(time * 20) * 1, "#ffe27a");
  }
  c.restore();
}
export function drawPlayer(
  c: CanvasRenderingContext2D,
  p: Player,
  time: number,
  effects: boolean,
) {
  c.save();
  c.translate(p.x, p.y);
  if (p.invincible > 0 && effects)
    c.globalAlpha = Math.floor(p.invincible * 20) % 2 ? 0.25 : 1;
  circle(c, 0, 6, 19, "#040b1099");
  ring(c, 0, 0, 25 + Math.sin(time * 3) * 2, "#71e0be24");
  c.fillStyle = "#397c89";
  c.beginPath();
  c.moveTo(0, -18);
  c.lineTo(17, 14);
  c.lineTo(7, 10);
  c.lineTo(0, 17);
  c.lineTo(-8, 11);
  c.lineTo(-17, 14);
  c.closePath();
  c.fill();
  c.strokeStyle = "#96f6dd";
  c.lineWidth = 1.5;
  c.stroke();
  circle(c, 0, -4, 10, "#82cfd7");
  circle(c, 0, -2, 7, "#143044");
  c.fillStyle = "#d9ffed";
  c.fillRect(-4, -3, 3, 2);
  c.fillRect(2, -3, 3, 2);
  diamond(c, 0, 10, 4, "#ccff85");
  c.rotate(p.facing);
  c.fillStyle = "#ac9370";
  c.fillRect(12, -13, 3, 25);
  circle(c, 13, -15, 4, "#c4ff9e");
  c.restore();
}
