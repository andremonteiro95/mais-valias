# Calculadora de Mais-Valias Imobiliárias

A web calculator for computing real estate capital gains tax in Portugal, following the rules of the CIRS (Código do IRS) and official monetary devaluation coefficients.

**Live at [maisvalias.andremonteiro.pt](https://maisvalias.andremonteiro.pt)**

## Features

- **Capital gains calculation** with monetary devaluation coefficients (Portaria 382/2025)
- **Full expense tracking** — acquisition costs (IMT, stamp duty, notary fees), property improvements, and sale costs
- **Reinvestment exemption** — full or partial reinvestment scenarios per Art. 10.º CIRS
- **IRS 2025 estimation** — progressive tax brackets plus solidarity surcharge (Art. 68.º CIRS)
- **Multi-scenario comparison** — pin and compare different simulations side by side
- **Shareable links** — URL-encoded snapshots for easy sharing
- **Persistent state** — form automatically saved to localStorage

## Tech Stack

- [Nuxt 4](https://nuxt.com) + Vue 3
- [@nuxt/ui v4](https://ui.nuxt.com) (includes Tailwind CSS v4)
- [VeeValidate](https://vee-validate.logaretm.com) for form state management
- [lz-string](https://github.com/pieroxy/lz-string) for URL compression
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com)

## Getting Started

**Prerequisites:** [Bun](https://bun.sh) runtime.

```bash
# Install dependencies
bun install

# Start the development server
bun run dev
```

The app will be available at `http://localhost:3000`.

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start the development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview the production build |
| `bun run lint` | Run oxlint |
| `bun run lint:fix` | Run oxlint with auto-fix |
| `bun run fmt` | Format with oxfmt |
| `bun run fmt:check` | Check formatting without modifying files |

> [!NOTE]
> Pre-commit hooks (via lefthook) automatically lint and format staged `src/**/*.{js,ts,vue}` files before each commit.

## Calculation Reference

The core formula follows Art. 43.º n.º 2 CIRS:

```
Capital Gain (MV) = Sale Value − (Acquisition Value × Coef.) − Expenses

Taxable Amount = MV × 0.5

Reinvestment (partial):
  Exempt MV = MV × (reinvested / amount to reinvest)   [Art. 10.º n.º 9 CIRS]
```

**Expense buckets:**

| Category | Items |
|----------|-------|
| Acquisition costs | IMT, stamp duty, notary/registry fees, land registry certificate |
| Property improvements | Renovation and upgrade works (with invoices) |
| Sale costs | Realtor commission, energy performance certificate |

> [!NOTE]
> Monetary devaluation coefficients only apply when the holding period is ≥ 24 months.

## Project Structure

```
src/
├── pages/index.vue              # Single-page calculator (form state via VeeValidate)
├── components/
│   ├── ResultsDisplay.vue       # Results panel
│   ├── DiffCard.vue             # Scenario comparison deltas
│   ├── CurrencyInput.vue        # Formatted currency input
│   └── InfoTooltip.vue          # Mobile-friendly tooltips
├── composables/
│   ├── useCalculations.ts       # Core calculation engine (~20 computed properties)
│   ├── usePinnedSnapshots.ts    # Multi-scenario comparison state
│   ├── useShareableLink.ts      # URL encode/decode
│   └── useSimulationStorage.ts  # localStorage persistence
├── data/
│   ├── coeficientes.ts          # Devaluation coefficients (Portaria 382/2025)
│   └── irsTabela.ts             # IRS 2025 brackets + solidarity surcharge
└── utils/formatters.ts          # pt-PT currency and percentage formatters
```

All calculation logic is isolated in `useCalculations.ts` as pure computed properties — no side effects.
