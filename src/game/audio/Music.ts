import {
  LOOP_STEPS,
  STEP_SECONDS,
  notesForStep,
  tierAt,
  type Note,
} from "./pattern";
export type MusicMode = "off" | "play" | "duck";
const LOOKAHEAD = 0.12,
  INTERVAL_MS = 30;
// Lookahead sequencer: a timer schedules every note a little ahead of AudioContext.currentTime,
// so JS jitter never reaches the audio thread.
export class Music {
  private out: GainNode;
  private noise: AudioBuffer;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextStep = 0;
  private nextTime = 0;
  private mode: MusicMode = "off";
  private tier = 0;
  private volume = 0.5;
  constructor(
    private ctx: AudioContext,
    destination: AudioNode,
  ) {
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(destination);
    this.noise = ctx.createBuffer(1, ctx.sampleRate / 4, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  setVolume(volume: number) {
    this.volume = volume;
    this.applyGain();
  }
  setElapsed(elapsed: number) {
    this.tier = tierAt(elapsed);
  }
  setMode(mode: MusicMode) {
    if (mode === this.mode) return;
    this.mode = mode;
    if (mode === "off") this.stop();
    else if (!this.timer) this.start();
    this.applyGain();
  }
  dispose() {
    this.stop();
    this.out.disconnect();
  }
  private applyGain() {
    const level = this.mode === "off" ? 0 : this.mode === "duck" ? 0.35 : 1;
    this.out.gain.setTargetAtTime(
      this.volume ** 2 * level,
      this.ctx.currentTime,
      0.08,
    );
  }
  private start() {
    this.nextStep = 0;
    this.nextTime = this.ctx.currentTime + 0.05;
    this.timer = setInterval(this.tick, INTERVAL_MS);
  }
  private stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
  private tick = () => {
    while (this.nextTime < this.ctx.currentTime + LOOKAHEAD) {
      for (const note of notesForStep(this.nextStep, this.tier))
        this.schedule(note, this.nextTime);
      this.nextStep = (this.nextStep + 1) % LOOP_STEPS;
      this.nextTime += STEP_SECONDS;
    }
  };
  private schedule(note: Note, t: number) {
    switch (note.voice) {
      case "kick":
        return this.tone("sine", 150, 40, t, 0.28, 0.9);
      case "snare":
        return this.burst(t, 0.14, 0.35, 1800, "highpass");
      case "hat":
        return this.burst(
          t,
          note.accent ? 0.07 : 0.035,
          0.12,
          7000,
          "highpass",
        );
      case "bass":
        return this.acid(note.freq!, t, note.accent ? 0.5 : 0.32);
      case "lead":
        return this.tone(
          "triangle",
          note.freq!,
          note.freq! * 0.995,
          t,
          0.2,
          0.14,
        );
    }
  }
  private tone(
    wave: OscillatorType,
    from: number,
    to: number,
    t: number,
    duration: number,
    gain: number,
  ) {
    const osc = this.ctx.createOscillator(),
      env = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + duration);
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(env).connect(this.out);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }
  // Square bass through a snapping low-pass: the filter sweep is what makes the riff feel "acid".
  private acid(freq: number, t: number, gain: number) {
    const osc = this.ctx.createOscillator(),
      filter = this.ctx.createBiquadFilter(),
      env = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    filter.type = "lowpass";
    filter.Q.value = 9;
    filter.frequency.setValueAtTime(freq * 14, t);
    filter.frequency.exponentialRampToValueAtTime(freq * 2.5, t + 0.16);
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(filter).connect(env).connect(this.out);
    osc.start(t);
    osc.stop(t + 0.22);
  }
  private burst(
    t: number,
    duration: number,
    gain: number,
    cutoff: number,
    type: BiquadFilterType,
  ) {
    const src = this.ctx.createBufferSource(),
      filter = this.ctx.createBiquadFilter(),
      env = this.ctx.createGain();
    src.buffer = this.noise;
    filter.type = type;
    filter.frequency.value = cutoff;
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter).connect(env).connect(this.out);
    src.start(t);
    src.stop(t + duration + 0.02);
  }
}
