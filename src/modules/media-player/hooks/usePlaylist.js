import { useCallback, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { isMediaApiEnabled, mediaApi } from "../services/mediaApi.js";

/** Same-origin demo assets (public/media/demo/) — web/desktop only; omitted from Android AAB. */
const DEMO_TRACKS = [
  {
    id: "demo-track-1",
    title: "One More Time",
    artist: "Daft Punk",
    album: "Discovery",
    durationMs: 320000,
    sourceRef: "/media/demo/song-1.mp3",
  },
  {
    id: "demo-track-2",
    title: "Time",
    artist: "Hans Zimmer",
    album: "Inception",
    durationMs: 277000,
    sourceRef: "/media/demo/song-2.mp3",
  },
];

function initialTracks() {
  try {
    if (Capacitor?.isNativePlatform?.()) return [];
  } catch {
    /* web */
  }
  return DEMO_TRACKS;
}

export function usePlaylist() {
  const [tracks, setTracks] = useState(initialTracks);
  const [playlistName, setPlaylistName] = useState(
    Capacitor?.isNativePlatform?.() ? "Library" : "Dakinis Classics",
  );
  const loadDemo = useCallback(async () => {
    if (!isMediaApiEnabled()) return;
    try {
      const data = await mediaApi.listTracks();
      if (data?.items?.length) {
        setTracks(
          data.items.map((t) => ({
            ...t,
            sourceRef: t.sourceRef ?? t.url,
          })),
        );
      }
    } catch {
      /* keep bundled demo tracks */
    }
  }, []);

  const loadPlaylist = useCallback(async (id) => {
    if (!isMediaApiEnabled()) return;
    const pl = await mediaApi.getPlaylist(id);
    setPlaylistName(pl.name);
    setTracks(pl.trackIds?.map((tid) => ({ id: tid, title: tid })) ?? []);
  }, []);

  const addLocalFiles = useCallback((fileList) => {
    const files = [...fileList];
    if (!files.length) return;
    const newTracks = files.map((file) => ({
      id: `local-${file.name}-${file.size}-${file.lastModified}`,
      title: file.name.replace(/\.[^.]+$/, ""),
      artist: "Local",
      album: "",
      durationMs: 0,
      sourceRef: URL.createObjectURL(file),
      local: true,
    }));
    setTracks((prev) => [...prev, ...newTracks]);
  }, []);

  return { tracks, playlistName, loadDemo, loadPlaylist, setTracks, addLocalFiles };
}
