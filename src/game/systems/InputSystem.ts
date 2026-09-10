import { normalize, type Vec2 } from "../utils/math";
const MOVEMENT = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);
export const JOYSTICK = { deadZone: 10, radius: 60 };
export interface Joystick {
  originX: number;
  originY: number;
  x: number;
  y: number;
}
export class InputSystem {
  private keys = new Set<string>();
  private pointerId: number | null = null;
  private stick: Joystick | null = null;
  private surface: HTMLElement | null = null;
  constructor(
    private onPause: () => void,
    private onBlur: () => void,
  ) {}
  private down = (e: KeyboardEvent) => {
    if (MOVEMENT.has(e.code)) {
      e.preventDefault();
      this.keys.add(e.code);
    }
    if (e.code === "Escape" && !e.repeat) {
      e.preventDefault();
      this.onPause();
    }
  };
  private up = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };
  private blur = () => {
    this.clear();
    this.onBlur();
  };
  private visibility = () => {
    if (document.hidden) this.blur();
  };
  // Floating joystick: wherever the finger lands becomes the stick's centre.
  private pointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" || this.pointerId !== null) return;
    e.preventDefault();
    this.pointerId = e.pointerId;
    this.stick = {
      originX: e.clientX,
      originY: e.clientY,
      x: e.clientX,
      y: e.clientY,
    };
  };
  private pointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId || !this.stick) return;
    e.preventDefault();
    this.stick.x = e.clientX;
    this.stick.y = e.clientY;
  };
  private pointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = null;
    this.stick = null;
  };
  attach(surface?: HTMLElement) {
    window.addEventListener("keydown", this.down);
    window.addEventListener("keyup", this.up);
    window.addEventListener("blur", this.blur);
    document.addEventListener("visibilitychange", this.visibility);
    if (surface) {
      this.surface = surface;
      surface.addEventListener("pointerdown", this.pointerDown);
      window.addEventListener("pointermove", this.pointerMove);
      window.addEventListener("pointerup", this.pointerUp);
      window.addEventListener("pointercancel", this.pointerUp);
    }
  }
  dispose() {
    window.removeEventListener("keydown", this.down);
    window.removeEventListener("keyup", this.up);
    window.removeEventListener("blur", this.blur);
    document.removeEventListener("visibilitychange", this.visibility);
    this.surface?.removeEventListener("pointerdown", this.pointerDown);
    window.removeEventListener("pointermove", this.pointerMove);
    window.removeEventListener("pointerup", this.pointerUp);
    window.removeEventListener("pointercancel", this.pointerUp);
    this.surface = null;
    this.clear();
  }
  clear() {
    this.keys.clear();
    this.pointerId = null;
    this.stick = null;
  }
  joystick(): Joystick | null {
    return this.stick;
  }
  private keyboard(): Vec2 {
    return normalize(
      Number(this.keys.has("KeyD") || this.keys.has("ArrowRight")) -
        Number(this.keys.has("KeyA") || this.keys.has("ArrowLeft")),
      Number(this.keys.has("KeyS") || this.keys.has("ArrowDown")) -
        Number(this.keys.has("KeyW") || this.keys.has("ArrowUp")),
    );
  }
  direction(): Vec2 {
    const keys = this.keyboard();
    if (keys.x || keys.y || !this.stick) return keys;
    const dx = this.stick.x - this.stick.originX,
      dy = this.stick.y - this.stick.originY,
      d = Math.hypot(dx, dy);
    if (d < JOYSTICK.deadZone) return { x: 0, y: 0 };
    return normalize(dx, dy);
  }
}
