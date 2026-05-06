<script setup>
const props = defineProps({
  playlist: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(["select"]);
</script>

<template>
<p>Playlist 1</p>
</template>

<style scoped>

</style>