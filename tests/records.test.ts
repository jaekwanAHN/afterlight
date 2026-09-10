import { afterEach, expect, it, vi } from "vitest";
import {
  readRecords,
  saveRecords,
  EMPTY_RECORDS,
  RECORDS_KEY,
} from "../src/game/core/records";
import { createState, snapshot } from "../src/game/core/GameState";
afterEach(() => vi.unstubAllGlobals());
it("recovers from broken or blocked storage", () => {
  vi.stubGlobal("localStorage", {
    getItem: () => "{broken",
    setItem: () => {
      throw new Error("denied");
    },
  });
  expect(readRecords()).toEqual(EMPTY_RECORDS);
  const s = snapshot(createState());
  s.elapsed = 10;
  s.kills = 3;
  expect(saveRecords(EMPTY_RECORDS, s)).toEqual({
    bestTime: 10,
    maxKills: 3,
    highestLevel: 1,
  });
});
it("validates persisted numbers", () => {
  vi.stubGlobal("localStorage", {
    getItem: () =>
      JSON.stringify({ bestTime: 9999, maxKills: -4, highestLevel: "bad" }),
  });
  expect(readRecords()).toEqual({
    bestTime: 600,
    maxKills: 0,
    highestLevel: 0,
  });
});
it("saves each record independently without lowering previous scores", () => {
  const setItem = vi.fn();
  vi.stubGlobal("localStorage", { setItem });
  const s = snapshot(createState());
  s.elapsed = 20;
  s.kills = 15;
  s.level = 2;
  expect(
    saveRecords({ bestTime: 40, maxKills: 3, highestLevel: 5 }, s),
  ).toEqual({ bestTime: 40, maxKills: 15, highestLevel: 5 });
  expect(setItem).toHaveBeenCalledWith(
    RECORDS_KEY,
    JSON.stringify({ bestTime: 40, maxKills: 15, highestLevel: 5 }),
  );
});
