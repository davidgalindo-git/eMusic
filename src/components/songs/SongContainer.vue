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
    <div
    v-if="!songStore.songs.length"
    class="d-flex flex-column align-center justify-center py-16 text-medium-emphasis"
    >
    <v-icon icon="mdi-music-off" size="64" class="mb-4" />
    <div class="text-h6">No songs found</div>
    <div class="text-body-2">Try searching for something else.</div>
    </div>
    <v-row v-else>
      <v-col
        v-for="song in songStore.songs"
        :key="song.trackId"
        cols="12" sm="8" md="6" lg="6"
      >
        <SongCard :song="song" @toggle-play="handleSongClick" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>

</style>