import type { Upgrade } from "./upgradeTypes";
export const PASSIVE_UPGRADES: Upgrade[] = [
  {
    id: "speed",
    name: "Light foot",
    description: "이동속도 +10%",
    category: "PASSIVE",
    icon: "»",
    maxLevel: 5,
    apply: (s) => {
      s.player.moveSpeed *= 1.1;
    },
  },
  {
    id: "vitality",
    name: "Second heart",
    description: "최대 체력 +20 · 체력 20 회복",
    category: "PASSIVE",
    icon: "♡",
    maxLevel: 5,
    apply: (s) => {
      s.player.maxHp += 20;
      s.player.hp = Math.min(s.player.maxHp, s.player.hp + 20);
    },
  },
  {
    id: "magnet",
    name: "Gathering light",
    description: "경험치 획득 범위 +30%",
    category: "PASSIVE",
    icon: "◎",
    maxLevel: 5,
    apply: (s) => {
      s.player.pickupRadius *= 1.3;
    },
  },
  {
    id: "heal",
    name: "A little relief",
    description: "체력 30 회복",
    category: "RECOVERY",
    icon: "+",
    maxLevel: Infinity,
    apply: (s) => {
      s.player.hp = Math.min(s.player.maxHp, s.player.hp + 30);
    },
  },
  // Repeatable fallback: keeps three distinct choices available after everything else is capped.
  {
    id: "renewal",
    name: "Enduring ember",
    description: "최대 체력 +5 · 체력 5 회복",
    category: "PASSIVE",
    icon: "⌁",
    maxLevel: Infinity,
    fallback: true,
    apply: (s) => {
      s.player.maxHp += 5;
      s.player.hp = Math.min(s.player.maxHp, s.player.hp + 5);
    },
  },
];
