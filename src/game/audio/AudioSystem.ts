import { shouldPlay, type SoundEvent } from "./soundEvents";
import { Music, type MusicMode } from "./Music";
export interface AudioSettings {
  sound: boolean;
  volume: number;
  music: boolean;
  musicVolume: number;
}
type Wave = OscillatorType;
interface Tone {
  wave: Wave;
  from: number;
  to?: number;
  duration: number;
  gain: number;
  delay?: number;
}
// Every effect is synthesised from oscillators and filtered noise, so the game ships no audio assets.
export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private settings: AudioSettings = {
    sound: true,
    volume: 0.6,
    music: true,
    musicVolume: 0.5,
  };
  private music: Music | null = null;
  private musicMode: MusicMode = "off";
  private elapsed = 0;
  private last: Partial<Record<SoundEvent, number>> = {};
  private unlock = () => {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return; // No Web Audio support; the game stays silent.
      }
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      // Music has its own gain path so the SFX toggle/volume and music settings stay independent.
      this.music = new Music(this.ctx, this.ctx.destination);
      this.applyVolume();
      this.applyMusic();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  };
  // Browsers only start audio after a user gesture, so listen for the first one.
  attach() {
    window.addEventListener("pointerdown", this.unlock);
    window.addEventListener("keydown", this.unlock);
  }
  dispose() {
    window.removeEventListener("pointerdown", this.unlock);
    window.removeEventListener("keydown", this.unlock);
    this.music?.dispose();
    this.music = null;
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }
  setSettings(settings: AudioSettings) {
    this.settings = settings;
    this.applyVolume();
    this.applyMusic();
  }
  // Called with every HUD snapshot; music follows game status and builds up with elapsed time.
  setMusic(mode: MusicMode, elapsed: number) {
    this.musicMode = mode;
    this.elapsed = elapsed;
    this.applyMusic();
  }
  private applyMusic() {
    if (!this.music) return;
    this.music.setVolume(this.settings.musicVolume);
    this.music.setElapsed(this.elapsed);
    this.music.setMode(this.settings.music ? this.musicMode : "off");
  }
  private applyVolume() {
    if (!this.master || !this.ctx) return;
    const target = this.settings.sound ? this.settings.volume ** 2 : 0;
    this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
  }
  play = (event: SoundEvent) => {
    if (!this.ctx || !this.settings.sound || this.ctx.state !== "running")
      return;
    if (!shouldPlay(event, this.ctx.currentTime, this.last)) return;
    const recipe = RECIPES[event];
    for (const tone of recipe.tones) this.tone(tone);
    if (recipe.noise) this.noise(recipe.noise);
  };
  private tone({ wave, from, to = from, duration, gain, delay = 0 }: Tone) {
    const ctx = this.ctx!,
      start = ctx.currentTime + delay;
    const osc = ctx.createOscillator(),
      env = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(to, start + duration);
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(gain, start + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(env).connect(this.master!);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }
  private noise({
    duration,
    gain,
    cutoff,
    delay = 0,
  }: {
    duration: number;
    gain: number;
    cutoff: number;
    delay?: number;
  }) {
    const ctx = this.ctx!,
      start = ctx.currentTime + delay;
    if (!this.noiseBuffer) {
      this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      env = ctx.createGain();
    src.buffer = this.noiseBuffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, start);
    filter.frequency.exponentialRampToValueAtTime(cutoff / 8, start + duration);
    env.gain.setValueAtTime(gain, start);
    env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    src.connect(filter).connect(env).connect(this.master!);
    src.start(start);
    src.stop(start + duration + 0.02);
  }
}
const RECIPES: Record<
  SoundEvent,
  {
    tones: Tone[];
    noise?: { duration: number; gain: number; cutoff: number; delay?: number };
  }
