<script setup>
import PlaylistSongCard from "./PlaylistSongCard.vue";
import {useSongStore} from "../../../store/useSongStore.js";

const songStore = useSongStore();

const handleSongClick = (song) => {
  songStore.togglePlay(song)
}
</script>

<template>
  <!-- Dynamic Title Section -->
  <div class="d-flex align-center mb-4">
    <v-icon icon="mdi-playlist-music" class="mr-2" color="primary" />
    <h2 class="text-h5 font-weight-bold">{{ songStore.collectionName }}</h2>
    <v-chip class="ml-4" size="small" variant="outlined" color="primary">
      {{ songStore.songs.length }} Tracks
    </v-chip>
  </div>

  <v-row v-if="songStore.songs.length">
    <v-col
        v-for="song in songStore.songs"
        :key="song.trackId"
        cols="12" sm="8" md="6" lg="6"
    >
      <PlaylistSongCard :song="song" @toggle-play="handleSongClick" />
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
</template>

<style scoped>

</style>