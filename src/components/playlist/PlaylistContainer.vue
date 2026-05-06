<script setup>
import PlaylistCard from "./PlaylistCard.vue";
</script>

<template>
  <PlaylistCard class="playlist-item"/>
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