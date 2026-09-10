import type { GameState } from "../core/GameState";
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  maxLevel: number;
  // Offered only after the named upgrade has been taken at least once (weapon unlock gating).
  requires?: string;
  // Offered only when fewer than three regular upgrades remain.
  fallback?: boolean;
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
