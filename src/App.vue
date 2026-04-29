<script setup>
import { useITunes } from "./api/useITunes.js";
import SearchBar from "./components/header/SearchBar.vue";
import SongContainer from "./components/songs/SongContainer.vue";

const { songs, searchSongs, loading} = useITunes();

const handleSearch = (term) => {
  searchSongs(term)
}
</script>
<template>
  <SearchBar @search="handleSearch" />
  <SongContainer />
  <div class="songs">
    {{ songs }}
  </div>
</template>
