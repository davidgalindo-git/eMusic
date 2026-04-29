<script setup>
import { useSongStore } from "../../store/useSongStore.js";
import SongCard from "./SongCard.vue";

const songStore = useSongStore()
</script>

<template>
  <v-container>
    <v-row>
      <v-col
        v-for="song in songStore.songs"
        :key="song.trackId"
        cols="12" sm="6" md="4" lg="3"
      >
        <SongCard :song="song"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>

</style>