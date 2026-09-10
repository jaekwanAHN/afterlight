import type { GameState } from "../core/GameState";
import { createState } from "../core/GameState";
import { GAME_CONFIG } from "../config/gameConfig";
import { ENEMY_CONFIG } from "../config/enemyConfig";
import { orbitPositions } from "../weapons/OrbitWeapon";
import { drawScenery } from "./Scenery";
import { drawEnemy, drawPlayer } from "./EntityRenderer";
import { circle, diamond, ring } from "./primitives";
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width = 1280;
  private height = 720;
  private settings = { effects: true, showGrid: true };
  private preview = createState();
  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D를 사용할 수 없습니다.");
    this.ctx = ctx;
    const layout = [
      [-220, -115],
      [-130, -230],
      [55, -205],
      [225, -85],
      [280, 115],
      [110, 225],
      [-120, 170],
      [-275, 70],
      [350, -180],
      [-320, -260],
      [15, 320],
      [360, 300],
    ];
    this.preview.enemies = layout.map(([x, y], i) => {
      const kind = i % 5 === 0 ? "tank" : i % 3 === 0 ? "fast" : "normal";
      const cfg = ENEMY_CONFIG[kind];
      return {
        id: i,
        x,
        y,
        kind,
        ...cfg,
        hp: cfg.maxHp,
        flash: 0,
        orbitHitAt: 0,
        dead: false,
      };
    });
    this.preview.orbs = Array.from({ length: 19 }, (_, i) => ({
      id: i,
      x: Math.cos(i * 2.4) * (50 + i * 7),
      y: Math.sin(i * 2.4) * (60 + i * 5),
      radius: 4,
      value: 1,
      attracted: false,
      dead: false,
    }));
    this.preview.weapons.orbit.level = 1;
    this.preview.weapons.orbit.count = 2;
  }
  setSettings(settings: { effects: boolean; showGrid: boolean }) {
    this.settings = settings;
  }
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    const dpr = Math.min(window.devicePixelRatio || 1, GAME_CONFIG.maxDpr);
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  draw(real: GameState) {
    const c = this.ctx,
      idle = real.status === "idle",
      state = idle ? this.preview : real,
      p = state.player;
    const time = idle ? performance.now() / 1000 : state.elapsed;
    if (idle) this.preview.weapons.orbit.angle = time * 0.3;
    c.fillStyle = "#0c191b";
    c.fillRect(0, 0, this.width, this.height);
    const centerX = idle ? this.width * 0.74 : this.width / 2,
      centerY = idle ? this.height * 0.49 : this.height / 2;
    const left = p.x - centerX,
      top = p.y - centerY;
    c.save();
    c.translate(-left, -top);
    drawScenery(c, left, top, this.width, this.height, this.settings.showGrid);
    const visible = (x: number, y: number, margin = 40) =>
      x > left - margin &&
      x < left + this.width + margin &&
      y > top - margin &&
      y < top + this.height + margin;
    for (const orb of state.orbs) {
      if (!visible(orb.x, orb.y)) continue;
      diamond(c, orb.x, orb.y, orb.radius + 3, "#b9f28418");
      diamond(c, orb.x, orb.y, orb.radius, "#b5e985");
    }
    if (state.weapons.orbit.level) {
      ring(c, p.x, p.y, state.weapons.orbit.distance, "#bbff7020");
      for (const orb of orbitPositions(state)) {
        circle(c, orb.x, orb.y, orb.radius + 7, "#c5ff7814");
        circle(c, orb.x, orb.y, orb.radius, "#7bcaaa");
        diamond(c, orb.x, orb.y, orb.radius * 0.65, "#d6ffab");
      }
    }
    for (const e of state.enemies)
      if (visible(e.x, e.y)) drawEnemy(c, e, this.settings.effects);
    for (const bolt of state.projectiles) {
      if (!visible(bolt.x, bolt.y)) continue;
      c.strokeStyle = "#86f1e660";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(bolt.x - bolt.vx * 0.035, bolt.y - bolt.vy * 0.035);
      c.lineTo(bolt.x, bolt.y);
      c.stroke();
      circle(c, bolt.x, bolt.y, bolt.radius + 4, "#98ffe719");
      circle(c, bolt.x, bolt.y, bolt.radius, "#dcfff6");
    }
    if (this.settings.effects)
      for (const e of state.effects) {
        if (!visible(e.x, e.y, 80)) continue;
        const life = e.life / e.duration;
        c.globalAlpha = life;
        ring(c, e.x, e.y, e.radius * (2 - life), e.color, 2);
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          diamond(
            c,
            e.x + Math.cos(a) * e.radius * (2 - life),
            e.y + Math.sin(a) * e.radius * (2 - life),
            3 * life,
            e.color,
          );
        }
      }
    c.globalAlpha = 1;
    drawPlayer(c, p, time, this.settings.effects);
    c.restore();
    const shade = c.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.height * 0.2,
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height) * 0.65,
    );
    shade.addColorStop(0, "#050b1000");
    shade.addColorStop(1, "#050b10b0");
    c.fillStyle = shade;
    c.fillRect(0, 0, this.width, this.height);
  }
}
