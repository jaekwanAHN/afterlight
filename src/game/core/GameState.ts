import type { UpgradeChoice } from "../upgrades/upgradeTypes";
import type { Projectile } from "../entities/Projectile";
import type { Boomerang } from "../entities/Boomerang";
import type { Nova } from "../entities/Nova";
import type { FlamePatch } from "../entities/FlamePatch";
import type { Item } from "../entities/Item";
import { ITEM_CONFIG } from "../config/itemConfig";
import type { ExperienceOrb } from "../entities/ExperienceOrb";
import type { Effect } from "../entities/Effect";
import { createWeapons, type WeaponState } from "../weapons/Weapon";
import { createPlayer, type Player } from "../entities/Player";
import type { Enemy } from "../entities/Enemy";
import type { SoundEvent } from "../audio/soundEvents";
export type GameStatus =
  "idle" | "playing" | "paused" | "levelup" | "gameover" | "victory";
export interface GameState {
  status: GameStatus;
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  boomerangs: Boomerang[];
  novas: Nova[];
  flames: FlamePatch[];
  items: Item[];
  orbs: ExperienceOrb[];
  effects: Effect[];
  // Systems queue sounds here; Game drains the queue after each update so simulation stays pure.
  sounds: SoundEvent[];
  weapons: WeaponState;
  upgradeLevels: Record<string, number>;
  choices: UpgradeChoice[];
  nextId: number;
  spawnTimer: number;
  itemTimer: number;
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
    boomerangs: [],
    novas: [],
    flames: [],
    items: [],
    orbs: [],
    effects: [],
    sounds: [],
    weapons: createWeapons(),
    upgradeLevels: {},
    choices: [],
    nextId: 1,
    spawnTimer: 0,
    itemTimer: ITEM_CONFIG.firstAt,
    elapsed: 0,
    kills: 0,
    viewport: { width: 1280, height: 720 },
  };
}
export interface Snapshot {
  choices: UpgradeChoice[];
  orbitLevel: number;
  boltCount: number;
  boomerangLevel: number;
  stormLevel: number;
  beamLevel: number;
  novaLevel: number;
  flameLevel: number;
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
    boomerangLevel: s.weapons.boomerang.level,
    stormLevel: s.weapons.storm.level,
    beamLevel: s.weapons.beam.level,
    novaLevel: s.weapons.nova.level,
    flameLevel: s.weapons.flame.level,
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
