import { ref } from "vue";

/**
 * Composable for interacting with the iTunes Search API.
 * Handles state management for search results and loading status.
 * * @returns {Object} An object containing:
 * - songs: Ref<Array> - The list of results from iTunes.
 * - loading: Ref<boolean> - The current fetch status.
 * - searchSongs: Function - The async search method.
 */
export function useITunes() {
    const songs = ref([]);
    const loading = ref(false);

    /**
     * Fetches music tracks based on a search term.
     * * @async
     * @param {string} term - The text to search for (artist name, song title, etc.).
     * It is automatically URI encoded.
     */
    async function searchSongs(term) {
        loading.value = true;

        // iTunes URL parameters:
        // term: the search string
        // media: restricted to "music" for context specificity
        // limit: set to 20 results max
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=20`;

        const res = await fetch(url)
        const data = await res.json()

        songs.value = data.results;

        loading.value = false;
    }

    return { songs, loading, searchSongs };
}