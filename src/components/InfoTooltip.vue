<template>
  <UPopover mode="click" :ui="{ content: 'max-w-80' }">
    <UIcon
      name="i-lucide-info"
      :class="[
        'size-3.5 shrink-0 cursor-pointer text-muted hover:text-default transition-colors',
        iconClass,
      ]"
    />
    <template #content>
      <div class="p-3.5 space-y-2.5">
        <p class="text-sm text-default leading-relaxed">{{ text }}</p>
        <template v-if="details">
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
        </template>
        <p v-else-if="legal" class="text-xs text-muted/60 font-mono border-t border-default pt-2">
          {{ legal }}
        </p>
      </div>
    </template>
  </UPopover>
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
</script>
