"use client";
import { useEffect, useRef, useState } from "react";
import { Game } from "@/game/core/Game";
import { GameLoop } from "@/game/core/GameLoop";
import { createState, snapshot } from "@/game/core/GameState";
import { EMPTY_RECORDS, readRecords, saveRecords } from "@/game/core/records";
import { InputSystem } from "@/game/systems/InputSystem";
import { Renderer } from "@/game/rendering/Renderer";
import { StartScreen } from "./StartScreen";
import { GameHUD } from "./GameHUD";
import { LevelUpModal } from "./LevelUpModal";
import { GameOverModal } from "./GameOverModal";
import { PauseModal } from "./PauseModal";
import { SettingsModal } from "./SettingsModal";
import { AudioSystem } from "@/game/audio/AudioSystem";
import {
  DEFAULT_SETTINGS,
  readSettings,
  saveSettings,
} from "@/game/core/settings";
export function GameCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null),
    engine = useRef<Game | null>(null),
    inputRef = useRef<InputSystem | null>(null),
    rendererRef = useRef<Renderer | null>(null),
    audioRef = useRef<AudioSystem | null>(null);
  const [ui, setUi] = useState(() => snapshot(createState()));
  const [records, setRecords] = useState(EMPTY_RECORDS);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsOpenRef = useRef(false);
  useEffect(() => {
    if (!canvas.current) return;
    let renderer: Renderer;
    try {
      renderer = new Renderer(canvas.current);
    } catch {
      queueMicrotask(() =>
        setError(
          "Canvas를 초기화할 수 없습니다. 최신 브라우저에서 다시 시도해주세요.",
        ),
      );
      return;
    }
    let best = readRecords();
    let previous = "idle";
    const game = new Game((s) => {
      setUi(s);
      if (
        (s.status === "gameover" || s.status === "victory") &&
        previous !== s.status
      ) {
        best = saveRecords(best, s);
        setRecords(best);
      }
      previous = s.status;
    });
    const input = new InputSystem(
      () => {
        if (!settingsOpenRef.current) {
          input.clear();
          game.togglePause();
        }
      },
      () => game.pause(),
    );
    const audio = new AudioSystem();
    audio.attach();
    game.setSoundSink(audio.play);
    const stored = readSettings();
    renderer.setSettings(stored);
    audio.setSettings(stored);
    engine.current = game;
    inputRef.current = input;
    rendererRef.current = renderer;
    audioRef.current = audio;
    const resize = () => {
      const rect = canvas.current!.getBoundingClientRect();
      game.state.viewport = { width: rect.width, height: rect.height };
      renderer.resize(rect.width, rect.height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.current);
    window.addEventListener("resize", resize);
    resize();
    input.attach(canvas.current);
    const loop = new GameLoop(
      (dt) => game.update(dt, input.direction()),
      () => renderer.draw(game.state, input.joystick()),
    );
    loop.start();
    queueMicrotask(() => {
      setRecords(best);
      setSettings(stored);
      setReady(true);
    });
    return () => {
      loop.stop();
      input.dispose();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      engine.current = null;
      inputRef.current = null;
      rendererRef.current = null;
      audio.dispose();
      audioRef.current = null;
    };
  }, []);
  const start = () => {
    inputRef.current?.clear();
    engine.current?.start();
  };
  const openSettings = () => {
    engine.current?.pause();
    settingsOpenRef.current = true;
    setSettingsOpen(true);
  };
  return (
    <main className={`game-shell ${ui.status === "idle" ? "is-idle" : ""}`}>
      <canvas
        ref={canvas}
        className="game-canvas"
        aria-label="Afterlight 게임 필드. WASD 또는 방향키로 이동, 터치는 누른 채 끌기, ESC로 일시정지."
      />
      {error ? (
        <div className="overlay">
          <p role="alert">{error}</p>
        </div>
      ) : (
        <>
          {ui.status === "idle" ? (
            <StartScreen
              ready={ready}
              records={records}
              onStart={start}
              onSettings={openSettings}
            />
          ) : (
            <GameHUD ui={ui} onPause={() => engine.current?.pause()} />
          )}
          {ui.status === "levelup" && !settingsOpen && (
            <LevelUpModal
              choices={ui.choices}
              onChoose={(id) => {
                inputRef.current?.clear();
                engine.current?.choose(id);
              }}
            />
          )}
          {ui.status === "paused" && !settingsOpen && (
            <PauseModal
              onResume={() => engine.current?.togglePause()}
              onRestart={start}
              onSettings={openSettings}
            />
          )}
          {(ui.status === "gameover" || ui.status === "victory") && (
            <GameOverModal
              ui={ui}
              onRestart={start}
              onHome={() => engine.current?.home()}
            />
          )}
        </>
      )}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onChange={(value) => {
            setSettings(value);
            saveSettings(value);
            rendererRef.current?.setSettings(value);
            audioRef.current?.setSettings(value);
            // Preview the new level so the slider is audible while dragging.
            if (value.sound && value.volume !== settings.volume)
              audioRef.current?.play("select");
          }}
          onClose={() => {
            settingsOpenRef.current = false;
            setSettingsOpen(false);
          }}
        />
      )}
    </main>
  );
}
