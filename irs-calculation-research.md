# IRS sobre Mais-Valias Imobiliárias — Documentação de Referência

> **Âmbito:** Residentes fiscais em Portugal, rendimentos auferidos em 2025
> **Regime:** Englobamento obrigatório (Lei n.º 24-D/2022, em vigor desde 2023)

---

## 1. Escalões IRS 2025

**Fonte:** Lei n.º 55-A/2025, de 22 de julho (OE 2025) — Art. 68.º CIRS

| Escalão | Rendimento Coletável (€) | Taxa Marginal | Taxa Média Máx. |
|---------|--------------------------|---------------|-----------------|
| 1.º | Até 8.059 | 13,0% | 13,000% |
| 2.º | 8.059 — 11.460 | 16,5% | 14,022% |
| 3.º | 11.460 — 16.037 | 22,0% | 17,122% |
| 4.º | 16.037 — 21.704 | 25,0% | 19,874% |
| 5.º | 21.704 — 28.410 | 32,0% | 23,261% |
| 6.º | 28.410 — 41.629 | 34,9% | 27,988% |
| 7.º | 41.629 — 44.987 | 37,0% | 28,612% |
| 8.º | 44.987 — 83.696 | 43,5% | 35,024% |
| 9.º | Superior a 83.696 | 48,0% | — |

### Fórmula de Cálculo (Art. 68.º n.º 1 CIRS — método de dois segmentos)

O imposto é calculado como:

```
Imposto = (Rendimento Coletável × Taxa Média do Escalão)
```

Onde a taxa média incorpora o efeito das taxas marginais de todos os escalões anteriores.

**Método alternativo (equivalente, mais didático):**

```
Imposto = Σ (amplitude de cada escalão × taxa marginal)
         para todos os escalões até ao rendimento coletável

No escalão final: (rendimento − limite inferior) × taxa marginal
```

**Exemplo com rendimento coletável de €30.000:**

| Escalão | Amplitude (€) | Taxa | Imposto (€) |
|---------|---------------|------|-------------|
| 1.º | 8.059 | 13,0% | 1.047,67 |
| 2.º | 3.401 (= 11.460 − 8.059) | 16,5% | 561,17 |
| 3.º | 4.577 (= 16.037 − 11.460) | 22,0% | 1.006,94 |
| 4.º | 5.667 (= 21.704 − 16.037) | 25,0% | 1.416,75 |
| 5.º | 6.706 (= 28.410 − 21.704) | 32,0% | 2.145,92 |
| 6.º | 1.590 (= 30.000 − 28.410) | 34,9% | 554,91 |
| **Total** | | | **6.733,36** |

---

## 2. Taxa Adicional de Solidariedade (Art. 68.º-A CIRS)

Aplica-se sobre o rendimento coletável que exceda os limiares:

| Limiar | Taxa Adicional | Incide sobre |
|--------|---------------|--------------|
| €80.000 — €250.000 | 2,5% | Valor entre €80.000 e €250.000 |
| > €250.000 | 5,0% | Valor acima de €250.000 |

**Exemplo:**
- Rendimento coletável: €120.000
- Sobretaxa = (€120.000 − €80.000) × 2,5% = €1.000

**Exemplo 2:**
- Rendimento coletável: €300.000
- Sobretaxa = (€250.000 − €80.000) × 2,5% + (€300.000 − €250.000) × 5,0%
- Sobretaxa = €4.250 + €2.500 = **€6.750**

---

## 3. Englobamento Obrigatório das Mais-Valias Imobiliárias

### Enquadramento Legal

**Lei n.º 24-D/2022, de 30 de dezembro** alterou o CIRS com efeitos a partir de 1 de janeiro de 2023:

- As mais-valias imobiliárias de **residentes** passaram a ser de **englobamento obrigatório**
- A taxa autónoma de 28% (anterior Art. 72.º para residentes) foi **revogada** para MV imobiliárias
- Em 2023, o Tribunal de Justiça da União Europeia determinou regime idêntico para **não-residentes** da UE/EEE

### Mecanismo

1. **50% da mais-valia** entra no rendimento coletável — Art. 43.º n.º 2 CIRS
2. Este valor soma-se aos restantes rendimentos do sujeito passivo
3. O conjunto é tributado pelas taxas gerais progressivas da tabela do Art. 68.º

```
Rendimento Coletável Total = outrosRendimentos + (maisValia × 0,50)
```

**Não existe opção de tributação autónoma a 28% para residentes fiscais em Portugal.**

---

## 4. Método de Cálculo do IRS Adicional (Delta)

O imposto imputável à mais-valia calcula-se pela diferença entre dois cenários:

