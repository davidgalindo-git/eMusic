import { ref } from "vue";
import { useITunes } from "../api/useITunes";

/**
 * Global store for managing song search results and application state.
 * Centralizes data to be shared across the Search and Results components.
 * * @returns {Object} An object containing:
 * - songs: Ref<Array> - Reactive list of tracks returned by the API.
 * - loading: Ref<boolean> - Reactive state indicating if an async operation is in progress.
 * - error: Ref<string|null> - Reactive error message if the fetch fails.
 * - search: Function - Method to trigger a new search and update state.
 */
export function useSongStore() {
    const { fetchSongs } = useITunes();

    // State
    const songs = ref([]);
    const loading = ref(false);
    const error = ref(null);

    /**
     * Executes a search and synchronizes the store's state.
     * @async
     * @param {string} term - The search query provided by the user.
     */
    async function search(term) {
        loading.value = true;
        error.value = null

        try {
            songs.value = await fetchSongs(term);
        } catch (err) {
            error.value = "Unable to load songs. Please check your connection.";
            console.error("Store Search Error:", err);
        } finally {
            loading.value = false;
        }
    }

    return { songs, loading, error, search };
}