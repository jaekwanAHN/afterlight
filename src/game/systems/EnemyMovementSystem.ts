import type { GameState } from "../core/GameState";
import type { Enemy } from "../entities/Enemy";
import { normalize } from "../utils/math";
import type { SpatialGrid } from "../utils/SpatialGrid";
import { SPAWN_CONFIG } from "../config/enemyConfig";
import { spawnPosition } from "./EnemySpawnSystem";
export function moveEnemies(
  state: GameState,
  grid: SpatialGrid<Enemy>,
  dt: number,
) {
  const far = Math.hypot(state.viewport.width, state.viewport.height) + 500;
  for (const e of state.enemies) {
    const direction = normalize(state.player.x - e.x, state.player.y - e.y);
    let sx = 0,
      sy = 0,
      neighbors = 0;
    for (const other of grid.query(e.x, e.y, e.radius + 24)) {
      if (other.id === e.id) continue;
      const dx = e.x - other.x,
        dy = e.y - other.y,
        d = Math.hypot(dx, dy),
        range = e.radius + other.radius;
      if (d < range) {
        const push = (range - d) / range;
        sx += (d ? dx / d : e.id % 2 ? 1 : -1) * push;
        sy += (d ? dy / d : 0) * push;
        if (++neighbors >= SPAWN_CONFIG.maxSeparationNeighbors) break;
      }
    }
    e.x +=
      (direction.x * e.moveSpeed + sx * SPAWN_CONFIG.separationStrength) * dt;
    e.y +=
      (direction.y * e.moveSpeed + sy * SPAWN_CONFIG.separationStrength) * dt;
    e.flash = Math.max(0, e.flash - dt);
    if (
      Math.abs(e.x - state.player.x) > far ||
      Math.abs(e.y - state.player.y) > far
    )
      Object.assign(e, spawnPosition(state));
  }
}
