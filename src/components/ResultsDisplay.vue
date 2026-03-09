<script setup lang="ts">
import { fmt, fmtPct } from "~/utils/formatters";

const props = withDefaults(
  defineProps<{
    showResults: boolean;
    showReinvestimento?: boolean;
    ganhoRealizacao: number;
    maisValia: number;
    maisValiaTributavel50: number;
    valorAReinvestir: number;
    modoReinvestimento: "total" | "parcial" | "nenhum";
    valorReinvestido: number;
    maisValiaIsenta: number;
    maisValiaTributavelParcial: number;
    irsAdicional?: number | null;
  }>(),
  { showReinvestimento: true },
);

const emit = defineEmits<{ share: [] }>();

const isCopied = ref(false);

function handleShare() {
  emit("share");
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 1500);
}

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

const showIrs = computed(
  () =>
    props.showReinvestimento &&
    props.irsAdicional != null &&
    !isFullExemption.value &&
    props.irsAdicional > 0,
);

// irsAdicional === 0 without full exemption: parcial mode over-investing (ratio clamps to 1)
const showIrsZero = computed(
  () =>
    props.showReinvestimento && props.irsAdicional === 0 && !isFullExemption.value && !isLoss.value,
);
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-calculator" class="text-primary-500" />
          <span class="font-semibold text-base">Resultado do Cálculo</span>
        </div>
        <UButton
          :icon="isCopied ? 'i-lucide-check' : 'i-lucide-share-2'"
          variant="ghost"
          size="xs"
          color="neutral"
          @click="handleShare"
        >
          Partilhar
        </UButton>
      </div>
    </template>

    <!-- Empty state -->
    <div v-if="!showResults" class="py-8 text-center space-y-2">
      <UIcon name="i-lucide-calculator" class="size-8 mx-auto text-muted opacity-40" />
      <p class="text-sm text-muted">Preencha o valor de compra e de venda para ver o resultado.</p>
    </div>

    <template v-else>
      <!-- Menos-valia -->
      <UAlert v-if="isLoss" color="info" icon="i-lucide-trending-down" title="Menos-valia">
        <template #description>
          <span class="flex items-center gap-1.5">
            O valor de venda é inferior ao custo ajustado — não há mais-valia tributável. A
            menos-valia pode ser deduzida a mais-valias de outros imóveis no mesmo ano.
            <InfoTooltip
              text="Art. 55.º CIRS — o saldo negativo pode ser reportado e deduzido a mais-valias dos cinco anos seguintes. Apenas aplicável a residentes."
            />
          </span>
        </template>
      </UAlert>

      <div v-else class="space-y-3">
        <!-- Ganho na realização -->
        <div class="flex items-center justify-between py-2 border-b border-default">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">Ganho na realização</span>
            <InfoTooltip text="VR − VA, antes de ajustes fiscais." />
          </div>
          <UBadge color="neutral" variant="soft" size="lg">{{ fmt(ganhoRealizacao) }}</UBadge>
        </div>

        <!-- MV bruta -->
        <div class="flex items-center justify-between py-2 border-b border-default">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">Mais-valia bruta</span>
            <InfoTooltip
              text="MV = VR − (VA × Coef.) − Encargos valorização − Despesas. Art. 44.º a 51.º CIRS"
            />
          </div>
          <UBadge color="warning" variant="soft" size="lg">{{ fmt(maisValia) }}</UBadge>
        </div>

        <!-- MV tributável 50% -->
        <div class="flex items-center justify-between py-2 border-b border-default">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">Mais-valia tributável (50%)</span>
            <InfoTooltip
              text="Para residentes em Portugal, apenas 50% do saldo é tributado às taxas progressivas do IRS. Art. 43.º, n.º 2, al. b) CIRS"
            />
          </div>
          <UBadge color="error" variant="soft" size="lg">{{ fmt(maisValiaTributavel50) }}</UBadge>
        </div>

        <!-- Reinvestimento (only in phase 2) -->
        <template v-if="showReinvestimento">
          <!-- Percentagem de reinvestimento -->
          <div
            v-if="modoReinvestimento !== 'nenhum' && valorAReinvestir > 0"
            class="flex items-center justify-between py-2 border-b border-default"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted">Reinvestimento aplicado</span>
              <InfoTooltip
                text="Percentagem do valor necessário para isenção total que está a ser reinvestido. Art. 10.º, n.º 5 e n.º 9 CIRS"
              />
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
                  <InfoTooltip
                    text="Art. 10.º, n.º 5 CIRS — exclusão condicionada a: reinvestimento em nova HPP, prazo de 24 meses antes a 36 meses após a venda, domicílio fiscal no imóvel alienado nos 12 meses anteriores à transmissão (DL n.º 57/2024) e declaração de intenção no Anexo G."
                  />
                </span>
              </template>
            </UAlert>
          </div>

          <!-- Reinvestimento parcial rows -->
          <template v-if="modoReinvestimento === 'parcial' && valorReinvestido > 0">
            <div class="flex items-center justify-between py-2 border-b border-default">
              <div class="flex items-center gap-2">
                <span class="text-sm text-muted">Mais-valia isenta</span>
                <InfoTooltip
                  text="MV isenta = MV total × (reinvestido / valor a reinvestir). Art. 10.º, n.º 9 CIRS"
                />
              </div>
              <UBadge color="success" variant="soft" size="lg">{{ fmt(maisValiaIsenta) }}</UBadge>
            </div>
            <div class="flex items-start justify-between gap-3 py-2 border-b border-default">
              <span class="flex-1 text-sm text-muted">
                Mais-valia tributável após reinvestimento
                <span class="inline-flex align-middle ml-0.5"
                  ><InfoTooltip text="(MV total − MV isenta) × 50%. Art. 10.º, n.º 9 CIRS"
                /></span>
              </span>
              <UBadge color="error" variant="soft" size="lg">{{
                fmt(maisValiaTributavelParcial)
              }}</UBadge>
            </div>
          </template>
        </template>

        <!-- IRS zero (parcial mode fully covered — not a formal full exemption) -->
        <div v-if="showIrsZero" class="pt-1">
          <UAlert color="success" icon="i-lucide-check-circle" title="Sem IRS adicional">
            <template #description>
              O reinvestimento declarado cobre a totalidade da mais-valia — sem imposto adicional
              estimado.
            </template>
          </UAlert>
        </div>

        <!-- IRS adicional -->
        <div v-if="showIrs" class="flex items-center justify-between py-2">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold">IRS adicional estimado</span>
            <InfoTooltip
              text="Diferença de imposto com e sem a mais-valia: imposto(rendimentos + MV tributável) − imposto(rendimentos). Art. 68.º CIRS + sobretaxa de solidariedade Art. 68.º-A CIRS"
            />
          </div>
          <UBadge color="error" variant="soft" size="lg" class="font-semibold">{{
            fmt(irsAdicional!)
          }}</UBadge>
        </div>
      </div>
    </template>

    <template v-if="showReinvestimento" #footer>
      <div class="space-y-1.5">
        <p v-if="showIrs" class="text-xs text-muted flex items-center gap-1.5">
          <UIcon name="i-lucide-triangle-alert" class="size-3.5 shrink-0 text-warning-500" />
          Estimativa sem deduções à coleta (saúde, educação, dependentes). Consulte um contabilista
          para o valor exato.
        </p>
      </div>
    </template>
  </UCard>
</template>
