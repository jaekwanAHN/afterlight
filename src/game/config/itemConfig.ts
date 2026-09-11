export const ITEM_CONFIG = {
  // Roughly two pickups per minute. Items never expire, so a skipped one waits on the field.
  firstAt: 15,
  minInterval: 20,
  maxInterval: 40,
  radius: 13,
  // Spawn ring around the player, in fractions of the half-diagonal of the viewport.
  spawnMin: 0.45,
  spawnMax: 0.95,
  blastDuration: 0.7,
  // Heal restores this fraction of max HP.
  healFraction: 0.4,
};
