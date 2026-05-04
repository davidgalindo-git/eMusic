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
});