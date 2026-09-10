import type { GameState } from "./GameState";
import type { Enemy } from "../entities/Enemy";
import type { Vec2 } from "../utils/math";
import type { SpatialGrid } from "../utils/SpatialGrid";
import { GAME_CONFIG } from "../config/gameConfig";
import { movePlayer } from "../systems/MovementSystem";
import { spawnEnemies } from "../systems/EnemySpawnSystem";
import { moveEnemies } from "../systems/EnemyMovementSystem";
import { playerContacts } from "../systems/CollisionSystem";
import { fireMagicBolt } from "../weapons/MagicBolt";
import { updateOrbit } from "../weapons/OrbitWeapon";
import { throwBoomerangs, updateBoomerangs } from "../weapons/BoomerangWeapon";
import { callStorm } from "../weapons/StormWeapon";
import { updateBeams } from "../weapons/BeamWeapon";
import { fireNova, updateNovas } from "../weapons/NovaWeapon";
import { dropFlames, updateFlames } from "../weapons/FlameWeapon";
import {
  updateProjectiles,
  collectDeaths,
  updateEffects,
} from "../systems/CombatSystem";
import { collectExperience, compactOrbs } from "../systems/ExperienceSystem";
import { checkLevel } from "../systems/LevelSystem";
// Systems mutate engine-owned entities only. React receives a separate small snapshot.
export function simulate(
  state: GameState,
  grid: SpatialGrid<Enemy>,
  input: Vec2,
  dt: number,
) {
  state.elapsed = Math.min(GAME_CONFIG.duration, state.elapsed + dt);
  if (state.elapsed >= GAME_CONFIG.duration) {
    state.status = "victory";
    state.sounds.push("victory");
    return;
  }
  movePlayer(state.player, input, dt);
  spawnEnemies(state, dt);
  grid.rebuild(state.enemies);
  moveEnemies(state, grid, dt);
  grid.rebuild(state.enemies);
  fireMagicBolt(state, dt);
  updateProjectiles(state, grid, dt);
  updateOrbit(state, grid, dt);
  throwBoomerangs(state, dt);
  updateBoomerangs(state, grid, dt);
  callStorm(state, grid, dt);
  updateBeams(state, dt);
  fireNova(state, dt);
  updateNovas(state, grid, dt);
  dropFlames(state);
  updateFlames(state, grid, dt);
  playerContacts(state, grid);
  collectDeaths(state);
  updateEffects(state, dt);
  if (state.status === "playing") {
    collectExperience(state, dt);
    checkLevel(state);
  }
  compactOrbs(state);
}
