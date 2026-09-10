export type SoundEvent =
  | "bolt"
  | "boomerang"
  | "storm"
  | "kill"
  | "hurt"
  | "pickup"
  | "levelup"
  | "select"
  | "gameover"
  | "victory"
  | "nova"
  | "flame"
  | "beamOn"
  | "beamOff"
  | "magnet"
  | "bomb";
// Minimum gap between repeats (seconds). Kills and pickups can happen dozens of times per frame.
export const SOUND_THROTTLE: Record<SoundEvent, number> = {
  bolt: 0.05,
  boomerang: 0.05,
  storm: 0.1,
  kill: 0.06,
  hurt: 0.15,
  pickup: 0.07,
  levelup: 0.2,
  select: 0.1,
  gameover: 1,
  victory: 1,
  nova: 0.2,
  flame: 0.6,
  beamOn: 0,
  beamOff: 0,
  magnet: 0.5,
  bomb: 0.5,
};
export function shouldPlay(
  event: SoundEvent,
  now: number,
  last: Partial<Record<SoundEvent, number>>,
) {
  const previous = last[event];
  if (previous !== undefined && now - previous < SOUND_THROTTLE[event])
    return false;
  last[event] = now;
  return true;
}
