import { GAME_CONFIG } from "../config/gameConfig";
export interface Player {
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  moveSpeed: number;
  level: number;
  exp: number;
  expToNextLevel: number;
  pickupRadius: number;
  invincible: number;
  facing: number;
}
export function createPlayer(): Player {
  return {
    x: 0,
    y: 0,
    ...GAME_CONFIG.player,
    hp: GAME_CONFIG.player.maxHp,
    level: 1,
    exp: 0,
    expToNextLevel: 10,
    invincible: 0,
    facing: 0,
  };
}
