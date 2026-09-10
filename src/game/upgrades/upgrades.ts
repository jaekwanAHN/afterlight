import type { Upgrade, UpgradeChoice } from "./upgradeTypes";
import type { GameState } from "../core/GameState";
import { pickRandom } from "../utils/random";
export const UPGRADES: Upgrade[] = [
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
  // Repeatable fallback choices guarantee three distinct options even after all capped upgrades are exhausted.
  {
    id: "overcharge",
    name: "Afterglow",
    description: "마법탄 피해량 +5%",
    category: "PASSIVE",
    icon: "◇",
    maxLevel: Infinity,
    apply: (s) => {
      s.weapons.bolt.damage *= 1.05;
    },
  },
  {
    id: "renewal",
    name: "Enduring ember",
    description: "최대 체력 +5 · 체력 5 회복",
    category: "PASSIVE",
    icon: "⌁",
    maxLevel: Infinity,
    apply: (s) => {
      s.player.maxHp += 5;
      s.player.hp = Math.min(s.player.maxHp, s.player.hp + 5);
    },
  },
];
export function chooseUpgrades(
  state: GameState,
  random: () => number = Math.random,
): UpgradeChoice[] {
  let candidates = UPGRADES.filter(
    (u) => (state.upgradeLevels[u.id] ?? 0) < u.maxLevel,
  );
  const main = candidates.filter(
    (u) => u.id !== "overcharge" && u.id !== "renewal",
  );
  if (main.length >= 3) candidates = main;
  return pickRandom(candidates, 3, random).map((u) => ({
    id: u.id,
    name: u.name,
    description: u.description,
    category: u.category,
    icon: u.icon,
    rank: (state.upgradeLevels[u.id] ?? 0) + 1,
    maxLevel: u.maxLevel,
  }));
}
export function applyUpgrade(state: GameState, id: string) {
  if (state.status !== "levelup" || !state.choices.some((c) => c.id === id))
    return false;
  const upgrade = UPGRADES.find((u) => u.id === id);
  if (!upgrade || (state.upgradeLevels[id] ?? 0) >= upgrade.maxLevel)
    return false;
  upgrade.apply(state);
  state.upgradeLevels[id] = (state.upgradeLevels[id] ?? 0) + 1;
  state.choices = [];
  state.status = "playing";
  return true;
}
