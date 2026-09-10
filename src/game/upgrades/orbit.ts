import type { Upgrade } from "./upgradeTypes";
export const ORBIT_UPGRADES: Upgrade[] = [
  {
    id: "orbit",
    name: "Orbit guardian",
    description: "회전 구체 획득 · 강화 시 개수·속도·피해·크기 증가",
    category: "ORBIT WEAPON",
    icon: "◌",
    maxLevel: 6,
    apply: (s) => {
      const w = s.weapons.orbit;
      w.level++;
      w.count = w.level;
      if (w.level > 1) {
        w.damage *= 1.2;
        w.speed *= 1.12;
        w.radius += 1.5;
      }
    },
  },
];
