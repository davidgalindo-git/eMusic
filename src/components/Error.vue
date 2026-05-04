<script setup>
import {useSongStore} from "../store/useSongStore.js";

const songStore = useSongStore()
</script>

<template>
  <!-- Error Message Area -->
  <v-expand-transition>
    <div v-if="songStore.error" class="mb-4">
      <v-alert
          type="error"
          variant="tonal"
          density="compact"
          icon="mdi-alert-circle"
          closable
          @click:close="songStore.error = null"
      >
        {{ songStore.error }}
      </v-alert>
    </div>
  </v-expand-transition>
</template>

<style scoped>

</style>