export function formatTime(ms) {
  if (!ms || ms < 0) return "0:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/** @param {string | undefined} sourceRef */
export function inferTrackFormat(sourceRef, local = false) {
  if (local) return { codec: "Local", bitrate: "—", sampleRate: "44.1 kHz", channels: "Stereo" };
  if (!sourceRef) return { codec: "—", bitrate: "—", sampleRate: "—", channels: "—" };
  const ext = sourceRef.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  const map = {
    mp3: { codec: "MP3", bitrate: "320 kbps", sampleRate: "44.1 kHz", channels: "Stereo" },
    flac: { codec: "FLAC", bitrate: "Lossless", sampleRate: "44.1 kHz", channels: "Stereo" },
    ogg: { codec: "OGG", bitrate: "Vorbis", sampleRate: "44.1 kHz", channels: "Stereo" },
    wav: { codec: "WAV", bitrate: "PCM", sampleRate: "44.1 kHz", channels: "Stereo" },
    m4a: { codec: "AAC", bitrate: "256 kbps", sampleRate: "44.1 kHz", channels: "Stereo" },
  };
  return map[ext] ?? { codec: ext.toUpperCase() || "Stream", bitrate: "—", sampleRate: "44.1 kHz", channels: "Stereo" };
}

export function totalDurationMs(tracks) {
  return tracks.reduce((sum, t) => sum + (t.durationMs || 0), 0);
}
