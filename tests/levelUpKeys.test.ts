import { expect, it } from "vitest";
import { choiceAction } from "../src/components/game/levelUpKeys";
it("moves the highlight with A/D and the arrow keys, wrapping at the ends", () => {
  expect(choiceAction("KeyD", 0, 3)).toEqual({ type: "move", index: 1 });
  expect(choiceAction("ArrowRight", 2, 3)).toEqual({ type: "move", index: 0 });
  expect(choiceAction("KeyA", 0, 3)).toEqual({ type: "move", index: 2 });
  expect(choiceAction("ArrowLeft", 1, 3)).toEqual({ type: "move", index: 0 });
});
it("confirms with Enter or Space and ignores everything else", () => {
  expect(choiceAction("Enter", 1, 3)).toEqual({ type: "confirm" });
  expect(choiceAction("NumpadEnter", 1, 3)).toEqual({ type: "confirm" });
  expect(choiceAction("Space", 1, 3)).toEqual({ type: "confirm" });
  expect(choiceAction("KeyW", 1, 3)).toBeNull();
  expect(choiceAction("Escape", 1, 3)).toBeNull();
  expect(choiceAction("KeyD", 0, 0)).toBeNull();
});
