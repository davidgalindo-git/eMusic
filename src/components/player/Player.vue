<script setup>
import { computed } from 'vue'
import { useSongStore } from "../../store/useSongStore.js"
import {timeFormatter} from "../../utils/timeFormatter.js";

const store = useSongStore()
const song = computed(() => store.songs.find(s => s.trackId === store.currentSongId))
</script>

<template>
  <v-footer
      v-if="song"
      app
      :height="$vuetify.display.xs ? 'auto' : 120"
      class="px-8 border-t bg-surface player-footer-layout"
      style="z-index: 1004;"
  >
    <div class="d-flex align-center player-section-left">
      <!-- Cover & Info -->
      <v-avatar rounded size="90" class="mr-6 flex-shrink-0">
        <v-img :src="song.artworkUrl" cover />
      </v-avatar>

      <div class="text-truncate">
        <div class="text-subtitle-2 font-weight-bold text-truncate">{{ song.trackName }}</div>
        <div class="text-caption text-truncate">{{ song.artistName }}</div>
      </div>
    </div>
  <!-- Actions -->
    <div class="d-flex flex-column align-center justify-center player-section-center" style="flex: 2;">
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
      <div class="d-flex align-center w-100" style="max-width: 400px;">
        <span class="text-caption mr-2" style="min-width: 40px">
          {{ timeFormatter(store.currentTime) }}
        </span>

        <v-slider
            :model-value="store.currentTime"
            :max="store.duration"
            step="0.1"
            density="compact"
            hide-details
            color="black"
            class="mt-1"
            @update:model-value="store.seek"
        ></v-slider>

        <span class="text-caption ml-2" style="min-width: 40px">
          {{ timeFormatter(store.duration) }}
        </span>
      </div>
    </div>

    <div class="player-section-right d-none d-md-block"></div>
  </v-footer>
</template>
<style scoped>
.player-footer-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.player-section-left,
.player-section-right {
  flex: 1 1 25% !important;
  min-width: 0;
}

.player-section-center {
  flex: 1 1 50% !important;
  min-width: 0;
}

@media (max-width: 599px) {
  .player-footer-layout {
    flex-direction: column !important;
    gap: 12px;
  }

  .player-section-left {
    flex: none !important;
    width: 100%;
    justify-content: space-evenly;
  }
  .player-section-center {
    flex: none !important;
    width: 100% !important;
  }
}
</style>