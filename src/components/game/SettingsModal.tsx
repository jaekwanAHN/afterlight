import { ModalFrame } from "./ModalFrame";
export interface Settings {
  effects: boolean;
  showGrid: boolean;
}
export const DEFAULT_SETTINGS: Settings = { effects: true, showGrid: true };
export function SettingsModal({
  settings,
  onChange,
  onClose,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
}) {
  return (
    <ModalFrame className="settings-overlay">
      <section
        className="modal settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <p className="eyebrow">MAKE IT YOUR NIGHT</p>
        <h2 id="settings-title">Settings</h2>
        <label>
          피격·사망 효과
          <input
            type="checkbox"
            checked={settings.effects}
            onChange={(e) =>
              onChange({ ...settings, effects: e.target.checked })
            }
          />
        </label>
        <label>
          배경 그리드
          <input
            type="checkbox"
            checked={settings.showGrid}
            onChange={(e) =>
              onChange({ ...settings, showGrid: e.target.checked })
            }
          />
        </label>
        <p>
          WASD / 방향키로 이동 · ESC 일시정지
          <br />
          PC 키보드 플레이를 권장합니다.
        </p>
        <button autoFocus className="primary" onClick={onClose}>
          완료
        </button>
      </section>
    </ModalFrame>
  );
}
