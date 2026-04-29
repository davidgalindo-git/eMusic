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
  <v-row density="comfortable">
    <v-col
        v-for="(variant, i) in variants"
        :key="i"
        cols="12"
        md="4"
    >
      <v-card
          :variant="variant"
          class="mx-auto"
          color="surface-variant"
          max-width="344"
          subtitle="Greyhound divisely hello coldly fonwderfully"
          :title="song.trackName"
          :subtitle="song.artistName"
      >
        <template v-slot:actions>
          <v-btn text="Button"></v-btn>
        </template>
      </v-card>

      <div class="text-center text-body-small">{{ variant }}</div>
    </v-col>
  </v-row>
</template>

<style scoped>

</style>