import type { Upgrade } from "./upgradeTypes";
export const BEAM_UPGRADES: Upgrade[] = [
  {
    id: "beam",
    name: "Dawn lance",
    description: "광선 획득 · 충전 후 강력한 빛줄기를 한 번에 발사",
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
    id: "beam-haste",
    name: "Rapid charge",
    description: "광선 재사용 대기시간 −12%",
    category: "BEAM",
    icon: "ϟ",
    maxLevel: 6,
    requires: "beam",
    apply: (s) => {
      s.weapons.beam.cooldown *= 0.88;
      s.weapons.beam.level++;
    },
  },
  {
    id: "beam-count",
    name: "Split spectrum",
    description: "광선 +1 (부채꼴로 퍼짐)",
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
