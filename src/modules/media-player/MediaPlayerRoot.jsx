import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainWindow } from "./components/MainWindow.jsx";
import { PlaylistWindow } from "./components/PlaylistWindow.jsx";
import { EqualizerWindow } from "./components/EqualizerWindow.jsx";
import { LibraryWindow } from "./components/LibraryWindow.jsx";
import { VisualizerWindow } from "./components/VisualizerWindow.jsx";
import { FriendsListeningPanel } from "./components/FriendsListeningPanel.jsx";
import { MiniPlayer } from "./components/MiniPlayer.jsx";
import { WindowFrame } from "./components/WindowFrame.jsx";
import { SkinRenderer } from "./components/SkinRenderer.jsx";
import { SkinPicker } from "./components/SkinPicker.jsx";
import { usePlayer } from "./hooks/usePlayer.js";
import { usePlaylist } from "./hooks/usePlaylist.js";
import { useEqualizer } from "./hooks/useEqualizer.js";
import { useVisualizer } from "./hooks/useVisualizer.js";
import { PlayerProvider, usePlayerStore } from "./store/playerStore.jsx";
import { STRINGS, windowTitle } from "./i18n/strings.js";
import { WINDOW_REGISTRY, classicLayout } from "./windowRegistry.js";
import {
  applyWindowSnap,
  loadPersistedLayout,
  persistLayout,
  stackLayout,
} from "./lib/windowSnap.js";
import "./styles/media-player.css";

export default function MediaPlayerRoot() {
  return (
    <PlayerProvider>
      <SkinRenderer>
        <MediaPlayerDesktop />
      </SkinRenderer>
    </PlayerProvider>
  );
}

function pickNextTrack(tracks, current, { shuffle, repeat }) {
  if (!tracks.length) return null;
  if (repeat === "one" && current) return current;
  if (shuffle) {
    const pool = tracks.filter((t) => t.id !== current?.id);
    const list = pool.length ? pool : tracks;
    return list[Math.floor(Math.random() * list.length)];
  }
  if (!current) return tracks[0];
  const idx = tracks.findIndex((t) => t.id === current.id);
  if (idx < 0) return tracks[0];
  if (idx + 1 < tracks.length) return tracks[idx + 1];
  return repeat === "all" ? tracks[0] : null;
}

