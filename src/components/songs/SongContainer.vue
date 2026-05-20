<script setup>
import { useSongStore } from "../../store/useSongStore.js";
import SongCard from "./SongCard.vue";

const songStore = useSongStore()

const handleSongClick = (song) => {
  const isViewingSearch = songStore.searchResults.length > 0;

  const isAlreadyInQueue = songStore.songs.some(s => s.trackId === song.trackId);

  if (isViewingSearch && !isAlreadyInQueue) {
    songStore.setQueue(songStore.searchResults, songStore.collectionName);
  }

  songStore.togglePlay(song)
}
</script>

<template>
  <div class="songs-view-wrapper">
    <div class="sticky-header bg-surface">
      <div class="d-flex align-center w-100 header-content">
        <div class="d-flex align-center min-width-0" style="flex: 1; min-width: 0;">
          <v-icon icon="mdi-playlist-music" class="mr-2 flex-shrink-0" color="primary" />
          <h2 class="text-h5 font-weight-bold text-truncate">{{ songStore.collectionName }}</h2>
        </div>

        <v-chip class="ml-4 flex-shrink-0" size="small" variant="outlined" color="primary">
          {{ songStore.searchResults.length > 0 ? songStore.searchResults.length : songStore.songs.length }} Tracks
        </v-chip>
      </div>
    </div>

    <v-container class="pt-4">
      <v-row v-if="songStore.searchResults.length || songStore.songs.length">
        <v-col
            v-for="song in (songStore.searchResults.length > 0 ? songStore.searchResults : songStore.songs)"
            :key="song.trackId"
            cols="12" sm="12" md="6" lg="6"
        >
          <SongCard :song="song" @toggle-play="handleSongClick" />
        </v-col>
      </v-row>

      <div v-else class="text-center py-16">
        <v-progress-circular v-if="songStore.loading" indeterminate color="primary" />
        <div v-else class="text-medium-emphasis">
          <v-icon icon="mdi-alert-circle-outline" size="48" class="mb-2" />
          <p>No songs found</p>
          <p class="text-body-2">Try searching for something else.</p>
        </div>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.songs-view-wrapper {
  width: 100%;
  position: relative;
}

.sticky-header {
  position: sticky;
  top: 70px;
  z-index: 100;
  width: 100%;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px;
}
</style>