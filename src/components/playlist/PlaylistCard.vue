<script setup>
import {CARD_VARIANTS} from "../../store/constants.js";

const props = defineProps({
  playlist: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(["select"]);

const variants = CARD_VARIANTS;
</script>

<template>
  <v-card
    :variant="variants"
    class="playlist-card mx-auto"
    color="surface-variant"
    max-width="100"
    height="30"
    @click="emit('select', playlist.id)"
  >
    <v-card-title>{{ playlist.name }}</v-card-title>
    <v-card-text>{{ playlist.songs.length }} songs</v-card-text>
  </v-card>
</template>

<style scoped>

</style>