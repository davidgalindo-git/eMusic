<script setup>
import {useSongStore} from "./store/useSongStore.js";

import SearchBar from "./components/header/SearchBar.vue";
import SongContainer from "./components/songs/SongContainer.vue";

const songStore = useSongStore();

const handleSearch = (term) => {
  songStore.search(term)
}
</script>
<template>
  <SearchBar @search="handleSearch" />
  <SongContainer />
  <div class="songs">
    {{ songs }}
  </div>
</template>
