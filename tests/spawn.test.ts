import { expect, it } from "vitest";
import { createState } from "../src/game/core/GameState";
import { spawnEnemies } from "../src/game/systems/EnemySpawnSystem";
it("introduces fast and tank enemies at their thresholds", () => {
  const s = createState();
  s.elapsed = 60;
  spawnEnemies(s, 0, () => 0.2);
  expect(s.enemies[0].kind).toBe("fast");
  s.elapsed = 180;
  s.spawnTimer = 0;
  spawnEnemies(s, 0, () => 0.1);
  expect(s.enemies.at(-1)?.kind).toBe("tank");
});
it("increases spawn count, rate and late enemy HP", () => {
  const early = createState(),
    late = createState();
  late.elapsed = 400;
  spawnEnemies(early, 0, () => 0.9);
  spawnEnemies(late, 0, () => 0.9);
  expect(late.enemies.length).toBeGreaterThan(early.enemies.length);
  expect(late.spawnTimer).toBeLessThan(early.spawnTimer);
  expect(late.enemies[0].hp).toBeGreaterThan(early.enemies[0].hp);
});
