<script setup>
import { useITunes } from "./api/useITunes.js";
import SearchBar from "./components/header/SearchBar.vue";

const { songs, searchSongs, loading} = useITunes();

const handleSearch = (term) => {
  searchSongs(term)
}
</script>
<template>
  <SearchBar @search="handleSearch" />
  <div class="songs">
    {{ songs }}
  </div>
</template>
