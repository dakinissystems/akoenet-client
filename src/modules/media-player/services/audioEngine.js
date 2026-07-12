/**
 * Motor de audio — Web Audio API
 * decode → gain → EQ chain → analyser → destination
 */
const EQ_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

export class AudioEngine {
  constructor() {
    /** @type {AudioContext | null} */
    this.ctx = null;
    /** @type {GainNode | null} */
    this.gain = null;
    /** @type {AnalyserNode | null} */
    this.analyser = null;
    /** @type {BiquadFilterNode[]} */
    this.eqFilters = [];
    /** @type {AudioBufferSourceNode | null} */
    this.source = null;
    /** @type {number} */
    this.startedAt = 0;
    /** @type {number} */
    this.pauseOffset = 0;
    /** @type {boolean} */
    this.playing = false;
  }

  async ensureContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return this.ctx;
    }
    this.ctx = new AudioContext();
    this.gain = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;

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
    this.analyser.connect(this.ctx.destination);
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    return this.ctx;
  }

  /**
   * @param {number} index 0-9
   * @param {number} gainDb -12..12
   */
  setEqBand(index, gainDb) {
    const filter = this.eqFilters[index];
    if (filter) filter.gain.value = gainDb;
  }

  /** @param {number} value 0..1 */
  setVolume(value) {
    if (this.gain) this.gain.gain.value = value;
  }

  /** @param {string} url */
  async loadUrl(url) {
    await this.ensureContext();
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`audio_fetch_${res.status}`);
    const buf = await res.arrayBuffer();
    return this.ctx.decodeAudioData(buf);
  }

  /** @param {AudioBuffer} buffer */
  playBuffer(buffer, offsetSec = 0) {
    this.stop();
    this.source = this.ctx.createBufferSource();
    this.source.buffer = buffer;
    this.source.connect(this.gain);
    this.source.start(0, offsetSec);
    this.startedAt = this.ctx.currentTime - offsetSec;
    this.pauseOffset = offsetSec;
    this.playing = true;
    this.source.onended = () => {
      this.playing = false;
    };
  }

  pause() {
    if (!this.playing || !this.source || !this.ctx) return;
    this.pauseOffset = this.ctx.currentTime - this.startedAt;
    this.source.stop();
    this.source = null;
    this.playing = false;
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch {
        /* already stopped */
      }
      this.source = null;
    }
    this.playing = false;
    this.pauseOffset = 0;
    this.startedAt = 0;
  }

  getCurrentTime() {
    if (!this.ctx) return 0;
    if (this.playing) return this.ctx.currentTime - this.startedAt;
    return this.pauseOffset;
  }

  getAnalyser() {
    return this.analyser;
  }
}

export const EQ_BAND_LABELS = ["60", "170", "310", "600", "1K", "3K", "6K", "12K", "14K", "16K"];
