<script setup>
const emit = defineEmits(["remove-song"]);

const handleClick = () => {
  emit("remove-song")
}
</script>

<template>
  <v-btn
      icon="mdi-delete"
      variant="text"
      density="comfortable"
      color="error"
      @click=handleClick
      title="Remove Song"
  >
  </v-btn>
</template>

<style scoped>

</style>