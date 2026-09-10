export interface Settings {
  effects: boolean;
  showGrid: boolean;
  sound: boolean;
  volume: number;
  music: boolean;
  musicVolume: number;
}
export const DEFAULT_SETTINGS: Settings = {
  effects: true,
  showGrid: true,
  sound: true,
  volume: 0.6,
  music: true,
  musicVolume: 0.5,
};
export const SETTINGS_KEY = "afterlight.settings.v1";
export function readSettings(): Settings {
  try {
    const data: unknown = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "null",
    );
    if (!data || typeof data !== "object") return { ...DEFAULT_SETTINGS };
    const obj = data as Record<string, unknown>;
    const flag = (key: keyof Settings) =>
      typeof obj[key] === "boolean" ? obj[key] : DEFAULT_SETTINGS[key];
    const level = (key: "volume" | "musicVolume") =>
      typeof obj[key] === "number" && Number.isFinite(obj[key])
        ? Math.min(1, Math.max(0, obj[key] as number))
        : DEFAULT_SETTINGS[key];
    return {
      effects: flag("effects") as boolean,
      showGrid: flag("showGrid") as boolean,
      sound: flag("sound") as boolean,
      volume: level("volume"),
      music: flag("music") as boolean,
      musicVolume: level("musicVolume"),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* Storage can be unavailable in private or restricted contexts. */
  }
}
