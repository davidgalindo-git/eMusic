<script setup>
import {ref, watch} from "vue";
import DeletePlaylistButton from "./DeletePlaylistButton.vue";

const props = defineProps({
  playlist: {
    type: Object,
    required: true
  },
  isEditMode: Boolean,
  isCurrentlyRenaming: Boolean
})

const emit = defineEmits(["select", "rename", "cancel-rename", "delete"]);

const editName = ref(props.playlist.name)

// Sync local ref if the playlist name changes externally
watch(() => props.playlist.name, (newVal) => editName.ref = newVal);

const submitRename = () => {
  emit('rename', props.playlist.id, editName.value);
};
</script>

<template>
  <div class="playlist-card">
    <div class="content-area">
      <!-- Rename Input Mode -->
      <v-text-field
          v-if="isCurrentlyRenaming"
          v-model="editName"
          density="compact"
          autofocus
          hide-details
          @keyup.enter="submitRename"
          @keyup.esc="emit('cancel-rename')"
          @blur="submitRename"
          class="px-4"
      >
        <template v-slot:append-inner>
          <v-icon size="small" color="success" @click="submitRename">mdi-check</v-icon>
        </template>
      </v-text-field>

      <!-- Normal Display Mode -->
      <div
          v-else
          class="display-info"
          @click="emit('select', playlist.id)"
      >
        <span class="playlist-name text-truncate">{{ playlist.name }}</span>
        <span class="song-count text-caption grey--text">{{ playlist.songs.length }} songs</span>   </div>
    </div>

    <div v-if="isEditMode" class="action-area">
      <DeletePlaylistButton @delete-playlist="$emit('delete', playlist.id)" />
    </div>
  </div>
</template>

<style scoped>
.playlist-card {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 48px;
  padding: 8px 16px;
  gap: 12px;
  transition: background 0.2s;
}

.playlist-card:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.content-area {
  flex-grow: 1;
  overflow: hidden;
}

.display-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 100%;
}

.playlist-name {
  font-weight: 500;
  margin-right: 8px;
}

.song-count {
  white-space: nowrap;
}

.action-area {
  display: flex;
  align-items: center;
}
</style>