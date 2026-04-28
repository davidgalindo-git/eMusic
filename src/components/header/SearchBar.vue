<script setup>
import { ref } from "vue";

const emit = defineEmits(["search"])

const term = ref("")

const onSearch = () => {
  if (!term.value?.trim()) return

  emit("search", term.value)
}

</script>

<template>
<div>
  <form @submit.prevent="onSearch" class="search-container">
    <input
      type="text"
      v-model="term"
      placeholder="Search music..."
      class="search-input"
    >
  </form>
</div>
</template>

<style scoped>

</style>