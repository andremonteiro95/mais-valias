<script setup lang="ts">
import { getCoeficiente, hasCoeficientes, ANOS_VENDA_DISPONIVEIS, PORTARIA_REF, ULTIMA_ATUALIZACAO } from '~/data/coeficientes'

// ── Form state (VeeValidate) ─────────────────────────────────────────────────
const currentYear = new Date().getFullYear()

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
  modoReinvestimento: 'total' as 'total' | 'parcial' | 'nenhum',
  valorReinvestido: null as number | null,
}

const { defineField, values, setValues } = useForm({ initialValues: defaultValues })

function resetForm() {
  setValues({ ...defaultValues })
}

const [valorAquisicao] = defineField('valorAquisicao')
const [mesAquisicao] = defineField('mesAquisicao')
const [anoAquisicao] = defineField('anoAquisicao')
const [valorVenda] = defineField('valorVenda')
const [mesVenda] = defineField('mesVenda')
const [anoVenda] = defineField('anoVenda')
const [imt] = defineField('imt')
const [impostoSelo] = defineField('impostoSelo')
const [emolumentos] = defineField('emolumentos')
const [certidaoRP] = defineField('certidaoRP')
const [obras] = defineField('obras')
const [comissaoImobiliaria] = defineField('comissaoImobiliaria')
const [certEnergetico] = defineField('certEnergetico')
const [capitalEmDivida] = defineField('capitalEmDivida')
const [modoReinvestimento] = defineField('modoReinvestimento')
const [valorReinvestido] = defineField('valorReinvestido')

