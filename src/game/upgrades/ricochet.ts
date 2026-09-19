import type { Upgrade } from "./upgradeTypes";
export const RICOCHET_UPGRADES: Upgrade[] = [
  {
    id: "ricochet",
    name: "Echo shard",
    description: "반사탄 획득 · 적중 후 주변의 다른 적에게 2회 튕김",
    category: "RICOCHET",
    icon: "⌁",
    maxLevel: 1,
    apply: (s) => {
      s.weapons.ricochet.level = 1;
    },
  },
  {
    id: "ricochet-bounces",
    name: "Resonance",
    description: "반사탄 튕김 횟수 +1",
    category: "RICOCHET",
    icon: "⌁",
    maxLevel: 5,
    requires: "ricochet",
    apply: (s) => {
      s.weapons.ricochet.bounces++;
      s.weapons.ricochet.level++;
    },
  },
  {
    id: "ricochet-count",
    name: "Echo chorus",
    description: "발사하는 반사탄 +1",
    category: "RICOCHET",
    icon: "⋔",
    maxLevel: 4,
    requires: "ricochet",
    apply: (s) => {
      s.weapons.ricochet.count++;
      s.weapons.ricochet.level++;
    },
  },
  {
    id: "ricochet-power",
    name: "Sharper echoes",
    description: "반사탄 피해량 +25%",
    category: "RICOCHET",
    icon: "✦",
    maxLevel: 6,
    requires: "ricochet",
    apply: (s) => {
      s.weapons.ricochet.damage *= 1.25;
      s.weapons.ricochet.level++;
    },
  },
];
