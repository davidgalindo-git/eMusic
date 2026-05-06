<script setup>
import {CARD_VARIANTS} from "../../store/constants.js";

const props = defineProps({
  playlist: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(["select"]);

const variants = CARD_VARIANTS;
</script>

<template>
<v-card>

</v-card>
</template>

<style scoped>

</style>