<script setup>
import PlaylistContainer from "./PlaylistContainer.vue";

const emit = defineEmits(["show-playlist"]);

const showPlaylist = (playlistId) => {
  emit("show-playlist", playlistId);
}

</script>

<template>
  <aside class="playlist-menu">
    <div class="menu-header align-content-center">
      <h2 class="font-weight-bold text-subtitle-1">Playlists</h2>
    </div>
    <PlaylistContainer @show-playlist="showPlaylist" class="playlist-container"/>
  </aside>
</template>

<style scoped>
.playlist-menu {
  /* Positioning and Size */
  width: 100%;
  height: 100%;

  /* Layout */
  display: flex;
  flex-direction: column;

  /* Visuals */
  background-color: #121212;
  color: white;
}

.menu-header {
  background-color: white;
  color: black;
  padding: 24px;
  height: 70px;
}

.playlist-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

@media (max-width: 800px) {
  .menu-header {
    padding: 12px;
  }
}
</style>