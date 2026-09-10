import { describe, it, expect } from "vitest";
import { normalize, formatTime } from "../src/game/utils/math";
describe("movement", () => {
  it("normalizes diagonal movement", () => {
    expect(Math.hypot(...Object.values(normalize(1, 1)))).toBeCloseTo(1);
  });
  it("handles zero input", () =>
    expect(normalize(0, 0)).toEqual({ x: 0, y: 0 }));
  it("formats time", () => expect(formatTime(600)).toBe("10:00"));
});
