<script setup>
import {ref} from "vue";
import {usePlaylistStore} from "../../../store/usePlaylistStore.js";

const playlistStore = usePlaylistStore()
const isPopUp = ref(false)
const newPlaylistName = ref("");

const toggleInput = (e) => {
  isPopUp.value = !isPopUp.value
  newPlaylistName.value = "";
}

const submitPlaylist = () => {
  if (newPlaylistName.value.trim()) {
    playlistStore.createPlaylist(newPlaylistName.value.trim())
    isPopUp.value = false;
    newPlaylistName.value = "";
  }
}
</script>

<template>
  <v-btn
      :icon="isPopUp ? 'mdi-close' : 'mdi-plus'"
      variant="text"
      density="comfortable"
      color="primary"
      @click="toggleInput"
      :title="isPopUp ? 'Close' : 'Create New Playlist'"
  ></v-btn>

  <v-text-field
      v-if="isPopUp"
      v-model="newPlaylistName"
      label="Playlist Name"
      variant="underlined"
      density="compact"
      hide-details
      autofocus
      @keyup.enter="submitPlaylist"
      class="mt-2"
  >
    <template v-slot:append-inner>
      <v-btn
          icon="mdi-check"
          variant="text"
          density="compact"
          color="success"
          @click.stop="submitPlaylist"
      ></v-btn>
    </template>
  </v-text-field>
</template>

<style scoped>

</style>