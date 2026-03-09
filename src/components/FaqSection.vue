<script setup lang="ts">
import { FAQ_CATEGORIES } from "~/data/faq";

// Show one highlighted question per category as a preview
const PREVIEW_IDS = [
  "como-e-calculada",
  "comissoes-bancarias",
  "condicoes-isencao",
  "declarar-intencao",
  "adquirido-antes-1989",
];

const previewItems = FAQ_CATEGORIES.flatMap((cat) =>
  cat.items.filter((item) => PREVIEW_IDS.includes(item.id)),
);

const faqAccordionItems = previewItems.map((item) => ({
  value: item.id,
  label: item.question,
  slot: item.id,
  answer: item.answer,
  legal: item.legal,
}));
</script>

<template>
  <section aria-labelledby="faq-heading">
    <!-- Section header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-circle-help" class="size-4 text-muted" />
        <h2 id="faq-heading" class="text-sm font-semibold text-default">Dúvidas frequentes</h2>
      </div>
      <NuxtLink
        to="/faq"
        class="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition-colors"
      >
        Ver todas
        <UIcon name="i-lucide-arrow-right" class="size-3.5" />
      </NuxtLink>
    </div>

    <!-- Accordion -->
    <UCard :ui="{ body: 'p-0' }">
      <UAccordion :items="faqAccordionItems" type="single">
        <template v-for="item in faqAccordionItems" #[item.slot] :key="item.slot">
          <div class="pb-4 space-y-2.5">
            <p class="text-sm text-muted leading-relaxed whitespace-pre-line">
              {{ item.answer }}
            </p>
            <p v-if="item.legal" class="text-xs text-muted/60 font-mono">{{ item.legal }}</p>
            <NuxtLink
              :to="`/faq#${item.value}`"
              class="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition-colors"
            >
              <UIcon name="i-lucide-external-link" class="size-3" />
              Ver na FAQ
            </NuxtLink>
          </div>
        </template>
      </UAccordion>
    </UCard>
  </section>
</template>
