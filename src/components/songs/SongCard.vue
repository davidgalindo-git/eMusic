<script setup>
import {CARD_VARIANTS} from "../../store/constants.js";
import AddToPlaylistButton from "../AddToPlaylistButton.vue";

const props = defineProps({
  song: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["toggle-play"]);

const variants = CARD_VARIANTS;
</script>

<template>
  <v-card
      :variant="variants[0]"
      class="song-card mx-auto"
      max-width="604"
      height="130"
      @click="emit('toggle-play', song)"
  >
    <v-img
      :src="song.artworkUrl"
      cover
      class="card-image"
    ></v-img>
    <div class="d-flex flex-column justify-center text-block overflow-hidden">
      <v-card-item>
        <v-card-title>{{ song.trackName }}</v-card-title>
        <v-card-subtitle>{{ song.artistName }}</v-card-subtitle>
      </v-card-item>
    </div>
    <AddToPlaylistButton :song="song" />
  </v-card>
</template>

<style scoped>
.song-card{
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
}
.card-image {
  flex: 0 0 40% !important;
  width: 40% !important;
  height: 100%;
}
.text-block {
  flex: 0 0 60%;
  max-width: 60%;
}
.v-card-item{
  padding: 10px 0 10px 10px;
}
</style>