import { WEAPON_CONFIG } from "../config/weaponConfig";
export interface WeaponState {
  bolt: {
    damage: number;
    cooldown: number;
    projectileSpeed: number;
    projectileCount: number;
    timer: number;
  };
  orbit: {
    level: number;
    damage: number;
    count: number;
    speed: number;
    radius: number;
    distance: number;
    angle: number;
  };
}
export function createWeapons(): WeaponState {
  return {
    bolt: { ...WEAPON_CONFIG.bolt, timer: 0 },
    orbit: { ...WEAPON_CONFIG.orbit, level: 0, angle: 0 },
  };
}
