<template>
  <UPopover mode="hover" :ui="{ content: 'max-w-80' }">
    <!-- Negative margin cancels out the padding so siblings aren't pushed apart,
         while p-2.5 gives a ~44px tap target on mobile -->
    <span class="-m-2.5 inline-flex items-center justify-center p-2.5 cursor-pointer shrink-0">
      <UIcon
        name="i-lucide-info"
        :class="['size-3.5 text-muted hover:text-default transition-colors', iconClass]"
      />
    </span>
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
