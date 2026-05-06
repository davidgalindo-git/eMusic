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

const handlePlaylistClick = (song, playlistId) => {
  playlistStore.addToPlaylist(song, playlistId);
}
</script>

<template>
  <v-menu location="bottom end" :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
          v-bind="props"
          icon="mdi-plus"
          variant="text"
          density="comfortable"
          color="primary"
          title="Add To Playlist"
          @click.stop
      ></v-btn>
    </template>
  </v-menu>

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