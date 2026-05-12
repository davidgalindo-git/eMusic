import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Singleton instance capture handle.
 * Facitiliates external access to the internal scoped Audio object.
 */
let capturedAudio;

/**
 * Global constructor interception.
 * Uses standard function syntax to satisfy 'new' keyword requirements.
 * Replaces the native Audio interface with a compliant mock.
 */
vi.stubGlobal('Audio', vi.fn(function() {
    this.play = vi.fn().mockResolvedValue(undefined);
    this.pause = vi.fn();
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1;
    this.src = '';
    this.onended = null;
    this.onerror = null;
    this.ontimeupdate = null;

    capturedAudio = this;
    return this;
}));

describe('player.js utility - Event Logic', () => {
    let player;

    beforeEach(async () => {
        /**
         * Dynamic Module Resolution.
         * Forces player.js evaluation post-stubbing to ensure the mock
         * is utilized during top-level singleton instantiation.
         */
        const module = await import('../../src/store/player.js');
        player = module.player;

        /**
         * State sanitation.
         * Purges call history and resets the capturedAudio properties.
         */
        vi.clearAllMocks();
        player.stop();
    });

    it('should bind the onEnd callback to the native media "ended" event', () => {
        const onEndMock = vi.fn();
        const url = 'https://example.com/preview.mp3';

        /**
         * Logic execution.
         * Orchestrates resource assignment and event hook synchronization.
         */
        player.play(url, onEndMock);

        /**
         * Property integrity check.
         * Validates the transition of onended from null to a Function.
         */
        expect(capturedAudio).toBeDefined();
        expect(typeof capturedAudio.onended).toBe('function');

        /**
         * Synthetic event dispatch.
         * Executes the internal handler to simulate hardware-level termination.
         */
        capturedAudio.onended();

        expect(onEndMock).toHaveBeenCalled();
    });

    it('should synchronize the progress callback with the temporal "timeupdate" event', () => {
        const progressCallback = vi.fn();

        /**
         * Handler registration.
         * Subscribes the callback to the internal update cycle.
         */
        player.onProgress(progressCallback);

        /**
         * Listener validation.
         * Confirms the functional binding on the ontimeupdate property.
         */
        expect(typeof capturedAudio.ontimeupdate).toBe('function');

        /**
         * Temporal simulation.
         * Manipulates state and triggers the hook to evaluate parameter pass-through.
         */
        capturedAudio.currentTime = 15;
        capturedAudio.duration = 30;
        capturedAudio.ontimeupdate();

        expect(progressCallback).toHaveBeenCalledWith(15, 30);
    });

    it('should stop previous playback when starting a new URL', () => {
        const stopSpy = vi.spyOn(player, 'stop');
        player.play('url-1.mp3');
        player.play('url-2.mp3');

        // Should have called stop to clear the first URL
        expect(stopSpy).toHaveBeenCalled();
        expect(capturedAudio.src).toBe('url-2.mp3');
    });

    it('should resume without resetting currentTime if the URL is the same', () => {
        capturedAudio.src = 'same-url.mp3';
        capturedAudio.paused = true;
        capturedAudio.currentTime = 10;

        player.play('same-url.mp3');

        expect(capturedAudio.play).toHaveBeenCalled();
        expect(capturedAudio.currentTime).toBe(10); // Should NOT be 0
    });

    it('should handle native audio errors gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        player.play('broken-link.mp3');

        // Simulate browser error
        capturedAudio.error = { code: 4, message: 'MEDIA_ERR_SRC_NOT_SUPPORTED' };
        capturedAudio.onerror();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Player] Audio Element Error:'), expect.any(Object));
    });

    it('should clamp volume values between 0 and 1', () => {
        player.setVolume(1.5);
        expect(capturedAudio.volume).toBe(1);

        player.setVolume(-0.5);
        expect(capturedAudio.volume).toBe(0);
    });
});