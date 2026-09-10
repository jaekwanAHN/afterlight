import type { GameState } from "../core/GameState";
import { createState } from "../core/GameState";
import { GAME_CONFIG } from "../config/gameConfig";
import { ENEMY_CONFIG } from "../config/enemyConfig";
import { orbitPositions } from "../weapons/OrbitWeapon";
import { beamSegments } from "../weapons/BeamWeapon";
import { WEAPON_CONFIG } from "../config/weaponConfig";
import { drawScenery } from "./Scenery";
import { drawEnemy, drawItem, drawPlayer } from "./EntityRenderer";
import { circle, diamond, ring } from "./primitives";
import { JOYSTICK, type Joystick } from "../systems/InputSystem";
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
        bossIndex: 0,
        orbitHitAt: 0,
        beamHitAt: 0,
        pushX: 0,
        pushY: 0,
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
    this.preview.weapons.boomerang.level = 1;
    this.preview.items = [
      {
        id: 1,
        kind: "magnet",
        x: -60,
        y: 250,
        radius: 13,
        life: 99,
        dead: false,
      },
      {
        id: 2,
        kind: "bomb",
        x: 300,
        y: -20,
        radius: 13,
        life: 99,
        dead: false,
      },
    ];
  }
  // Idle scene keeps one boomerang looping around the player without running the simulation.
  private previewBoomerang(time: number) {
    const t = (time * 0.45) % 1;
    const dist = Math.sin(t * Math.PI) * 200;
    const angle = -0.4 + t * 0.9;
    this.preview.boomerangs = [
      {
        id: 0,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        dirX: 1,
        dirY: 0,
        radius: 12,
        damage: 0,
        speed: 0,
        spin: time * 14,
        lifetime: 1,
        returning: t > 0.5,
        hit: new Set(),
        dead: false,
      },
    ];
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
  draw(real: GameState, stick: Joystick | null = null) {
    const c = this.ctx,
      idle = real.status === "idle",
      state = idle ? this.preview : real,
      p = state.player;
    const time = idle ? performance.now() / 1000 : state.elapsed;
    if (idle) {
      this.preview.weapons.orbit.angle = time * 0.3;
      this.previewBoomerang(time);
    }
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
    for (const item of state.items)
      if (visible(item.x, item.y)) drawItem(c, item, time);
    for (const f of state.flames) {
      if (!visible(f.x, f.y)) continue;
      const life = f.life / f.duration;
      const flicker = 0.85 + Math.sin(time * 17 + f.seed) * 0.15;
      c.globalAlpha = Math.min(1, life * 1.6);
      circle(c, f.x, f.y, f.radius * flicker, "#ff6a2a2e");
      circle(c, f.x, f.y, f.radius * 0.62 * flicker, "#ff9a3c55");
      circle(c, f.x, f.y, f.radius * 0.3 * flicker, "#ffe08a99");
    }
    c.globalAlpha = 1;
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
    for (const b of state.boomerangs) {
      if (!visible(b.x, b.y)) continue;
      circle(c, b.x, b.y, b.radius + 6, "#ffd9a014");
      c.save();
      c.translate(b.x, b.y);
      c.rotate(b.spin);
      c.strokeStyle = "#ffcf8a";
      c.lineWidth = 3.5;
      c.lineCap = "round";
      c.beginPath();
      c.arc(0, 0, b.radius * 0.8, Math.PI * 0.15, Math.PI * 0.85);
      c.stroke();
      c.beginPath();
      c.arc(0, 0, b.radius * 0.8, Math.PI * 1.15, Math.PI * 1.85);
      c.stroke();
      c.restore();
    }
    if (state.weapons.beam.level) {
      const w = state.weapons.beam;
      const pulse = 0.9 + Math.sin(time * 18) * 0.1;
      c.lineCap = "round";
      for (const end of beamSegments(state)) {
        c.strokeStyle = "#ff9d5c22";
        c.lineWidth = w.width * 2.6 * pulse;
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.lineTo(end.x, end.y);
        c.stroke();
        c.strokeStyle = "#ffb36e88";
        c.lineWidth = w.width * pulse;
        c.stroke();
        c.strokeStyle = "#fff1d6";
        c.lineWidth = Math.max(1.5, w.width * 0.28);
        c.stroke();
      }
      circle(c, p.x, p.y, 9 + Math.sin(time * 18) * 2, "#ffd9a6");
    }
    for (const n of state.novas) {
      const life = 1 - n.radius / n.maxRadius;
      c.globalAlpha = 0.25 + life * 0.75;
      ring(c, n.x, n.y, n.radius, "#9fd8ff", WEAPON_CONFIG.nova.thickness);
      c.globalAlpha = 0.5 + life * 0.5;
      ring(c, n.x, n.y, n.radius, "#eaf7ff", 3);
    }
    c.globalAlpha = 1;
    for (const e of state.effects) {
      if (e.kind === "blast") {
        const life = e.life / e.duration;
        const grow = 1 - life;
        c.globalAlpha = life * 0.55;
        circle(c, e.x, e.y, e.radius * 1.3, "#fff3dc");
        c.globalAlpha = life;
        ring(
          c,
          e.x,
          e.y,
          e.radius * (0.2 + grow * 1.2),
          e.color,
          14 * life + 2,
        );
        ring(c, e.x, e.y, e.radius * (0.1 + grow * 0.9), "#ffffff", 3);
        continue;
      }
      if (e.kind !== "strike" || !visible(e.x, e.y, 120)) continue;
      const life = e.life / e.duration;
      c.globalAlpha = life;
      circle(c, e.x, e.y, e.radius * (1.15 - life * 0.15), "#ffd16628");
      ring(c, e.x, e.y, e.radius, e.color, 2);
      c.strokeStyle = "#fff4cc";
      c.lineWidth = 4 * life;
      c.beginPath();
      c.moveTo(e.x + 14, e.y - e.radius * 2.2);
      c.lineTo(e.x - 6, e.y - e.radius * 0.6);
      c.lineTo(e.x + 8, e.y - e.radius * 0.5);
      c.lineTo(e.x, e.y);
      c.stroke();
    }
    c.globalAlpha = 1;
    if (this.settings.effects)
      for (const e of state.effects) {
        if (e.kind === "strike" || !visible(e.x, e.y, 80)) continue;
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
    if (stick && !idle) this.drawJoystick(stick);
  }
  // Screen-space overlay for touch play; clamps the knob to the ring's edge.
  private drawJoystick(stick: Joystick) {
    const c = this.ctx,
      rect = this.canvas.getBoundingClientRect(),
      ox = stick.originX - rect.left,
      oy = stick.originY - rect.top;
    const dx = stick.x - stick.originX,
      dy = stick.y - stick.originY,
      d = Math.hypot(dx, dy),
      k = d > JOYSTICK.radius ? JOYSTICK.radius / d : 1;
    circle(c, ox, oy, JOYSTICK.radius, "#c1f78c12");
    ring(c, ox, oy, JOYSTICK.radius, "#c1f78c66", 2);
    circle(c, ox + dx * k, oy + dy * k, 22, "#c1f78c55");
    circle(c, ox + dx * k, oy + dy * k, 14, "#dfffb8");
  }
}
