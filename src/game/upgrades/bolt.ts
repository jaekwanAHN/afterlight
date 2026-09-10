import type { Upgrade } from "./upgradeTypes";
export const BOLT_UPGRADES: Upgrade[] = [
  {
    id: "power",
    name: "Magic power",
    description: "마법탄 피해량 +20%",
    category: "MAGIC BOLT",
    icon: "✦",
    maxLevel: 8,
    apply: (s) => {
      s.weapons.bolt.damage *= 1.2;
    },
  },
  {
    id: "haste",
    name: "Quick cast",
    description: "마법탄 재사용 대기시간 −10%",
    category: "MAGIC BOLT",
    icon: "ϟ",
    maxLevel: 8,
    apply: (s) => {
      s.weapons.bolt.cooldown *= 0.9;
    },
  },
  {
    id: "multishot",
    name: "Split the light",
    description: "발사하는 마법탄 +1",
    category: "MAGIC BOLT",
    icon: "⋔",
    maxLevel: 5,
    apply: (s) => {
      s.weapons.bolt.projectileCount++;
    },
  },
  // Repeatable fallback: keeps three distinct choices available after everything else is capped.
  {
    id: "overcharge",
    name: "Afterglow",
    description: "마법탄 피해량 +5%",
    category: "PASSIVE",
    icon: "◇",
    maxLevel: Infinity,
    fallback: true,
    apply: (s) => {
      s.weapons.bolt.damage *= 1.05;
    },
  },
];