function MediaPlayerDesktop() {
  const navigate = useNavigate();
  const { state } = usePlayerStore();
  const playlist = usePlaylist();
  const [windows, setWindows] = useState(() => loadPersistedLayout(WINDOW_REGISTRY) ?? classicLayout());
  const [compact, setCompact] = useState(false);
  const [focusedId, setFocusedId] = useState("player.main");

  const visualizerOpen = useMemo(
    () => windows.some((w) => w.id === "player.visualizer" && w.visible && !w.minimized),
    [windows],
  );

  const playFnRef = useRef(null);

  const handleNeedNextTrack = useCallback(
    (current) => {
      const next = pickNextTrack(playlist.tracks, current, state);
      if (next) playFnRef.current?.(next, 0);
    },
    [playlist.tracks, state],
  );

  const player = usePlayer({ tracks: playlist.tracks, onNeedNextTrack: handleNeedNextTrack });
  playFnRef.current = player.play;

  const equalizer = useEqualizer(player.audioEngine);
  const visualizer = useVisualizer(player.audioEngine, visualizerOpen && player.isPlaying);

  useEffect(() => {
    persistLayout(windows);
  }, [windows]);

  useEffect(() => {
    playlist.loadDemo();
  }, [playlist]);

  const focus = useCallback((id) => {
    setFocusedId(id);
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    });
  }, []);

  const moveWindow = useCallback((id, rect) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)));
  }, []);

  const finishMove = useCallback((id, rect) => {
    setWindows((prev) => {
      const snapped = applyWindowSnap(
        id,
        rect,
        prev.map((w) => (w.id === id ? { ...w, rect } : w)),
        WINDOW_REGISTRY,
      );
      return prev.map((w) => (w.id === id ? { ...w, rect: snapped } : w));
    });
  }, []);

  const resizeWindow = useCallback((id, rect) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)));
  }, []);

  const finishResize = useCallback((id, rect) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)));
  }, []);

  const toggleWindow = useCallback((id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible, minimized: false } : w)),
    );
  }, []);

  const resetLayout = useCallback(() => {
    setWindows(classicLayout());
    setFocusedId("player.main");
  }, []);

  const applyStackLayout = useCallback(() => {
    setWindows(stackLayout(WINDOW_REGISTRY));
    setFocusedId("player.main");
  }, []);

  const renderWindow = useMemo(() => {
    const map = {
      "player.main": (
        <MainWindow
          player={player}
          onToggleCompact={() => setCompact((c) => !c)}
          onOpenPlaylist={() => toggleWindow("player.playlist")}
          onOpenSound={() => toggleWindow("player.eq")}
        />
      ),
      "player.playlist": (
        <PlaylistWindow
          tracks={playlist.tracks}
          currentId={player.currentTrack?.id}
          onSelect={(track) => player.play(track)}
        />
      ),
      "player.eq": (
        <EqualizerWindow
          presets={equalizer.presets}
          presetId={equalizer.presetId}
          bands={equalizer.bands}
          onPreset={equalizer.applyPreset}
          onChange={equalizer.setBand}
          onReset={equalizer.reset}
        />
      ),
      "player.library": (
        <LibraryWindow
          tracks={playlist.tracks}
          onPlay={(t) => player.play(t)}
          onAddFiles={playlist.addLocalFiles}
        />
      ),
      "player.visualizer": (
        <VisualizerWindow
          analyser={visualizer.analyser}
          isPlaying={player.isPlaying}
          hasTrack={Boolean(player.currentTrack)}
        />
      ),
      "player.friends": <FriendsListeningPanel />,
    };
    return map;
  }, [player, playlist, equalizer, visualizer.analyser, toggleWindow]);

  if (compact) {
    return (
      <div className="dmp-desktop dmp-desktop--compact">
        <MiniPlayer player={player} onExpand={() => setCompact(false)} />
      </div>
    );
  }

  return (
    <div className="dmp-desktop">
      <div className="dmp-toolbar">
        <button type="button" className="dmp-toolbar__btn dmp-toolbar__back" onClick={() => navigate("/")}>
          ← {STRINGS.back}
        </button>
        <div className="dmp-toolbar__brand-block">
          <span className="dmp-toolbar__brand">{STRINGS.appName}</span>
          <span className="dmp-toolbar__tagline">{STRINGS.appSubtitle}</span>
        </div>
        <SkinPicker />
        <button type="button" className="dmp-toolbar__btn" onClick={applyStackLayout} title={STRINGS.layoutStack}>
          ⊟ {STRINGS.layoutStack}
        </button>
        <button type="button" className="dmp-toolbar__btn" onClick={resetLayout} title={STRINGS.layoutGrid}>
          ⊞ {STRINGS.layoutGrid}
        </button>
        {WINDOW_REGISTRY.map((w) => (
          <button key={w.id} type="button" className="dmp-toolbar__btn" onClick={() => toggleWindow(w.id)}>
            {windowTitle(w.id)}
          </button>
        ))}
      </div>

      {windows
        .filter((w) => w.visible && !w.minimized)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((w) => (
          <WindowFrame
            key={w.id}
            id={w.id}
            title={windowTitle(w.id)}
            rect={w.rect}
            zIndex={w.zIndex}
            focused={focusedId === w.id}
            onFocus={() => focus(w.id)}
            onMove={(r) => moveWindow(w.id, r)}
            onMoveEnd={(r) => finishMove(w.id, r)}
            onResize={(r) => resizeWindow(w.id, r)}
            onResizeEnd={(r) => finishResize(w.id, r)}
            onClose={() => toggleWindow(w.id)}
          >
            {renderWindow[w.id]}
          </WindowFrame>
        ))}
    </div>
  );
}
