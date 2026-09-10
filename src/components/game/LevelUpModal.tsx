import { ModalFrame } from "./ModalFrame";
import type { UpgradeChoice } from "@/game/upgrades/upgradeTypes";
export function LevelUpModal({
  choices,
  onChoose,
}: {
  choices: UpgradeChoice[];
  onChoose: (id: string) => void;
}) {
  return (
    <ModalFrame>
      <section
        className="modal level-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-title"
      >
        <p className="eyebrow">A LITTLE STRONGER</p>
        <h2 id="level-title">Choose your light.</h2>
        <p>레벨 업! 이번 밤을 함께할 강화를 선택하세요.</p>
        <div className="upgrade-grid">
          {choices.map((c, i) => (
            <button
              autoFocus={i === 0}
              className="upgrade-card"
              key={c.id}
              onClick={() => onChoose(c.id)}
            >
              <span className="upgrade-icon">{c.icon}</span>
              <small>{c.category}</small>
              <h3>{c.name}</h3>
              <p>{c.description}</p>
              <span className="card-footer">
                RANK {c.rank} <b>↗</b>
              </span>
            </button>
          ))}
        </div>
        <small>강화를 선택할 때까지 시간이 멈춥니다.</small>
      </section>
    </ModalFrame>
  );
}
