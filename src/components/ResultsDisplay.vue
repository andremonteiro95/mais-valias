<script setup lang="ts">
const props = defineProps<{
  maisValia: number;
  maisValiaTributavel50: number;
  valorAReinvestir: number;
  modoReinvestimento: "total" | "parcial" | "nenhum";
  valorReinvestido: number;
  maisValiaIsenta: number;
  maisValiaTributavelParcial: number;
}>();

const emit = defineEmits<{ share: [] }>();

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);

const fmtPct = (v: number) =>
  new Intl.NumberFormat("pt-PT", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(v);

const isLoss = computed(() => props.maisValia < 0);
const isFullExemption = computed(
  () =>
    props.modoReinvestimento === "total" &&
    props.valorReinvestido >= props.valorAReinvestir &&
    props.valorAReinvestir > 0,
);

const percentagemReinvestimento = computed(() => {
  if (props.valorAReinvestir === 0) return 0;
  return Math.min(props.valorReinvestido / props.valorAReinvestir, 1);
});

const reinvestimentoParcial = computed(() => props.modoReinvestimento === "parcial");
</script>

<template>
  <div class="space-y-4">
    <!-- Negative MV -->
    <UAlert v-if="isLoss" color="info" icon="i-lucide-trending-down" title="Menos-valia">
      <template #description>
        <span class="flex items-center gap-1.5">
          O valor de venda é inferior ao custo ajustado — não há mais-valia tributável. A
          menos-valia pode ser deduzida a mais-valias de outros imóveis no mesmo ano.
          <UTooltip
            text="Art. 55.º CIRS — o saldo negativo pode ser reportado e deduzido a mais-valias dos cinco anos seguintes. Apenas aplicável a residentes."
          >
            <UIcon name="i-lucide-info" class="size-3.5 cursor-help shrink-0" />
          </UTooltip>
        </span>
      </template>
    </UAlert>

    <UCard v-if="!isLoss">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-calculator" class="text-primary-500" />
            <span class="font-semibold text-base">Resultado do Cálculo</span>
          </div>
          <UButton
            icon="i-lucide-share-2"
            variant="ghost"
            size="xs"
            color="neutral"
            @click="emit('share')"
          >
            Partilhar
          </UButton>
        </div>
      </template>

      <div class="space-y-3">
        <!-- Mais-valia bruta -->
        <div class="flex items-center justify-between py-2 border-b border-default">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">Mais-valia bruta</span>
            <UTooltip
              text="MV = VR − (VA × Coef.) − Encargos valorização − Despesas. Art. 44.º a 51.º CIRS"
            >
              <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
            </UTooltip>
          </div>
          <UBadge color="warning" variant="soft" size="lg">{{ fmt(maisValia) }}</UBadge>
        </div>

        <!-- Mais-valia tributável 50% -->
        <div class="flex items-center justify-between py-2 border-b border-default">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">Mais-valia tributável (50%)</span>
            <UTooltip
              text="Para residentes em Portugal, apenas 50% do saldo é tributado às taxas progressivas do IRS. Art. 43.º, n.º 2, al. b) CIRS"
            >
              <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
            </UTooltip>
          </div>
          <UBadge color="error" variant="soft" size="lg">{{ fmt(maisValiaTributavel50) }}</UBadge>
        </div>

        <!-- Percentagem de reinvestimento — only shown in partial mode -->
        <div
          v-if="reinvestimentoParcial"
          class="flex items-center justify-between py-2 border-b border-default"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">Reinvestimento aplicado</span>
            <UTooltip
              text="Percentagem do valor necessário para isenção total que está a ser reinvestido. Art. 10.º, n.º 5 e n.º 9 CIRS"
            >
              <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
            </UTooltip>
          </div>
          <UBadge
            :color="
              percentagemReinvestimento >= 1
                ? 'success'
                : percentagemReinvestimento > 0
                  ? 'warning'
                  : 'neutral'
            "
            variant="soft"
            size="lg"
          >
            {{ fmtPct(percentagemReinvestimento) }}
          </UBadge>
        </div>

        <!-- Isenção total -->
        <div v-if="isFullExemption" class="pt-1">
          <UAlert color="success" icon="i-lucide-shield-check" title="Isenção total">
            <template #description>
              <span class="flex items-center gap-1.5">
                Reinvestindo a totalidade do valor necessário, a mais-valia fica excluída de
                tributação.
                <UTooltip
                  text="Art. 10.º, n.º 5 CIRS — exclusão condicionada a: reinvestimento em nova HPP, prazo de 24 meses antes a 36 meses após a venda, domicílio fiscal no imóvel alienado nos 12 meses anteriores à transmissão (DL n.º 57/2024) e declaração de intenção no Anexo G."
                >
                  <UIcon name="i-lucide-info" class="size-3.5 cursor-help shrink-0" />
                </UTooltip>
              </span>
            </template>
          </UAlert>
        </div>

        <!-- Reinvestimento parcial -->
        <template v-if="reinvestimentoParcial && valorReinvestido > 0">
          <div class="flex items-center justify-between py-2 border-b border-default">
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted">Mais-valia isenta (proporcional)</span>
              <UTooltip
                text="MV isenta = MV total × (reinvestido / valor a reinvestir). Art. 10.º, n.º 9 CIRS"
              >
                <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
              </UTooltip>
            </div>
            <UBadge color="success" variant="soft" size="lg">{{ fmt(maisValiaIsenta) }}</UBadge>
          </div>

          <div class="flex items-center justify-between py-2">
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted"
                >Mais-valia tributável após reinvestimento parcial (50%)</span
              >
              <UTooltip text="(MV total − MV isenta) × 50%. Art. 10.º, n.º 9 CIRS">
                <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
              </UTooltip>
            </div>
            <UBadge color="error" variant="soft" size="lg">{{
              fmt(maisValiaTributavelParcial)
            }}</UBadge>
          </div>
        </template>
      </div>

      <template #footer>
        <p class="text-xs text-muted flex items-center gap-1.5">
          <UIcon name="i-lucide-clock" class="size-3.5 shrink-0" />
          Prazo de reinvestimento: 24 meses antes a 36 meses após a venda.
          <UTooltip text="Art. 10.º, n.º 5, al. b) CIRS">
            <UIcon name="i-lucide-info" class="size-3 cursor-help" />
          </UTooltip>
        </p>
      </template>
    </UCard>
  </div>
</template>
