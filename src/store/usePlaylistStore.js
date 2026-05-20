import {computed, ref, watch} from "vue";
import { defineStore } from "pinia";
import { loadCollection, saveCollection } from "./storageHelper.js";
import { useSongStore } from "./useSongStore.js";

/**
 * Global store for managing user-created playlists and their persistence.
 * Handles the lifecycle of playlists, including creation, deletion, and
 * synchronization with the active playback engine (songStore).
 *
 * @returns {Object} An object containing:
 * - playlists: Ref<Array> - Reactive list of all saved playlist objects.
 * - selectedPlaylist: Ref<Object|null> - The playlist currently being viewed in the UI.
 * - playingPlaylist: Ref<Object|null> - The playlist currently loaded into the player.
 * - error: Ref<string|null> - Reactive error message for storage or operation failures.
 * - selectPlaylist: Function - Sets the active playlist for UI display.
 * - playPlaylist: Function - Injects a playlist into the songStore and starts playback.
 * - createPlaylist: Function - Initializes a new empty playlist collection.
 * - deletePlaylist: Function - Removes a playlist and cleans up associated state.
 * - renamePlaylist: Function - Updates the title of an existing playlist.
 * - addToPlaylist: Function - Appends a normalized song object to a specific playlist.
 * - removeFromPlaylist: Function - Removes a song from a playlist by its track ID.
 */
export const usePlaylistStore = defineStore("playlistStore", () => {
    // --- State ---
    const playlists = ref(loadCollection("playlists") || []);
    const selectedPlaylistId = ref(null);
    const playingPlaylist = ref(null);
    const error = ref(null);

    // --- Getters (Computed) ---
    const activePlaylistSongs = computed(() => {
        const active = playlists.value.find(p => p.id === selectedPlaylistId.value);
        return active ? active.songs : [];
    });

    const activePlaylistName = computed(() => {
        const active = playlists.value.find(p => p.id === selectedPlaylistId.value);
        return active ? active.name : 'Playlist';
    });

    /**
     * Data Persistence Layer.
     * Watches the deep structure of the playlists array to automatically
     * sync changes to persistent storage whenever a song is added, removed, or renamed.
     */
    watch(playlists, (newPlaylists) => {
        try {
            saveCollection("playlists", newPlaylists);
            error.value = null;
        } catch (err) {
            error.value = "Failed to save playlists. Storage might be full.";
            console.error("Playlist save error:", err);
        }
    }, { deep: true });

    // --- Actions ---

    /**
     * Updates the UI context to focus on a specific playlist.
     *
     * @param {number} playlistId - Unique identifier of the playlist to select.
     */
    function selectPlaylist(playlistId) {
        selectedPlaylistId.value = playlistId;
    }

    /**
     * Engine Orchestration: Playback.
     * Synchronizes the playlist data with the songStore playback queue.
     *
     * @param {number} playlistId - ID of the playlist to be played.
     */
    function playPlaylist(playlistId) {
        const songStore = useSongStore();
        const playlist = playlists.value.find(p => p.id === playlistId);

        if (playlist && playlist.songs.length > 0) {
            playingPlaylist.value = playlist;

            const playlistTitle = `Playlist: ${playlist.name}`;
            songStore.setQueue(playlist.songs, playlistTitle);

            // Logic: Positional Playback Initialization.
            songStore.playSongByIndex(0);
        }
    }

    /**
     * Initializes a new playlist entity with a unique temporal ID.
     *
     * @param {string} name - Desired name for the new playlist.
     * @returns {Object} The newly created playlist object.
     */
    function createPlaylist(name) {
        try {
            const trimmedName = name.trim();
            const now = Date.now(); // Ensures unique identification

            const newPlaylist = {
                id: now,
                name: trimmedName,
                songs: [],
            };
            playlists.value.push(newPlaylist);
            error.value = null;

            return newPlaylist;
        } catch (err) {
            error.value = err.message;
            throw err;
        }
    }

    /**
     * Deletes a playlist and resolves dangling selection references.
     *
     * @param {number} playlistId - ID of the playlist to remove.
     */
    function deletePlaylist(playlistId) {
        try {
            playlists.value = playlists.value.filter(p => p.id !== playlistId);

            // Clean up UI state if the deleted playlist was currently selected
            if (selectedPlaylistId.value === playlistId) {
                selectedPlaylistId.value = null;
            }
        } catch (err) {
            error.value = err.message;
            throw err;
        }
    }

    /**
     * Performs sanitized renaming of a playlist collection.
     *
     * @param {number} playlistId - ID of the target playlist.
     * @param {string} newName - The new title to apply.
     */
    function renamePlaylist(playlistId, newName) {
        if (!newName || newName.trim() === "") return;

        const playlist = playlists.value.find(p => p.id === playlistId);

        if (playlist) {
            playlist.name = newName.trim();
        }
    }

    /**
     * Data Integrity: Adds a song while enforcing referential uniqueness.
     * Normalizes the song object to store only required playback data.
     *
     * @param {number} playlistId - Target playlist ID.
     * @param {Object} song - The song object to add.
     */
    function addToPlaylist(playlistId, song) {
        const playlist = playlists.value.find(p => p.id === playlistId);
        if (playlist) {
            // Prevent duplicate entries within the same collection
            const exists = playlist.songs.some(s => s.trackId === song.trackId);
            if (!exists) {
                playlist.songs.push({
                    trackId: song.trackId,
                    trackName: song.trackName,
                    artistName: song.artistName,
                    albumName: song.albumName,
                    durationMs: song.durationMs,
                    previewUrl: song.previewUrl,
                    artworkUrl: song.artworkUrl,
                });
            }
        }
    }

    /**
     * Removes a track from a specific playlist collection.
     *
     * @param {number} playlistId - Target playlist ID.
     * @param {number} trackId - Unique iTunes track ID to remove.
     */
    function removeFromPlaylist(playlistId, trackId) {
        const playlist = playlists.value.find(p => p.id === playlistId);
        if (playlist) {
            playlist.songs = playlist.songs.filter(s => s.trackId !== trackId);
        }
    }

    return {
        // Data & UI State
        playlists, selectedPlaylistId, playingPlaylist, error,

        // Getters
        activePlaylistSongs, activePlaylistName,

        // Actions: Collection Lifecycle
        selectPlaylist, playPlaylist, createPlaylist, deletePlaylist, renamePlaylist,

        // Actions: Membership Management
        addToPlaylist, removeFromPlaylist
    };
});