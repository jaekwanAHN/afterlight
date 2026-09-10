import type { GameState } from "../core/GameState";
import type { Enemy } from "../entities/Enemy";
import type { SpatialGrid } from "../utils/SpatialGrid";
import { circlesOverlap } from "../utils/collision";
import { GAME_CONFIG } from "../config/gameConfig";
export function playerContacts(state: GameState, grid: SpatialGrid<Enemy>) {
  const p = state.player;
  if (p.invincible > 0) return;
  for (const e of grid.query(p.x, p.y, p.radius + 24)) {
    if (!e.dead && circlesOverlap(p, e)) {
      p.hp = Math.max(0, p.hp - e.damage);
      p.invincible = GAME_CONFIG.player.invincibleDuration;
      state.sounds.push("hurt");
      break;
    }
  }
  if (p.hp <= 0) {
    state.status = "gameover";
    state.sounds.push("gameover");
  }
}
