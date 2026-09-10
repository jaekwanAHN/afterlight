import type { Upgrade } from "./upgradeTypes";
export const BOOMERANG_UPGRADES: Upgrade[] = [
  {
    id: "boomerang",
    name: "Returning edge",
    description: "부메랑 획득 · 날아갔다 되돌아오며 관통 피해",
    category: "BOOMERANG",
    icon: "↺",
    maxLevel: 1,
    apply: (s) => {
      s.weapons.boomerang.level = 1;
    },
  },
  {
    id: "boomerang-speed",
    name: "Swift arc",
    description: "부메랑 속도 +12% (사거리 증가)",
    category: "BOOMERANG",
    icon: "↝",
    maxLevel: 5,
    requires: "boomerang",
    apply: (s) => {
      s.weapons.boomerang.speed *= 1.12;
      s.weapons.boomerang.level++;
    },
  },
  {
    id: "boomerang-haste",
    name: "Quick throw",
    description: "부메랑 재사용 대기시간 −10%",
    category: "BOOMERANG",
    icon: "ϟ",
    maxLevel: 6,
    requires: "boomerang",
    apply: (s) => {
      s.weapons.boomerang.cooldown *= 0.9;
      s.weapons.boomerang.level++;
    },
  },
  {
    id: "boomerang-power",
    name: "Honed edge",
    description: "부메랑 피해량 +20%",
    category: "BOOMERANG",
    icon: "✦",
    maxLevel: 6,
    requires: "boomerang",
    apply: (s) => {
      s.weapons.boomerang.damage *= 1.2;
      s.weapons.boomerang.level++;
    },
  },
  {
    id: "boomerang-count",
    name: "Twin throw",
    description: "던지는 부메랑 +1",
    category: "BOOMERANG",
    icon: "⋔",
    maxLevel: 3,
    requires: "boomerang",
    apply: (s) => {
      s.weapons.boomerang.count++;
      s.weapons.boomerang.level++;
    },
  },
];
