<script lang="ts">
import { ANOS_VENDA_DISPONIVEIS } from "~/data/coeficientes";

// ── Named constants ────────────────────────────────────────────────────────────
const MIN_ANO_AQUISICAO = 1973;
const SAVE_DEBOUNCE_MS = 800;

// ── Module-scope static arrays ─────────────────────────────────────────────────
const currentYear = new Date().getFullYear();

const yearOptions = Array.from({ length: currentYear - (MIN_ANO_AQUISICAO - 1) }, (_, i) => ({
  label: String(currentYear - i),
  value: currentYear - i,
}));

const monthOptions = [
  { label: "Jan", value: 1 },
  { label: "Fev", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Abr", value: 4 },
  { label: "Mai", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Ago", value: 8 },
  { label: "Set", value: 9 },
  { label: "Out", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dez", value: 12 },
];

const monthLabelMap: Record<number, string> = Object.fromEntries(
  monthOptions.map((o) => [o.value, o.label]),
);
const monthLabel = (m: number) => monthLabelMap[m] ?? String(m);

const anoVendaOptions = ANOS_VENDA_DISPONIVEIS.map((a) => ({ label: String(a), value: a }));

const tipoTributacaoOptions = [
  { label: "Individual", value: "individual" },
  { label: "Conjunta", value: "conjunto" },
];
</script>

<script setup lang="ts">
import { onUnmounted } from "vue";
import { PORTARIA_REF } from "~/data/coeficientes";
import { ULTIMA_ATUALIZACAO } from "~/constants";
import { fmt, fmtCompact } from "~/utils/formatters";
import { useCalculations } from "~/composables/useCalculations";
import { usePinnedSnapshots } from "~/composables/usePinnedSnapshots";
// ── Form state (VeeValidate) ─────────────────────────────────────────────────
const defaultValues = {
  valorAquisicao: null as number | null,
  mesAquisicao: 1,
  anoAquisicao: currentYear,
  valorVenda: null as number | null,
  mesVenda: 1,
  anoVenda: ANOS_VENDA_DISPONIVEIS[0],
  imt: null as number | null,
  impostoSelo: null as number | null,
  emolumentos: null as number | null,
  certidaoRP: null as number | null,
  obras: null as number | null,
  comissaoImobiliaria: null as number | null,
  certEnergetico: null as number | null,
  capitalEmDivida: null as number | null,
  modoReinvestimento: "nenhum" as "total" | "parcial" | "nenhum",
  valorReinvestido: null as number | null,
  rendimentoColetavel: null as number | null,
  tipoTributacao: "individual" as "individual" | "conjunto",
};

const { defineField, values, setValues } = useForm({ initialValues: defaultValues });

// ── Phase state ───────────────────────────────────────────────────────────────
const phase = ref<"form" | "confirmed">("form");
function confirmTransaction() {
  phase.value = "confirmed";
}
function editTransaction() {
  phase.value = "form";
  valorReinvestido.value = null;
}

function resetForm() {
  clear();
  hasSavedData.value = false;
  setValues({ ...defaultValues });
  phase.value = "form";
  vaiReinvestir.value = null;
}

const [valorAquisicao] = defineField("valorAquisicao");
const [mesAquisicao] = defineField("mesAquisicao");
const [anoAquisicao] = defineField("anoAquisicao");
const [valorVenda] = defineField("valorVenda");
const [mesVenda] = defineField("mesVenda");
const [anoVenda] = defineField("anoVenda");
const [imt] = defineField("imt");
const [impostoSelo] = defineField("impostoSelo");
const [emolumentos] = defineField("emolumentos");
const [certidaoRP] = defineField("certidaoRP");
const [obras] = defineField("obras");
const [comissaoImobiliaria] = defineField("comissaoImobiliaria");
const [certEnergetico] = defineField("certEnergetico");
const [capitalEmDivida] = defineField("capitalEmDivida");
const [modoReinvestimento] = defineField("modoReinvestimento");
const [valorReinvestido] = defineField("valorReinvestido");
const [rendimentoColetavel] = defineField("rendimentoColetavel");
const [tipoTributacao] = defineField("tipoTributacao");

// ── Derived calculations ──────────────────────────────────────────────────────
const calcs = useCalculations(values);
const {
  coeficiente,
  coeficienteIndisponivel,
  mesesEntreTransacoes,
  despesasAquisicao,
  despesasAlienacao,
  encargosValorizacao,
  totalDespesas,
  ganhoRealizacao,
  maisValia,
  tributavel,
  maisValiaTributavel50,
  valorAReinvestir,
  reinvestimentoEfetivo,
  maisValiaIsenta,
  maisValiaTributavelParcial,
  isFullExemption,
  percentagemReinvestimento,
  irsAdicional,
  showResults,
  menosValiaRisco,
  accordionItems,
} = calcs;

// ── Reinvestment intent UI state ─────────────────────────────────────────────
const vaiReinvestir = ref<boolean | null>(null);

function syncModoReinvestimento() {
  if (!vaiReinvestir.value) {
    modoReinvestimento.value = "nenhum";
    return;
  }
  const reinvested = valorReinvestido.value ?? 0;
  modoReinvestimento.value = reinvested >= valorAReinvestir.value ? "total" : "parcial";
}

watch(vaiReinvestir, (val) => {
  if (val === true && !valorReinvestido.value) {
    valorReinvestido.value = valorAReinvestir.value;
  }
  syncModoReinvestimento();
});

watch(
  () => valorReinvestido.value,
  () => {
    if (vaiReinvestir.value) syncModoReinvestimento();
  },
);

function onReinvestidoInput(v: number | null) {
  if (v === null) return;
  valorReinvestido.value = Math.min(Math.max(0, v), valorAReinvestir.value);
}

// ── Shareable links ───────────────────────────────────────────────────────────
const route = useRoute();
const { decode, copyToClipboard } = useShareableLink();
const toast = useToast();

// ── Local storage auto-save ───────────────────────────────────────────────────
const { save, load, clear } = useSimulationStorage();
const hasSavedData = ref(false);

onMounted(() => {
  const s = route.query.s as string | undefined;
  if (s) {
    const state = decode(s);
    if (state) {
      setValues(state as Parameters<typeof setValues>[0]);
      phase.value = "confirmed";
      vaiReinvestir.value = state.modoReinvestimento !== "nenhum" ? true : false;
    }
  } else {
    const stored = load();
    if (stored) {
      setValues({ ...defaultValues, ...stored } as Parameters<typeof setValues>[0]);
      hasSavedData.value = true;
    }
  }
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => ({
    valorAquisicao: values.valorAquisicao,
    mesAquisicao: values.mesAquisicao,
    anoAquisicao: values.anoAquisicao,
    valorVenda: values.valorVenda,
    mesVenda: values.mesVenda,
    anoVenda: values.anoVenda,
    imt: values.imt,
    impostoSelo: values.impostoSelo,
    emolumentos: values.emolumentos,
    certidaoRP: values.certidaoRP,
    obras: values.obras,
    comissaoImobiliaria: values.comissaoImobiliaria,
    certEnergetico: values.certEnergetico,
    capitalEmDivida: values.capitalEmDivida,
    modoReinvestimento: values.modoReinvestimento,
    valorReinvestido: values.valorReinvestido,
    rendimentoColetavel: values.rendimentoColetavel,
    tipoTributacao: values.tipoTributacao,
  }),
  () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      save(values);
      hasSavedData.value = true;
    }, SAVE_DEBOUNCE_MS);
  },
  { deep: false },
);

onUnmounted(() => {
  if (saveTimer) clearTimeout(saveTimer);
});

async function handleShare() {
  const success = await copyToClipboard(values);
  if (success) {
    toast.add({ title: "Link copiado!", color: "success" });
  } else {
    toast.add({ title: "Não foi possível copiar o link", color: "error" });
  }
}

// ── Pinned snapshots ──────────────────────────────────────────────────────────
const {
  pinnedSnapshots,
  compareWith,
  activeCompareId,
  showCompareModal,
  currentSnapshotKey,
  pinnedSnapshot,
  hasPinnedBar,
  bestPinnedId,
  pinCurrent,
  removePin,
  removePinned,
  toggleCompare,
  clearPinned,
  restorePin,
  restoreSnapshot,
} = usePinnedSnapshots(values, calcs, setValues, () => {
  phase.value = "confirmed";
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <UContainer class="max-w-5xl py-10" :class="hasPinnedBar ? 'pb-36' : 'pb-6'">
      <!-- Header -->
      <div class="relative text-center space-y-3 pb-6">
        <div
          class="inline-flex items-center justify-center size-14 rounded-2xl bg-primary-100 dark:bg-primary-900/40 mb-1"
        >
          <UIcon name="i-lucide-house" class="size-7 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Calculadora de Mais-Valias Imobiliárias</h1>
          <p class="text-sm text-muted mt-1">
            Habitação própria e permanente com reinvestimento — Art. 10.º CIRS
          </p>
        </div>
        <UButton
          v-if="phase === 'confirmed'"
          icon="i-lucide-rotate-ccw"
          variant="ghost"
          size="xs"
          color="neutral"
          class="absolute right-0 top-0"
          @click="resetForm"
        >
          Recomeçar
        </UButton>
      </div>

      <!-- Two-column grid: form left, results right -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        <!-- LEFT: form sections -->
        <div class="space-y-5">
          <!-- ─── PHASE 1: Dados da Transação ─── -->
          <Transition name="phase">
            <div v-if="phase === 'form'" key="form" class="space-y-5">
              <p class="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                Passo 1 de 2
              </p>
              <!-- Section 1: Valores da transação -->
              <UCard>
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-euro" class="text-primary-500 size-4 shrink-0" />
                    <span class="font-semibold">Valores da Transação</span>
                  </div>
                </template>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Valor de compra -->
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium flex items-center gap-1.5">
                      Valor de compra
                      <InfoTooltip
                        text="Preço pelo qual o imóvel foi comprado, conforme escritura pública de compra e venda. Não inclui IMT, Imposto de Selo nem outros custos — esses entram nas despesas dedutíveis. Art. 46.º CIRS"
                      />
                    </label>
                    <CurrencyInput
                      v-model="valorAquisicao"
                      placeholder="150 000,00"
                      class="w-full"
                    />
                  </div>

                  <!-- Data de aquisição -->
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium flex items-center gap-1.5">
                      Data de aquisição
                      <InfoTooltip
                        text="Mês e ano da escritura de compra. Usados para calcular os meses exatos até à venda e determinar se o coeficiente de desvalorização se aplica (≥ 24 meses). Art. 46.º e 50.º CIRS"
                      />
                    </label>
                    <div class="flex gap-2">
                      <USelect
                        v-model="mesAquisicao"
                        :items="monthOptions"
                        value-key="value"
                        label-key="label"
                        class="w-24 shrink-0"
                      />
                      <USelect
                        v-model="anoAquisicao"
                        :items="yearOptions"
                        value-key="value"
                        label-key="label"
                        class="flex-1"
                      />
                    </div>
                  </div>

                  <!-- Valor de venda -->
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium flex items-center gap-1.5">
                      Valor de venda
                      <InfoTooltip
                        text="Valor de realização constante na escritura de venda. Art. 44.º CIRS"
                      />
                    </label>
                    <CurrencyInput v-model="valorVenda" placeholder="200 000,00" class="w-full" />
                    <p
                      v-if="menosValiaRisco"
                      class="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"
                    >
                      <UIcon name="i-lucide-triangle-alert" class="size-3.5 shrink-0" />
                      O valor de venda é inferior ao custo ajustado — o resultado será uma
                      menos-valia.
                    </p>
                  </div>

                  <!-- Data de venda -->
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium flex items-center gap-1.5">
                      Data de venda
                      <InfoTooltip
                        text="Mês e ano da escritura de venda. O ano define qual a Portaria de coeficientes aplicável. Art. 44.º e 50.º CIRS — Portaria n.º 382/2025/1"
                      />
                    </label>
                    <div class="flex gap-2">
                      <USelect
                        v-model="mesVenda"
                        :items="monthOptions"
                        value-key="value"
                        label-key="label"
                        class="w-24 shrink-0"
                      />
                      <USelect
                        v-model="anoVenda"
                        :items="anoVendaOptions"
                        value-key="value"
                        label-key="label"
                        class="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <!-- Coeficiente -->
                <div
                  v-if="mesesEntreTransacoes >= 24"
                  class="mt-4 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-elevated border border-default"
                >
                  <div class="flex items-center gap-1.5 min-w-0">
                    <UIcon name="i-lucide-trending-up" class="size-3.5 text-muted shrink-0" />
                    <div class="min-w-0">
                      <span class="text-sm text-muted">Coeficiente de desvalorização</span>
                      <p
                        v-if="(values.valorAquisicao ?? 0) > 0"
                        class="text-xs text-muted/70 mt-0.5"
                      >
                        {{ fmt(values.valorAquisicao ?? 0) }} × {{ coeficiente.toFixed(2) }} =
                        {{ fmt((values.valorAquisicao ?? 0) * coeficiente) }}
                      </p>
                    </div>
                    <InfoTooltip
                      :text="`Aplicável quando ≥ 24 meses entre aquisição e venda. Art. 50.º CIRS — ${PORTARIA_REF}`"
                      details="Fator que corrige a inflação, multiplicado pelo valor de aquisição para calcular o custo fiscal atualizado. É publicado anualmente por Portaria do Governo.\n\nSe a Portaria do ano de venda ainda não foi publicada (tipicamente até outubro/novembro), usa-se o coeficiente do ano anterior como estimativa conservadora."
                      legal="Art. 50.º CIRS"
                      faq-href="/faq#coeficiente"
                    />
                  </div>
                  <UBadge
                    :color="coeficienteIndisponivel ? 'warning' : 'primary'"
                    variant="soft"
                    class="shrink-0"
                  >
                    {{ coeficiente.toFixed(2) }}
                    <span v-if="coeficienteIndisponivel" class="ml-1 opacity-70">estimado</span>
                  </UBadge>
                </div>
                <p v-else-if="mesesEntreTransacoes > 0" class="text-sm text-muted italic">
                  Coeficiente de desvalorização não aplicável (período inferior a 24 meses — Art.
                  50.º CIRS).
                </p>

                <UAlert
                  v-if="coeficienteIndisponivel"
                  color="warning"
                  icon="i-lucide-triangle-alert"
                  variant="soft"
                  class="mt-3"
                  :title="`Coeficientes de ${values.anoVenda} ainda não publicados`"
                  :description="`A Portaria de ${values.anoVenda} é tipicamente publicada em outubro/novembro. Até lá, é usada uma estimativa baseada nos coeficientes de ${values.anoVenda - 1} — o valor real poderá ser ligeiramente mais favorável.`"
                />
              </UCard>

              <!-- Section 2: Despesas e Encargos -->
              <UCard>
                <template #header>
                  <div class="flex items-center gap-2 flex-wrap">
                    <UIcon name="i-lucide-receipt" class="text-primary-500 size-4 shrink-0" />
                    <span class="font-semibold">Despesas e Encargos</span>
                    <UBadge color="neutral" variant="soft" size="xs">opcional</UBadge>
                    <InfoTooltip
                      text="Art. 51.º CIRS — apenas despesas inerentes à aquisição e alienação, e encargos de valorização nos últimos 12 anos"
                    />
                    <span class="text-xs text-muted font-normal"
                      >— cada euro dedutível reduz a mais-valia</span
                    >
                  </div>
                </template>

                <UAccordion :items="accordionItems" type="multiple" :default-value="[]">
                  <template #aquisicao>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                      <div class="space-y-1.5">
                        <label class="text-sm font-medium flex items-center gap-1.5">
                          IMT
                          <InfoTooltip
                            text="Imposto Municipal sobre Transmissões — obrigatório na aquisição. Dedutível. Art. 51.º, n.º 1, al. a) CIRS"
                          />
                        </label>
                        <CurrencyInput
                          v-model="imt"
                          placeholder="2 500,00"
                          :step="0.01"
                          class="w-full"
                        />
                      </div>

                      <div class="space-y-1.5">
                        <label class="text-sm font-medium flex items-center gap-1.5">
                          Imposto de Selo
                          <InfoTooltip
                            text="Imposto de Selo da aquisição — obrigatório. Dedutível. Art. 51.º, n.º 1, al. a) CIRS"
                          />
                        </label>
                        <CurrencyInput
                          v-model="impostoSelo"
                          placeholder="1 200,00"
                          :step="0.01"
                          class="w-full"
                        />
                      </div>

                      <div class="space-y-1.5">
                        <label class="text-sm font-medium flex items-center gap-1.5">
                          Emolumentos escritura
                          <InfoTooltip
                            text="Emolumentos da escritura de compra e venda. Dedutível. Art. 51.º CIRS"
                          />
                        </label>
                        <CurrencyInput
                          v-model="emolumentos"
                          placeholder="400,00"
                          :step="0.01"
                          class="w-full"
                        />
                      </div>

                      <div class="space-y-1.5">
                        <label class="text-sm font-medium flex items-center gap-1.5">
                          Certidão Registo Predial
                          <InfoTooltip
                            text="Custo necessário à aquisição. Dedutível. Art. 51.º CIRS"
                          />
                        </label>
                        <CurrencyInput
                          v-model="certidaoRP"
                          placeholder="20,00"
                          :step="0.01"
                          class="w-full"
                        />
                      </div>
                    </div>

                    <UAlert
                      color="neutral"
                      icon="i-lucide-alert-circle"
                      variant="soft"
                      class="mt-2 mb-4"
                      title="Comissões bancárias NÃO dedutíveis"
                      description="Custos do crédito (dossier, formalização, avaliação, hipoteca) não são dedutíveis — a AT distingue custos da aquisição do imóvel dos custos do financiamento."
                    />
                  </template>

                  <template #obras>
                    <div class="space-y-3 pb-2">
                      <div class="space-y-1.5">
                        <label class="text-sm font-medium flex items-center gap-1.5">
                          Encargos com valorização (obras)
                          <InfoTooltip
                            text="Obras realizadas nos últimos 12 anos que valorizem o imóvel, comprovadas por fatura com NIF e pagamento por MB/TRF. Art. 51.º CIRS — CAAD Proc. 634/2023"
                            details="A partir de 2025, a AT exige: fatura com NIF do proprietário + pagamento por transferência bancária, MB ou cartão. Pagamentos em numerário não são aceites.\n\nApenas obras que valorizem o imóvel são elegíveis — manutenção simples não conta."
                            legal="Art. 51.º CIRS — CAAD Proc. 634/2023"
                            faq-href="/faq#requisitos-obras"
                          />
                        </label>
                        <CurrencyInput
                          v-model="obras"
                          placeholder="5 000,00"
                          :step="0.01"
                          class="w-full"
                        />
                      </div>
                      <p class="text-xs text-muted">
                        A partir de 2025, a AT exige fatura com NIF e pagamento por transferência
                        bancária ou cartão.
                      </p>
                    </div>
                  </template>

                  <template #alienacao>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                      <div class="space-y-1.5">
                        <label class="text-sm font-medium flex items-center gap-1.5">
                          Comissão imobiliária
                          <InfoTooltip
                            text="Dedutível se comprovada por fatura. Inclui IVA. Art. 51.º CIRS"
                          />
                        </label>
                        <CurrencyInput
                          v-model="comissaoImobiliaria"
                          placeholder="10 000,00"
                          :step="0.01"
                          class="w-full"
                        />
                      </div>

                      <div class="space-y-1.5">
                        <label class="text-sm font-medium flex items-center gap-1.5">
                          Certificado energético
                          <InfoTooltip text="Obrigatório para a venda. Dedutível. Art. 51.º CIRS" />
                        </label>
                        <CurrencyInput
                          v-model="certEnergetico"
                          placeholder="0,00"
                          :step="0.01"
                          class="w-full"
                        />
                      </div>
                    </div>
                  </template>
                </UAccordion>

                <!-- Totais despesas -->
                <div v-if="totalDespesas > 0" class="mt-4 pt-3 border-t border-default space-y-1.5">
                  <div class="flex justify-between text-xs text-muted">
                    <span>Total despesas aquisição</span>
                    <span>{{ fmt(despesasAquisicao) }}</span>
                  </div>
                  <div class="flex justify-between text-xs text-muted">
                    <span>Encargos valorização</span>
                    <span>{{ fmt(encargosValorizacao) }}</span>
                  </div>
                  <div class="flex justify-between text-xs text-muted">
                    <span>Total despesas alienação</span>
                    <span>{{ fmt(despesasAlienacao) }}</span>
                  </div>
                  <div
                    class="flex justify-between text-sm font-semibold pt-1.5 border-t border-default"
                  >
                    <span class="flex items-center gap-1.5">
                      Total dedutível
                      <InfoTooltip
                        text="Soma das despesas inerentes à aquisição + encargos de valorização + despesas inerentes à alienação. Este valor é deduzido ao valor de realização no cálculo da mais-valia. Art. 51.º CIRS"
                      />
                    </span>
                    <span>{{ fmt(totalDespesas) }}</span>
                  </div>
                </div>
              </UCard>

              <!-- Capital em Dívida (Phase 1) -->
              <UCard>
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-landmark" class="text-primary-500 size-4 shrink-0" />
                    <span class="font-semibold">Crédito Habitação</span>
                    <UBadge color="neutral" variant="soft" size="xs">opcional</UBadge>
                  </div>
                </template>

                <div class="space-y-3">
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium flex items-center gap-1.5">
                      Capital em dívida
                      <InfoTooltip
                        text="Valor do empréstimo a amortizar com o produto da venda. Art. 10.º, n.º 5, al. a) CIRS"
                        details="A isenção por reinvestimento aplica-se apenas ao capital próprio — o valor de venda menos o crédito em dívida. A parte financiada pelo banco é usada para liquidar o empréstimo existente e não fica disponível para reinvestir.\n\nSe não tem crédito habitação, deixe em branco: o valor a reinvestir será o total da venda."
                        legal="Art. 10.º, n.º 5, al. a) CIRS"
                        faq-href="/faq#capital-em-divida"
                      />
                    </label>
                    <CurrencyInput
                      v-model="capitalEmDivida"
                      placeholder="80 000,00"
                      :step="0.01"
                      class="w-full"
                    />
                  </div>
                </div>
              </UCard>

              <!-- Confirm button -->
              <UButton
                icon="i-lucide-check"
                trailing-icon="i-lucide-arrow-right"
                color="primary"
                size="lg"
                class="w-full justify-center"
                @click="confirmTransaction"
              >
                Confirmar dados da transação
              </UButton>
            </div>
          </Transition>
          <!-- /PHASE 1 -->

          <!-- ─── PHASE 2: Resumo + Simulação ─── -->
          <Transition name="phase">
            <div v-if="phase === 'confirmed'" key="confirmed" class="space-y-5">
              <p class="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                Passo 2 de 2
              </p>
              <!-- Summary card -->
              <UCard>
                <template #header>
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-file-check" class="text-primary-500 size-4 shrink-0" />
                      <span class="font-semibold">Dados da transação</span>
                    </div>
                    <UButton
                      icon="i-lucide-pencil"
                      variant="ghost"
                      size="xs"
                      color="neutral"
                      @click="editTransaction"
                    >
                      Editar
                    </UButton>
                  </div>
                </template>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div class="space-y-0.5">
                    <p class="text-xs text-muted uppercase tracking-wide">Valor de compra</p>
                    <p class="text-sm font-semibold">{{ fmt(values.valorAquisicao ?? 0) }}</p>
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs text-muted uppercase tracking-wide">Valor de venda</p>
                    <p class="text-sm font-semibold">{{ fmt(values.valorVenda ?? 0) }}</p>
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs text-muted uppercase tracking-wide">Data aquisição</p>
                    <p class="text-sm font-semibold">
                      {{ monthLabel(values.mesAquisicao) }} {{ values.anoAquisicao }}
                    </p>
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs text-muted uppercase tracking-wide">Data venda</p>
                    <p class="text-sm font-semibold">
                      {{ monthLabel(values.mesVenda) }} {{ values.anoVenda }}
                    </p>
                  </div>
                  <div v-if="mesesEntreTransacoes >= 24" class="space-y-0.5">
                    <p class="text-xs text-muted uppercase tracking-wide">Coeficiente</p>
                    <p class="text-sm font-semibold">
                      {{ coeficiente.toFixed(2) }}
                      <span
                        v-if="coeficienteIndisponivel"
                        class="text-xs text-warning-500 font-normal ml-1"
                        >estimado</span
                      >
                    </p>
                  </div>
                  <div v-if="totalDespesas > 0" class="space-y-0.5">
                    <p class="text-xs text-muted uppercase tracking-wide">Total despesas</p>
                    <p class="text-sm font-semibold">{{ fmt(totalDespesas) }}</p>
                  </div>
                  <div v-if="(values.capitalEmDivida ?? 0) > 0" class="space-y-0.5">
                    <p class="text-xs text-muted uppercase tracking-wide">Capital em dívida</p>
                    <p class="text-sm font-semibold">{{ fmt(values.capitalEmDivida ?? 0) }}</p>
                  </div>
                </div>
              </UCard>

              <!-- Simulation card -->
              <UCard>
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-sliders-horizontal"
                      class="text-primary-500 size-4 shrink-0"
                    />
                    <span class="font-semibold">Reinvestimento em HPP</span>
                  </div>
                </template>

                <div class="space-y-5">
                  <!-- Question: vai reinvestir? -->
                  <div class="space-y-2">
                    <label class="text-sm font-medium flex items-center gap-1.5">
                      Pretende reinvestir em habitação própria e permanente?
                      <InfoTooltip
                        text="Deve declarar a intenção de reinvestir no Quadro 5-A do Anexo G da declaração de IRS do ano da venda — mesmo que o reinvestimento ainda não esteja concluído. Art. 10.º, n.º 5 e n.º 9 CIRS — Portaria n.º 39-B/2024"
                        details="Para beneficiar da isenção, tem de verificar TODAS as condições: imóvel vendido é HPP, reinvestimento entre 24 meses antes e 36 meses após a venda, domicílio fiscal no imóvel nos 12 meses anteriores (DL n.º 57/2024), e declaração de intenção obrigatória no Quadro 5-A do Anexo G."
                        legal="Art. 10.º, n.º 5 e n.º 6 CIRS"
                        faq-href="/faq#condicoes-isencao"
                      />
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        class="flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer"
                        :class="
                          vaiReinvestir === true
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                            : 'border-default hover:bg-elevated text-default'
                        "
                        :aria-pressed="vaiReinvestir === true"
                        @click="vaiReinvestir = true"
                      >
                        <UIcon
                          :name="
                            vaiReinvestir === true ? 'i-lucide-circle-check' : 'i-lucide-circle'
                          "
                          class="size-4 shrink-0"
                          :class="vaiReinvestir === true ? 'text-primary-500' : 'text-muted'"
                        />
                        Sim, vou reinvestir
                      </button>
                      <button
                        type="button"
                        class="flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer"
                        :class="
                          vaiReinvestir === false
                            ? 'border-neutral-400 bg-neutral-50 dark:bg-neutral-900/40 text-neutral-700 dark:text-neutral-300'
                            : 'border-default hover:bg-elevated text-default'
                        "
                        :aria-pressed="vaiReinvestir === false"
                        @click="vaiReinvestir = false"
                      >
                        <UIcon
                          :name="
                            vaiReinvestir === false ? 'i-lucide-circle-minus' : 'i-lucide-circle'
                          "
                          class="size-4 shrink-0"
                          :class="vaiReinvestir === false ? 'text-neutral-500' : 'text-muted'"
                        />
                        Não
                      </button>
                    </div>
                  </div>

                  <!-- Slider + input (only when "Sim") -->
                  <Transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="vaiReinvestir === true" class="space-y-4">
                      <div class="space-y-1.5">
                        <label class="text-sm font-medium flex items-center gap-1.5">
                          Valor que pretende reinvestir
                          <InfoTooltip
                            text="Exclusão proporcional: MV isenta = MV × (reinvestido / valor a reinvestir). Art. 10.º, n.º 9 CIRS"
                          />
                        </label>
                        <CurrencyInput
                          :model-value="valorReinvestido"
                          placeholder="50 000,00"
                          :max="valorAReinvestir"
                          :step="500"
                          class="w-full"
                          @update:model-value="onReinvestidoInput"
                        />
                        <div
                          v-if="valorAReinvestir > 0"
                          class="flex items-center gap-1 text-xs text-muted"
                        >
                          <span
                            >Máximo para isenção total:
                            <strong>{{ fmt(valorAReinvestir) }}</strong></span
                          >
                          <InfoTooltip
                            text="VR − capital em dívida. Apenas capitais próprios contam; a parte financiada por novo crédito não conta. Art. 10.º, n.º 5, al. a) CIRS"
                            details="Se reinvestir este valor ou mais, a mais-valia fica totalmente excluída de tributação. Se reinvestir menos, a isenção é proporcional (reinvestimento parcial).\n\nReinvestir abaixo deste valor não impede a isenção — apenas a reduz proporcionalmente."
                            faq-href="/faq#reinvestimento-parcial"
                          />
                        </div>
                      </div>
                      <!-- Slider -->
                      <div class="space-y-2">
                        <USlider
                          v-model="valorReinvestido"
                          :min="0"
                          :max="valorAReinvestir"
                          :step="500"
                          :color="
                            (values.valorReinvestido ?? 0) >= valorAReinvestir
                              ? 'success'
                              : 'primary'
                          "
                        />
                        <div class="flex justify-between text-xs text-muted">
                          <span>{{ fmt(0) }}</span>
                          <span>{{ fmt(valorAReinvestir) }}</span>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </UCard>

              <!-- IRS card -->
              <UCard>
                <template #header>
                  <div class="flex items-center gap-2 flex-wrap">
                    <UIcon name="i-lucide-percent" class="text-primary-500 size-4 shrink-0" />
                    <span class="font-semibold">Estimativa de IRS</span>
                    <UBadge color="neutral" variant="soft" size="xs">opcional</UBadge>
                    <InfoTooltip
                      text="Englobamento obrigatório desde 2023 (Lei 24-D/2022) — a mais-valia soma-se aos restantes rendimentos e é tributada pelas taxas progressivas. Art. 68.º CIRS"
                    />
                  </div>
                </template>

                <div class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium flex items-center gap-1.5">
                      Rendimento coletável (excl. mais-valia)
                      <InfoTooltip
                        text="Rendimento coletável de todas as outras categorias (trabalho, pensões, etc.) após deduções específicas. Não inclua a mais-valia — é calculada automaticamente."
                      />
                    </label>
                    <CurrencyInput
                      v-model="rendimentoColetavel"
                      placeholder="30 000,00"
                      class="w-full"
                    />
                  </div>

                  <div class="space-y-2">
                    <label class="text-sm font-medium flex items-center gap-1.5">
                      Tipo de tributação
                      <InfoTooltip
                        text="Tributação conjunta aplica o quociente familiar de 2 antes de entrar na tabela (Art. 69.º CIRS) — pode resultar numa taxa marginal mais baixa."
                      />
                    </label>
                    <URadioGroup
                      v-model="tipoTributacao"
                      :items="tipoTributacaoOptions"
                      orientation="horizontal"
                      variant="card"
                      color="primary"
                      class="w-full"
                      :ui="{ list: 'w-full', item: 'flex-1' }"
                    />
                  </div>
                </div>
              </UCard>

              <!-- Mobile results (below simulation, hidden on desktop) -->
              <div class="lg:hidden space-y-3">
                <!-- Diff card — mobile -->
                <DiffCard
                  v-if="pinnedSnapshot && activeCompareId !== null"
                  :pinned-id="activeCompareId!"
                  :mais-valia="maisValia"
                  :mais-valia-tributavel50="maisValiaTributavel50"
                  :valor-a-reinvestir="valorAReinvestir"
                  :pinned-mais-valia="pinnedSnapshot!.maisValia"
                  :pinned-mais-valia-tributavel50="pinnedSnapshot!.maisValiaTributavel50"
                  :pinned-valor-a-reinvestir="pinnedSnapshot!.valorAReinvestir"
                  @close="activeCompareId = null"
                />

                <ResultsDisplay
                  :show-results="showResults"
                  :show-reinvestimento="phase === 'confirmed'"
                  :ganho-realizacao="ganhoRealizacao"
                  :mais-valia="maisValia"
                  :mais-valia-tributavel50="maisValiaTributavel50"
                  :valor-a-reinvestir="valorAReinvestir"
                  :modo-reinvestimento="values.modoReinvestimento"
                  :valor-reinvestido="reinvestimentoEfetivo"
                  :mais-valia-isenta="maisValiaIsenta"
                  :mais-valia-tributavel-parcial="maisValiaTributavelParcial"
                  :irs-adicional="irsAdicional"
                  @share="handleShare"
                />

                <!-- Pin button — mobile -->
                <UButton
                  v-if="showResults && maisValia > 0"
                  icon="i-lucide-pin"
                  color="primary"
                  variant="soft"
                  class="w-full justify-center"
                  @click="pinCurrent"
                >
                  Guardar simulação
                </UButton>
              </div>
            </div>
          </Transition>
          <!-- /PHASE 2 -->
        </div>
        <!-- /LEFT -->

        <!-- RIGHT: sticky results sidebar (desktop only) -->
        <div class="hidden lg:flex lg:flex-col lg:gap-3 lg:sticky lg:top-6">
          <!-- Diff card — desktop -->
          <DiffCard
            v-if="pinnedSnapshot && activeCompareId !== null"
            :pinned-id="activeCompareId!"
            :mais-valia="maisValia"
            :mais-valia-tributavel50="maisValiaTributavel50"
            :valor-a-reinvestir="valorAReinvestir"
            :pinned-mais-valia="pinnedSnapshot!.maisValia"
            :pinned-mais-valia-tributavel50="pinnedSnapshot!.maisValiaTributavel50"
            :pinned-valor-a-reinvestir="pinnedSnapshot!.valorAReinvestir"
            :wrap-values="true"
            @close="activeCompareId = null"
          />

          <ResultsDisplay
            :show-results="showResults"
            :show-reinvestimento="phase === 'confirmed'"
            :ganho-realizacao="ganhoRealizacao"
            :mais-valia="maisValia"
            :mais-valia-tributavel50="maisValiaTributavel50"
            :valor-a-reinvestir="valorAReinvestir"
            :modo-reinvestimento="values.modoReinvestimento"
            :valor-reinvestido="reinvestimentoEfetivo"
            :mais-valia-isenta="maisValiaIsenta"
            :mais-valia-tributavel-parcial="maisValiaTributavelParcial"
            :irs-adicional="irsAdicional"
            @share="handleShare"
          />

          <!-- Pin button — desktop -->
          <UButton
            v-if="phase === 'confirmed' && showResults && maisValia > 0"
            icon="i-lucide-pin"
            color="primary"
            variant="soft"
            class="w-full justify-center"
            @click="pinCurrent"
          >
            Guardar simulação
          </UButton>
        </div>
      </div>
      <!-- /grid -->

      <!-- FAQ section -->
      <FaqSection class="mt-10" />

      <!-- Footer -->
      <div class="text-center space-y-1 mt-6 pb-2">
        <p class="text-xs text-gray-500 dark:text-gray-500 px-4">
          Calculadora de caráter informativo. Não substitui aconselhamento fiscal profissional.
          Consulte um contabilista certificado para a sua situação concreta.
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-600">
          Última atualização: {{ ULTIMA_ATUALIZACAO }}
        </p>
        <p
          class="text-xs text-gray-400 dark:text-gray-600 flex items-center justify-center gap-1.5"
        >
          Feito por
          <a
            href="https://andremonteiro.pt"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
            >André Monteiro</a
          >
          &middot;
          <a
            href="https://github.com/andremonteiro95/mais-valias"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            <UIcon name="i-simple-icons-github" class="size-3.5" />
            Open source
          </a>
        </p>
      </div>
    </UContainer>

    <!-- Pinned snapshots bar (fixed bottom) -->
    <Transition name="slide-up">
      <div
        v-if="hasPinnedBar"
        class="fixed bottom-0 left-0 right-0 z-50 border-t border-default bg-default/95 backdrop-blur-sm"
      >
        <div class="max-w-5xl mx-auto px-4 py-3 flex items-end gap-3 overflow-x-auto">
          <!-- Cards -->
          <div
            v-for="p in pinnedSnapshots"
            :key="p.id"
            class="shrink-0 w-32 rounded-lg border text-xs transition-colors overflow-hidden"
            :class="
              activeCompareId === p.id
                ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20'
                : 'border-default bg-elevated'
            "
          >
            <!-- Card header: id + action buttons -->
            <div class="flex items-center justify-between px-2 pt-1.5 pb-1">
              <span class="font-mono text-muted font-medium">#{{ p.id }}</span>
              <div class="flex items-center gap-0.5">
                <button
                  v-if="p.snapshotKey !== currentSnapshotKey"
                  class="p-0.5 rounded hover:bg-default transition-colors"
                  :title="
                    activeCompareId === p.id ? 'Sair da comparação' : 'Comparar com estado atual'
                  "
                  @click="toggleCompare(p.id)"
                >
                  <UIcon
                    name="i-lucide-arrow-left-right"
                    class="size-3"
                    :class="activeCompareId === p.id ? 'text-primary-500' : 'text-muted'"
                  />
                </button>
                <button
                  class="p-0.5 rounded hover:bg-default transition-colors"
                  title="Remover simulação"
                  @click="removePinned(p.id)"
                >
                  <UIcon name="i-lucide-x" class="size-3 text-muted" />
                </button>
              </div>
            </div>
            <!-- Card body: 3 rows, click to restore -->
            <button
              class="w-full px-2 pb-2 text-left space-y-1 hover:brightness-95 transition-all"
              title="Restaurar valores desta simulação"
              @click="restoreSnapshot(p)"
            >
              <div class="flex items-center justify-between gap-1">
                <span class="text-muted/60 uppercase tracking-wide text-[10px]">VV</span>
                <span class="font-medium tabular-nums">{{ fmtCompact(p.valorVenda ?? 0) }}</span>
              </div>
              <div class="flex items-center justify-between gap-1">
                <span class="text-muted/60 uppercase tracking-wide text-[10px]">MV</span>
                <span class="text-warning-600 dark:text-warning-400 tabular-nums">{{
                  fmtCompact(p.maisValia)
                }}</span>
              </div>
              <div class="flex items-center justify-between gap-1">
                <span class="text-muted/60 uppercase tracking-wide text-[10px]">Trib</span>
                <span class="text-error-600 dark:text-error-400 font-semibold tabular-nums">{{
                  fmtCompact(p.maisValiaTributavel50)
                }}</span>
              </div>
            </button>
          </div>

          <!-- Global actions -->
          <div class="flex flex-col items-start gap-1.5 shrink-0 ml-auto self-center">
            <UButton size="xs" variant="ghost" color="neutral" @click="clearPinned">
              Limpar
            </UButton>
            <UButton
              v-if="pinnedSnapshots.length >= 2"
              size="xs"
              variant="soft"
              color="primary"
              trailing-icon="i-lucide-arrow-right"
              @click="showCompareModal = true"
            >
              Comparar
            </UButton>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Compare modal -->
    <UModal v-model:open="showCompareModal" title="Comparação de Simulações" size="xl">
      <template #body>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th class="text-left py-2 pr-4 text-muted font-medium">Métrica</th>
                <th
                  v-for="p in pinnedSnapshots"
                  :key="p.id"
                  class="text-right py-2 px-3 font-medium min-w-32"
                  :class="bestPinnedId === p.id ? 'text-success-600 dark:text-success-400' : ''"
                >
                  <div class="flex items-center justify-end gap-1.5">
                    <UBadge
                      v-if="bestPinnedId === p.id"
                      color="success"
                      variant="soft"
                      size="xs"
                      icon="i-lucide-trophy"
                    >
                      Melhor
                    </UBadge>
                    <span>Fixado #{{ p.id }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr>
                <td class="py-2.5 pr-4 text-muted">Valor de venda</td>
                <td
                  v-for="p in pinnedSnapshots"
                  :key="p.id"
                  class="py-2.5 px-3 text-right font-medium"
                  :class="
                    bestPinnedId === p.id ? 'bg-success-50/50 dark:bg-success-900/10 rounded' : ''
                  "
                >
                  {{ fmt(p.valorVenda ?? 0) }}
                </td>
              </tr>
              <tr>
                <td class="py-2.5 pr-4 text-muted">Coeficiente</td>
                <td
                  v-for="p in pinnedSnapshots"
                  :key="p.id"
                  class="py-2.5 px-3 text-right"
                  :class="bestPinnedId === p.id ? 'bg-success-50/50 dark:bg-success-900/10' : ''"
                >
                  {{ p.coef.toFixed(2) }}
                </td>
              </tr>
              <tr>
                <td class="py-2.5 pr-4 text-muted">Mais-valia bruta</td>
                <td
                  v-for="p in pinnedSnapshots"
                  :key="p.id"
                  class="py-2.5 px-3 text-right text-warning-700 dark:text-warning-400 font-medium"
                  :class="bestPinnedId === p.id ? 'bg-success-50/50 dark:bg-success-900/10' : ''"
                >
                  {{ fmt(p.maisValia) }}
                </td>
              </tr>
              <tr>
                <td class="py-2.5 pr-4 text-muted">Tributável (50%)</td>
                <td
                  v-for="p in pinnedSnapshots"
                  :key="p.id"
                  class="py-2.5 px-3 text-right font-semibold"
                  :class="[
                    bestPinnedId === p.id
                      ? 'bg-success-50/50 dark:bg-success-900/10 text-success-700 dark:text-success-400'
                      : 'text-error-700 dark:text-error-400',
                  ]"
                >
                  {{ fmt(p.maisValiaTributavel50) }}
                </td>
              </tr>
              <tr>
                <td class="py-2.5 pr-4 text-muted">Valor a reinvestir</td>
                <td
                  v-for="p in pinnedSnapshots"
                  :key="p.id"
                  class="py-2.5 px-3 text-right"
                  :class="bestPinnedId === p.id ? 'bg-success-50/50 dark:bg-success-900/10' : ''"
                >
                  {{ fmt(p.valorAReinvestir) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.phase-enter-active,
.phase-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.phase-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.phase-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.phase-leave-active {
  position: absolute;
  width: 100%;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
