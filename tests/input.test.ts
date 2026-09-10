import { afterEach, expect, it, vi } from "vitest";
import { InputSystem } from "../src/game/systems/InputSystem";
afterEach(() => vi.unstubAllGlobals());
it("clears held keys on blur and removes listeners on dispose", () => {
  const win = new EventTarget(),
    doc = new EventTarget();
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", doc);
  const pause = vi.fn(),
    blur = vi.fn();
  const input = new InputSystem(pause, blur);
  input.attach();
  const key = (type: string, code: string) =>
    win.dispatchEvent(
      Object.assign(new Event(type, { cancelable: true }), {
        code,
        repeat: false,
      }),
    );
  key("keydown", "KeyW");
  key("keydown", "KeyD");
  expect(Math.hypot(input.direction().x, input.direction().y)).toBeCloseTo(1);
  win.dispatchEvent(new Event("blur"));
  expect(input.direction()).toEqual({ x: 0, y: 0 });
  expect(blur).toHaveBeenCalledOnce();
  key("keydown", "Escape");
  expect(pause).toHaveBeenCalledOnce();
  input.dispose();
  key("keydown", "KeyD");
  key("keydown", "Escape");
  expect(input.direction()).toEqual({ x: 0, y: 0 });
  expect(pause).toHaveBeenCalledOnce();
});
