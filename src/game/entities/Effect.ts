export type EffectKind = "burst" | "strike" | "blast";
export interface Effect {
  kind?: EffectKind;
  x: number;
  y: number;
  radius: number;
  color: string;
  life: number;
  duration: number;
}
