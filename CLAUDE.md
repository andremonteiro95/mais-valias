# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- Nuxt 4 + @nuxt/ui v4 (bundles Tailwind CSS v4)
- Package manager: bun (always use `bun`, never `npm` or `yarn`)
- No separate Tailwind install needed — `@nuxt/ui` handles it

## Commands

```bash
bun run dev          # dev server
bun run build        # production build
bun run preview      # preview production build
bun run lint         # oxlint
bun run lint:fix     # oxlint --fix
bun run fmt          # oxfmt
bun run fmt:check    # oxfmt --check
```

Pre-commit hooks (lefthook) auto-lint and auto-format staged `src/**/*.{js,ts,vue}` files via oxlint + oxfmt.

## Key Files

- `nuxt.config.ts` — Vite `define` injects `__BUILD_DATE__` at build time; Nitro preset: `cloudflare_module`
- `src/constants.ts` — app-level constants (e.g. `ULTIMA_ATUALIZACAO`)
- `src/global.d.ts` — global type declarations (e.g. `__BUILD_DATE__`)
- `src/pages/index.vue` — single-page calculator; form state managed by VeeValidate
- `src/components/ResultsDisplay.vue` — results panel (receives computed props, emits `share`)
- `src/data/coeficientes.ts` — monetary coefficient table (Portaria 382/2025); exports `PORTARIA_REF`, `getCoeficiente()`, `hasCoeficientes()`
- `src/data/irsTabela.ts` — IRS 2025 brackets (Art. 68.º CIRS) + solidarity surcharge; exports `calcularIRSAdicional()`

## Architecture

All calculation logic lives in `src/composables/useCalculations.ts`. It accepts the VeeValidate reactive `values` object (`FormValues` interface) and returns ~20 computed properties — no side-effects. `index.vue` owns form state and wires it to this composable and to `ResultsDisplay.vue`.

Other composables:
- `useSimulationStorage` — localStorage persistence of form state
- `useShareableLink` — URL encode/decode via `lz-string`
- `usePinnedSnapshots` — multi-scenario comparison state machine; `DiffCard.vue` renders deltas

`src/utils/formatters.ts` — `fmt()` (EUR currency), `fmtPct()` (%), `fmtCompact()` (compact EUR); all `pt-PT` locale.

## Calculation Logic

```
MV = VR − (VA × Coef.) − encargosValorizacao − despesasAquisicao − despesasAlienacao
Tributável = MV × 0.5                          (Art. 43.º n.º 2 CIRS)
Valor a reinvestir = VR − capitalEmDivida      (Art. 10.º n.º 5 CIRS)
Reinvestimento parcial:
  MV isenta = MV × (reinvestido / valorAReinvestir)  (Art. 10.º n.º 9 CIRS)
```

Expense buckets:
- `despesasAquisicao`: IMT + imposto de selo + emolumentos + certidão RP
- `encargosValorizacao`: obras
- `despesasAlienacao`: comissão imobiliária + certificado energético

Coeficiente applies only when ≥ 24 months between acquisition and sale; falls back to previous year's table if the current year's Portaria isn't published yet.

## Reference Example

Compra 185.000€ (2023), Venda 270.000€ (2025), Coef 1.02
→ MV = 55.511,40 €, Valor a reinvestir = 107.203,07 €

## Language

- All code, comments, variable names, and function names: **English**
- Commit messages and PR descriptions: **English**
- User-facing UI text (labels, tooltips, alerts): **Portuguese**

## Nuxt UI Notes

- `USelect`: use `value-key` and `label-key` props; items must be `[{ label: '2025', value: 2025 }]`
- Icons use Lucide: `i-lucide-*` class syntax
- Use Context7 (`mcp__context7`) for Nuxt UI / Nuxt documentation lookups
