import type { UpgradeChoice } from "../upgrades/upgradeTypes";
import type { Projectile } from "../entities/Projectile";
import type { ExperienceOrb } from "../entities/ExperienceOrb";
import type { Effect } from "../entities/Effect";
import { createWeapons, type WeaponState } from "../weapons/Weapon";
import { createPlayer, type Player } from "../entities/Player";
import type { Enemy } from "../entities/Enemy";
export type GameStatus =
  "idle" | "playing" | "paused" | "levelup" | "gameover" | "victory";
export interface GameState {
  status: GameStatus;
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  orbs: ExperienceOrb[];
  effects: Effect[];
  weapons: WeaponState;
  upgradeLevels: Record<string, number>;
  choices: UpgradeChoice[];
  nextId: number;
  spawnTimer: number;
  elapsed: number;
  kills: number;
  viewport: { width: number; height: number };
}
export function createState(): GameState {
  return {
    status: "idle",
    player: createPlayer(),
    enemies: [],
    projectiles: [],
    orbs: [],
    effects: [],
    weapons: createWeapons(),
    upgradeLevels: {},
    choices: [],
    nextId: 1,
    spawnTimer: 0,
    elapsed: 0,
    kills: 0,
    viewport: { width: 1280, height: 720 },
  };
}
export interface Snapshot {
  choices: UpgradeChoice[];
  orbitLevel: number;
  boltCount: number;
  status: GameStatus;
  hp: number;
  maxHp: number;
  level: number;
  exp: number;
  expToNextLevel: number;
  elapsed: number;
  kills: number;
}
export function snapshot(s: GameState): Snapshot {
  return {
    choices: [...s.choices],
    orbitLevel: s.weapons.orbit.level,
    boltCount: s.weapons.bolt.projectileCount,
    status: s.status,
    hp: s.player.hp,
    maxHp: s.player.maxHp,
    level: s.player.level,
    exp: s.player.exp,
    expToNextLevel: s.player.expToNextLevel,
    elapsed: s.elapsed,
    kills: s.kills,
  };
}
