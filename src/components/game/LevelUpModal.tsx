import { useEffect, useRef, useState } from "react";
import { ModalFrame } from "./ModalFrame";
import { choiceAction } from "./levelUpKeys";
import type { UpgradeChoice } from "@/game/upgrades/upgradeTypes";
export function LevelUpModal({
  choices,
  onChoose,
}: {
  choices: UpgradeChoice[];
  onChoose: (id: string) => void;
}) {
  const [selected, setSelected] = useState(0);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    cards.current[selected]?.focus();
  }, [selected]);
  const onKeyDown = (event: React.KeyboardEvent) => {
    const action = choiceAction(event.code, selected, choices.length);
    if (!action) return;
    event.preventDefault();
    // A key still held from moving when the modal opened would otherwise
    // auto-repeat through the cards (or confirm) before the player reacts.
    if (event.repeat) return;
    if (action.type === "move") setSelected(action.index);
    else onChoose(choices[selected].id);
  };
  return (
    <ModalFrame>
      <section
        className="modal level-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-title"
        onKeyDown={onKeyDown}
      >
        <p className="eyebrow">A LITTLE STRONGER</p>
        <h2 id="level-title">Choose your light.</h2>
        <p>레벨 업! 이번 밤을 함께할 강화를 선택하세요.</p>
        <div className="upgrade-grid">
          {choices.map((c, i) => (
            <button
              autoFocus={i === 0}
              className={`upgrade-card${i === selected ? " is-selected" : ""}`}
              key={c.id}
              ref={(node) => {
                cards.current[i] = node;
              }}
              onClick={() => onChoose(c.id)}
              onMouseEnter={() => setSelected(i)}
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
        <small>
          A/D 또는 ←/→ 로 고르고 Enter·Space 로 선택. 선택할 때까지 시간이
          멈춥니다.
        </small>
      </section>
    </ModalFrame>
  );
}
