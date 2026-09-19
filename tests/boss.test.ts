import { Game } from "../src/game/core/Game";
import { expect, it } from "vitest";
import { createState } from "../src/game/core/GameState";
import { snapshot } from "../src/game/core/GameState";
import { makeBoss, spawnBosses } from "../src/game/systems/EnemySpawnSystem";
import { collectDeaths } from "../src/game/systems/CombatSystem";
import {
  BOSS_CONFIG,
  BOSS_LOOKS,
  ENEMY_CONFIG,
  bossLook,
} from "../src/game/config/enemyConfig";
it("spawns exactly one boss per minute mark, even across a long frame", () => {
  const s = createState();
  s.elapsed = 59.9;
  spawnBosses(s);
  expect(s.enemies).toHaveLength(0);
  s.elapsed = 60;
  spawnBosses(s);
  spawnBosses(s);
  expect(s.enemies.filter((e) => e.kind === "boss")).toHaveLength(1);
  expect(s.sounds).toEqual(["boss"]);
  s.elapsed = 185;
  spawnBosses(s);
  expect(s.enemies.map((e) => e.bossIndex)).toEqual([1, 2, 3]);
});
it("later bosses have more health, speed and damage", () => {
  const s = createState();
  const first = makeBoss(s, 1);
  const fifth = makeBoss(s, 5);
  expect(first.maxHp).toBe(ENEMY_CONFIG.boss.maxHp);
  expect(first.moveSpeed).toBe(ENEMY_CONFIG.boss.moveSpeed);
  expect(fifth.maxHp).toBe(
    Math.round(ENEMY_CONFIG.boss.maxHp * (1 + BOSS_CONFIG.hpGrowth * 4)),
  );
  expect(fifth.moveSpeed).toBeGreaterThan(first.moveSpeed);
  expect(fifth.damage).toBeGreaterThan(first.damage);
  expect(fifth.expReward).toBeGreaterThan(first.expReward);
  expect(fifth.hp).toBe(fifth.maxHp);
});
it("exposes the newest living boss to the HUD and plays a heavier kill sound", () => {
  const s = createState();
  const a = makeBoss(s, 1);
  const b = makeBoss(s, 2);
  s.enemies.push(a, b);
  expect(snapshot(s).boss).toEqual({ index: 2, hp: b.hp, maxHp: b.maxHp });
  b.dead = true;
  collectDeaths(s);
  expect(s.sounds).toEqual(["bossKill"]);
  expect(s.kills).toBe(1);
  expect(s.orbs[0].value).toBe(b.expReward);
  expect(snapshot(s).boss?.index).toBe(1);
  a.dead = true;
  collectDeaths(s);
  expect(snapshot(s).boss).toBeNull();
});
it("cycles a distinct look per boss and wraps around the palette", () => {
  expect(BOSS_LOOKS.length).toBeGreaterThan(1);
  for (let i = 1; i < BOSS_LOOKS.length; i++) {
    expect(bossLook(i)).not.toBe(bossLook(i + 1));
    expect(bossLook(i).color).not.toBe(bossLook(i + 1).color);
    expect(bossLook(i).face).not.toBe(bossLook(i + 1).face);
  }
  expect(bossLook(BOSS_LOOKS.length + 1)).toBe(bossLook(1));
  expect(bossLook(0)).toBe(BOSS_LOOKS.at(-1));
});

it("queues one upgrade per boss alongside level-ups and freezes until chosen", () => {
  const game = new Game(() => {});
  game.start();
  const s = game.state;
  const bosses = [makeBoss(s, 1), makeBoss(s, 2)];
  for (const boss of bosses) {
    boss.dead = true;
    boss.x = 500;
    boss.y = 0;
  }
  s.enemies.push(...bosses);
  s.player.exp = s.player.expToNextLevel;
  game.update(0.02, { x: 0, y: 0 });
  expect(s.upgradeReason).toBe("boss");
  expect(s.status).toBe("levelup");
  expect(s.choices).toHaveLength(3);
  expect(s.player.level).toBe(1);
  expect(s.pendingBossUpgrades).toBe(1);
  const time = s.elapsed;
  game.update(1, { x: 1, y: 0 });
  expect(s.elapsed).toBe(time);
  collectDeaths(s);
  expect(s.pendingBossUpgrades).toBe(1);
  game.choose(s.choices[0].id);
  expect(s.upgradeReason).toBe("boss");
  expect(s.pendingBossUpgrades).toBe(0);
  game.choose(s.choices[0].id);
  expect(s.upgradeReason).toBe("level");
  expect(s.player.level).toBe(2);
  game.choose(s.choices[0].id);
  expect(s.status).toBe("playing");
  expect(s.orbs).toHaveLength(2);
  game.start();
  expect(game.state.pendingBossUpgrades).toBe(0);
});
it("does not replace game over with a boss reward", () => {
  const game = new Game(() => {});
  game.start();
  const boss = makeBoss(game.state, 1);
  boss.dead = true;
  game.state.enemies.push(boss);
  game.state.player.hp = 0;
  game.update(0.02, { x: 0, y: 0 });
  expect(game.state.status).toBe("gameover");
  expect(game.state.choices).toHaveLength(0);
});
