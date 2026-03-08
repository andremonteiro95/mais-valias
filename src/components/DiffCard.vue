<script setup lang="ts">
import { fmt } from "~/utils/formatters";

const props = defineProps<{
  pinnedId: number;
  // Current computed values
  maisValia: number;
  maisValiaTributavel50: number;
  valorAReinvestir: number;
  // Pinned snapshot values
  pinnedMaisValia: number;
  pinnedMaisValiaTributavel50: number;
  pinnedValorAReinvestir: number;
  // Layout hint: desktop sidebar needs flex-wrap + justify-end on the value cluster
  wrapValues?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const diffMaisValia = computed(() => props.maisValia - props.pinnedMaisValia);
const diffTributavel = computed(
  () => props.maisValiaTributavel50 - props.pinnedMaisValiaTributavel50,
);
const diffAReinvestir = computed(() => props.valorAReinvestir - props.pinnedValorAReinvestir);

const diffVerdict = computed(() => {
  const d = diffTributavel.value;
  if (Math.abs(d) < 1) return "neutral";
  return d < 0 ? "better" : "worse";
});
</script>

<template>
  <div class="rounded-xl border border-default bg-default p-4 space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold text-muted">
        A comparar com fixado #{{ props.pinnedId }}
      </span>
      <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-x" @click="emit('close')" />
    </div>

    <!-- Rows -->
    <div class="space-y-2">
      <!-- Mais-valia row -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted">Mais-valia</span>
        <div
          class="flex items-center gap-2"
          :class="props.wrapValues ? 'flex-wrap justify-end' : ''"
        >
          <span class="font-medium">{{ fmt(props.maisValia) }}</span>
          <span class="text-xs text-muted">vs {{ fmt(props.pinnedMaisValia) }}</span>
          <span
            class="text-xs font-semibold"
            :class="
              diffMaisValia < 0
                ? 'text-success-500'
                : diffMaisValia > 0
                  ? 'text-error-500'
                  : 'text-muted'
            "
          >
            {{ diffMaisValia > 0 ? "+" : "" }}{{ fmt(diffMaisValia) }}
          </span>
        </div>
      </div>

      <!-- Tributável (50%) row -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted">Tributável (50%)</span>
        <div
          class="flex items-center gap-2"
          :class="props.wrapValues ? 'flex-wrap justify-end' : ''"
        >
          <span class="font-medium">{{ fmt(props.maisValiaTributavel50) }}</span>
          <span class="text-xs text-muted">vs {{ fmt(props.pinnedMaisValiaTributavel50) }}</span>
          <span
            class="text-xs font-semibold"
            :class="
              diffTributavel < 0
                ? 'text-success-500'
                : diffTributavel > 0
                  ? 'text-error-500'
                  : 'text-muted'
            "
          >
            {{ diffTributavel > 0 ? "+" : "" }}{{ fmt(diffTributavel) }}
          </span>
        </div>
      </div>

      <!-- A reinvestir row -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted">A reinvestir</span>
        <div
          class="flex items-center gap-2"
          :class="props.wrapValues ? 'flex-wrap justify-end' : ''"
        >
          <span class="font-medium">{{ fmt(props.valorAReinvestir) }}</span>
          <span class="text-xs text-muted">vs {{ fmt(props.pinnedValorAReinvestir) }}</span>
          <span
            class="text-xs font-semibold"
            :class="
              diffAReinvestir > 0
                ? 'text-success-500'
                : diffAReinvestir < 0
                  ? 'text-error-500'
                  : 'text-muted'
            "
          >
            {{ diffAReinvestir > 0 ? "+" : "" }}{{ fmt(diffAReinvestir) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Verdict alert -->
    <UAlert
      v-if="diffVerdict === 'better'"
      color="success"
      icon="i-lucide-trending-down"
      title="Cenário atual mais favorável"
      description="A tributação atual é menor do que o fixado."
      variant="soft"
    />
    <UAlert
      v-else-if="diffVerdict === 'worse'"
      color="error"
      icon="i-lucide-trending-up"
      title="Cenário fixado era mais favorável"
      description="A tributação atual é maior do que o fixado."
      variant="soft"
    />
  </div>
</template>
