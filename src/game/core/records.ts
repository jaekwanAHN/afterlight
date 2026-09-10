import type { Snapshot } from "./GameState";
export interface Records {
  bestTime: number;
  maxKills: number;
  highestLevel: number;
}
export const EMPTY_RECORDS: Records = {
  bestTime: 0,
  maxKills: 0,
  highestLevel: 0,
};
export const RECORDS_KEY = "afterlight.records.v1";
export function readRecords(): Records {
  try {
    const data: unknown = JSON.parse(
      localStorage.getItem(RECORDS_KEY) || "null",
    );
    if (!data || typeof data !== "object") return { ...EMPTY_RECORDS };
    const obj = data as Record<string, unknown>;
    const valid = (key: string) =>
      typeof obj[key] === "number" && Number.isFinite(obj[key]) && obj[key] >= 0
        ? (obj[key] as number)
        : 0;
    return {
      bestTime: Math.min(600, valid("bestTime")),
      maxKills: Math.floor(valid("maxKills")),
      highestLevel: Math.floor(valid("highestLevel")),
    };
  } catch {
    return { ...EMPTY_RECORDS };
  }
}
export function saveRecords(previous: Records, s: Snapshot): Records {
  const next = {
    bestTime: Math.max(previous.bestTime, s.elapsed),
    maxKills: Math.max(previous.maxKills, s.kills),
    highestLevel: Math.max(previous.highestLevel, s.level),
  };
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(next));
  } catch {
    /* Storage can be unavailable in private or restricted contexts. Gameplay continues. */
  }
  return next;
}
