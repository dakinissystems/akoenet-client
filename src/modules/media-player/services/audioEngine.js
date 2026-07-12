/**
 * Web Audio engine — lazy context, buffer cache, EQ on demand, analyser throttling
 */
import { EQ_BAND_LABELS } from "../i18n/strings.js";

const EQ_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
const BUFFER_CACHE_MAX = 6;

/** @type {AudioEngine | null} */
let sharedEngine = null;

/** One engine per tab — survives route remounts without stacking AudioContexts. */
export function getAudioEngine() {
  if (!sharedEngine) sharedEngine = new AudioEngine();
  return sharedEngine;
}

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.gain = null;
    this.analyser = null;
    this.eqFilters = [];
    this.eqBypassed = true;
    this.source = null;
    this.startedAt = 0;
    this.pauseOffset = 0;
    this.playing = false;
    /** @type {(() => void) | null} */
    this.onEnded = null;
    /** @type {Map<string, AudioBuffer>} */
    this.bufferCache = new Map();
  }

  async ensureContext() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") await this.ctx.resume();
      return this.ctx;
    }
    this.ctx = new AudioContext();
    this.gain = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.82;
    this.gain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    return this.ctx;
  }

  ensureEqChain() {
    if (this.eqFilters.length || !this.ctx || !this.gain) return;
    this.gain.disconnect();
    let node = this.gain;
    this.eqFilters = EQ_FREQUENCIES.map((freq, i) => {
      const f = this.ctx.createBiquadFilter();
      f.type = i === 0 ? "lowshelf" : i === EQ_FREQUENCIES.length - 1 ? "highshelf" : "peaking";
      f.frequency.value = freq;
      f.gain.value = 0;
      node.connect(f);
      node = f;
      return f;
    });
    node.connect(this.analyser);
  }

  setEqBypass(bypass) {
    if (!this.gain || !this.analyser) return;
    if (bypass === this.eqBypassed) return;
    this.eqBypassed = bypass;
    if (bypass) {
      if (this.eqFilters.length) {
        try {
          this.eqFilters[this.eqFilters.length - 1].disconnect();
        } catch {
          /* noop */
        }
        this.gain.disconnect();
        this.gain.connect(this.analyser);
      }
    } else {
      this.ensureEqChain();
    }
  }

  /** @param {number} index @param {number} gainDb */
  setEqBand(index, gainDb) {
    if (gainDb === 0 && this.eqBypassed) return;
    this.setEqBypass(false);
    this.ensureEqChain();
    const filter = this.eqFilters[index];
    if (filter) filter.gain.value = gainDb;
  }

  setAllEqFlat() {
    if (this.eqFilters.length) {
      this.eqFilters.forEach((f) => {
        f.gain.value = 0;
      });
    }
    this.setEqBypass(true);
  }

  /** @param {number} value 0..1 */
  setVolume(value) {
    if (this.gain) this.gain.gain.value = value;
  }

  /** Lower FFT cost when visualizer is hidden */
  setAnalyserActive(active) {
    if (!this.analyser) return;
    this.analyser.fftSize = active ? 64 : 32;
  }

  /** @param {string} url */
  async loadUrl(url) {
    const cached = this.bufferCache.get(url);
    if (cached) return cached;

    await this.ensureContext();
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`audio_fetch_${res.status}`);
    const buf = await res.arrayBuffer();
    const decoded = await this.ctx.decodeAudioData(buf);

    if (this.bufferCache.size >= BUFFER_CACHE_MAX) {
      const firstKey = this.bufferCache.keys().next().value;
      this.bufferCache.delete(firstKey);
    }
    this.bufferCache.set(url, decoded);
    return decoded;
  }

  /** @param {AudioBuffer} buffer @param {number} [offsetSec] */
  playBuffer(buffer, offsetSec = 0) {
    this.stopSource();
    this.source = this.ctx.createBufferSource();
    this.source.buffer = buffer;
    this.source.connect(this.gain);
    this.source.start(0, offsetSec);
    this.startedAt = this.ctx.currentTime - offsetSec;
    this.pauseOffset = offsetSec;
    this.playing = true;
    this.source.onended = () => {
      this.playing = false;
      this.onEnded?.();
    };
  }

  pause() {
    if (!this.playing || !this.source || !this.ctx) return;
    this.pauseOffset = this.ctx.currentTime - this.startedAt;
    this.stopSource();
    this.playing = false;
  }

  stop() {
    this.stopSource();
    this.playing = false;
    this.pauseOffset = 0;
    this.startedAt = 0;
  }

  stopSource() {
    if (!this.source) return;
    const node = this.source;
    node.onended = null;
    try {
      node.stop();
    } catch {
      /* already stopped */
    }
    try {
      node.disconnect();
    } catch {
      /* noop */
    }
    this.source = null;
  }

  getCurrentTime() {
    if (!this.ctx) return 0;
    if (this.playing) return this.ctx.currentTime - this.startedAt;
    return this.pauseOffset;
  }

  getAnalyser() {
    return this.analyser;
  }

  /** @param {number} sec */
  seek(sec) {
    if (!this.ctx || !this.source?.buffer) return;
    const buffer = this.source.buffer;
    const clamped = Math.max(0, Math.min(sec, buffer.duration));
    this.playBuffer(buffer, clamped);
  }
}

export { EQ_BAND_LABELS };
