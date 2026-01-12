let audioContext: AudioContext | null = null;

/**
 * Play a gentle chime sound for phase transitions
 * Uses Web Audio API to generate a soft bell-like tone
 */
export function playChime(): void {
    try {
        // Create or reuse audio context
        if (!audioContext) {
            audioContext = new AudioContext();
        }

        const ctx = audioContext;
        const now = ctx.currentTime;

        // Create oscillator for main tone
        const oscillator = ctx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, now); // D5 note
        oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.3); // Slide to A4

        // Create gain node for envelope
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8); // Slow decay

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Play
        oscillator.start(now);
        oscillator.stop(now + 0.8);

        // Secondary higher harmonic for bell-like quality
        const oscillator2 = ctx.createOscillator();
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(1174.66, now); // D6

        const gainNode2 = ctx.createGain();
        gainNode2.gain.setValueAtTime(0, now);
        gainNode2.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        oscillator2.connect(gainNode2);
        gainNode2.connect(ctx.destination);
        oscillator2.start(now);
        oscillator2.stop(now + 0.4);

    } catch (error) {
        console.warn('Could not play audio:', error);
    }
}

/**
 * Resume audio context if suspended (required after user interaction)
 */
export function resumeAudioContext(): void {
    if (audioContext?.state === 'suspended') {
        audioContext.resume();
    }
}
