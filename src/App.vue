<script setup>
import {ref} from "vue";

import SearchBar from "./components/search/SearchBar.vue";
import SongContainer from "./components/songs/SongContainer.vue";
import Player from "./components/player/Player.vue";
import ErrorAlert from "./components/ErrorAlert.vue";
import PlaylistSideMenu from "./components/playlist/menu/PlaylistSideMenu.vue";
import PlaylistSongContainer from "./components/playlist/page/PlaylistSongContainer.vue";

import {useSongStore} from "./store/useSongStore.js";
import {usePlaylistStore} from "./store/usePlaylistStore.js";
import Logo from "./components/Logo.vue";

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
    <Player />

    <v-navigation-drawer
        permanent
        :width="$vuetify.display.mdAndDown ? ($vuetify.display.smAndDown ? 125 : 200) : 250"
        color="#fff"
        class="border-right"
    >
      <PlaylistSideMenu @show-playlist="showPlaylist" />
    </v-navigation-drawer>

    <v-app-bar :elevation="1" color="surface" height="70" class="px-4">
      <div class="d-flex align-center w-100 built-header">
        <SearchBar @search="handleSearch" class="flex-grow-1 header-search" />
        <Logo />
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-0">
        <ErrorAlert />
      </v-container>

      <div class="view-container">
        <SongContainer v-if="currentView === 'search'" class="flex-grow-1" />
        <PlaylistSongContainer
            v-else-if="currentView === 'playlist'"
            class="w-100"
            @deleted-playlist="currentView = 'search'"
        />
      </div>
    </v-main>
  </v-app>
</template>

<style>
.view-container {
  width: 100%;
  height: auto;
  overflow: visible;
}

.built-header {
  max-width: 1200px;
  margin: 0 auto;
}

.header-search {
  min-width: 0;
}

.w-100 {
  width: 100%;
}
</style>