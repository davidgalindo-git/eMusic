<script setup>
import PlaylistContainer from "./PlaylistContainer.vue";
import NewPlaylistButton from "./NewPlaylistButton.vue";
import EditModeButton from "../EditModeButton.vue";
</script>

<template>
  <aside class="playlist-menu">
    <div class="menu-header">
      <h2>Playlists</h2>
      <NewPlaylistButton />
      <EditModeButton />
    </div>
    <PlaylistContainer class="playlist-container"/>
  </aside>
</template>

<style scoped>
.playlist-menu {
  /* Positioning and Size */
  width: 250px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;

  /* Layout */
  display: flex;
  flex-direction: column;

  /* Visuals */
  background-color: #121212;
  color: white;
  border-right: 1px solid #282828;
}

.menu-header {
  padding: 24px;
  border-bottom: 1px solid #282828;
}

.menu-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.playlist-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

</style>