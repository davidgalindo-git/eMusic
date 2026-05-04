/**
 * Audio management utility for playing iTunes song previews.
 * Centralizes the audio instance to prevent overlapping sounds.
 */

// Global unique instance (Singleton pattern)
const audio = new Audio();

export const player = {
    /**
     * Plays a song preview.
     * @param {string} url - The iTunes preview URL.
     * @param {Function} onEnd - Optional callback triggered when playback finishes.
     */
    play(url, onEnd) {
        if (!url){
            console.error("[Player] No URL provided.");
            return;
        }

        if (audio.src === url && audio.paused) {
            audio.play().catch(err => console.warn("[Player] Resume failed:", err));
            return;
        }

        this.stop();
        audio.src = url;

        audio.play()
            .catch(err => {
            console.warn("[Player] Audio playback failed:", err);
        });

        /**
         * Event listener: Reset state when the track ends naturally.
         * Useful for updating UI icons back to 'play' mode in the Store.
         */
        audio.onended = () => {
            if (onEnd) onEnd();
        };

        audio.onerror = (e) => {
            console.error("[Player] Audio Element Error:", audio.error);
        };
    },

    /**
     * Pauses the current playback.
     */
    pause() {
        audio.pause();
    },

    /**
     * Stops playback entirely and resets progress to the beginning.
     */
    stop() {
        audio.pause();
        audio.currentTime = 0;
    },

    /**
     * Adjusts the playback volume.
     * @param {number} value - Volume level ranging from 0 to 1.
     */
    setVolume(value) {
        // Clamp value between 0 and 1 to prevent runtime errors
        audio.volume = Math.max(0, Math.min(1, value));
    }
};