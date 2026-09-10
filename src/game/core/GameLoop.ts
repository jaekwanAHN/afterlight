import { GAME_CONFIG } from "../config/gameConfig";
export class GameLoop {
  private frame = 0;
  private last = 0;
  private running = false;
  constructor(
    private update: (dt: number) => void,
    private render: () => void,
  ) {}
  start() {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.frame = requestAnimationFrame(this.tick);
  }
  private tick = (now: number) => {
    if (!this.running) return;
    const dt = this.last
      ? Math.min((now - this.last) / 1000, GAME_CONFIG.maxDelta)
      : 0;
    this.last = now;
    this.update(dt);
    this.render();
    this.frame = requestAnimationFrame(this.tick);
  };
  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.last = 0;
  }
}
