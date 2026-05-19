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
.search-container {
  width: 100%;
  max-width: 500px;
}

.search-input {
  width: 80%;
  height: 40px;
  padding: 0 16px;

  /* Grey Border Definition */
  border: 1px solid #cccccc;
  border-radius: 20px;

  /* Typography & Basics */
  font-size: 0.95rem;
  background-color: transparent;
  color: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
</style>