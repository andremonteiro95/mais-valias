<template>
  <UTooltip :text="text" v-model:open="open">
    <UIcon
      name="i-lucide-info"
      class="text-muted size-3.5 cursor-help"
      @mouseenter="open = true"
      @mouseleave="open = false"
      @touchstart.stop.prevent="open = !open"
    />
  </UTooltip>
</template>

<script setup lang="ts">
defineProps<{ text: string }>();
const open = ref(false);
</script>
