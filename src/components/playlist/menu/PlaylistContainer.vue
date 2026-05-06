<script setup>
import {ref} from "vue";
import {usePlaylistStore} from "../../../store/usePlaylistStore.js";
import PlaylistCard from "./PlaylistCard.vue";
import NewPlaylistButton from "./NewPlaylistButton.vue";
import EditModeButton from "../EditModeButton.vue";

const playlistStore = usePlaylistStore();

const isEditMode = ref(false)
const editingPlaylistId = ref(null)

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
  if (!isEditMode.value) editingPlaylistId.value = null;
}

const handlePlaylistClick = (playlistId) => {
  if (isEditMode.value) {
    editingPlaylistId.value = playlistId;  } else
  playlistStore.selectPlaylist(playlistId);
}

const handleRename = (playlistId, newName) => {
  if (newName.trim()) {
    playlistStore.renamePlaylist(playlistId, newName);
  }
  editingPlaylistId.value = null;
  isEditMode.value = false;
}
</script>

<template>
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
    />
  </v-col>
  <div v-else class="text-center">
    <p>No playlists yet</p>
    <p class="text-body-small">Create or add a song to a new playlist.</p>
  </div>
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