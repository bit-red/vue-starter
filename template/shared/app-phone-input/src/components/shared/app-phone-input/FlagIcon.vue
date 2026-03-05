<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  country?: string;
}>();

const flagUrl = computed(() => {
  if (!props.country) return "";
  return `https://flagcdn.com/w40/${props.country.toLowerCase()}.png`;
});
</script>

<template>
  <span class="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm">
    <img v-if="country" :src="flagUrl" :alt="country" class="h-full w-full object-cover" />
  </span>
</template>
