import { expect, it } from "vitest";
import { circlesOverlap, segmentHitsCircle } from "../src/game/utils/collision";
import { SpatialGrid } from "../src/game/utils/SpatialGrid";
import { createState } from "../src/game/core/GameState";
import { spawnPosition, makeEnemy } from "../src/game/systems/EnemySpawnSystem";
import { playerContacts } from "../src/game/systems/CollisionSystem";
it("includes touching circles", () =>
  expect(
    circlesOverlap({ x: 0, y: 0, radius: 5 }, { x: 10, y: 0, radius: 5 }),
  ).toBe(true));
it("rejects separated circles", () =>
  expect(
    circlesOverlap({ x: 0, y: 0, radius: 5 }, { x: 11, y: 0, radius: 5 }),
  ).toBe(false));
it("detects swept collisions", () =>
  expect(
    segmentHitsCircle(
      { x: -100, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 0, radius: 5 },
      2,
    ),
  ).toBe(true));
it("queries negative world cells without duplicates", () => {
  const g = new SpatialGrid(64);
  g.rebuild([
    { x: -1, y: -1 },
    { x: 500, y: 500 },
  ]);
  expect(g.query(0, 0, 10)).toEqual([{ x: -1, y: -1 }]);
});
it("spawns off screen at every angle", () => {
  const s = createState();
  for (let i = 0; i < 100; i++) {
    const p = spawnPosition(s, () => i / 100);
    expect(
      Math.abs(p.x) > s.viewport.width / 2 + 24 ||
        Math.abs(p.y) > s.viewport.height / 2 + 24,
    ).toBe(true);
  }
});
it("grants contact invulnerability", () => {
  const s = createState();
  const e = makeEnemy(s, "normal");
  e.x = e.y = 0;
  const grid = new SpatialGrid<typeof e>();
  grid.rebuild([e]);
  playerContacts(s, grid);
  playerContacts(s, grid);
  expect(s.player.hp).toBe(90);
});
