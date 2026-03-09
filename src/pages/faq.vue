<script setup lang="ts">
import { FAQ_CATEGORIES } from "~/data/faq";

useHead({
  title: "FAQ — Calculadora de Mais-Valias Imobiliárias",
  meta: [
    {
      name: "description",
      content:
        "Perguntas frequentes sobre mais-valias imobiliárias: reinvestimento em HPP, despesas dedutíveis, prazos, declaração de IRS e casos especiais.",
    },
  ],
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <UContainer class="max-w-3xl py-10 pb-16">
      <!-- Back link -->
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-default transition-colors mb-8"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        Voltar à calculadora
      </NuxtLink>

      <!-- Header -->
      <div class="space-y-3 mb-10">
        <div
          class="inline-flex items-center justify-center size-12 rounded-xl bg-primary-100 dark:bg-primary-900/40"
        >
          <UIcon
            name="i-lucide-circle-help"
            class="size-6 text-primary-600 dark:text-primary-400"
          />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Perguntas Frequentes</h1>
          <p class="text-sm text-muted mt-1">
            Mais-valias imobiliárias — Art. 10.º CIRS · Habitação Própria e Permanente
          </p>
        </div>
        <p class="text-sm text-muted max-w-xl">
          Respostas às dúvidas mais comuns sobre o cálculo e tributação de mais-valias na venda de
          imóveis em Portugal. Para a sua situação concreta, consulte um contabilista certificado.
        </p>
      </div>

      <!-- Categories -->
      <div class="space-y-10">
        <section v-for="category in FAQ_CATEGORIES" :key="category.id" :id="category.id">
          <!-- Category header -->
          <div class="flex items-center gap-2.5 mb-4">
            <div
              class="flex items-center justify-center size-8 rounded-lg bg-elevated border border-default"
            >
              <UIcon :name="category.icon" class="size-4 text-primary-500" />
            </div>
            <h2 class="text-base font-semibold">{{ category.label }}</h2>
          </div>

          <!-- Questions -->
          <div class="space-y-0 rounded-xl border border-default overflow-hidden">
            <div
              v-for="(item, idx) in category.items"
              :key="item.id"
              :id="item.id"
              :class="idx < category.items.length - 1 ? 'border-b border-default' : ''"
            >
              <details class="group">
                <summary
                  class="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none select-none hover:bg-elevated transition-colors"
                >
                  <span class="text-sm font-medium">{{ item.question }}</span>
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="size-4 text-muted shrink-0 transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <div class="px-5 pb-5 pt-2 space-y-3 border-t border-default">
                  <p class="text-sm text-muted leading-relaxed whitespace-pre-line">
                    {{ item.answer }}
                  </p>
                  <p v-if="item.legal" class="text-xs text-muted/60 font-mono">
                    {{ item.legal }}
                  </p>
                </div>
              </details>
            </div>
          </div>
        </section>
      </div>

      <!-- Disclaimer -->
      <div class="mt-12 flex items-start gap-3 p-4 rounded-xl bg-elevated border border-default">
        <UIcon name="i-lucide-triangle-alert" class="size-4 text-warning-500 shrink-0 mt-0.5" />
        <p class="text-xs text-muted leading-relaxed">
          Esta página tem caráter informativo e não constitui aconselhamento fiscal ou jurídico. As
          regras fiscais podem ser alteradas e a sua aplicação depende das circunstâncias concretas
          de cada caso. Consulte um contabilista certificado (OCC) para a sua situação específica.
        </p>
      </div>

      <!-- Footer nav -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium"
        >
          <UIcon name="i-lucide-calculator" class="size-4" />
          Ir para a calculadora
        </NuxtLink>
      </div>
    </UContainer>
  </div>
</template>
