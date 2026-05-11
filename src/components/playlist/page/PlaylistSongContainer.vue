<script setup>
import {computed, ref, watch} from "vue";
import draggable from "vuedraggable";

import PlaylistSongCard from "./PlaylistSongCard.vue";
import EditModeButton from "../EditModeButton.vue";

import {useSongStore} from "../../../store/useSongStore.js";
import {usePlaylistStore} from "../../../store/usePlaylistStore.js";
import DeletePlaylistButton from "../menu/DeletePlaylistButton.vue";

const playlistStore = usePlaylistStore();
const songStore = useSongStore();

const emit = defineEmits(["deleted-playlist"])

const isEditMode = ref(false)
const isCurrentlyRenaming = ref(false)
const editName = ref("")

watch(() => playlistStore.activePlaylistName, (newVal) => {
  editName.value = newVal;
}, { immediate: true });

const songs = computed({
  get: () => playlistStore.activePlaylistSongs,
  set: (newList) => {
    const playlist = playlistStore.playlists.find(p => p.id === playlistStore.selectedPlaylistId);
    if (playlist) {
      playlist.songs = newList;
    }
  }
});

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
  if (!isEditMode.value) {
    isCurrentlyRenaming.value = false;
  }
}
const handleSongClick = (song) => {
  if (!isEditMode.value) {
    songStore.setQueue(songs.value, playlistStore.activePlaylistName);
    songStore.togglePlay(song)
  }
}
const removeSong = (trackId) => {
  playlistStore.removeFromPlaylist(playlistStore.selectedPlaylistId, trackId);
}

const startRenaming = () => {
  editName.value = playlistStore.activePlaylistName;
  isCurrentlyRenaming.value = true;
};

const handleRename = () => {
  const trimmed = editName.value.trim();
  if (trimmed && trimmed !== playlistStore.activePlaylistName) {
    playlistStore.renamePlaylist(playlistStore.selectedPlaylistId, trimmed);
  }
  isCurrentlyRenaming.value = false;
  isEditMode.value = false;
}

const cancelRename = () => {
  editName.value = playlistStore.activePlaylistName;
  isCurrentlyRenaming.value = false;
}

const deletePlaylist = () => {
  playlistStore.deletePlaylist(playlistStore.selectedPlaylistId);
  isEditMode.value = false;
  emit("deleted-playlist");
}
</script>

<template>
  <v-container @keyup.esc="isEditMode = false">
    <!-- Dynamic Title Section -->
    <div class="d-flex align-center mb-4">
      <v-icon icon="mdi-playlist-music" class="mr-2" color="primary" />

      <div class="content-area">
        <!-- Rename Input Mode -->
        <v-text-field
            v-if="isCurrentlyRenaming"
            v-model="editName"
            density="compact"
            autofocus
            hide-details
            variant="underlined"
            @keyup.enter="handleRename"
            @keyup.esc="cancelRename"
            @blur="cancelRename"
        >
          <template v-slot:append-inner>
            <v-icon size="small" color="success" @click="handleRename">mdi-check</v-icon>
          </template>
        </v-text-field>

        <!-- Normal Display Mode -->
        <div
            v-else
            class="display-info"
            :class="{ 'cursor-pointer': isEditMode }"
            @click="isEditMode ? startRenaming() : null"
        >
          <div class="d-flex align-center">
            <h2 class="text-h5 font-weight-bold">
              {{ playlistStore.activePlaylistName }}
            </h2>
          </div>
        </div>
      </div>

      <v-chip class="ml-4" size="small" variant="outlined" color="primary">
        {{ playlistStore.activePlaylistSongs.length }} Tracks
      </v-chip>

      <EditModeButton
          :is-edit-mode="isEditMode"
          @toggle-edit-mode="toggleEditMode"
      />
      <DeletePlaylistButton v-if="isEditMode" @delete-playlist="deletePlaylist" />
    </div>

    <div v-if="songs.length">
      <draggable
          v-model="songs"
          item-key="trackId"
          handle=".drag-handle"
          :disabled="!isEditMode"
          ghost-class="on-drag"
          animation="200"
      >
        <template #item="{ element }">
          <div class="py-1">
            <PlaylistSongCard
                :song="element"
                :is-edit-mode="isEditMode"
                @toggle-play="handleSongClick"
                @remove-song="removeSong"
            />
          </div>
        </template>
      </draggable>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <v-progress-circular v-if="songStore.loading" indeterminate color="primary" />
      <div v-else class="text-medium-emphasis">
        <v-icon icon="mdi-alert-circle-outline" size="48" class="mb-2" />
        <p>This playlist is empty.</p>
        <p class="text-body-2">Try adding new songs.</p>
      </div>
    </div>
  </v-container>
</template>

<style scoped>

</style>