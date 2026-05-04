/**
 * (by Gemini AI)
 * timeFormatter.js
 * Utility functions for time manipulation and display.
 */

/**
 * Converts a duration in seconds into a standardized MM:SS string format.
 * Ensures two-digit padding for both minutes and seconds.
 *
 * @param {number} seconds - The total time duration in seconds.
 * @returns {string} Formatted time string (e.g., "04:05").
 */
export function timeFormatter(seconds) {
    if (!seconds) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}