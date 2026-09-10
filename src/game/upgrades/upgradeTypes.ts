import type { GameState } from "../core/GameState";
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  maxLevel: number;
  apply: (state: GameState) => void;
}
export interface UpgradeChoice {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rank: number;
  maxLevel: number;
}
