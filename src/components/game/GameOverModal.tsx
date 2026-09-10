import { ModalFrame } from "./ModalFrame";
import type { Snapshot } from "@/game/core/GameState";
import { formatTime } from "@/game/utils/math";
export function GameOverModal({
  ui,
  onRestart,
  onHome,
}: {
  ui: Snapshot;
  onRestart: () => void;
  onHome: () => void;
}) {
  const victory = ui.status === "victory";
  return (
    <ModalFrame>
      <section
        className="modal result-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
      >
        <div className="result-symbol">{victory ? "✳" : "◇"}</div>
        <p className="eyebrow">
          {victory ? "DAWN HAS ARRIVED" : "EVERY LIGHT LEAVES A TRACE"}
        </p>
        <h2 id="result-title">
          {victory ? "You survived." : "Until next night."}
        </h2>
        <p>
          {victory
            ? "10분 생존 성공! 새벽을 맞이했습니다."
            : "GAME OVER · 당신의 빛은 다시 타오릅니다."}
        </p>
        <div className="result-stats">
          <div>
            <small>SURVIVAL TIME</small>
            <strong>{formatTime(ui.elapsed)}</strong>
          </div>
          <div>
            <small>DEFEATED</small>
            <strong>{ui.kills}</strong>
          </div>
          <div>
            <small>LEVEL</small>
            <strong>{ui.level}</strong>
          </div>
        </div>
        <button autoFocus className="primary" onClick={onRestart}>
          PLAY AGAIN <span>↗</span>
        </button>
        <button className="text-button" onClick={onHome}>
          시작 화면으로
        </button>
      </section>
    </ModalFrame>
  );
}
