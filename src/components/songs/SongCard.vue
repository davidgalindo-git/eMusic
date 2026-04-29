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
          class="mx-auto"
          color="surface-variant"
          max-width="344"
          :title="song.trackName"
          :subtitle="song.artistName"
      >
        <template v-slot:actions>
          <v-btn text="Button"></v-btn>
        </template>
      </v-card>

      <div class="text-center text-body-small">{{ variant }}</div>
</template>

<style scoped>

</style>