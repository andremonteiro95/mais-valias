<template>
  <UTooltip :text="text" v-model:open="open">
    <UIcon
      name="i-lucide-info"
      :class="['text-muted size-3.5 shrink-0 cursor-help', iconClass]"
      @mouseenter="open = true"
      @mouseleave="open = false"
      @touchstart.stop.prevent="open = !open"
    />
  </UTooltip>
</template>

<script setup lang="ts">
const { text, iconClass = "" } = defineProps<{ text: string; iconClass?: string }>();
const open = ref(false);
</script>
