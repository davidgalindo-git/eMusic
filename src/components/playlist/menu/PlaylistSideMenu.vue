<script setup>
import PlaylistContainer from "./PlaylistContainer.vue";

const emit = defineEmits(["show-playlist"]);

const showPlaylist = (playlistId) => {
  emit("show-playlist", playlistId);
}

</script>

<template>
  <aside class="playlist-menu">
    <div class="menu-header">
      <h2>Playlists</h2>
    </div>
    <PlaylistContainer @show-playlist="showPlaylist" class="playlist-container"/>
  </aside>
</template>

<style scoped>
.playlist-menu {
  /* Positioning and Size */
  width: 250px;
  position: sticky;
  left: 0;
  top: 0;
  height: calc(100vh - 64px);

  /* Layout */
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  /* Visuals */
  background-color: #121212;
  color: white;
  border-right: 1px solid #282828;
}

.menu-header {
  background-color: white;
  color: black;
  padding: 24px;
  border-bottom: 1px solid #282828;
}

.menu-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.playlist-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

/* RESPONSIVE LAYOUT ENGINE */
@media (max-width: 1200px) {
  .playlist-menu {
    width: 200px;
  }
}

@media (max-width: 800px) {
  .playlist-menu {
    width: 125px;
  }

  .menu-header {
    padding: 12px;
  }

  .menu-header h2 {
    font-size: 1rem;
  }
}

</style>