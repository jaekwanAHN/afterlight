import type { Upgrade } from "./upgradeTypes";
export const STORM_UPGRADES: Upgrade[] = [
  {
    id: "storm",
    name: "Skyfall",
    description: "낙뢰 획득 · 화면 안 적 위치에 무작위 광역 피해",
    category: "STORM",
    icon: "☄",
    maxLevel: 1,
    apply: (s) => {
      s.weapons.storm.level = 1;
    },
  },
  {
    id: "storm-haste",
    name: "Gathering clouds",
    description: "낙뢰 재사용 대기시간 −12%",
    category: "STORM",
    icon: "ϟ",
    maxLevel: 6,
    requires: "storm",
    apply: (s) => {
      s.weapons.storm.cooldown *= 0.88;
      s.weapons.storm.level++;
    },
  },
  {
    id: "storm-power",
    name: "Heavy sky",
    description: "낙뢰 피해량 +25%",
    category: "STORM",
    icon: "✦",
    maxLevel: 6,
    requires: "storm",
    apply: (s) => {
      s.weapons.storm.damage *= 1.25;
      s.weapons.storm.level++;
    },
  },
  {
    id: "storm-range",
    name: "Wide strike",
    description: "낙뢰 범위 +15%",
    category: "STORM",
    icon: "◎",
    maxLevel: 5,
    requires: "storm",
    apply: (s) => {
      s.weapons.storm.radius *= 1.15;
      s.weapons.storm.level++;
    },
  },
];
