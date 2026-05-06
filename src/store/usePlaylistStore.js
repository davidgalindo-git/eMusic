import {ref, watch} from "vue";
import { defineStore } from "pinia";
import {loadCollection, saveCollection} from "./storageHelper.js";
import { useSongStore } from "./useSongStore.js";

export const usePlaylistStore = defineStore("playlistStore", () => {
    const playlists = ref(loadCollection("playlists") || []);
    const selectedPlaylist = ref(null);
    const playingPlaylist = ref(null);
    const error = ref(null)

    watch(playlists, (newPlaylists) => {
        try {
            saveCollection("playlists", newPlaylists);
            error.value = null;
        } catch (err) {
            error.value = "Failed to save playlists. Storage might be full.";
            console.error("Playlist save error:", err);
        }
    }, {deep: true})

    function selectPlaylist(playlistId) {
        selectedPlaylist.value = playlists.value.find(p => p.id === playlistId);
    }

    function playPlaylist(playlistId) {
        const songStore = useSongStore();
        const playlist = playlists.value.find(p => p.id === playlistId);

        if (playlist && playlist.songs.length > 0) {
            playingPlaylist.value = playlist;
            songStore.setQueue(playlist.songs);
            songStore.playSongByIndex(0);
        }
    }

    function createPlaylist(name) {
        try {
            const trimmedName = name.trim()
            const now = Date.now();

            const newPlaylist = {
                id: now,
                name: trimmedName,
                songs: [],
            }
            playlists.value.push(newPlaylist);
            error.value = null;

            return newPlaylist;
        } catch (err) {
            error.value = err.message;
            throw err;
        }
    }

    function deletePlaylist(playlistId) {
        try {
            playlists.value = playlists.value.filter(p => p.id !== playlistId);
            if (selectedPlaylist.value?.id === playlistId) {
                selectedPlaylist.value = null
            }
        } catch (err) {
            error.value = err.message;
            throw err;
        }
    }

    function renamePlaylist(playlistId, newName) {
        if (!newName || newName.trim() === "") return;

        const playlist = playlists.value.find(p => p.id === playlistId);

        if (playlist) {
            playlist.name = newName.trim();
        }
    }

    function addToPlaylist(playlistId, song) {
        const playlist = playlists.value.find(p => p.id === playlistId)
        if (playlist) {
            const exists = playlist.songs.some(s => s.trackId === song.trackId)
            if (!exists) {
                playlist.songs.push({
                    trackId: song.trackId,
                    trackName: song.trackName,
                    artistName: song.artistName,
                    artworkUrl: song.artworkUrl,
                    previewUrl: song.previewUrl
                })
            }
        }
    }

    function deleteFromPlaylist(playlistId, trackId) {
        const playlist = playlists.value.find(p => p.id === playlistId)
        if (playlist) {
            playlist.songs = playlist.songs.filter(s => s.trackId !== trackId)
        }
    }


    return {
        playlists, selectedPlaylist, playingPlaylist,

        selectPlaylist, playPlaylist,createPlaylist, deletePlaylist, renamePlaylist,

        addToPlaylist, deleteFromPlaylist
    }
})
