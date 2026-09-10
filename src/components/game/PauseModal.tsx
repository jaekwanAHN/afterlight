import { ModalFrame } from "./ModalFrame";
export function PauseModal({
  onResume,
  onRestart,
  onSettings,
}: {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
}) {
  return (
    <ModalFrame>
      <section
        className="modal pause-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
      >
        <p className="eyebrow">TAKE A BREATH</p>
        <h2 id="pause-title">The night can wait.</h2>
        <p>PAUSED · 잠시 멈췄습니다.</p>
        <button autoFocus className="primary" onClick={onResume}>
          RESUME ↗
        </button>
        <button className="secondary" onClick={onRestart}>
          새로 시작
        </button>
        <button className="text-button" onClick={onSettings}>
          설정
        </button>
      </section>
    </ModalFrame>
  );
}
