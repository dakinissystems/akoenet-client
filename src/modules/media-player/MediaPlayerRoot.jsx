import { useCallback, useEffect, useMemo, useState } from "react";
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
import { PlayerProvider } from "./store/playerStore.jsx";
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

function MediaPlayerDesktop() {
  const navigate = useNavigate();
  const player = usePlayer();
  const playlist = usePlaylist();
  const equalizer = useEqualizer(player.audioEngine);
  const visualizer = useVisualizer(player.audioEngine);
  const [windows, setWindows] = useState(() => loadPersistedLayout(WINDOW_REGISTRY) ?? classicLayout());
  const [compact, setCompact] = useState(false);
  const [focusedId, setFocusedId] = useState("player.main");

  useEffect(() => {
    persistLayout(windows);
  }, [windows]);

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

  useEffect(() => {
    playlist.loadDemo();
  }, [playlist]);

  const renderWindow = useMemo(() => {
    const map = {
      "player.main": (
        <MainWindow
          player={player}
          onToggleCompact={() => setCompact((c) => !c)}
          onOpenPlaylist={() => toggleWindow("player.playlist")}
          onOpenEq={() => toggleWindow("player.eq")}
        />
      ),
      "player.playlist": (
        <PlaylistWindow
          tracks={playlist.tracks}
          currentId={player.currentTrack?.id}
          onSelect={(track) => player.play(track)}
        />
      ),
      "player.eq": <EqualizerWindow bands={equalizer.bands} onChange={equalizer.setBand} />,
      "player.library": (
        <LibraryWindow
          tracks={playlist.tracks}
          onPlay={(t) => player.play(t)}
          onAddFiles={playlist.addLocalFiles}
        />
      ),
      "player.visualizer": (
        <VisualizerWindow
          frequencyData={visualizer.frequencyData}
          isPlaying={player.isPlaying}
          hasTrack={Boolean(player.currentTrack)}
        />
      ),
      "player.friends": <FriendsListeningPanel />,
    };
    return map;
  }, [player, playlist, equalizer, visualizer, toggleWindow]);

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
          ← AkoeNet
        </button>
        <div className="dmp-toolbar__brand-block">
          <span className="dmp-toolbar__brand">Dakinis Media Workspace</span>
          <span className="dmp-toolbar__tagline">Player · Library · Social</span>
        </div>
        <SkinPicker />
        <button type="button" className="dmp-toolbar__btn" onClick={applyStackLayout} title="Stack Player + Playlist + EQ">
          ⊟ Stack
        </button>
        <button type="button" className="dmp-toolbar__btn" onClick={resetLayout} title="Grid layout">
          ⊞ Grid
        </button>
        {WINDOW_REGISTRY.map((w) => (
          <button key={w.id} type="button" className="dmp-toolbar__btn" onClick={() => toggleWindow(w.id)}>
            {w.title}
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
            title={w.title}
            rect={w.rect}
            zIndex={w.zIndex}
            focused={focusedId === w.id}
            onFocus={() => focus(w.id)}
            onMove={(rect) => moveWindow(w.id, rect)}
            onMoveEnd={(rect) => finishMove(w.id, rect)}
            onClose={() => toggleWindow(w.id)}
          >
            {renderWindow[w.id]}
          </WindowFrame>
        ))}
    </div>
  );
}
