import type { Player } from "../entities/Player";
import type { Vec2 } from "../utils/math";
export function movePlayer(player: Player, input: Vec2, dt: number) {
  player.x += input.x * player.moveSpeed * dt;
  player.y += input.y * player.moveSpeed * dt;
  if (input.x || input.y) player.facing = Math.atan2(input.y, input.x);
  player.invincible = Math.max(0, player.invincible - dt);
}
