<script setup>
import {CARD_VARIANTS} from "../../../store/constants.js";
import AddToPlaylistButton from "./../../songs/AddToPlaylistButton.vue";
import RemoveFromPlaylistButton from "./RemoveFromPlaylistButton.vue";

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
      class="song-card mx-auto"
      color="surface-variant"
      max-width="604"
      height="60"
      @click="emit('toggle-play', song)"
  >
    <v-img
        :src="song.artworkUrl"
        cover
        class="flex-shrink-0 flex-grow-0"
        style="flex-basis: 170px;"
    ></v-img>
    <div class="d-flex flex-column justify-center flex-grow-1 overflow-hidden">
      <v-card-item
          :title="song.trackName"
          :subtitle="song.artistName"
      >
      </v-card-item>
    </div>
    <div class="d-flex align-center" @click.stop>
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