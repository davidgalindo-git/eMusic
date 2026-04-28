<script setup>
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