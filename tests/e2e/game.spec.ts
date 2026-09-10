import { test, expect } from "@playwright/test";
test("start, keyboard, pause, settings, restart and responsive canvas", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "START SURVIVING" }),
  ).toBeEnabled();
  await page.screenshot({ path: "test-results/start-desktop.png" });
  await page.getByRole("button", { name: "START SURVIVING" }).click();
  await expect(page.getByRole("progressbar", { name: "체력" })).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await page.keyboard.down("d");
  await page.waitForTimeout(500);
  await page.keyboard.up("d");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toContainText("The night can wait.");
  const pausedTime = await page.getByTestId("timer").textContent();
  await page.waitForTimeout(1200);
  await expect(page.getByTestId("timer")).toHaveText(pausedTime!);
  await page.getByRole("button", { name: "설정", exact: true }).click();
  await page.getByLabel("배경 그리드").uncheck();
  await page.getByRole("button", { name: "완료", exact: true }).click();
  await page.getByRole("button", { name: "RESUME" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "새로 시작", exact: true }).click();
  await expect(page.getByTestId("timer")).toHaveText("00:00");
  await expect(page.getByTestId("kills")).toHaveText("0");
  await page.screenshot({ path: "test-results/game-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  const dimensions = await page.locator("canvas").evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    return {
      width: canvas.width,
      height: canvas.height,
      cssWidth: canvas.getBoundingClientRect().width,
    };
  });
  expect(dimensions.cssWidth).toBe(390);
  expect(dimensions.width).toBeGreaterThanOrEqual(390);
  await page.keyboard.press("Escape");
  await page.screenshot({ path: "test-results/pause-mobile.png" });
  expect(errors).toEqual([]);
});
test("real combat, level choice, game over and persistent records", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.addInitScript(() => {
    let seed = 731;
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  });
  await page.clock.install();
  await page.goto("/game");
  await page.getByRole("button", { name: "START SURVIVING" }).click();
  let leveled = false;
  for (let i = 0; i < 360; i++) {
    if (!leveled) {
      // Find visible green gems in rendered pixels; move using real keyboard input.
      // The test never reads or edits the engine's entities or player state.
      const target = await page.locator("canvas").evaluate((element) => {
        const canvas = element as HTMLCanvasElement;
        const { width, height } = canvas;
        const pixels = canvas
          .getContext("2d")!
          .getImageData(0, 0, width, height).data;
        let best = Infinity,
          tx = 0,
          ty = 0;
        for (let y = 0; y < height; y += 4)
          for (let x = 0; x < width; x += 4) {
            const at = (y * width + x) * 4,
              r = pixels[at],
              g = pixels[at + 1],
              b = pixels[at + 2];
            const dx = x - width / 2,
              dy = y - height / 2,
              d = dx * dx + dy * dy;
            if (
              r > 85 &&
              g > r * 1.15 &&
              g > b * 1.35 &&
              b > 35 &&
              d > 45 ** 2 &&
              d < best
            ) {
              best = d;
              tx = dx;
              ty = dy;
            }
          }
        return { x: tx, y: ty };
      });
      for (const [key, pressed] of [
        ["a", target.x < -8],
        ["d", target.x > 8],
        ["w", target.y < -8],
        ["s", target.y > 8],
      ] as const) {
        if (pressed) await page.keyboard.down(key);
        else await page.keyboard.up(key);
      }
    }
    await page.clock.runFor(leveled ? 1000 : 250);
    const levelDialog = page.getByRole("dialog", {
      name: "Choose your light.",
    });
    if (await levelDialog.isVisible()) {
      const cards = levelDialog.locator("button");
      await expect(cards).toHaveCount(3);
      if (!leveled) {
        await page.screenshot({ path: "test-results/level-up.png" });
        const timer = await page.getByTestId("timer").textContent();
        await page.clock.runFor(3000);
        await expect(page.getByTestId("timer")).toHaveText(timer!);
      }
      for (const key of ["a", "d", "w", "s"]) await page.keyboard.up(key);
      await cards.first().click();
      leveled = true;
    }
    if (await page.getByRole("button", { name: "PLAY AGAIN" }).isVisible())
      break;
  }
  expect(leveled).toBe(true);
  await expect(page.getByRole("button", { name: "PLAY AGAIN" })).toBeVisible();
  expect(
    Number(
      (await page.getByTestId("kills").textContent())?.replaceAll(",", ""),
    ),
  ).toBeGreaterThan(0);
  await page.screenshot({ path: "test-results/game-over.png" });
  const record = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("afterlight.records.v1") || "{}") as {
        bestTime: number;
        maxKills: number;
      },
  );
  expect(record.bestTime).toBeGreaterThan(0);
  expect(record.maxKills).toBeGreaterThan(0);
  await page.getByRole("button", { name: "PLAY AGAIN" }).click();
  await expect(page.getByTestId("kills")).toHaveText("0");
  await expect(page.getByRole("progressbar", { name: "체력" })).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "START SURVIVING" }),
  ).toBeVisible();
  await expect(page.locator(".records")).not.toContainText("00:00");
});
test("mobile start and high DPI sizing", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100");
  await expect(
    page.getByRole("button", { name: "START SURVIVING" }),
  ).toBeEnabled();
  await expect(page.locator("canvas")).toHaveAttribute("width", "780");
  await page.screenshot({ path: "test-results/start-mobile.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await context.close();
});
