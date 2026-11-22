// Gilded Vault — synthesized sound.
// One job: every blip, chime and siren, made with WebAudio, no audio files.

export function makeAudio() {
  return { ctx: null, muted: false, alarmOn: false, alarmNodes: null };
}

function ensure(audio) {
  if (!audio.ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audio.ctx = new AC();
    } catch (e) {
      audio.ctx = null;
    }
  }
  if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
  return audio.ctx;
}

function tone(audio, freq, dur, type, gain, when, slideTo) {
  const ctx = ensure(audio);
  if (!ctx || audio.muted) return;
  const t0 = ctx.currentTime + (when || 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playStep(audio) {
  tone(audio, 180 + Math.random() * 60, 0.06, 'triangle', 0.03);
}

export function playPickup(audio) {
  tone(audio, 660, 0.12, 'sine', 0.14);
  tone(audio, 990, 0.18, 'sine', 0.14, 0.09);
  tone(audio, 1320, 0.26, 'sine', 0.12, 0.18);
}

export function playSmoke(audio) {
  tone(audio, 900, 0.35, 'sawtooth', 0.05, 0, 220);
}

export function playEmp(audio) {
  tone(audio, 1400, 0.4, 'square', 0.07, 0, 120);
  tone(audio, 700, 0.3, 'square', 0.05, 0.08, 90);
}

export function playPick(audio) {
  tone(audio, 440, 0.07, 'square', 0.06);
  tone(audio, 520, 0.07, 'square', 0.06, 0.12);
}

export function playUnlock(audio) {
  tone(audio, 523, 0.12, 'sine', 0.12);
  tone(audio, 784, 0.2, 'sine', 0.12, 0.1);
}

export function playLaserZap(audio) {
  tone(audio, 220, 0.18, 'sawtooth', 0.1, 0, 880);
}

export function playWin(audio) {
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((n, i) => tone(audio, n, 0.3, 'sine', 0.13, i * 0.11));
}

export function playCaught(audio) {
  tone(audio, 330, 0.5, 'sawtooth', 0.12, 0, 110);
  tone(audio, 165, 0.7, 'sawtooth', 0.1, 0.2, 55);
}

export function startAlarmLoop(audio) {
  const ctx = ensure(audio);
  if (!ctx || audio.alarmOn) return;
  audio.alarmOn = true;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 620;
  g.gain.value = 0.0;
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 2.2;
  lfoGain.gain.value = 0.035;
  lfo.connect(lfoGain);
  lfoGain.connect(g.gain);
  g.gain.value = 0.035;
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  lfo.start();
  audio.alarmNodes = { osc, lfo, g };
}

export function stopAlarmLoop(audio) {
  if (!audio.alarmOn || !audio.alarmNodes) return;
  try {
    audio.alarmNodes.osc.stop();
    audio.alarmNodes.lfo.stop();
  } catch (e) {}
  audio.alarmNodes = null;
  audio.alarmOn = false;
}
