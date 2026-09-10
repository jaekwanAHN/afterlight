import type { Upgrade } from "./upgradeTypes";
export const NOVA_UPGRADES: Upgrade[] = [
  {
    id: "nova",
    name: "Shockwave",
    description: "충격파 획득 · 주기적으로 퍼지는 파동이 적을 밀쳐냄",
    category: "NOVA",
    icon: "◉",
    maxLevel: 1,
    apply: (s) => {
      s.weapons.nova.level = 1;
    },
  },
  {
    id: "nova-power",
    name: "Crushing wave",
    description: "충격파 피해량 +25%",
    category: "NOVA",
    icon: "✦",
    maxLevel: 6,
    requires: "nova",
    apply: (s) => {
      s.weapons.nova.damage *= 1.25;
      s.weapons.nova.level++;
    },
  },
  {
    id: "nova-range",
    name: "Far ripple",
    description: "충격파 반경 +20%",
    category: "NOVA",
    icon: "◎",
    maxLevel: 4,
    requires: "nova",
    apply: (s) => {
      s.weapons.nova.maxRadius *= 1.2;
      s.weapons.nova.level++;
    },
  },
  {
    id: "nova-haste",
    name: "Restless pulse",
    description: "충격파 재사용 대기시간 −12%",
    category: "NOVA",
    icon: "ϟ",
    maxLevel: 6,
    requires: "nova",
    apply: (s) => {
      s.weapons.nova.cooldown *= 0.88;
      s.weapons.nova.level++;
    },
  },
  {
    id: "nova-knockback",
    name: "Heavy push",
    description: "충격파 밀쳐내기 +30%",
    category: "NOVA",
    icon: "⇶",
    maxLevel: 3,
    requires: "nova",
    apply: (s) => {
      s.weapons.nova.knockback *= 1.3;
      s.weapons.nova.level++;
    },
  },
];
