# Mais-Valias Calculator

## Stack
- Nuxt 4 + @nuxt/ui v4 (bundles Tailwind CSS v4)
- Package manager: bun
- No separate Tailwind install needed — `@nuxt/ui` handles it

## Key Files
- `nuxt.config.ts` — modules: ['@nuxt/ui'], css: ['~/assets/css/main.css']
- `app/assets/css/main.css` — @import "tailwindcss"; @import "@nuxt/ui";
- `app/app.vue` — <UApp><NuxtPage /></UApp>
- `app/pages/index.vue` — main calculator SPA
- `app/components/ResultsDisplay.vue` — results panel
- `app/data/coeficientes.ts` — monetary coefficient table (Portaria 382/2025)

## Calculation Logic
- MV = VR − (VA × Coef.) − encargosValorizacao − despesasAquisicao − despesasAlienacao
- Tributável = MV × 0.5  (Art. 43.º n.º 2 CIRS)
- Valor a reinvestir = VR − capitalEmDivida  (Art. 10.º n.º 5 CIRS)
- Reinvestimento parcial: MV isenta = MV × (reinvestido / valorAReinvestir)  (Art. 10.º n.º 9 CIRS)

## Reference Example (from guide)
Compra 185.000€ (2023), Venda 270.000€ (2025), Coef 1.02
→ MV = 55.511,40 €, Valor a reinvestir = 107.203,07 €

## Nuxt UI Notes
- `USelect`: use `value-key` and `label-key` props; items: `[{ label: '2025', value: 2025 }]`
