import Link from "next/link";
import type { Records } from "@/game/core/records";
import { formatTime } from "@/game/utils/math";
export function StartScreen({
  records,
  onStart,
  onSettings,
  ready,
}: {
  records: Records;
  onStart: () => void;
  onSettings: () => void;
  ready: boolean;
}) {
  return (
    <div className="start-screen">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Afterlight 홈">
          <span className="brand-mark">✳</span> AFTERLIGHT
          <span className="edition">SURVIVAL ARCADE</span>
        </Link>
        <button className="icon-button" onClick={onSettings} aria-label="설정">
          ⚙
        </button>
      </header>
      <div className="start-content">
        <section className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> ONE NIGHT. ONE SURVIVOR.
          </div>
          <h1>
            Outnumbered.
            <br />
            Never <em>outshone.</em>
          </h1>
          <p className="hero-description">
            어둠은 끝없이 몰려옵니다.
            <br />
            빛을 모으고, 강해지고, 새벽까지 살아남으세요.
          </p>
          <button
            className="primary start-button"
            disabled={!ready}
            onClick={onStart}
          >
            <span>START SURVIVING</span>
            <span>↗</span>
          </button>
          <div className="run-details">
            <span>◷ 10 MINUTE RUN</span>
            <span>◇ EVERY RUN IS DIFFERENT</span>
          </div>
          <div className="records">
            <div>
              <small>BEST SURVIVAL</small>
              <strong>{formatTime(records.bestTime)}</strong>
            </div>
            <div>
              <small>MOST DEFEATED</small>
              <strong>{records.maxKills.toLocaleString()}</strong>
            </div>
            <div>
              <small>HIGHEST LEVEL</small>
              <strong>
                <span>LV.</span>{" "}
                {records.highestLevel.toString().padStart(2, "0")}
              </strong>
            </div>
          </div>
        </section>
        <div className="field-caption">
          <span className="live-dot" /> THE HOLLOW FIELDS <span>SECTOR 01</span>
        </div>
      </div>
      <footer className="start-footer">
        <div className="control-tip">
          <div className="key-group">
            <kbd>W</kbd>
            <div>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </div>
          </div>
          <span>
            MOVE TO SURVIVE
            <small>WASD · 방향키 · 터치 드래그 · 공격은 자동</small>
          </span>
        </div>
        <div className="footer-hint">
          <kbd>ESC</kbd> 잠깐 숨 고르기
        </div>
        <span className="version">
          BUILT FOR THE LAST ONE STANDING <b>v1.0</b>
        </span>
      </footer>
    </div>
  );
}
