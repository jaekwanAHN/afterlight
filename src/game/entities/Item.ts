export type ItemKind = "magnet" | "bomb" | "heal";
export interface Item {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  radius: number;
  dead: boolean;
}
