/** Friendly copy — ES first, no Winamp jargon */

export const STRINGS = {
  appName: "Reproductor",
  appSubtitle: "Música en Dakinis",
  back: "Volver a AkoeNet",
  nowPlaying: "Sonando ahora",
  paused: "En pausa",
  ready: "Listo para reproducir",
  loading: "Cargando…",
  chooseTrack: "Elige una canción para empezar",
  tapToPlay: "Pulsa play o elige una pista de la cola",
  queue: "Cola",
  queueEmpty: "No hay canciones en la cola",
  queueSummary: (n, time) => `${n} ${n === 1 ? "canción" : "canciones"} · ${time}`,
  library: "Biblioteca",
  sound: "Sonido",
  soundTitle: "Ajustes de sonido",
  soundHint: "Elige un estilo. No necesitas conocer ecualizadores.",
  presetNormal: "Normal",
  presetNormalDesc: "Equilibrado para la mayoría de canciones",
  presetBass: "Más graves",
  presetBassDesc: "Ideal para electrónica y hip-hop",
  presetVoice: "Voz clara",
  presetVoiceDesc: "Podcasts y canciones con mucha voz",
  presetSoft: "Suave",
  presetSoftDesc: "Menos agudos, más relajado",
  presetBright: "Brillante",
  presetBrightDesc: "Más detalle en agudos",
  presetCustom: "Personalizado",
  advancedEq: "Ecualizador manual (avanzado)",
  advancedEqHint: "Solo si sabes lo que haces — frecuencias en Hz",
  reset: "Restablecer",
  visualizer: "Animación",
  visualizerHint: "Ondas que siguen la música",
  visualizerPaused: "Pausado — pulsa play",
  visualizerEmpty: "Elige música de la cola o biblioteca",
  miniPlayer: "Modo compacto",
  expand: "Expandir",
  play: "Reproducir",
  pause: "Pausar",
  stop: "Detener",
  previous: "Anterior",
  next: "Siguiente",
  volume: "Volumen",
  openQueue: "Ver cola",
  openSound: "Ajustar sonido",
  shuffle: "Aleatorio",
  repeat: "Repetir",
  repeatAll: "Repetir todo",
  repeatOne: "Repetir una",
  layoutStack: "Apilar ventanas",
  layoutGrid: "Cuadrícula",
  windows: {
    "player.main": "Reproductor",
    "player.playlist": "Cola",
    "player.eq": "Sonido",
    "player.library": "Biblioteca",
    "player.visualizer": "Animación",
    "player.friends": "Amigos",
  },
};

export const EQ_PRESETS = {
  normal: {
    id: "normal",
    label: STRINGS.presetNormal,
    desc: STRINGS.presetNormalDesc,
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  bass: {
    id: "bass",
    label: STRINGS.presetBass,
    desc: STRINGS.presetBassDesc,
    gains: [6, 5, 3, 0, -1, 0, 0, -1, -2, -2],
  },
  voice: {
    id: "voice",
    label: STRINGS.presetVoice,
    desc: STRINGS.presetVoiceDesc,
    gains: [-2, -1, 2, 4, 5, 4, 2, 0, -1, -2],
  },
  soft: {
    id: "soft",
    label: STRINGS.presetSoft,
    desc: STRINGS.presetSoftDesc,
    gains: [-1, 0, 1, 1, 0, -1, -2, -3, -3, -4],
  },
  bright: {
    id: "bright",
    label: STRINGS.presetBright,
    desc: STRINGS.presetBrightDesc,
    gains: [-2, -1, 0, 1, 2, 3, 4, 5, 4, 3],
  },
};

export const EQ_PRESET_LIST = Object.values(EQ_PRESETS);

export const EQ_BAND_LABELS = ["60", "170", "310", "600", "1K", "3K", "6K", "12K", "14K", "16K"];

export function windowTitle(id) {
  return STRINGS.windows[id] ?? id;
}
