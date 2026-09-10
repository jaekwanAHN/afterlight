import { normalize } from "../utils/math";
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
export class InputSystem {
  private keys = new Set<string>();
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
  attach() {
    window.addEventListener("keydown", this.down);
    window.addEventListener("keyup", this.up);
    window.addEventListener("blur", this.blur);
    document.addEventListener("visibilitychange", this.visibility);
  }
  dispose() {
    window.removeEventListener("keydown", this.down);
    window.removeEventListener("keyup", this.up);
    window.removeEventListener("blur", this.blur);
    document.removeEventListener("visibilitychange", this.visibility);
    this.clear();
  }
  clear() {
    this.keys.clear();
  }
  direction() {
    return normalize(
      Number(this.keys.has("KeyD") || this.keys.has("ArrowRight")) -
        Number(this.keys.has("KeyA") || this.keys.has("ArrowLeft")),
      Number(this.keys.has("KeyS") || this.keys.has("ArrowDown")) -
        Number(this.keys.has("KeyW") || this.keys.has("ArrowUp")),
    );
  }
}
