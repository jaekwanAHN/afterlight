// Physical key codes so the bindings survive a Korean IME being toggled on.
const PREV = new Set(["KeyA", "ArrowLeft"]);
const NEXT = new Set(["KeyD", "ArrowRight"]);
const CONFIRM = new Set(["Enter", "NumpadEnter", "Space"]);
export type ChoiceAction =
  { type: "move"; index: number } | { type: "confirm" } | null;
export function choiceAction(
  code: string,
  index: number,
  count: number,
): ChoiceAction {
  if (count === 0) return null;
  if (PREV.has(code))
    return { type: "move", index: (index + count - 1) % count };
  if (NEXT.has(code)) return { type: "move", index: (index + 1) % count };
  if (CONFIRM.has(code)) return { type: "confirm" };
  return null;
}
