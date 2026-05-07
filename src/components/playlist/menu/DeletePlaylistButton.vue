<script setup>
const emit = defineEmits(["delete-playlist"]);

const handleClick = () => {
  emit("delete-playlist")
}
</script>

<template>
  <v-btn
    icon="mdi-delete"
    variant="text"
    density="comfortable"
    color="error"
    @click=handleClick
    title="Delete Playlist"
  >
  </v-btn>
</template>

<style scoped>

</style>