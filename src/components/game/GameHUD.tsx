import type { Snapshot } from "@/game/core/GameState";
import { formatTime } from "@/game/utils/math";
export function GameHUD({
  ui,
  onPause,
}: {
  ui: Snapshot;
  onPause: () => void;
}) {
  return (
    <div className="hud">
      <header className="hud-top">
        <div className="health-block">
          <div className="meter-label">
            <span>♥ VITALITY</span>
            <strong>
              {Math.ceil(ui.hp)} <i>/ {ui.maxHp}</i>
            </strong>
          </div>
          <div
            className="meter"
            role="progressbar"
            aria-label="체력"
            aria-valuenow={ui.hp}
            aria-valuemin={0}
            aria-valuemax={ui.maxHp}
          >
            <span style={{ width: `${(ui.hp / ui.maxHp) * 100}%` }} />
          </div>
        </div>
        <div className="timer">
          <small>UNTIL DAWN</small>
          <strong data-testid="timer">{formatTime(ui.elapsed)}</strong>
          <span>/ 10:00</span>
        </div>
        <button
          className="pause-button"
          aria-label="일시정지"
          onClick={onPause}
          disabled={ui.status !== "playing"}
        >
          Ⅱ <span>ESC</span>
        </button>
      </header>
      <div className="xp-hud">
        <span>
          LV. <b>{ui.level.toString().padStart(2, "0")}</b>
        </span>
        <div
          className="meter xp"
          role="progressbar"
          aria-label="경험치"
          aria-valuenow={ui.exp}
          aria-valuemin={0}
          aria-valuemax={ui.expToNextLevel}
        >
          <span
            style={{
              width: `${Math.min(100, (ui.exp / ui.expToNextLevel) * 100)}%`,
            }}
          />
        </div>
        <small>
          {ui.exp} / {ui.expToNextLevel} XP
        </small>
      </div>
      <footer className="hud-bottom">
        <div className="loadout">
          <div
            className="weapon-slot"
            title={`Magic Bolt · 투사체 ${ui.boltCount}개`}
          >
            ✦<small>{ui.boltCount}</small>
          </div>
          <div
            className={`weapon-slot ${ui.orbitLevel ? "" : "locked"}`}
            title={
              ui.orbitLevel
                ? `Orbit Guardian · Lv.${ui.orbitLevel}`
                : "레벨업 시 회전 구체 획득 가능"
            }
          >
            ◌<small>{ui.orbitLevel || "—"}</small>
          </div>
          <div
            className={`weapon-slot ${ui.boomerangLevel ? "" : "locked"}`}
            title={
              ui.boomerangLevel
                ? `Returning Edge · Lv.${ui.boomerangLevel}`
                : "레벨업 시 부메랑 획득 가능"
            }
          >
            ↺<small>{ui.boomerangLevel || "—"}</small>
          </div>
          <div
            className={`weapon-slot ${ui.stormLevel ? "" : "locked"}`}
            title={
              ui.stormLevel
                ? `Skyfall · Lv.${ui.stormLevel}`
                : "레벨업 시 낙뢰 획득 가능"
            }
          >
            ☄<small>{ui.stormLevel || "—"}</small>
          </div>
          <div
            className={`weapon-slot ${ui.beamLevel ? "" : "locked"}`}
            title={
              ui.beamLevel
                ? `Dawn Lance · Lv.${ui.beamLevel}`
                : "레벨업 시 광선 획득 가능"
            }
          >
            ╱<small>{ui.beamLevel || "—"}</small>
          </div>
          <div
            className={`weapon-slot ${ui.novaLevel ? "" : "locked"}`}
            title={
              ui.novaLevel
                ? `Shockwave · Lv.${ui.novaLevel}`
                : "레벨업 시 충격파 획득 가능"
            }
          >
            ◉<small>{ui.novaLevel || "—"}</small>
          </div>
          <div
            className={`weapon-slot ${ui.flameLevel ? "" : "locked"}`}
            title={
              ui.flameLevel
                ? `Ember Trail · Lv.${ui.flameLevel}`
                : "레벨업 시 화염 지대 획득 가능"
            }
          >
            ♨<small>{ui.flameLevel || "—"}</small>
          </div>
          <span>
            AUTO ATTACK
            <br />
            <small>이동에 집중하세요</small>
          </span>
        </div>
        <div className="kill-count">
          <span>✕</span>
          <strong data-testid="kills">{ui.kills.toLocaleString()}</strong>
          <small>DEFEATED</small>
        </div>
      </footer>
    </div>
  );
}
