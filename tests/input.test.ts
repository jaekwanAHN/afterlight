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
it("drives movement from a floating touch joystick", () => {
  const win = new EventTarget(),
    doc = new EventTarget(),
    surface = new EventTarget();
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", doc);
  const input = new InputSystem(vi.fn(), vi.fn());
  input.attach(surface as unknown as HTMLElement);
  const pointer = (
    target: EventTarget,
    type: string,
    pointerId: number,
    x: number,
    y: number,
    pointerType = "touch",
  ) =>
    target.dispatchEvent(
      Object.assign(new Event(type, { cancelable: true }), {
        pointerId,
        clientX: x,
        clientY: y,
        pointerType,
      }),
    );
  pointer(surface, "pointerdown", 1, 100, 100, "mouse");
  expect(input.joystick()).toBeNull();
  pointer(surface, "pointerdown", 1, 100, 100);
  expect(input.joystick()).toMatchObject({ originX: 100, originY: 100 });
  pointer(win, "pointermove", 1, 105, 100);
  expect(input.direction()).toEqual({ x: 0, y: 0 });
  pointer(win, "pointermove", 1, 100, 180);
  expect(input.direction()).toEqual({ x: 0, y: 1 });
  // A second finger must not steal the stick.
  pointer(surface, "pointerdown", 2, 300, 300);
  pointer(win, "pointermove", 2, 200, 300);
  expect(input.direction()).toEqual({ x: 0, y: 1 });
  pointer(win, "pointerup", 2, 200, 300);
  expect(input.joystick()).not.toBeNull();
  pointer(win, "pointerup", 1, 100, 180);
  expect(input.joystick()).toBeNull();
  expect(input.direction()).toEqual({ x: 0, y: 0 });
  input.dispose();
  pointer(surface, "pointerdown", 3, 0, 0);
  expect(input.joystick()).toBeNull();
});
