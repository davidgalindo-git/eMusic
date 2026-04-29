/**
 * * Composable providing methods to interact with the iTunes API.
 * * @returns {Object} { fetchSongs } - The fetch handler.
 */
export function useITunes() {
    /**
     * Fetches music tracks from the iTunes Search API.
     * @async
     * @param {string} term - The search query (artist, album, or track).
     * @returns {Promise<Array>} A promise that resolves to an array of track objects.
     * @throws {Error} If the network response is not ok.
     */
    async function fetchSongs(term) {
        // iTunes URL parameters:
        // term: the search string
        // media: restricted to "music" for context specificity
        // limit: set to 20 results max
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=20`;

        const res = await fetch(url)

        if (!res.ok) {
            throw new Error(`iTunes API Error: ${res.statusText}`);
        }
        const data = await res.json()

        return data.results;
    }

    return { fetchSongs };
}