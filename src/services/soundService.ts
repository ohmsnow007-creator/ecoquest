export type SoundKind = 'success' | 'reward' | 'tap';

// Short tones generated in the browser; no audio files are downloaded.
const TONES: Record<SoundKind, number[]> = {
  success: [523.25, 659.25, 783.99],
  reward: [659.25, 783.99, 1046.5],
  tap: [440],
};

let ctx: AudioContext | null = null;

export function playSound(kind: SoundKind): void {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    const start = ctx.currentTime;
    TONES[kind].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = start + i * 0.09;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  } catch {
    // Audio is optional; ignore devices that block it.
  }
}
