<script setup>
import {ref, watch} from "vue";
import {CARD_VARIANTS} from "../../../store/constants.js";

const props = defineProps({
  playlist: {
    type: Object,
    required: true
  },
  isEditMode: Boolean,
  isCurrentlyRenaming: Boolean
})

const emit = defineEmits(["select", "rename", "cancel-rename"]);

const editName = ref(props.playlist.name)

// Sync local ref if the playlist name changes externally
watch(() => props.playlist.name, (newVal) => editName.ref = newVal);

const submitRename = () => {
  emit('rename', props.playlist.id, editName.value);
};

const variants = CARD_VARIANTS;
</script>

<template>
  <div class="playlist-item-container">
    <!-- Rename Input Mode -->
    <v-text-field
        v-if="isCurrentlyRenaming"
        v-model="editName"
        density="compact"
        :variant=variants[2]
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
        class="playlist-item d-flex align-center justify-space-between"
        @click="emit('select', playlist.id)"
    >
      <div class="d-flex align-center">
        <span class="text-truncate">{{ playlist.name }}</span>
      </div>

      <span class="text-caption grey--text">{{ playlist.songs.length }} songs</span>
    </div>
  </div>
</template>

<style scoped>
.playlist-card {
  padding: 0;
}

.title {
  color: white;
  padding: 0;
  font-size: 1rem;
}
</style>