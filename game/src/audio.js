// VelvetAudio — every sound is synthesised live with Web Audio. No audio files.

const VelvetAudio = {
  ctx: null,
  muted: false,
  master: null,

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.42;
    this.master.connect(this.ctx.destination);
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.42;
    return this.muted;
  },

  tone(freq, dur, type, vol, slideTo) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    gain.gain.setValueAtTime(vol || 0.2, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  },

  noiseBurst(dur, vol, lowpass) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass || 900;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.15, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t0);
  },

  footstep(running) {
    this.noiseBurst(0.07, running ? 0.16 : 0.07, running ? 700 : 420);
  },

  chipClink() {
    this.tone(2093, 0.09, 'triangle', 0.22);
    this.tone(2637, 0.14, 'triangle', 0.16);
  },

  lootChime(value) {
    const base = value >= 1000 ? 523 : value >= 500 ? 659 : 784;
    this.tone(base, 0.12, 'triangle', 0.22);
    setTimeout(() => this.tone(base * 1.25, 0.16, 'triangle', 0.2), 70);
    setTimeout(() => this.tone(base * 1.5, 0.22, 'triangle', 0.18), 140);
  },

  guardBark() {
    this.tone(220, 0.16, 'square', 0.2, 160);
    this.tone(330, 0.1, 'square', 0.14, 260);
  },

  alarmSting() {
    this.tone(880, 0.22, 'sawtooth', 0.16, 660);
    setTimeout(() => this.tone(660, 0.22, 'sawtooth', 0.16, 880), 200);
  },

  cameraZap() {
    this.tone(1400, 0.08, 'square', 0.1, 900);
  },

  vaultClunk() {
    this.noiseBurst(0.18, 0.3, 300);
    this.tone(90, 0.25, 'sine', 0.3, 55);
  },

  doorCreak() {
    this.tone(180, 0.3, 'sawtooth', 0.07, 120);
  },

  smokePuff() {
    this.noiseBurst(0.4, 0.2, 1200);
  },

  empBuzz() {
    this.tone(1200, 0.35, 'sawtooth', 0.12, 180);
  },

  tossClink() {
    this.tone(1568, 0.07, 'triangle', 0.2);
    setTimeout(() => this.tone(1319, 0.1, 'triangle', 0.16), 90);
  },

  bustedSting() {
    this.tone(392, 0.3, 'sawtooth', 0.2, 196);
    setTimeout(() => this.tone(311, 0.4, 'sawtooth', 0.2, 155), 260);
  },

  getawayFanfare() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((n, i) => setTimeout(() => this.tone(n, 0.3, 'triangle', 0.22), i * 110));
    this.noiseBurst(0.5, 0.12, 500);
  },

  clickUi() {
    this.tone(1047, 0.05, 'square', 0.1);
  },
};
