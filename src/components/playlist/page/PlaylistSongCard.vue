<script setup>
import {CARD_VARIANTS} from "../../../store/constants.js";
import AddToPlaylistButton from "../../AddToPlaylistButton.vue";
import RemoveFromPlaylistButton from "./RemoveFromPlaylistButton.vue";
import {timeFormatter} from "../../../utils/timeFormatter.js";

const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  isEditMode: Boolean,
  isCurrentlyRenaming: Boolean
});

const emit = defineEmits(["toggle-play", "remove-song"]);

const variants = CARD_VARIANTS;
</script>

<template>
  <v-card
      :variant="variants[0]"
      class="song-card mx-auto w-100"
      color="surface-variant"
      height="60"
      @click="emit('toggle-play', song)"
  >
    <v-icon
        v-if="isEditMode"
        icon="mdi-drag-horizontal-variant"
        class="drag-handle mr-2 ml-2"
        style="cursor: grab"
    />
    <v-img
        :src="song.artworkUrl"
        cover
        height="60"
        :width="$vuetify.display.xs ? 60 : 120"
        max-width="250px"
        class="flex-shrink-0 flex-grow-1"
    ></v-img>
    <div class="d-flex flex-column justify-center pl-3 pr-2 flex-grow-1 overflow-hidden">
      <div class="text-body-1 font-weight-bold text-truncate line-height-tight">
        {{ song.trackName }}
      </div>
      <div class="text-caption text-medium-emphasis text-truncate text-white">
        {{ song.artistName }} <span class="font-italic d-none d-sm-inline">• {{ song.albumName }} </span>
      </div>
    </div>
    <div class="d-flex align-center" @click.stop>
      <span class="d-none d-sm-inline text-caption text-medium-emphasis mr-1 text-white">
        {{ timeFormatter(song.durationMs/1000) }}
      </span>
      <AddToPlaylistButton :song="song" />

      <div v-if="isEditMode">
        <RemoveFromPlaylistButton @remove-song="emit('remove-song', song.trackId)" />
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.song-card{
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
}
</style>