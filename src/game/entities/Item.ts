export type ItemKind = "magnet" | "bomb";
export interface Item {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  radius: number;
  life: number;
  dead: boolean;
}
