/**
 * IRS 2025 tax brackets and calculation logic.
 * Source: Lei n.º 55-A/2025, de 22 de julho (OE 2025) — Art. 68.º CIRS
 */

const ESCALOES_IRS_2025 = [
  { limite: 8_059, taxa: 0.13 },
  { limite: 11_460, taxa: 0.165 },
  { limite: 16_037, taxa: 0.22 },
  { limite: 21_704, taxa: 0.25 },
  { limite: 28_410, taxa: 0.32 },
  { limite: 41_629, taxa: 0.349 },
  { limite: 44_987, taxa: 0.37 },
  { limite: 83_696, taxa: 0.435 },
  { limite: Infinity, taxa: 0.48 },
];

function calcularImposto(rendimento: number): number {
  let imposto = 0;
  let anterior = 0;
  for (const escalao of ESCALOES_IRS_2025) {
    if (rendimento <= anterior) break;
    const base = Math.min(rendimento, escalao.limite) - anterior;
    imposto += base * escalao.taxa;
    anterior = escalao.limite;
  }
  // Sobretaxa de solidariedade — Art. 68.º-A CIRS
  if (rendimento > 80_000) {
    imposto += (Math.min(rendimento, 250_000) - 80_000) * 0.025;
  }
  if (rendimento > 250_000) {
    imposto += (rendimento - 250_000) * 0.05;
  }
  return imposto;
}

/**
 * Calculates the additional IRS attributable to real estate capital gains
 * using the delta method: imposto(com MV) − imposto(sem MV).
 *
 * @param outrosRendimentos - Taxable income excluding the capital gain (€)
 * @param tributavelMV - Taxable portion of the capital gain (already at 50%, Art. 43.º n.º 2)
 * @param tipoTributacao - Individual vs. joint filing (quociente 2, Art. 69.º CIRS)
 */
export function calcularIRSAdicional(
  outrosRendimentos: number,
  tributavelMV: number,
  tipoTributacao: "individual" | "conjunto",
): number {
  const divisor = tipoTributacao === "conjunto" ? 2 : 1;
  const impostoSem = calcularImposto(outrosRendimentos / divisor) * divisor;
  const impostoComMV = calcularImposto((outrosRendimentos + tributavelMV) / divisor) * divisor;
  return Math.max(0, impostoComMV - impostoSem);
}
