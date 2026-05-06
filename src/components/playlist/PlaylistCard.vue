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
    :variant="variants[2]"
    class="playlist-card mx-auto"
    color="surface-variant"
    width="100%"
    height="40"
    @click="emit('select', playlist.id)"
  >
    <v-card-text class="title">{{ playlist.name }}</v-card-text>
    <v-card-text>{{ playlist.songs.length }} songs</v-card-text>
  </v-card>
</template>

<style scoped>
.playlist-card {
  padding: 0;
}

.title {
  color: white;
  padding: 0;
  font-size: 1rem;
}
</style>