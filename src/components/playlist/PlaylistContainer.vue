<script setup>
import PlaylistCard from "./PlaylistCard.vue";
import {usePlaylistStore} from "../../store/usePlaylistStore.js";

const playlistStore = usePlaylistStore();


</script>

<template>
  <v-col v-if="playlistStore.playlists.length"
    v-for="playlist in playlistStore.playlists"
    :key="playlist.id"
  >
    <PlaylistCard class="playlist-item" :playlist="playlist"/>
  </v-col>

</template>

<style scoped>

.playlist-item {
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.playlist-item:hover {
  background-color: #282828;
}
</style>