// ── Date options ─────────────────────────────────────────────────────────────
const yearOptions = Array.from({ length: currentYear - 1972 }, (_, i) => ({
  label: String(currentYear - i),
  value: currentYear - i,
}))
const monthOptions = [
  { label: 'Jan', value: 1 },
  { label: 'Fev', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Abr', value: 4 },
  { label: 'Mai', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Ago', value: 8 },
  { label: 'Set', value: 9 },
  { label: 'Out', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Dez', value: 12 },
]

// ── Derived calculations ─────────────────────────────────────────────────────
const coeficiente = computed(() => getCoeficiente(values.mesAquisicao, values.anoAquisicao, values.mesVenda, values.anoVenda))
const coeficienteIndisponivel = computed(() => !hasCoeficientes(values.anoVenda))
const mesesEntreTransacoes = computed(() =>
  (values.anoVenda - values.anoAquisicao) * 12 + (values.mesVenda - values.mesAquisicao)
)

const despesasAquisicao = computed(() =>
  (values.imt ?? 0) + (values.impostoSelo ?? 0) + (values.emolumentos ?? 0) + (values.certidaoRP ?? 0)
)
const despesasAlienacao = computed(() =>
  (values.comissaoImobiliaria ?? 0) + (values.certEnergetico ?? 0)
)
const encargosValorizacao = computed(() => values.obras ?? 0)

const maisValia = computed(() => {
  const vr = values.valorVenda ?? 0
  const va = values.valorAquisicao ?? 0
  return vr - va * coeficiente.value - encargosValorizacao.value - despesasAquisicao.value - despesasAlienacao.value
})

const maisValiaTributavel50 = computed(() =>
  maisValia.value > 0 ? maisValia.value * 0.5 : 0
)

const valorAReinvestir = computed(() => {
  const vr = values.valorVenda ?? 0
  const capital = values.capitalEmDivida ?? 0
  return Math.max(0, vr - capital)
})

const reinvestimentoEfetivo = computed(() => {
  if (values.modoReinvestimento === 'nenhum') return 0
  if (values.modoReinvestimento === 'total') return valorAReinvestir.value
  return Math.min(values.valorReinvestido ?? 0, valorAReinvestir.value)
})

const maisValiaIsenta = computed(() => {
  if (valorAReinvestir.value === 0 || maisValia.value <= 0) return 0
  const ratio = Math.min(reinvestimentoEfetivo.value / valorAReinvestir.value, 1)
  return maisValia.value * ratio
})

const maisValiaTributavelParcial = computed(() =>
  Math.max(0, (maisValia.value - maisValiaIsenta.value) * 0.5)
)

const showResults = computed(() => (values.valorVenda ?? 0) > 0 && (values.valorAquisicao ?? 0) > 0)

// Warn early if sale price is below the coeficient-adjusted purchase price
const menosValiaRisco = computed(() =>
  (values.valorVenda ?? 0) > 0 && (values.valorAquisicao ?? 0) > 0 &&
  (values.valorVenda ?? 0) < (values.valorAquisicao ?? 0) * coeficiente.value
)

// ── Accordion items (computed to show subtotals in headers) ──────────────────
const accordionItems = computed(() => [
  {
    value: 'aquisicao',
    label: despesasAquisicao.value > 0
      ? `Despesas na Aquisição · ${fmt(despesasAquisicao.value)}`
      : 'Despesas na Aquisição',
    icon: 'i-lucide-home',
    slot: 'aquisicao',
  },
  {
    value: 'obras',
    label: encargosValorizacao.value > 0
      ? `Encargos com Valorização (Obras) · ${fmt(encargosValorizacao.value)}`
      : 'Encargos com Valorização (Obras)',
    icon: 'i-lucide-hammer',
    slot: 'obras',
  },
  {
    value: 'alienacao',
    label: despesasAlienacao.value > 0
      ? `Despesas na Alienação (Venda) · ${fmt(despesasAlienacao.value)}`
      : 'Despesas na Alienação (Venda)',
    icon: 'i-lucide-tag',
    slot: 'alienacao',
  },
])

const reinvestimentoOptions = [
  { label: 'Reinvestimento total', value: 'total' },
  { label: 'Reinvestimento parcial', value: 'parcial' },
  { label: 'Sem reinvestimento', value: 'nenhum' },
]

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v)

// ── Shareable links ───────────────────────────────────────────────────────────
const route = useRoute()
const { decode, copyToClipboard } = useShareableLink()
const toast = useToast()

onMounted(() => {
  const s = route.query.s as string | undefined
  if (s) {
    const state = decode(s)
    if (state) setValues(state as Parameters<typeof setValues>[0])
  }
})

async function handleShare() {
  await copyToClipboard(values)
  toast.add({ title: 'Link copiado!', color: 'success' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <UContainer class="max-w-5xl py-10 pb-16 lg:pb-10">

      <!-- Header -->
      <div class="relative text-center space-y-3 pb-6">
        <div class="inline-flex items-center justify-center size-14 rounded-2xl bg-primary-100 dark:bg-primary-900/40 mb-1">
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
              <UTooltip text="Preço pelo qual o imóvel foi comprado, conforme escritura pública de compra e venda. Não inclui IMT, Imposto de Selo nem outros custos — esses entram nas despesas dedutíveis. Art. 46.º CIRS">
                <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
              </UTooltip>
            </label>
            <UInputNumber
              v-model="valorAquisicao"
              placeholder="185 000,00"
              :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }"
              locale="pt-PT"
              :min="0"
              :increment="false"
              :decrement="false"
              class="w-full"
            />
          </div>

          <!-- Data de aquisição — year first -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium flex items-center gap-1.5">
              Data de aquisição
              <UTooltip text="Mês e ano da escritura de compra. Usados para calcular os meses exatos até à venda e determinar se o coeficiente de desvalorização se aplica (≥ 24 meses). Art. 46.º e 50.º CIRS">
                <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
              </UTooltip>
            </label>
            <div class="flex gap-2">
              <USelect v-model="mesAquisicao" :items="monthOptions" value-key="value" label-key="label" class="w-24 shrink-0" />
              <USelect v-model="anoAquisicao" :items="yearOptions" value-key="value" label-key="label" class="flex-1" />
            </div>
          </div>

          <!-- Valor de venda -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium flex items-center gap-1.5">
              Valor de venda
              <UTooltip text="Valor de realização constante na escritura de venda. Art. 44.º CIRS">
                <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
              </UTooltip>
            </label>
            <UInputNumber
              v-model="valorVenda"
              placeholder="270 000,00"
              :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }"
              locale="pt-PT"
              :min="0"
              :increment="false"
              :decrement="false"
              class="w-full"
            />
            <!-- Early warning: less-valia risk -->
            <p v-if="menosValiaRisco" class="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <UIcon name="i-lucide-triangle-alert" class="size-3.5 shrink-0" />
              O valor de venda é inferior ao custo ajustado — o resultado será uma menos-valia.
            </p>
          </div>

          <!-- Data de venda — year first -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium flex items-center gap-1.5">
              Data de venda
              <UTooltip text="Mês e ano da escritura de venda. O ano define qual a Portaria de coeficientes aplicável. Art. 44.º e 50.º CIRS — Portaria n.º 382/2025/1">
                <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
              </UTooltip>
            </label>
            <div class="flex gap-2">
              <USelect v-model="mesVenda" :items="monthOptions" value-key="value" label-key="label" class="w-24 shrink-0" />
              <USelect
                v-model="anoVenda"
                :items="ANOS_VENDA_DISPONIVEIS.map(a => ({ label: String(a), value: a }))"
                value-key="value"
                label-key="label"
                class="flex-1"
              />
            </div>
          </div>
        </div>

        <!-- Coeficiente — only relevant when >= 24 months -->
        <div v-if="mesesEntreTransacoes >= 24" class="mt-4 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-elevated border border-default">
          <div class="flex items-center gap-1.5 min-w-0">
            <UIcon name="i-lucide-trending-up" class="size-3.5 text-muted shrink-0" />
            <div class="min-w-0">
              <span class="text-sm text-muted">Coeficiente de desvalorização</span>
              <p v-if="(values.valorAquisicao ?? 0) > 0" class="text-xs text-muted/70 mt-0.5">
                {{ fmt(values.valorAquisicao ?? 0) }} × {{ coeficiente.toFixed(2) }} = {{ fmt((values.valorAquisicao ?? 0) * coeficiente) }}
              </p>
            </div>
            <UTooltip :text="`Aplicável quando ≥ 24 meses entre aquisição e venda. Art. 50.º CIRS — ${PORTARIA_REF}`">
              <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help shrink-0" />
            </UTooltip>
          </div>
          <UBadge :color="coeficienteIndisponivel ? 'warning' : 'primary'" variant="soft" class="shrink-0">
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
            <UTooltip text="Art. 51.º CIRS — apenas despesas inerentes à aquisição e alienação, e encargos de valorização nos últimos 12 anos">
              <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
            </UTooltip>
            <span class="text-xs text-muted font-normal">— cada euro dedutível reduz a mais-valia</span>
          </div>
        </template>

        <UAccordion :items="accordionItems" type="multiple" :default-value="[]">
          <template #aquisicao>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
              <div class="space-y-1.5">
                <label class="text-sm font-medium flex items-center gap-1.5">
                  IMT
                  <UTooltip text="Imposto Municipal sobre Transmissões — obrigatório na aquisição. Dedutível. Art. 51.º, n.º 1, al. a) CIRS">
                    <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
                  </UTooltip>
                </label>
                <UInputNumber v-model="imt" placeholder="3 404,80" :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }" locale="pt-PT" :min="0" :increment="false" :decrement="false" :step="0.01" class="w-full" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium flex items-center gap-1.5">
                  Imposto de Selo
                  <UTooltip text="Imposto de Selo da aquisição — obrigatório. Dedutível. Art. 51.º, n.º 1, al. a) CIRS">
                    <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
                  </UTooltip>
                </label>
                <UInputNumber v-model="impostoSelo" placeholder="1 480,00" :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }" locale="pt-PT" :min="0" :increment="false" :decrement="false" :step="0.01" class="w-full" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium flex items-center gap-1.5">
                  Emolumentos escritura
                  <UTooltip text="Emolumentos da escritura de compra e venda. Dedutível. Art. 51.º CIRS">
                    <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
                  </UTooltip>
                </label>
                <UInputNumber v-model="emolumentos" placeholder="465,70" :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }" locale="pt-PT" :min="0" :increment="false" :decrement="false" :step="0.01" class="w-full" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium flex items-center gap-1.5">
                  Certidão Registo Predial
                  <UTooltip text="Custo necessário à aquisição. Dedutível. Art. 51.º CIRS">
                    <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
                  </UTooltip>
                </label>
                <UInputNumber v-model="certidaoRP" placeholder="20,00" :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }" locale="pt-PT" :min="0" :increment="false" :decrement="false" :step="0.01" class="w-full" />
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
                  <UTooltip text="Obras realizadas nos últimos 12 anos que valorizem o imóvel, comprovadas por fatura com NIF e pagamento por MB/TRF. Art. 51.º CIRS — CAAD Proc. 634/2023">
                    <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
                  </UTooltip>
                </label>
                <UInputNumber v-model="obras" placeholder="3 813,10" :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }" locale="pt-PT" :min="0" :increment="false" :decrement="false" :step="0.01" class="w-full" />
              </div>
              <p class="text-xs text-muted">
                A partir de 2025, a AT exige fatura com NIF e pagamento por transferência bancária ou cartão.
              </p>
            </div>
          </template>

          <template #alienacao>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
              <div class="space-y-1.5">
                <label class="text-sm font-medium flex items-center gap-1.5">
                  Comissão imobiliária
                  <UTooltip text="Dedutível se comprovada por fatura. Inclui IVA. Art. 51.º CIRS">
                    <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
                  </UTooltip>
                </label>
                <UInputNumber v-model="comissaoImobiliaria" placeholder="16 605,00" :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }" locale="pt-PT" :min="0" :increment="false" :decrement="false" :step="0.01" class="w-full" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium flex items-center gap-1.5">
                  Certificado energético
                  <UTooltip text="Obrigatório para a venda. Dedutível. Art. 51.º CIRS">
                    <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
                  </UTooltip>
                </label>
                <UInputNumber v-model="certEnergetico" placeholder="0,00" :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }" locale="pt-PT" :min="0" :increment="false" :decrement="false" :step="0.01" class="w-full" />
              </div>
            </div>
          </template>
        </UAccordion>

        <!-- Totais despesas -->
        <div v-if="despesasAquisicao + despesasAlienacao + encargosValorizacao > 0" class="mt-4 pt-3 border-t border-default space-y-1.5">
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
          <div class="flex justify-between text-sm font-semibold pt-1.5 border-t border-default">
            <span class="flex items-center gap-1.5">
              Total dedutível
              <UTooltip text="Soma das despesas inerentes à aquisição + encargos de valorização + despesas inerentes à alienação. Este valor é deduzido ao valor de realização no cálculo da mais-valia. Art. 51.º CIRS">
                <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
              </UTooltip>
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
              <UTooltip text="Valor do empréstimo a amortizar com o produto da venda. Art. 10.º, n.º 5, al. a) CIRS">
                <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
              </UTooltip>
              <span class="text-xs text-muted font-normal">(opcional)</span>
            </label>
            <UInputNumber
              v-model="capitalEmDivida"
              placeholder="162 796,93"
              :format-options="{ style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }"
              locale="pt-PT"
              :min="0"
              :increment="false"
              :decrement="false"
              :step="0.01"
              class="w-full"
            />
          </div>

          <!-- Valor a reinvestir para isenção total — shown as soon as sale value exists -->
          <div v-if="(values.valorVenda ?? 0) > 0" class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-elevated border border-default">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-shield-check" class="size-3.5 text-muted shrink-0" />
              <span class="text-sm text-muted">Valor a reinvestir para isenção total</span>
              <UTooltip text="VR − capital em dívida. Apenas capitais próprios contam; a parte financiada por novo crédito não conta. Art. 10.º, n.º 5, al. a) CIRS">
                <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
              </UTooltip>
            </div>
            <UBadge color="success" variant="soft" size="lg">{{ fmt(valorAReinvestir) }}</UBadge>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium flex items-center gap-1.5">
              Intenção de reinvestimento
              <UTooltip text="Deve declarar a intenção de reinvestir no Quadro 5-A do Anexo G da declaração de IRS do ano da venda — mesmo que o reinvestimento ainda não esteja concluído. Art. 10.º, n.º 5 e n.º 9 CIRS — Portaria n.º 39-B/2024">
                <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
              </UTooltip>
            </label>
            <URadioGroup
              v-model="modoReinvestimento"
              :items="reinvestimentoOptions"
            />
          </div>

          <div v-if="modoReinvestimento === 'parcial'" class="space-y-1.5">
            <label class="text-sm font-medium flex items-center gap-1.5">
              Valor que pretende reinvestir
              <UTooltip text="Exclusão proporcional: MV isenta = MV × (reinvestido / valor a reinvestir). Art. 10.º, n.º 9 CIRS">
                <UIcon name="i-lucide-info" class="text-muted size-3.5 cursor-help" />
              </UTooltip>
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
      <div class="lg:hidden">
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
            <p class="text-sm text-muted">Preencha o valor de compra e de venda para ver o resultado.</p>
          </div>
        </UCard>
      </div>

      </div><!-- /LEFT -->

      <!-- RIGHT: sticky results sidebar (desktop only) -->
      <div class="hidden lg:block lg:sticky lg:top-6">
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
            <p class="text-sm text-muted">Preencha o valor de compra e de venda para ver o resultado.</p>
          </div>
        </UCard>
      </div>

      </div><!-- /grid -->

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

    <!-- Mobile sticky summary bar -->
    <Transition name="slide-up">
      <div
        v-if="showResults"
        class="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-default bg-default/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between"
      >
        <div class="text-sm">
          <span class="text-muted">Tributável (50%)</span>
          <span class="font-semibold ml-2">{{ fmt(maisValiaTributavel50) }}</span>
        </div>
        <UButton size="xs" variant="ghost" icon="i-lucide-share-2" @click="handleShare">
          Partilhar
        </UButton>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
