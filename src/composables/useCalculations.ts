import { computed } from "vue";
import { getCoeficiente, hasCoeficientes } from "~/data/coeficientes";
import { calcularIRSAdicional } from "~/data/irsTabela";

/**
 * Shape of the VeeValidate `values` reactive object consumed by this composable.
 * Mirrors the `defaultValues` object in index.vue.
 */
export interface FormValues {
  valorAquisicao: number | null;
  mesAquisicao: number;
  anoAquisicao: number;
  valorVenda: number | null;
  mesVenda: number;
  anoVenda: number;
  imt: number | null;
  impostoSelo: number | null;
  emolumentos: number | null;
  certidaoRP: number | null;
  obras: number | null;
  comissaoImobiliaria: number | null;
  certEnergetico: number | null;
  capitalEmDivida: number | null;
  modoReinvestimento: "total" | "parcial" | "nenhum";
  valorReinvestido: number | null;
  rendimentoColetavel: number | null;
  tipoTributacao: "individual" | "conjunto";
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);

/**
 * Pure derived calculations composable.
 *
 * Accepts the reactive VeeValidate `values` object and returns all computed
 * values that derive from the form state. No side-effects.
 *
 * Usage:
 *   const { maisValia, tributavel, valorAReinvestir, ... } = useCalculations(values)
 */
export function useCalculations(values: FormValues) {
  // ── Monetary coefficient ────────────────────────────────────────────────────
  const coeficiente = computed(() =>
    getCoeficiente(values.mesAquisicao, values.anoAquisicao, values.mesVenda, values.anoVenda),
  );

  const coeficienteIndisponivel = computed(() => !hasCoeficientes(values.anoVenda));

  const mesesEntreTransacoes = computed(
    () => (values.anoVenda - values.anoAquisicao) * 12 + (values.mesVenda - values.mesAquisicao),
  );

  // ── Expense buckets ─────────────────────────────────────────────────────────
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

  const totalDespesas = computed(
    () => despesasAquisicao.value + encargosValorizacao.value + despesasAlienacao.value,
  );

  // ── Core gain ───────────────────────────────────────────────────────────────
  /** Simple sale profit: VR − VA, before coeficiente and expense adjustments. */
  const ganhoRealizacao = computed(() => (values.valorVenda ?? 0) - (values.valorAquisicao ?? 0));

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

  /** Art. 43.º n.º 2 CIRS — 50 % inclusion rule (no reinvestment). */
  const tributavel = computed(() => (maisValia.value > 0 ? maisValia.value * 0.5 : 0));

  // Keep the original name as an alias so pinned-snapshot code can reference it.
  const maisValiaTributavel50 = tributavel;

  // ── Reinvestment ────────────────────────────────────────────────────────────
  /** Art. 10.º n.º 5 CIRS — amount that must be reinvested for full exemption. */
  const valorAReinvestir = computed(() => {
    const vr = values.valorVenda ?? 0;
    const capital = values.capitalEmDivida ?? 0;
    return Math.max(0, vr - capital);
  });

  /** Effective reinvestment amount, capped at valorAReinvestir. */
  const reinvestimentoEfetivo = computed(() => {
    if (values.modoReinvestimento === "nenhum") return 0;
    if (values.modoReinvestimento === "total") return valorAReinvestir.value;
    return Math.min(values.valorReinvestido ?? 0, valorAReinvestir.value);
  });

  /** Art. 10.º n.º 9 CIRS — exempt portion of capital gain. */
  const maisValiaIsenta = computed(() => {
    if (valorAReinvestir.value === 0 || maisValia.value <= 0) return 0;
    const ratio = Math.min(reinvestimentoEfetivo.value / valorAReinvestir.value, 1);
    return maisValia.value * ratio;
  });

  /** Taxable gain after reinvestment exemption, already at 50 % (Art. 43.º n.º 2). */
  const maisValiaTributavelParcial = computed(() =>
    Math.max(0, (maisValia.value - maisValiaIsenta.value) * 0.5),
  );

  /** True when the taxpayer reinvests the full required amount. */
  const isFullExemption = computed(
    () =>
      values.modoReinvestimento === "total" &&
      reinvestimentoEfetivo.value >= valorAReinvestir.value &&
      valorAReinvestir.value > 0,
  );

  const percentagemReinvestimento = computed(() => {
    if (valorAReinvestir.value === 0) return 0;
    return Math.min(reinvestimentoEfetivo.value / valorAReinvestir.value, 1);
  });

  // ── IRS additional tax ─────────────────────────────────────────────────────
  const showResults = computed(
    () => (values.valorVenda ?? 0) > 0 && (values.valorAquisicao ?? 0) > 0,
  );

  const irsAdicional = computed(() => {
    const rc = values.rendimentoColetavel;
    if (rc == null || Number.isNaN(rc)) return null;
    if (!showResults.value || maisValia.value <= 0) return null;
    return calcularIRSAdicional(
      values.rendimentoColetavel,
      maisValiaTributavelParcial.value,
      values.tipoTributacao,
    );
  });

  // ── Risk flag ───────────────────────────────────────────────────────────────
  const menosValiaRisco = computed(
    () =>
      (values.valorVenda ?? 0) > 0 &&
      (values.valorAquisicao ?? 0) > 0 &&
      (values.valorVenda ?? 0) < (values.valorAquisicao ?? 0) * coeficiente.value,
  );

  // ── Accordion items (labels depend on calculated sub-totals) ───────────────
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

  return {
    // Coefficient
    coeficiente,
    coeficienteIndisponivel,
    mesesEntreTransacoes,
    // Expenses
    despesasAquisicao,
    despesasAlienacao,
    encargosValorizacao,
    totalDespesas,
    // Gain
    ganhoRealizacao,
    maisValia,
    /** Alias for maisValiaTributavel50 — 50 % inclusion with no reinvestment. */
    tributavel,
    maisValiaTributavel50,
    // Reinvestment
    valorAReinvestir,
    reinvestimentoEfetivo,
    maisValiaIsenta,
    maisValiaTributavelParcial,
    isFullExemption,
    percentagemReinvestimento,
    // IRS
    irsAdicional,
    showResults,
    menosValiaRisco,
    // UI
    accordionItems,
  };
}