> = {
  bolt: {
    tones: [
      { wave: "triangle", from: 880, to: 1400, duration: 0.09, gain: 0.18 },
    ],
  },
  boomerang: {
    tones: [
      { wave: "sawtooth", from: 320, to: 640, duration: 0.14, gain: 0.12 },
      {
        wave: "sawtooth",
        from: 640,
        to: 320,
        duration: 0.14,
        gain: 0.12,
        delay: 0.14,
      },
    ],
  },
  storm: {
    tones: [{ wave: "sine", from: 140, to: 36, duration: 0.4, gain: 0.5 }],
    noise: { duration: 0.35, gain: 0.45, cutoff: 3200 },
  },
  kill: {
    tones: [{ wave: "square", from: 420, to: 90, duration: 0.11, gain: 0.14 }],
  },
  hurt: {
    tones: [{ wave: "sawtooth", from: 220, to: 70, duration: 0.22, gain: 0.3 }],
    noise: { duration: 0.12, gain: 0.2, cutoff: 1200 },
  },
  pickup: {
    tones: [{ wave: "sine", from: 1300, to: 1900, duration: 0.06, gain: 0.08 }],
  },
  levelup: {
    tones: [523, 659, 784, 1047].map((f, i) => ({
      wave: "triangle" as Wave,
      from: f,
      duration: 0.16,
      gain: 0.2,
      delay: i * 0.09,
    })),
  },
  select: {
    tones: [{ wave: "sine", from: 780, to: 1040, duration: 0.09, gain: 0.16 }],
  },
  gameover: {
    tones: [440, 349, 294, 220].map((f, i) => ({
      wave: "sawtooth" as Wave,
      from: f,
      to: f * 0.94,
      duration: 0.32,
      gain: 0.18,
      delay: i * 0.28,
    })),
  },
  nova: {
    tones: [{ wave: "sine", from: 90, to: 480, duration: 0.45, gain: 0.45 }],
    noise: { duration: 0.4, gain: 0.25, cutoff: 900 },
  },
  flame: {
    tones: [
      { wave: "triangle", from: 160, to: 110, duration: 0.18, gain: 0.08 },
    ],
    noise: { duration: 0.2, gain: 0.1, cutoff: 1800 },
  },
  magnet: {
    tones: [440, 660, 880, 1320, 1760].map((f, i) => ({
      wave: "sine" as Wave,
      from: f,
      to: f * 1.5,
      duration: 0.22,
      gain: 0.14,
      delay: i * 0.05,
    })),
  },
  bomb: {
    tones: [{ wave: "sine", from: 160, to: 30, duration: 0.9, gain: 0.7 }],
    noise: { duration: 0.8, gain: 0.6, cutoff: 2600 },
  },
  heal: {
    tones: [523, 659, 784].map((f, i) => ({
      wave: "sine" as Wave,
      from: f,
      to: f * 1.02,
      duration: 0.3,
      gain: 0.16,
      delay: i * 0.08,
    })),
  },
  boss: {
    tones: [0, 1, 2].map((i) => ({
      wave: "square" as Wave,
      from: 196,
      to: 130,
      duration: 0.28,
      gain: 0.22,
      delay: i * 0.32,
    })),
  },
  bossKill: {
    tones: [
      { wave: "square", from: 300, to: 60, duration: 0.5, gain: 0.3 },
      {
        wave: "triangle",
        from: 784,
        to: 1568,
        duration: 0.5,
        gain: 0.18,
        delay: 0.3,
      },
    ],
    noise: { duration: 0.6, gain: 0.4, cutoff: 2000 },
  },
  beamCharge: {
    tones: [
      { wave: "sine", from: 180, to: 1100, duration: 0.55, gain: 0.16 },
      { wave: "triangle", from: 90, to: 550, duration: 0.55, gain: 0.1 },
    ],
  },
  beamFire: {
    tones: [
      { wave: "sawtooth", from: 1200, to: 180, duration: 0.42, gain: 0.32 },
      { wave: "sine", from: 70, to: 40, duration: 0.5, gain: 0.35 },
    ],
    noise: { duration: 0.3, gain: 0.3, cutoff: 5000 },
  },
  victory: {
    tones: [523, 659, 784, 1047, 1319].map((f, i) => ({
      wave: "triangle" as Wave,
      from: f,
      duration: i === 4 ? 0.6 : 0.18,
      gain: 0.22,
      delay: i * 0.13,
    })),
  },
};
