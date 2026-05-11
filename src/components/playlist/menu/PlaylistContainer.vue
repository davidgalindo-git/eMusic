<script setup>
import {ref} from "vue";

import PlaylistCard from "./PlaylistCard.vue";
import NewPlaylistButton from "./NewPlaylistButton.vue";
import EditModeButton from "../EditModeButton.vue";

import {usePlaylistStore} from "../../../store/usePlaylistStore.js";

const emit = defineEmits(["show-playlist"]);

const playlistStore = usePlaylistStore();

const isEditMode = ref(false)
const editingPlaylistId = ref(null)

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
  if (!isEditMode.value) editingPlaylistId.value = null;
}

const handlePlaylistClick = (playlistId) => {
  if (isEditMode.value) {
    editingPlaylistId.value = playlistId;
  } else {
    emit("show-playlist", playlistId);
  }
}

const handleRename = (playlistId, newName) => {
  if (newName.trim()) {
    playlistStore.renamePlaylist(playlistId, newName);
  }
  editingPlaylistId.value = null;
  isEditMode.value = false;
}

const deletePlaylist = (playlistId) => {
  playlistStore.deletePlaylist(playlistId);
}
</script>

<template>
  <div class="playlist-container" @keyup.esc="isEditMode = false">
    <div class="playlist-actions">
      <NewPlaylistButton />
      <EditModeButton
          :is-edit-mode="isEditMode"
          @toggle-edit-mode="toggleEditMode"
      />
    </div>
    <v-col v-if="playlistStore.playlists.length">
      <PlaylistCard
          v-for="playlist in playlistStore.playlists"
          :key="playlist.id"
          class="playlist-item"
          :playlist="playlist"
          :is-edit-mode="isEditMode"
          :is-currently-renaming="editingPlaylistId === playlist.id"
          @select="handlePlaylistClick"
          @rename="handleRename"
          @cancel-rename="editingPlaylistId = null"
          @delete="deletePlaylist"
      />
    </v-col>
    <div v-else class="text-center">
      <p>No playlists yet</p>
      <p class="text-body-small">Create or add a song to a new playlist.</p>
    </div>
  </div>
</template>

<style scoped>
.playlist-container {
  background: white;
}
.playlist-item {
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.2s;
  color: black;
}

.playlist-item:hover {
  background-color: #282828;
}
</style>