import { expect, it } from "vitest";
import {
  LOOP_STEPS,
  MUSIC,
  STEP_SECONDS,
  notesForStep,
  tierAt,
} from "../src/game/audio/pattern";
it("runs a 4-bar loop at 128 BPM", () => {
  expect(LOOP_STEPS).toBe(64);
  expect(STEP_SECONDS * LOOP_STEPS).toBeCloseTo(7.5);
  expect(notesForStep(LOOP_STEPS)).toEqual(notesForStep(0));
  expect(notesForStep(-1)).toEqual(notesForStep(LOOP_STEPS - 1));
});
it("keeps a four-on-the-floor kick with snares on 2 and 4", () => {
  for (let step = 0; step < LOOP_STEPS; step++) {
    const voices = notesForStep(step, 0).map((n) => n.voice);
    expect(voices.includes("kick")).toBe(step % 4 === 0);
    expect(voices.includes("snare")).toBe(step % 16 === 4 || step % 16 === 12);
    expect(voices.includes("hat")).toBe(false);
    expect(voices.includes("lead")).toBe(false);
  }
});
it("adds hats and lead as the run progresses", () => {
  expect(tierAt(0)).toBe(0);
  expect(tierAt(MUSIC.hatsAt)).toBe(1);
  expect(tierAt(MUSIC.leadAt)).toBe(2);
  const all = (tier: number) =>
    new Set(
      Array.from({ length: LOOP_STEPS }, (_, s) =>
        notesForStep(s, tier).map((n) => n.voice),
      ).flat(),
    );
  expect(all(1).has("hat")).toBe(true);
  expect(all(1).has("lead")).toBe(false);
  expect(all(2).has("lead")).toBe(true);
});
it("gives every pitched note a frequency and accents downbeat bass", () => {
  for (let step = 0; step < LOOP_STEPS; step++)
    for (const n of notesForStep(step, 2)) {
      if (n.voice === "bass" || n.voice === "lead")
        expect(n.freq).toBeGreaterThan(0);
      if (n.voice === "bass" && step % 4 === 0) expect(n.accent).toBe(true);
    }
});
