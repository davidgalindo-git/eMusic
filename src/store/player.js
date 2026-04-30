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
        // Stop current playback before switching to a new source
        this.stop();

        if (!url) return;

        audio.src = url;

        // Browsers require a user interaction before allowing play()
        audio.play().catch(err => {
            console.warn("Audio playback failed:", err);
        });

        /**
         * Event listener: Reset state when the track ends naturally.
         * Useful for updating UI icons back to 'play' mode in the Store.
         */
        audio.onended = () => {
            if (onEnd) onEnd();
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