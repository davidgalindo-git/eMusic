<script setup>
import {usePlaylistStore} from "../../store/usePlaylistStore.js";
import {ref} from "vue";
import NewPlaylistButton from "../playlist/menu/NewPlaylistButton.vue";

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

    <v-list min-width="200" elevation="10" class="pa-2">
      <v-list-subheader>Add to playlist</v-list-subheader>

      <v-list-item
          v-for="playlist in playlistStore.playlists"
          :key="playlist.id"
          :title="playlist.name"
          @click="handlePlaylistClick(song, playlist.id)"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-music-note-plus" size="small"></v-icon>
        </template>
      </v-list-item>

      <v-divider v-if="playlistStore.playlists.length" class="my-2"></v-divider>

      <div v-if="!playlistStore.playlists.length" class="text-caption pa-4 text-center">
        No playlists found
      </div>

      <NewPlaylistButton />
    </v-list>
  </v-menu>
</template>

<style scoped>

</style>