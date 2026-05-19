<script setup>
import { useSongStore } from "../../store/useSongStore.js";
import SongCard from "./SongCard.vue";

const songStore = useSongStore()

const handleSongClick = (song) => {
  songStore.togglePlay(song)
}
</script>

<template>
  <v-container>
    <!-- Dynamic Title Section -->
    <div class="d-flex align-center mb-4 w-100">
      <div class="d-flex align-center min-width-0" style="flex: 1; min-width: 0;">
        <v-icon icon="mdi-playlist-music" class="mr-2 flex-shrink-0" color="primary" />
        <h2 class="text-h5 font-weight-bold text-truncate">{{ songStore.collectionName }}</h2>
      </div>

      <v-chip class="ml-4 flex-shrink-0" size="small" variant="outlined" color="primary">
        {{ songStore.songs.length }} Tracks
      </v-chip>
    </div>

    <!-- Grid -->
    <v-row v-if="songStore.songs.length">
      <v-col
        v-for="song in songStore.songs"
        :key="song.trackId"
        cols="12" sm="12" md="6" lg="6"
      >
        <SongCard :song="song" @toggle-play="handleSongClick" />
      </v-col>
    </v-row>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <v-progress-circular v-if="songStore.loading" indeterminate color="primary" />
      <div v-else class="text-medium-emphasis">
        <v-icon icon="mdi-alert-circle-outline" size="48" class="mb-2" />
        <p>No songs found</p>
        <p class="text-body-2">Try searching for something else.</p>
      </div>
    </div>
  </v-container>
</template>

<style scoped>

</style>