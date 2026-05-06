<script setup>
import {usePlaylistStore} from "../../store/usePlaylistStore.js";
import {ref} from "vue";
import NewPlaylistButton from "../playlist/NewPlaylistButton.vue";

const props = defineProps({
  song: {
    type: Object,
    required: true
  }
});

const playlistStore = usePlaylistStore();
const isPopUp = ref(false)

const togglePopUp = () => {
  isPopUp.value = !isPopUp.value;
}

const handlePlaylistClick = (song, playlistId) => {
  playlistStore.addToPlaylist(song, playlistId);
  togglePopUp();
}
</script>

<template>
  <v-btn
      v-if="!isPopUp"
      :icon="'mdi-plus'"
      variant="text"
      density="comfortable"
      color="primary"
      @click="togglePopUp"
      :title="'Add To Playlist'"
  ></v-btn>
  <v-col v-if="isPopUp">
    <v-card v-if="playlistStore.playlists.length"
      v-for="playlist in playlistStore.playlists"
      :key="playlist.id"
      class="playlist-item"
      :playlist="playlist"
      @select="handlePlaylistClick"
    />
    <div v-else class="text-center">
      <p>No playlists yet</p>
    </div>
    <NewPlaylistButton />
  </v-col>
</template>

<style scoped>

</style>