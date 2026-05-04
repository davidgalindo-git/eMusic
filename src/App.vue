<script setup>
import {useSongStore} from "./store/useSongStore.js";

import SearchBar from "./components/search/SearchBar.vue";
import SongContainer from "./components/songs/SongContainer.vue";
import Player from "./components/player/Player.vue";
import Error from "./components/Error.vue";

const songStore = useSongStore();

const handleSearch = (term) => {
  songStore.search(term)
}
</script>

<template>
  <v-app>
    <v-main>
      <SearchBar @search="handleSearch" />
      <Error />
      <SongContainer />
    </v-main>
    <Player />
  </v-app>
</template>

<style>
</style>