import { ModalFrame } from "./ModalFrame";
import type { Settings } from "@/game/core/settings";
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
        <label>
          효과음
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => onChange({ ...settings, sound: e.target.checked })}
          />
        </label>
        <label>
          볼륨
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.volume * 100)}
            disabled={!settings.sound}
            aria-valuetext={`${Math.round(settings.volume * 100)}%`}
            onChange={(e) =>
              onChange({ ...settings, volume: Number(e.target.value) / 100 })
            }
          />
        </label>
        <label>
          배경음악
          <input
            type="checkbox"
            checked={settings.music}
            onChange={(e) => onChange({ ...settings, music: e.target.checked })}
          />
        </label>
        <label>
          음악 볼륨
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.musicVolume * 100)}
            disabled={!settings.music}
            aria-valuetext={`${Math.round(settings.musicVolume * 100)}%`}
            onChange={(e) =>
              onChange({
                ...settings,
                musicVolume: Number(e.target.value) / 100,
              })
            }
          />
        </label>
        <p>
          WASD / 방향키로 이동 · ESC 일시정지
          <br />
          모바일은 화면을 누른 채 끌어서 이동합니다.
        </p>
        <button autoFocus className="primary" onClick={onClose}>
          완료
        </button>
      </section>
    </ModalFrame>
  );
}
