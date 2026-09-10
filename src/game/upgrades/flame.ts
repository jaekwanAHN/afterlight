import type { Upgrade } from "./upgradeTypes";
export const FLAME_UPGRADES: Upgrade[] = [
  {
    id: "flame",
    name: "Ember trail",
    description: "화염 지대 획득 · 지나간 자리에 불길이 남음",
    category: "FLAME",
    icon: "♨",
    maxLevel: 1,
    apply: (s) => {
      s.weapons.flame.level = 1;
      s.weapons.flame.lastX = s.player.x;
      s.weapons.flame.lastY = s.player.y;
    },
  },
  {
    id: "flame-power",
    name: "Hotter embers",
    description: "화염 피해량 +25%",
    category: "FLAME",
    icon: "✦",
    maxLevel: 6,
    requires: "flame",
    apply: (s) => {
      s.weapons.flame.damage *= 1.25;
      s.weapons.flame.level++;
    },
  },
  {
    id: "flame-radius",
    name: "Wide blaze",
    description: "화염 반경 +20%",
    category: "FLAME",
    icon: "◎",
    maxLevel: 4,
    requires: "flame",
    apply: (s) => {
      s.weapons.flame.radius *= 1.2;
      s.weapons.flame.level++;
    },
  },
  {
    id: "flame-duration",
    name: "Lingering heat",
    description: "화염 지속시간 +25%",
    category: "FLAME",
    icon: "◷",
    maxLevel: 4,
    requires: "flame",
    apply: (s) => {
      s.weapons.flame.duration *= 1.25;
      s.weapons.flame.level++;
    },
  },
];
