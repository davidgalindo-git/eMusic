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
 * - isPlaying: Ref<boolean> - Reactive state of the audio player.
 * - currentSongId: Ref<number|null> - ID of the currently active track.
 * - currentTime: Ref<number> - Current playback position in seconds.
 * - duration: Ref<number> - Total duration of the active track in seconds.
 * - currentIndex: ComputedRef<number> - Index of the current song within the songs array.
 * - togglePlay: Function - Toggles playback for a specific song.
 * - next: Function - Skips to the next track.
 * - prev: Function - Skips to the previous track or restarts current.
 * - seek: Function - Updates the audio position.
 */
export const useSongStore = defineStore("songStore", () => {
    const { fetchSongs } = useITunes();

    // State
    const songs = ref(loadCollection('search_results'));
    const isPlaying = ref(false)
    const currentSongId = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const sortKey = ref("trackName");
    const sortOrder = ref("asc");
    const currentTime = ref(0);
    const duration = ref(0);

    /**
     * Computed index of the currently playing song within the results list.
     * Used for navigation logic (next/prev) and determining list boundaries.
     *
     * @type {ComputedRef<number>}
     */
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

            const mapped  = mapAndSortSongs(raw, sortKey.value, sortOrder.value);
            songs.value = mapped;

            saveCollection('search_results', mapped);
        } catch (err) {
            error.value = "Unable to load songs. Please check your connection.";
            songs.value = [];
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
        const sorted = mapAndSortSongs(songs.value, key, order);
        songs.value = sorted;

        saveCollection('search_results', sorted);
    }

    /**
     * Handles the core play logic: initializes audio source,
     * sets up progress listeners, and manages auto-advance callback.
     *
     * @param {Object} song - The normalized song object to play.
     */
    function play(song){
        player.play(song.previewUrl, () => {
            if (currentIndex.value < songs.value.length - 1) {
                next();
            } else {
                isPlaying.value = false;
                currentSongId.value = null;
            }
        });

        player.onProgress((cur, dur) => {
            currentTime.value = cur;
            duration.value = dur || 30; // iTunes previews are often 30s long
        });

        isPlaying.value = true;
        currentSongId.value = song.trackId;
    }

    /**
     * Toggles between play and pause states. If a new song is provided,
     * it stops the current track and starts the new one.
     *
     * @param {Object} song - The song object to toggle.
     */
    function togglePlay(song) {
        const isSameSong = currentSongId.value === song.trackId;

        if (isPlaying.value && isSameSong) {
            player.pause();
            isPlaying.value = false;
        } else {
            play(song)
        }
    }

    /**
     * Advances playback to the next song in the filtered list if available.
     */
    function next() {
        if (currentIndex.value < songs.value.length - 1 ) {
            const nextSong = songs.value[currentIndex.value + 1];
            togglePlay(nextSong);
        }
    }

    /**
     * Navigates to the previous song. If current playback exceeds 3 seconds,
     * the track restarts from the beginning instead of skipping back.
     */
    function prev() {
        const currentTime = player.getCurrentTime();
        const margin = 3
        if (currentTime > margin) {
            const currentSong = songs.value[currentIndex.value];

            player.stop();
            play(currentSong);
        }
        else if (currentIndex.value > 0) {
            const prevSong = songs.value[currentIndex.value - 1];
            play(prevSong);
        }
    }

    /**
     * Updates the audio playback position to a specific timestamp.
     *
     * @param {number} time - The target time in seconds.
     */
    function seek(time) {
        player.seek(time);
        currentTime.value = time;
    }

    return {
        // Data & UI State
        songs, loading, error, sortKey, sortOrder,
        // Playback State
        isPlaying, currentSongId, currentTime, duration, currentIndex,
        // Actions
        search, setSort, togglePlay, next, prev, seek
    };
})