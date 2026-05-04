import {computed, ref} from "vue";
import { defineStore } from "pinia";
import { useITunes } from "../api/useITunes";
import { mapAndSortSongs } from "../utils/songMapper.js";
import {player} from "./player.js";

/**
 * Global store for managing song search results and application state.
 * Centralizes data to be shared across the Search and Results components.
 *
 * @returns {Object} An object containing:
 * - songs: Ref<Array> - Reactive list of normalized & sorted tracks.
 * - loading: Ref<boolean> - Reactive state indicating if an async operation is in progress.
 * - error: Ref<string|null> - Reactive error message if the fetch fails.
 * - search: Function - Method to trigger a new search and update state.
 * - sortKey: Ref<string> - Currently active sort field.
 * - sortOrder: Ref<"asc"|"desc"> - Currently active sort direction.
 * - setSort: Function - Updates sort settings and re-sorts the current song list.
 */
export const useSongStore = defineStore("songStore", () => {
    const { fetchSongs } = useITunes();

    // State
    const songs = ref([]);
    const isPlaying = ref(false)
    const currentSongId = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const sortKey   = ref("trackName");
    const sortOrder = ref("asc");

    const currentIndex = computed(() =>
        songs.value.findIndex(s => s.trackId === currentSongId.value)
    );

    /**
     * Executes a search, maps raw iTunes results through songMapper,
     * and synchronizes the store's state.
     *
     * @async
     * @param {string} term - The search query provided by the user.
     */
    async function search(term) {
        loading.value = true;
        error.value = null

        try {
            const raw = await fetchSongs(term);
            songs.value  = mapAndSortSongs(raw, sortKey.value, sortOrder.value);
        } catch (err) {
            error.value = "Unable to load songs. Please check your connection.";
            console.error("Store Search Error:", err);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Updates the active sort settings and re-sorts the already-loaded song list
     * without triggering a new API call.
     *
     * @param {string}         key   - Sort field (e.g. "artistName", "releaseDate").
     * @param {"asc"|"desc"}   order - Sort direction.
     */
    function setSort(key, order = "asc") {
        sortKey.value = key;
        sortOrder.value = order;
        songs.value = mapAndSortSongs(songs.value, key, order);
    }

    function togglePlay(song) {
        if (isPlaying.value && currentSongId.value === song.trackId) {
            player.pause();
            isPlaying.value = false;
        } else {
            player.play(song.previewUrl, () => {
                if (currentIndex.value < songs.value.length - 1) {
                    next();
                } else {
                    isPlaying.value = false;
                    currentSongId.value = null;
                }
            });
            isPlaying.value = true;
            currentSongId.value = song.trackId;
        }
    }

    function next() {
        if (currentIndex.value < songs.value.length - 1 ) {
            const nextSong = songs.value[currentIndex.value + 1];
            togglePlay(nextSong);
        }
    }

    function prev() {
        if (currentIndex.value > 0) {
            const prevSong = songs.value[currentIndex.value - 1];
            togglePlay(prevSong);
        }
    }

    return { songs, isPlaying, currentSongId, loading, error,
        sortKey, sortOrder, search, setSort, togglePlay, next, prev };
})