```
IRS_adicional = imposto(outrosRendimentos + tributavelMV) − imposto(outrosRendimentos)
```

Onde:
- `outrosRendimentos` = rendimento coletável do sujeito passivo excluindo a MV
- `tributavelMV` = maisValia × 0,50 (parcela tributável, Art. 43.º n.º 2)
- `imposto(x)` = IRS calculado sobre rendimento coletável x, incluindo sobretaxa de solidariedade

### Tributação Conjunta (quociente familiar — Art. 69.º CIRS)

Em declaração conjunta (casados ou unidos de facto), aplica-se o **quociente de 2** antes de entrar na tabela, e multiplica-se o resultado por 2:

```
rendimento_para_tabela = rendimentoColetavelTotal / 2
imposto_antes_quociente = tabela(rendimento_para_tabela)
IRS_total = imposto_antes_quociente × 2
```

O delta mantém o mesmo princípio — dois cenários (com e sem tributavelMV), ambos com quociente 2.

### Exemplo Completo

**Dados:**
- Outros rendimentos coletáveis: €30.000
- Mais-valia: €55.511,40 (exemplo do CLAUDE.md)
- Tributável MV (50%): €27.755,70
- Tributação individual

**Cenário A — sem MV:** Rendimento = €30.000
- IRS = €6.733,36 (ver cálculo da secção 1)

**Cenário B — com MV:** Rendimento = €30.000 + €27.755,70 = €57.755,70

| Escalão | Amplitude (€) | Taxa | Imposto (€) |
|---------|---------------|------|-------------|
| 1.º | 8.059 | 13,0% | 1.047,67 |
| 2.º | 3.401 | 16,5% | 561,17 |
| 3.º | 4.577 | 22,0% | 1.006,94 |
| 4.º | 5.667 | 25,0% | 1.416,75 |
| 5.º | 6.706 | 32,0% | 2.145,92 |
| 6.º | 13.219 (= 41.629 − 28.410) | 34,9% | 4.613,43 |
| 7.º | 3.358 (= 44.987 − 41.629) | 37,0% | 1.242,46 |
| 8.º | 12.769 (= 57.755,70 − 44.987) | 43,5% | 5.554,52 |
| **Total** | | | **17.588,86** |

**IRS adicional = €17.588,86 − €6.733,36 = €10.855,50**

> **Nota:** Rendimento de €57.755,70 está abaixo do limiar de €80.000, pelo que não há sobretaxa de solidariedade neste exemplo.

---

## 5. Mínimo de Existência (Art. 70.º CIRS)

### Valor em 2025

```
Mínimo de existência = max(1,5 × 14 × IAS, 14 × RMMG)
                     = max(1,5 × 14 × €522,50, 14 × €870)
                     = max(€10.972,50, €12.180)
                     = €12.180
```

### Categorias de Rendimento Abrangidas

O mínimo de existência aplica-se **apenas** a rendimentos das categorias:
- **Categoria A** — trabalho dependente
- **Categoria B** — rendimentos empresariais e profissionais (em regime simplificado ou contabilidade organizada, com restrições)
- **Categoria H** — pensões

**Categoria G (mais-valias imobiliárias) — NÃO está abrangida.**

### Condições de Exclusão do Benefício

O contribuinte perde o direito ao mínimo de existência quando:

**Condição A:** Rendimento bruto total > €16.093 por sujeito passivo
- Limiar = 2,2 × 14 × IAS = 2,2 × 14 × €522,50 = €16.093

**Condição B:** Rendimentos sujeitos a taxas liberatórias > €7.315
- MV imobiliárias são tributadas como taxa especial (Art. 72.º), **não** como taxa liberatória (Art. 71.º)
- Por isso, MV imobiliárias **não contam** para este limiar

### Conclusão Prática

Na grande maioria dos casos de mais-valias imobiliárias relevantes, o rendimento bruto total do contribuinte ultrapassa €16.093, pelo que **o mínimo de existência não tem impacto no cálculo do IRS sobre a mais-valia**.

O calculador pode ignorar o mínimo de existência sem perda de precisão relevante para o utilizador típico.

---

## 6. Reinvestimento e Impacto no IRS (Art. 10.º n.º 9 CIRS)

O reinvestimento do produto da venda em habitação própria permanente reduz a mais-valia tributável:

### Reinvestimento Total

Se `valorReinvestido >= valorAReinvestir`:
- Mais-valia isenta = 100%
- Tributável = €0
- IRS sobre MV = €0

### Reinvestimento Parcial

