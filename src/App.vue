<script setup>
import {ref} from "vue";

import SearchBar from "./components/search/SearchBar.vue";
import SongContainer from "./components/songs/SongContainer.vue";
import Player from "./components/player/Player.vue";
import ErrorAlert from "./components/ErrorAlert.vue";
import PlaylistSideMenu from "./components/playlist/menu/PlaylistSideMenu.vue";
import PlaylistPage from "./components/playlist/page/PlaylistPage.vue";

import {useSongStore} from "./store/useSongStore.js";
import {usePlaylistStore} from "./store/usePlaylistStore.js";

const songStore = useSongStore();
const playlistStore = usePlaylistStore();

const currentView = ref('search')

const showPlaylist = (id) => {
  currentView.value = 'playlist';
  playlistStore.selectPlaylist(id);
}

const handleSearch = (term) => {
  currentView.value = 'search';
  songStore.search(term)
}
</script>

<template>
  <v-app>
    <v-main>
      <div class="header-container">
        <SearchBar @search="handleSearch" />
        <ErrorAlert />
      </div>
      <div class="body-container">
        <PlaylistSideMenu @show-playlist="showPlaylist"/>
        <SongContainer v-if="currentView === 'search'" class="flex-grow-1"/>
        <PlaylistPage v-else-if="currentView === 'playlist'" class="flex-grow-1"/>
      </div>
    </v-main>
    <Player />
  </v-app>
</template>

<style>
.body-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: flex-start;
}

.header-container {
  height: 60px;
  padding: 10px;
}

.flex-grow-1 {
  flex: 1;
  min-width: 0;
}
</style>