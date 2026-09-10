import type { Upgrade } from "./upgradeTypes";
export const BEAM_UPGRADES: Upgrade[] = [
  {
    id: "beam",
    name: "Dawn lance",
    description: "광선 획득 · 회전하는 빛줄기가 닿는 모든 적을 태움",
    category: "BEAM",
    icon: "╱",
    maxLevel: 1,
    apply: (s) => {
      s.weapons.beam.level = 1;
    },
  },
  {
    id: "beam-power",
    name: "Searing light",
    description: "광선 피해량 +25%",
    category: "BEAM",
    icon: "✦",
    maxLevel: 6,
    requires: "beam",
    apply: (s) => {
      s.weapons.beam.damage *= 1.25;
      s.weapons.beam.level++;
    },
  },
  {
    id: "beam-width",
    name: "Broad ray",
    description: "광선 두께 +30%",
    category: "BEAM",
    icon: "═",
    maxLevel: 4,
    requires: "beam",
    apply: (s) => {
      s.weapons.beam.width *= 1.3;
      s.weapons.beam.level++;
    },
  },
  {
    id: "beam-speed",
    name: "Sweeping arc",
    description: "광선 회전 속도 +20%",
    category: "BEAM",
    icon: "↻",
    maxLevel: 4,
    requires: "beam",
    apply: (s) => {
      s.weapons.beam.speed *= 1.2;
      s.weapons.beam.level++;
    },
  },
  {
    id: "beam-count",
    name: "Split spectrum",
    description: "광선 +1",
    category: "BEAM",
    icon: "✳",
    maxLevel: 2,
    requires: "beam",
    apply: (s) => {
      s.weapons.beam.count++;
      s.weapons.beam.level++;
    },
  },
];
