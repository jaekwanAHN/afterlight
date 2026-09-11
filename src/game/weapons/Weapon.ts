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
  boomerang: {
    level: number;
    damage: number;
    cooldown: number;
    speed: number;
    count: number;
    timer: number;
  };
  storm: {
    level: number;
    damage: number;
    cooldown: number;
    radius: number;
    count: number;
    timer: number;
  };
  beam: {
    level: number;
    damage: number;
    width: number;
    cooldown: number;
    count: number;
    timer: number;
    charge: number;
  };
  nova: {
    level: number;
    damage: number;
    cooldown: number;
    maxRadius: number;
    knockback: number;
    timer: number;
  };
  flame: {
    level: number;
    damage: number;
    radius: number;
    duration: number;
    lastX: number;
    lastY: number;
  };
}
export function createWeapons(): WeaponState {
  const { boomerang, storm, beam, nova, flame } = WEAPON_CONFIG;
  return {
    bolt: { ...WEAPON_CONFIG.bolt, timer: 0 },
    orbit: { ...WEAPON_CONFIG.orbit, level: 0, angle: 0 },
    boomerang: {
      level: 0,
      damage: boomerang.damage,
      cooldown: boomerang.cooldown,
      speed: boomerang.speed,
      count: boomerang.count,
      timer: 0,
    },
    storm: {
      level: 0,
      damage: storm.damage,
      cooldown: storm.cooldown,
      radius: storm.radius,
      count: storm.count,
      timer: 0,
    },
    beam: {
      level: 0,
      damage: beam.damage,
      width: beam.width,
      cooldown: beam.cooldown,
      count: beam.count,
      timer: 0,
      charge: 0,
    },
    nova: {
      level: 0,
      damage: nova.damage,
      cooldown: nova.cooldown,
      maxRadius: nova.maxRadius,
      knockback: nova.knockback,
      timer: 0,
    },
    flame: {
      level: 0,
      damage: flame.damage,
      radius: flame.radius,
      duration: flame.duration,
      lastX: 0,
      lastY: 0,
    },
  };
}
