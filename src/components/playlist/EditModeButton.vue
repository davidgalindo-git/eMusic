<script setup>
const props = defineProps({
  isEditMode: Boolean,
  required: true
})

const emit = defineEmits(["toggle-edit-mode"]);

const handleClick = () => {
  emit("toggle-edit-mode")
}
</script>

<template>
  <v-btn
      :icon="isEditMode ? 'mdi-close' : 'mdi-pencil'"
      variant="text"
      density="comfortable"
      color="primary"
      :title="isEditMode ? 'Close Edit Mode [Esc]' : 'Edit Mode'"
      @click="handleClick"
  >
  </v-btn>
</template>

<style scoped>

</style>