<script setup>
import {ref} from "vue";

import PlaylistSongCard from "./PlaylistSongCard.vue";
import EditModeButton from "../EditModeButton.vue";

import {useSongStore} from "../../../store/useSongStore.js";
import {usePlaylistStore} from "../../../store/usePlaylistStore.js";

const playlistStore = usePlaylistStore();
const songStore = useSongStore();

const isEditMode = ref(false)
const editingPlaylistId = ref(null)

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
  if (!isEditMode.value) editingPlaylistId.value = null;
}
const handleSongClick = (song) => {
  songStore.togglePlay(song)
}
const removeSong = (trackId) => {
  playlistStore.removeFromPlaylist(playlistStore.selectedPlaylistId, trackId);

}
</script>

<template>
  <v-container>
    <!-- Dynamic Title Section -->
    <div class="d-flex align-center mb-4">
      <v-icon icon="mdi-playlist-music" class="mr-2" color="primary" />
      <h2 class="text-h5 font-weight-bold">{{ playlistStore.activePlaylistName }}</h2>
      <v-chip class="ml-4" size="small" variant="outlined" color="primary">
        {{ playlistStore.activePlaylistSongs.length }} Tracks
      </v-chip>
      <EditModeButton
          :is-edit-mode="isEditMode"
          @toggle-edit-mode="toggleEditMode"
      />
    </div>

    <v-col v-if="playlistStore.activePlaylistSongs.length">
      <PlaylistSongCard
          v-for="song in playlistStore.activePlaylistSongs"
          :key="song.trackId"
          :song="song"
          :is-edit-mode="isEditMode"
          @toggle-play="handleSongClick"
          @remove-song="removeSong"
          class="py-1"
      />
    </v-col>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <v-progress-circular v-if="songStore.loading" indeterminate color="primary" />
      <div v-else class="text-medium-emphasis">
        <v-icon icon="mdi-alert-circle-outline" size="48" class="mb-2" />
        <p>This playlist is empty.</p>
        <p class="text-body-2">Try adding new songs.</p>
      </div>
    </div>
  </v-container>
</template>

<style scoped>

</style>