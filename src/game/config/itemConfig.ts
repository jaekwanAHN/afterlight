export const ITEM_CONFIG = {
  // Roughly two pickups per minute: strong effects, but frequent enough to plan around.
  firstAt: 15,
  minInterval: 20,
  maxInterval: 40,
  maxAlive: 3,
  lifetime: 45,
  blinkFor: 6,
  radius: 13,
  // Spawn ring around the player, in fractions of the half-diagonal of the viewport.
  spawnMin: 0.45,
  spawnMax: 0.95,
  blastDuration: 0.7,
};
