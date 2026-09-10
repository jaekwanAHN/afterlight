// Pure sequencer data: what plays on each 16th-note step. Kept free of Web Audio so it is testable.
export const MUSIC = {
  bpm: 128,
  stepsPerBar: 16,
  bars: 4,
  // Layers switch on as the run progresses (seconds of elapsed time).
  hatsAt: 120,
  leadAt: 300,
};
export const STEP_SECONDS = 60 / MUSIC.bpm / 4;
export const LOOP_STEPS = MUSIC.stepsPerBar * MUSIC.bars;
export type Voice = "kick" | "snare" | "hat" | "bass" | "lead";
export interface Note {
  voice: Voice;
  freq?: number;
  accent?: boolean;
}
const A1 = 55,
  C2 = 65.41,
  D2 = 73.42,
  E2 = 82.41,
  G2 = 98;
// Two-bar acid riff in A minor pentatonic, repeated with a turnaround in bar 4.
const BASS: (number | null)[] = [
  A1,
  null,
  A1,
  null,
  A1,
  A1,
  C2,
  null,
  A1,
  null,
  A1,
  null,
  G2,
  null,
  E2,
  null,
  A1,
  null,
  A1,
  null,
  A1,
  A1,
  C2,
  null,
  D2,
  null,
  D2,
  null,
  E2,
  null,
  G2,
  null,
  A1,
  null,
  A1,
  null,
  A1,
  A1,
  C2,
  null,
  A1,
  null,
  A1,
  null,
  G2,
  null,
  E2,
  null,
  A1,
  null,
  A1,
  null,
  C2,
  null,
  D2,
  null,
  E2,
  null,
  G2,
  null,
  E2,
  G2,
  D2,
  C2,
];
const A4 = 440,
  C5 = 523.25,
  E5 = 659.25,
  G5 = 783.99,
  A5 = 880;
const LEAD: (number | null)[] = [
  A4,
  null,
  null,
  C5,
  null,
  null,
  E5,
  null,
  null,
  null,
  G5,
  null,
  E5,
  null,
  C5,
  null,
  A4,
  null,
  null,
  C5,
  null,
  null,
  E5,
  null,
  null,
  null,
  A5,
  null,
  G5,
  null,
  E5,
  null,
  A4,
  null,
  null,
  C5,
  null,
  null,
  E5,
  null,
  null,
  null,
  G5,
  null,
  E5,
  null,
  C5,
  null,
  null,
  null,
  G5,
  null,
  null,
  A5,
  null,
  null,
  G5,
  null,
  E5,
  null,
  null,
  C5,
  null,
  null,
];
export function tierAt(elapsed: number) {
  return elapsed >= MUSIC.leadAt ? 2 : elapsed >= MUSIC.hatsAt ? 1 : 0;
}
export function notesForStep(step: number, tier = 0): Note[] {
  const i = ((step % LOOP_STEPS) + LOOP_STEPS) % LOOP_STEPS;
  const beat = i % MUSIC.stepsPerBar;
  const notes: Note[] = [];
  if (beat % 4 === 0) notes.push({ voice: "kick" });
  if (beat === 4 || beat === 12) notes.push({ voice: "snare" });
  const bass = BASS[i];
  if (bass !== null)
    notes.push({ voice: "bass", freq: bass, accent: beat % 4 === 0 });
  if (tier >= 1 && beat % 2 === 1)
    notes.push({ voice: "hat", accent: beat % 4 === 3 });
  const lead = LEAD[i];
  if (tier >= 2 && lead !== null) notes.push({ voice: "lead", freq: lead });
  return notes;
}
