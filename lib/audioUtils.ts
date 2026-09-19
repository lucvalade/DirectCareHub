/**
 * Synthesizes a "Success Chime" using the native Web Audio API.
 * Creates a two-tone ascending chime (C5 -> E5) with a soft fade-out.
 */
export function playSosResolvedChime() {
  // Gracefully exit if running on the server
  if (typeof window === 'undefined') return;

  // Initialize the audio context (with Safari fallback)
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  try {
    const audioCtx = new AudioContext();

    // Resume context if suspended by browser autoplay policies
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine'; // Smooth, pleasant sound
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      // ADSR Envelope: Quick attack, exponential decay
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Release

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    
    // Play C5 (523.25 Hz), then E5 (659.25 Hz) slightly delayed
    playTone(523.25, now, 0.6);
    playTone(659.25, now + 0.15, 0.8);
  } catch (err) {
    console.warn('Web Audio synthesis error:', err);
  }
}
