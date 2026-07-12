import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainWindow } from "./components/MainWindow.jsx";
import { PlaylistWindow } from "./components/PlaylistWindow.jsx";
import { EqualizerWindow } from "./components/EqualizerWindow.jsx";
import { LibraryWindow } from "./components/LibraryWindow.jsx";
import { VisualizerWindow } from "./components/VisualizerWindow.jsx";
import { MiniPlayer } from "./components/MiniPlayer.jsx";
import { WindowFrame } from "./components/WindowFrame.jsx";
import { SkinRenderer } from "./components/SkinRenderer.jsx";
import { usePlayer } from "./hooks/usePlayer.js";
import { usePlaylist } from "./hooks/usePlaylist.js";
import { useEqualizer } from "./hooks/useEqualizer.js";
import { useVisualizer } from "./hooks/useVisualizer.js";
import { PlayerProvider } from "./store/playerStore.jsx";
import { WINDOW_REGISTRY } from "./windowRegistry.js";
import "./styles/media-player.css";

export default function MediaPlayerRoot() {
  return (
    <PlayerProvider>
      <SkinRenderer skinId="classic">
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
  const [windows, setWindows] = useState(() => initWindows());
  const [compact, setCompact] = useState(false);
  const [focusedId, setFocusedId] = useState("player.main");

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

  const toggleWindow = useCallback((id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible, minimized: false } : w)),
    );
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
      "player.visualizer": <VisualizerWindow frequencyData={visualizer.frequencyData} />,
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
        <button type="button" className="dmp-toolbar__btn dmp-toolbar__back" onClick={() => navigate('/')}>
          ← AkoeNet
        </button>
        <span className="dmp-toolbar__brand">Dakinis Media Player</span>
        {WINDOW_REGISTRY.map((w) => (
          <button
            key={w.id}
            type="button"
            className="dmp-toolbar__btn"
            onClick={() => toggleWindow(w.id)}
          >
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
            onClose={() => toggleWindow(w.id)}
          >
            {renderWindow[w.id]}
          </WindowFrame>
        ))}
    </div>
  );
}

function initWindows() {
  return WINDOW_REGISTRY.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: desc.defaultVisible ?? true,
    minimized: false,
    zIndex: i + 1,
  }));
}
