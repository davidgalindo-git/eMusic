<script setup>
const props = defineProps({
  song: {
    type: Object,
    required: true
  }
});

const variants = ['elevated', 'flat', 'tonal', 'outlined'];
</script>

<template>
  <v-card
      :variant="variants[0]"
      class="song-card mx-auto"
      color="surface-variant"
      max-width="604"
      height="170"
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