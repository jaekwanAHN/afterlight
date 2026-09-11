export const ITEM_CONFIG = {
  // Roughly one pickup per 50 seconds. Items never expire, so a skipped one waits on the field.
  firstAt: 15,
  minInterval: 40,
  maxInterval: 60,
  radius: 13,
  // Spawn ring around the player, in fractions of the half-diagonal of the viewport.
  spawnMin: 0.45,
  spawnMax: 0.95,
  blastDuration: 0.7,
  // Heal restores this fraction of max HP.
  healFraction: 0.4,
};
