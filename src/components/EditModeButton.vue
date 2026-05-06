<script setup>
import {ref} from "vue";

const emit = defineEmits(["toggle-edit-mode"]);

const isEditMode = ref(false)

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  emit("toggle-edit-mode", isEditMode.value)
}
</script>

<template>
  <v-btn
      :icon="isEditMode ? 'mdi-close' : 'mdi-pencil'"
      variant="text"
      density="comfortable"
      color="primary"
      :title="isEditMode ? 'Close' : 'Edit Mode'"
      @click="toggleEditMode"
  >
  </v-btn>
</template>

<style scoped>

</style>