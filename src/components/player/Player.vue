<script setup>
import { computed } from 'vue'
import { useSongStore } from "../../store/useSongStore.js"

const store = useSongStore()
const song = computed(() => store.songs.find(s => s.trackId === store.currentSongId))
</script>

<template>
  <v-app-bar v-if="song" location="bottom" height="120" flat border class="px-8">
    <div class="d-flex align-center" style="flex: 1; min-width: 0;">
      <!-- Cover & Info -->
      <v-avatar rounded size="90" class="mr-6">
        <v-img :src="song.artworkUrl" cover />
      </v-avatar>

      <div class="text-truncate">
        <div class="text-subtitle-2 font-weight-bold text-truncate">{{ song.trackName }}</div>
        <div class="text-caption text-truncate">{{ song.artistName }}</div>
      </div>
    </div>
  <!-- Actions -->
    <div class="d-flex flex-column align-center justify-center" style="flex: 2;">
      <!-- Buttons -->
      <div class="d-flex align-center">
        <!-- Previous -->
        <v-btn icon variant="text" @click="store.prev">
          <v-icon icon="mdi-skip-previous" size="32" />
        </v-btn>
        <!-- Play/Pause -->
        <v-btn
            icon
            variant="tonal"
            @click="store.togglePlay(song)"
        >
          <v-icon :icon="store.isPlaying ? 'mdi-pause' : 'mdi-play'" />
        </v-btn>
        <!-- Next -->
        <v-btn icon variant="text" @click="store.next">
          <v-icon icon="mdi-skip-next" size="32" />
        </v-btn>
      </div>
      <!-- Progression Bar -->
      <v-slider
          density="compact"
          hide-details
          color="black"
          class="w-100 mt-1"
          style="max-width: 300px;"
      ></v-slider>
    </div>
  </v-app-bar>
</template>