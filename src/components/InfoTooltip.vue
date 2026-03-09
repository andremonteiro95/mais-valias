<template>
  <!-- With details: clickable popover with expanded content -->
  <UPopover v-if="details" mode="click" :ui="{ content: 'max-w-80' }">
    <UIcon
      name="i-lucide-info"
      :class="[
        'size-3.5 shrink-0 cursor-pointer text-primary-400 hover:text-primary-500 transition-colors',
        iconClass,
      ]"
    />
    <template #content>
      <div class="p-3.5 space-y-2.5">
        <p class="text-sm text-default leading-relaxed">{{ text }}</p>
        <div class="border-t border-default pt-2.5 space-y-2">
          <p class="text-xs text-muted leading-relaxed whitespace-pre-line">{{ details }}</p>
          <p v-if="legal" class="text-xs text-muted/60 font-mono">{{ legal }}</p>
          <NuxtLink
            v-if="faqHref"
            :to="faqHref"
            class="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition-colors"
          >
            <UIcon name="i-lucide-external-link" class="size-3" />
            Ver na FAQ
          </NuxtLink>
        </div>
      </div>
    </template>
  </UPopover>

  <!-- Without details: simple tooltip (existing behaviour) -->
  <UTooltip v-else :text="text" v-model:open="open">
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
const {
  text,
  details,
  legal,
  faqHref,
  iconClass = "",
} = defineProps<{
  text: string;
  details?: string;
  legal?: string;
  faqHref?: string;
  iconClass?: string;
}>();

const open = ref(false);
</script>