```
fracaoIsenta = valorReinvestido / valorAReinvestir
maisValiaIsenta = maisValia × fracaoIsenta
maisValiaTributavel = maisValia × (1 − fracaoIsenta)
tributavelParaIRS = maisValiaTributavel × 0,50   (Art. 43.º n.º 2)
```

**Onde:**
```
valorAReinvestir = valorRealizacao − capitalEmDivida   (Art. 10.º n.º 5)
```

### Exemplo (CLAUDE.md — sem reinvestimento)

- MV = €55.511,40
- Tributável (50%) = €27.755,70
- IRS adicional ≈ €10.855,50 (ver secção 4)

### Exemplo com Reinvestimento Parcial

- Reinvestido: €50.000 de €107.203,07 disponíveis
- Fração isenta = 50.000 / 107.203,07 = 46,64%
- MV tributável = €55.511,40 × (1 − 46,64%) = €29.625,35
- Tributável IRS (50%) = €14.812,68

---

## 7. Fontes Legais

### Código do IRS (CIRS) — Portal das Finanças

- [Art. 10.º — Mais-Valias (definição e exclusões)](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/irs_rep/Pages/irs10.aspx)
- [Art. 43.º — Mais-Valias: determinação do saldo](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/irs_rep/Pages/irs43.aspx)
- [Art. 68.º — Taxas gerais (tabela progressiva)](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/irs_rep/Pages/irs68.aspx)
- [Art. 68.º-A — Taxa adicional de solidariedade](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/irs_rep/Pages/irs68a.aspx)
- [Art. 69.º — Quociente familiar (tributação conjunta)](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/irs_rep/Pages/irs69.aspx)
- [Art. 70.º — Mínimo de existência](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/irs_rep/Pages/irs70.aspx)
- [Art. 72.º — Taxas especiais](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/irs_rep/Pages/irs72.aspx)

### Legislação

- [Lei n.º 55-A/2025, de 22 de julho (OE 2025)](https://dre.pt/dre/detalhe/lei/55-a-2025)
- [Lei n.º 24-D/2022, de 30 de dezembro (OE 2023 — englobamento obrigatório)](https://dre.pt/dre/detalhe/lei/24-d-2022)
- [Portaria n.º 382/2025 (coeficientes de desvalorização monetária)](https://dre.pt/dre/detalhe/portaria/382-2025)

---

## 8. Notas de Implementação para o Calculador

### Inputs adicionais necessários

| Campo | Descrição | Validação |
|-------|-----------|-----------|
| `rendimentoColetavel` | Rendimento coletável sem MV (€) | >= 0 |
| `tipoTributacao` | `"individual"` ou `"conjunto"` | obrigatório |

### Algoritmo (pseudocódigo)

```typescript
function calcularImposto(rendimento: number): number {
  // Inclui sobretaxa de solidariedade
  const escaloes = [
    { limite: 8059,   taxa: 0.130 },
    { limite: 11460,  taxa: 0.165 },
    { limite: 16037,  taxa: 0.220 },
    { limite: 21704,  taxa: 0.250 },
    { limite: 28410,  taxa: 0.320 },
    { limite: 41629,  taxa: 0.349 },
    { limite: 44987,  taxa: 0.370 },
    { limite: 83696,  taxa: 0.435 },
    { limite: Infinity, taxa: 0.480 },
  ]

  let imposto = 0
  let anterior = 0
  for (const escalao of escaloes) {
    if (rendimento <= anterior) break
    const base = Math.min(rendimento, escalao.limite) - anterior
    imposto += base * escalao.taxa
    anterior = escalao.limite
  }

  // Sobretaxa de solidariedade (Art. 68.º-A)
  if (rendimento > 80000) {
    const base1 = Math.min(rendimento, 250000) - 80000
    imposto += base1 * 0.025
  }
  if (rendimento > 250000) {
    imposto += (rendimento - 250000) * 0.05
  }

  return imposto
}

function calcularIRSAdicionalMV(
  outrosRendimentos: number,
  maisValiaTributavel: number,  // já com 50% aplicado
  tipoTributacao: "individual" | "conjunto"
): number {
  const divisor = tipoTributacao === "conjunto" ? 2 : 1

  const impostoSemMV = calcularImposto(outrosRendimentos / divisor) * divisor
  const impostoComMV = calcularImposto((outrosRendimentos + maisValiaTributavel) / divisor) * divisor

  return impostoComMV - impostoSemMV
}
```

### Advertências a mostrar ao utilizador

- Estimativa baseada em englobamento — valor exato depende de deduções específicas (saúde, educação, habitação, etc.)
- Não considera deduções à coleta (dependentes, deduções pessoais)
- Para situação fiscal completa, consultar simulador da AT ou técnico de contas
