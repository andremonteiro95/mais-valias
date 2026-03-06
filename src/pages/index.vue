<script setup lang="ts">
import {
  getCoeficiente,
  hasCoeficientes,
  ANOS_VENDA_DISPONIVEIS,
  PORTARIA_REF,
  ULTIMA_ATUALIZACAO,
} from "~/data/coeficientes";

// ── Form state (VeeValidate) ─────────────────────────────────────────────────
const currentYear = new Date().getFullYear();

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
  modoReinvestimento: "total" as "total" | "parcial" | "nenhum",
  valorReinvestido: null as number | null,
};

const { defineField, values, setValues } = useForm({ initialValues: defaultValues });

function resetForm() {
  setValues({ ...defaultValues });
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

// ── Date options ─────────────────────────────────────────────────────────────
const yearOptions = Array.from({ length: currentYear - 1972 }, (_, i) => ({
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

// ── Derived calculations ─────────────────────────────────────────────────────
const coeficiente = computed(() =>
  getCoeficiente(values.mesAquisicao, values.anoAquisicao, values.mesVenda, values.anoVenda),
);
const coeficienteIndisponivel = computed(() => !hasCoeficientes(values.anoVenda));
const mesesEntreTransacoes = computed(
  () => (values.anoVenda - values.anoAquisicao) * 12 + (values.mesVenda - values.mesAquisicao),
);

const despesasAquisicao = computed(
  () =>
    (values.imt ?? 0) +
    (values.impostoSelo ?? 0) +
    (values.emolumentos ?? 0) +
    (values.certidaoRP ?? 0),
);
const despesasAlienacao = computed(
  () => (values.comissaoImobiliaria ?? 0) + (values.certEnergetico ?? 0),
);
const encargosValorizacao = computed(() => values.obras ?? 0);

const maisValia = computed(() => {
  const vr = values.valorVenda ?? 0;
  const va = values.valorAquisicao ?? 0;
  return (
    vr -
    va * coeficiente.value -
    encargosValorizacao.value -
    despesasAquisicao.value -
    despesasAlienacao.value
  );
});

const maisValiaTributavel50 = computed(() => (maisValia.value > 0 ? maisValia.value * 0.5 : 0));

const valorAReinvestir = computed(() => {
  const vr = values.valorVenda ?? 0;
  const capital = values.capitalEmDivida ?? 0;
  return Math.max(0, vr - capital);
});

const reinvestimentoEfetivo = computed(() => {
  if (values.modoReinvestimento === "nenhum") return 0;
  if (values.modoReinvestimento === "total") return valorAReinvestir.value;
  return Math.min(values.valorReinvestido ?? 0, valorAReinvestir.value);
});

const maisValiaIsenta = computed(() => {
  if (valorAReinvestir.value === 0 || maisValia.value <= 0) return 0;
  const ratio = Math.min(reinvestimentoEfetivo.value / valorAReinvestir.value, 1);
  return maisValia.value * ratio;
});

const maisValiaTributavelParcial = computed(() =>
  Math.max(0, (maisValia.value - maisValiaIsenta.value) * 0.5),
);

const showResults = computed(
  () => (values.valorVenda ?? 0) > 0 && (values.valorAquisicao ?? 0) > 0,
);

const menosValiaRisco = computed(
  () =>
    (values.valorVenda ?? 0) > 0 &&
    (values.valorAquisicao ?? 0) > 0 &&
    (values.valorVenda ?? 0) < (values.valorAquisicao ?? 0) * coeficiente.value,
);

// ── Accordion items ──────────────────────────────────────────────────────────
const accordionItems = computed(() => [
  {
    value: "aquisicao",
    label:
      despesasAquisicao.value > 0
        ? `Despesas na Aquisição · ${fmt(despesasAquisicao.value)}`
        : "Despesas na Aquisição",
    icon: "i-lucide-home",
    slot: "aquisicao",
  },
  {
    value: "obras",
    label:
      encargosValorizacao.value > 0
        ? `Encargos com Valorização (Obras) · ${fmt(encargosValorizacao.value)}`
        : "Encargos com Valorização (Obras)",
    icon: "i-lucide-hammer",
    slot: "obras",
  },
  {
    value: "alienacao",
    label:
      despesasAlienacao.value > 0
        ? `Despesas na Alienação (Venda) · ${fmt(despesasAlienacao.value)}`
        : "Despesas na Alienação (Venda)",
    icon: "i-lucide-tag",
    slot: "alienacao",
  },
]);

const reinvestimentoOptions = [
  { label: "Total", value: "total" },
  { label: "Parcial", value: "parcial" },
  { label: "Nenhum", value: "nenhum" },
];

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);

function fmtCompact(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M€`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}k€`;
  return `${Math.round(v)}€`;
}

// ── Shareable links ───────────────────────────────────────────────────────────
const route = useRoute();
const { decode, copyToClipboard } = useShareableLink();
const toast = useToast();

onMounted(() => {
  const s = route.query.s as string | undefined;
  if (s) {
    const state = decode(s);
    if (state) setValues(state as Parameters<typeof setValues>[0]);
  }
});

async function handleShare() {
  await copyToClipboard(values);
  toast.add({ title: "Link copiado!", color: "success" });
}

// ── Pinned snapshots ──────────────────────────────────────────────────────────
interface PinnedSnapshot {
  id: number;
  snapshotKey: string;
  formValues: typeof defaultValues;
  // display / diff fields
  valorVenda: number | null;
  anoVenda: number;
  coef: number;
  maisValia: number;
  maisValiaTributavel50: number;
  valorAReinvestir: number;
  maisValiaIsenta: number;
  maisValiaTributavelParcial: number;
  modoReinvestimento: "total" | "parcial" | "nenhum";
  valorReinvestido: number | null;
}

const currentSnapshotKey = computed(() =>
  [
    Math.round(maisValia.value),
    Math.round(maisValiaTributavel50.value),
    Math.round(valorAReinvestir.value),
  ].join("|"),
);

const pinned = ref<PinnedSnapshot[]>([]);
const pinnedCounter = ref(0);
const activeCompareId = ref<number | null>(null);
const showCompareModal = ref(false);

const pinnedSnapshot = computed(
  () => pinned.value.find((p) => p.id === activeCompareId.value) ?? null,
);

function pinCurrent() {
  pinnedCounter.value++;
  pinned.value.push({
    id: pinnedCounter.value,
    snapshotKey: currentSnapshotKey.value,
    formValues: { ...values } as typeof defaultValues,
    valorVenda: values.valorVenda,
    anoVenda: values.anoVenda,
    coef: coeficiente.value,
    maisValia: maisValia.value,
    maisValiaTributavel50: maisValiaTributavel50.value,
    valorAReinvestir: valorAReinvestir.value,
    maisValiaIsenta: maisValiaIsenta.value,
    maisValiaTributavelParcial: maisValiaTributavelParcial.value,
    modoReinvestimento: values.modoReinvestimento,
    valorReinvestido: values.valorReinvestido,
  });
}

function removePinned(id: number) {
  if (activeCompareId.value === id) activeCompareId.value = null;
  pinned.value = pinned.value.filter((p) => p.id !== id);
}

function toggleCompare(id: number) {
  activeCompareId.value = activeCompareId.value === id ? null : id;
}

function clearPinned() {
  pinned.value = [];
  activeCompareId.value = null;
}

function restoreSnapshot(p: PinnedSnapshot) {
  setValues(p.formValues as Parameters<typeof setValues>[0]);
}

// Delta helpers
const diffMaisValia = computed(() => {
  if (!pinnedSnapshot.value) return null;
  return maisValia.value - pinnedSnapshot.value.maisValia;
});

const diffTributavel = computed(() => {
  if (!pinnedSnapshot.value) return null;
  return maisValiaTributavel50.value - pinnedSnapshot.value.maisValiaTributavel50;
});

const diffAReinvestir = computed(() => {
  if (!pinnedSnapshot.value) return null;
  return valorAReinvestir.value - pinnedSnapshot.value.valorAReinvestir;
});

const diffVerdict = computed(() => {
  if (!pinnedSnapshot.value) return null;
  const d = diffTributavel.value ?? 0;
  if (Math.abs(d) < 1) return "neutral";
  return d < 0 ? "better" : "worse";
});

// Best pinned snapshot (lowest tributável)
const bestPinnedId = computed(() => {
  if (pinned.value.length < 2) return null;
  return pinned.value.reduce((best, p) =>
    p.maisValiaTributavel50 < best.maisValiaTributavel50 ? p : best,
  ).id;
});

// Whether pinned bar is visible (affects padding)
const hasPinnedBar = computed(() => pinned.value.length > 0);
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
          v-if="showResults"
          icon="i-lucide-rotate-ccw"
          variant="ghost"
          size="xs"
          color="neutral"
          class="absolute right-0 top-0"
          @click="resetForm"
        >
          Limpar
        </UButton>
      </div>

      <!-- Two-column grid: form left, results right -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        <!-- LEFT: form sections -->
        <div class="space-y-5">
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
                <UInputNumber
                  v-model="valorAquisicao"
                  placeholder="150 000,00"
                  :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }"
                  locale="pt-PT"
                  :min="0"
                  :increment="false"
                  :decrement="false"
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
                <UInputNumber
                  v-model="valorVenda"
                  placeholder="200 000,00"
                  :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }"
                  locale="pt-PT"
                  :min="0"
                  :increment="false"
                  :decrement="false"
                  class="w-full"
                />
                <p
                  v-if="menosValiaRisco"
                  class="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"
                >
                  <UIcon name="i-lucide-triangle-alert" class="size-3.5 shrink-0" />
                  O valor de venda é inferior ao custo ajustado — o resultado será uma menos-valia.
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
                    :items="ANOS_VENDA_DISPONIVEIS.map((a) => ({ label: String(a), value: a }))"
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
                  <p v-if="(values.valorAquisicao ?? 0) > 0" class="text-xs text-muted/70 mt-0.5">
                    {{ fmt(values.valorAquisicao ?? 0) }} × {{ coeficiente.toFixed(2) }} =
                    {{ fmt((values.valorAquisicao ?? 0) * coeficiente) }}
                  </p>
                </div>
                <InfoTooltip
                  :text="`Aplicável quando ≥ 24 meses entre aquisição e venda. Art. 50.º CIRS — ${PORTARIA_REF}`"
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
                    <UInputNumber
                      v-model="imt"
                      placeholder="2 500,00"
                      :format-options="{
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                      }"
                      locale="pt-PT"
                      :min="0"
                      :increment="false"
                      :decrement="false"
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
                    <UInputNumber
                      v-model="impostoSelo"
                      placeholder="1 200,00"
                      :format-options="{
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                      }"
                      locale="pt-PT"
                      :min="0"
                      :increment="false"
                      :decrement="false"
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
                    <UInputNumber
                      v-model="emolumentos"
                      placeholder="400,00"
                      :format-options="{
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                      }"
                      locale="pt-PT"
                      :min="0"
                      :increment="false"
                      :decrement="false"
                      :step="0.01"
                      class="w-full"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-sm font-medium flex items-center gap-1.5">
                      Certidão Registo Predial
                      <InfoTooltip text="Custo necessário à aquisição. Dedutível. Art. 51.º CIRS" />
                    </label>
                    <UInputNumber
                      v-model="certidaoRP"
                      placeholder="20,00"
                      :format-options="{
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                      }"
                      locale="pt-PT"
                      :min="0"
                      :increment="false"
                      :decrement="false"
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
                      />
                    </label>
                    <UInputNumber
                      v-model="obras"
                      placeholder="5 000,00"
                      :format-options="{
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                      }"
                      locale="pt-PT"
                      :min="0"
                      :increment="false"
                      :decrement="false"
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
                    <UInputNumber
                      v-model="comissaoImobiliaria"
                      placeholder="10 000,00"
                      :format-options="{
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                      }"
                      locale="pt-PT"
                      :min="0"
                      :increment="false"
                      :decrement="false"
                      :step="0.01"
                      class="w-full"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-sm font-medium flex items-center gap-1.5">
                      Certificado energético
                      <InfoTooltip text="Obrigatório para a venda. Dedutível. Art. 51.º CIRS" />
                    </label>
                    <UInputNumber
                      v-model="certEnergetico"
                      placeholder="0,00"
                      :format-options="{
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                      }"
                      locale="pt-PT"
                      :min="0"
                      :increment="false"
                      :decrement="false"
                      :step="0.01"
                      class="w-full"
                    />
                  </div>
                </div>
              </template>
            </UAccordion>

            <!-- Totais despesas -->
            <div
              v-if="despesasAquisicao + despesasAlienacao + encargosValorizacao > 0"
              class="mt-4 pt-3 border-t border-default space-y-1.5"
            >
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
                <span>{{ fmt(despesasAquisicao + encargosValorizacao + despesasAlienacao) }}</span>
              </div>
            </div>
          </UCard>

          <!-- Section 3: Crédito e Reinvestimento -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-landmark" class="text-primary-500 size-4 shrink-0" />
                <span class="font-semibold">Crédito e Reinvestimento</span>
              </div>
            </template>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium flex items-center gap-1.5">
                  Capital em dívida (crédito habitação)
                  <InfoTooltip
                    text="Valor do empréstimo a amortizar com o produto da venda. Art. 10.º, n.º 5, al. a) CIRS"
                  />
                  <span class="text-xs text-muted font-normal">(opcional)</span>
                </label>
                <UInputNumber
                  v-model="capitalEmDivida"
                  placeholder="80 000,00"
                  :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }"
                  locale="pt-PT"
                  :min="0"
                  :increment="false"
                  :decrement="false"
                  :step="0.01"
                  class="w-full"
                />
              </div>

              <div
                v-if="(values.valorVenda ?? 0) > 0"
                class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-elevated border border-default"
              >
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-shield-check" class="size-3.5 text-muted shrink-0" />
                  <span class="text-sm text-muted">Valor a reinvestir para isenção total</span>
                  <InfoTooltip
                    text="VR − capital em dívida. Apenas capitais próprios contam; a parte financiada por novo crédito não conta. Art. 10.º, n.º 5, al. a) CIRS"
                  />
                </div>
                <UBadge color="success" variant="soft" size="lg">{{
                  fmt(valorAReinvestir)
                }}</UBadge>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium flex items-center gap-1.5">
                  Intenção de reinvestimento
                  <InfoTooltip
                    text="Deve declarar a intenção de reinvestir no Quadro 5-A do Anexo G da declaração de IRS do ano da venda — mesmo que o reinvestimento ainda não esteja concluído. Art. 10.º, n.º 5 e n.º 9 CIRS — Portaria n.º 39-B/2024"
                  />
                </label>
                <URadioGroup
                  v-model="modoReinvestimento"
                  :items="reinvestimentoOptions"
                  orientation="horizontal"
                  variant="card"
                  color="primary"
                  class="w-full"
                  :ui="{ list: 'w-full', item: 'flex-1' }"
                />
              </div>

              <div v-if="modoReinvestimento === 'parcial'" class="space-y-1.5">
                <label class="text-sm font-medium flex items-center gap-1.5">
                  Valor que pretende reinvestir
                  <InfoTooltip
                    text="Exclusão proporcional: MV isenta = MV × (reinvestido / valor a reinvestir). Art. 10.º, n.º 9 CIRS"
                  />
                </label>
                <UInputNumber
                  v-model="valorReinvestido"
                  placeholder="50 000,00"
                  :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }"
                  locale="pt-PT"
                  :min="0"
                  :increment="false"
                  :decrement="false"
                  class="w-full"
                />
                <p v-if="valorAReinvestir > 0" class="text-xs text-muted">
                  Máximo para isenção total: <strong>{{ fmt(valorAReinvestir) }}</strong>
                </p>
              </div>
            </div>
          </UCard>

          <!-- Mobile results (below form, hidden on desktop) -->
          <div class="lg:hidden space-y-3">
            <!-- Diff card — mobile -->
            <div
              v-if="pinnedSnapshot"
              class="rounded-xl border border-default bg-default p-4 space-y-3"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-muted">
                  A comparar com fixado #{{ pinnedSnapshot.id }}
                </span>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-x"
                  @click="activeCompareId = null"
                />
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Mais-valia</span>
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ fmt(maisValia) }}</span>
                    <span class="text-xs text-muted">vs {{ fmt(pinnedSnapshot.maisValia) }}</span>
                    <span
                      v-if="diffMaisValia !== null"
                      :class="
                        diffMaisValia < 0
                          ? 'text-success-500'
                          : diffMaisValia > 0
                            ? 'text-error-500'
                            : 'text-muted'
                      "
                      class="text-xs font-semibold"
                    >
                      {{ diffMaisValia > 0 ? "+" : "" }}{{ fmt(diffMaisValia) }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Tributável (50%)</span>
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ fmt(maisValiaTributavel50) }}</span>
                    <span class="text-xs text-muted"
                      >vs {{ fmt(pinnedSnapshot.maisValiaTributavel50) }}</span
                    >
                    <span
                      v-if="diffTributavel !== null"
                      :class="
                        diffTributavel < 0
                          ? 'text-success-500'
                          : diffTributavel > 0
                            ? 'text-error-500'
                            : 'text-muted'
                      "
                      class="text-xs font-semibold"
                    >
                      {{ diffTributavel > 0 ? "+" : "" }}{{ fmt(diffTributavel) }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">A reinvestir</span>
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ fmt(valorAReinvestir) }}</span>
                    <span class="text-xs text-muted"
                      >vs {{ fmt(pinnedSnapshot.valorAReinvestir) }}</span
                    >
                    <span
                      v-if="diffAReinvestir !== null"
                      :class="
                        diffAReinvestir > 0
                          ? 'text-success-500'
                          : diffAReinvestir < 0
                            ? 'text-error-500'
                            : 'text-muted'
                      "
                      class="text-xs font-semibold"
                    >
                      {{ diffAReinvestir > 0 ? "+" : "" }}{{ fmt(diffAReinvestir) }}
                    </span>
                  </div>
                </div>
              </div>
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

            <ResultsDisplay
              v-if="showResults"
              :mais-valia="maisValia"
              :mais-valia-tributavel50="maisValiaTributavel50"
              :valor-a-reinvestir="valorAReinvestir"
              :modo-reinvestimento="modoReinvestimento"
              :valor-reinvestido="reinvestimentoEfetivo"
              :mais-valia-isenta="maisValiaIsenta"
              :mais-valia-tributavel-parcial="maisValiaTributavelParcial"
              @share="handleShare"
            />
            <UCard v-else>
              <div class="py-8 text-center space-y-2">
                <UIcon name="i-lucide-calculator" class="size-8 mx-auto text-muted opacity-40" />
                <p class="text-sm text-muted">
                  Preencha o valor de compra e de venda para ver o resultado.
                </p>
              </div>
            </UCard>

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
        <!-- /LEFT -->

        <!-- RIGHT: sticky results sidebar (desktop only) -->
        <div class="hidden lg:flex lg:flex-col lg:gap-3 lg:sticky lg:top-6">
          <!-- Diff card — desktop -->
          <div
            v-if="pinnedSnapshot"
            class="rounded-xl border border-default bg-default p-4 space-y-3"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-muted">
                A comparar com fixado #{{ pinnedSnapshot.id }}
              </span>
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                @click="activeCompareId = null"
              />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted">Mais-valia</span>
                <div class="flex items-center gap-2 flex-wrap justify-end">
                  <span class="font-medium">{{ fmt(maisValia) }}</span>
                  <span class="text-xs text-muted">vs {{ fmt(pinnedSnapshot.maisValia) }}</span>
                  <span
                    v-if="diffMaisValia !== null"
                    :class="
                      diffMaisValia < 0
                        ? 'text-success-500'
                        : diffMaisValia > 0
                          ? 'text-error-500'
                          : 'text-muted'
                    "
                    class="text-xs font-semibold"
                  >
                    {{ diffMaisValia > 0 ? "+" : "" }}{{ fmt(diffMaisValia) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted">Tributável (50%)</span>
                <div class="flex items-center gap-2 flex-wrap justify-end">
                  <span class="font-medium">{{ fmt(maisValiaTributavel50) }}</span>
                  <span class="text-xs text-muted"
                    >vs {{ fmt(pinnedSnapshot.maisValiaTributavel50) }}</span
                  >
                  <span
                    v-if="diffTributavel !== null"
                    :class="
                      diffTributavel < 0
                        ? 'text-success-500'
                        : diffTributavel > 0
                          ? 'text-error-500'
                          : 'text-muted'
                    "
                    class="text-xs font-semibold"
                  >
                    {{ diffTributavel > 0 ? "+" : "" }}{{ fmt(diffTributavel) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted">A reinvestir</span>
                <div class="flex items-center gap-2 flex-wrap justify-end">
                  <span class="font-medium">{{ fmt(valorAReinvestir) }}</span>
                  <span class="text-xs text-muted"
                    >vs {{ fmt(pinnedSnapshot.valorAReinvestir) }}</span
                  >
                  <span
                    v-if="diffAReinvestir !== null"
                    :class="
                      diffAReinvestir > 0
                        ? 'text-success-500'
                        : diffAReinvestir < 0
                          ? 'text-error-500'
                          : 'text-muted'
                    "
                    class="text-xs font-semibold"
                  >
                    {{ diffAReinvestir > 0 ? "+" : "" }}{{ fmt(diffAReinvestir) }}
                  </span>
                </div>
              </div>
            </div>
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

          <ResultsDisplay
            v-if="showResults"
            :mais-valia="maisValia"
            :mais-valia-tributavel50="maisValiaTributavel50"
            :valor-a-reinvestir="valorAReinvestir"
            :modo-reinvestimento="modoReinvestimento"
            :valor-reinvestido="reinvestimentoEfetivo"
            :mais-valia-isenta="maisValiaIsenta"
            :mais-valia-tributavel-parcial="maisValiaTributavelParcial"
            @share="handleShare"
          />
          <UCard v-else>
            <div class="py-8 text-center space-y-2">
              <UIcon name="i-lucide-calculator" class="size-8 mx-auto text-muted opacity-40" />
              <p class="text-sm text-muted">
                Preencha o valor de compra e de venda para ver o resultado.
              </p>
            </div>
          </UCard>

          <!-- Pin button — desktop -->
          <UButton
            v-if="showResults && maisValia > 0"
            icon="i-lucide-pin"
            color="primary"
            variant="soft"
            class="w-full justify-center"
            @click="pinCurrent"
          >
            Fixar resultado
          </UButton>
        </div>
      </div>
      <!-- /grid -->

      <!-- Footer -->
      <div class="text-center space-y-1 mt-6 pb-2">
        <p class="text-xs text-gray-500 dark:text-gray-500 px-4">
          Calculadora de caráter informativo. Não substitui aconselhamento fiscal profissional.
          Consulte um contabilista certificado para a sua situação concreta.
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-600">
          Última atualização: {{ ULTIMA_ATUALIZACAO }}
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
            v-for="p in pinned"
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
              v-if="pinned.length >= 2"
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
                  v-for="p in pinned"
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
                  v-for="p in pinned"
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
                  v-for="p in pinned"
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
                  v-for="p in pinned"
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
                  v-for="p in pinned"
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
                  v-for="p in pinned"
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
