<script setup>
const props = defineProps({
  song: {
    type: Object,
    required: true
  }
});

const variants = ['elevated', 'flat', 'tonal', 'outlined'];
</script>

<template v-slot:actions>
  <v-card
      :variant="variants[0]"
      class="mx-auto"
      color="surface-variant"
      max-width="344"
      :title="song.trackName"
      :subtitle="song.artistName"
  >
  </v-card>
</template>

<style scoped>
</style>