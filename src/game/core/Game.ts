import { createState, snapshot, type Snapshot } from "./GameState";
import { simulate } from "./Simulation";
import { SpatialGrid } from "../utils/SpatialGrid";
import type { Enemy } from "../entities/Enemy";
import type { Vec2 } from "../utils/math";
import { GAME_CONFIG } from "../config/gameConfig";
import { applyUpgrade } from "../upgrades/upgrades";
import { checkLevel } from "../systems/LevelSystem";
import type { SoundEvent } from "../audio/soundEvents";
export class Game {
  state = createState();
  private grid = new SpatialGrid<Enemy>(GAME_CONFIG.gridSize);
  private hudTimer = 0;
  private accumulator = 0;
  private onSound: (e: SoundEvent) => void = () => {};
  constructor(private emit: (s: Snapshot) => void) {}
  setSoundSink(sink: (e: SoundEvent) => void) {
    this.onSound = sink;
  }
  private flushSounds() {
    for (const e of this.state.sounds) this.onSound(e);
    this.state.sounds.length = 0;
  }
  private reset() {
    const viewport = this.state.viewport;
    this.state = createState();
    this.state.viewport = viewport;
    this.grid.rebuild([]);
    this.hudTimer = 0;
    this.accumulator = 0;
  }
  start() {
    this.reset();
    this.state.status = "playing";
    this.publish();
  }
  home() {
    this.reset();
    this.publish();
  }
  togglePause() {
    if (this.state.status === "playing") this.pause();
    else if (this.state.status === "paused") {
      this.state.status = "playing";
      this.accumulator = 0;
      this.publish();
    }
  }
  pause() {
    if (this.state.status === "playing") {
      this.state.status = "paused";
      this.accumulator = 0;
      this.publish();
    }
  }
  update(dt: number, input: Vec2) {
    if (this.state.status !== "playing" || !Number.isFinite(dt) || dt <= 0)
      return;
    const delta = Math.min(dt, GAME_CONFIG.maxDelta);
    this.accumulator += delta;
    // Fixed simulation steps give identical movement on 60/120/144 Hz displays.
    while (this.accumulator + 1e-9 >= GAME_CONFIG.fixedStep) {
      this.accumulator -= GAME_CONFIG.fixedStep;
      simulate(this.state, this.grid, input, GAME_CONFIG.fixedStep);
      if (this.state.status !== "playing") {
        this.accumulator = 0;
        this.flushSounds();
        this.publish();
        return;
      }
    }
    this.flushSounds();
    this.hudTimer += delta;
    if (this.hudTimer + 1e-9 >= GAME_CONFIG.hudInterval) {
      this.hudTimer = 0;
      this.publish();
    }
  }
  choose(id: string) {
    if (applyUpgrade(this.state, id)) {
      this.accumulator = 0;
      checkLevel(this.state);
      this.flushSounds();
      this.publish();
    }
  }
  publish() {
    this.emit(snapshot(this.state));
  }
}
