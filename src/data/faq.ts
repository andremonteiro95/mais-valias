export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  legal?: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  icon: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "conceitos",
    label: "Conceitos básicos",
    icon: "i-lucide-book-open",
    items: [
      {
        id: "o-que-e-mais-valia",
        question: "O que é uma mais-valia imobiliária?",
        answer:
          "É o ganho obtido com a venda de um imóvel: a diferença entre o valor de venda e o custo ajustado (valor de aquisição atualizado pelo coeficiente de desvalorização, menos as despesas dedutíveis). Quando o resultado é negativo, chama-se menos-valia.",
        legal: "Art. 10.º, n.º 1, al. a) CIRS",
      },
      {
        id: "como-e-calculada",
        question: "Como é calculada a mais-valia?",
        answer:
          "Fórmula: MV = VR − (VA × Coef.) − Encargos de valorização − Despesas de aquisição − Despesas de alienação\n\nOnde VR é o valor de realização (venda), VA é o valor de aquisição (compra) e Coef. é o coeficiente de desvalorização (apenas aplicável se decorreram ≥ 24 meses entre aquisição e venda).\n\nPara residentes em Portugal, apenas 50% da mais-valia é tributada.",
        legal: "Art. 43.º a 51.º CIRS",
      },
      {
        id: "coeficiente",
        question: "O que é o coeficiente de desvalorização da moeda?",
        answer:
          "É um fator que corrige a inflação, multiplicado pelo valor de aquisição para apurar o custo fiscal atualizado. É publicado anualmente por Portaria do Governo.\n\nApenas se aplica quando decorrem 24 ou mais meses entre a data de aquisição e a data de venda. Quando ainda não está publicada a Portaria do ano de venda, usa-se o coeficiente do ano anterior como estimativa.",
        legal: "Art. 50.º CIRS — Portaria n.º 382/2025/1",
      },
      {
        id: "quem-e-tributado",
        question: "Quem está sujeito a tributação? Residentes e não residentes pagam o mesmo?",
        answer:
          "Residentes fiscais em Portugal: 50% da mais-valia é englobada nos rendimentos do ano e tributada pelas taxas progressivas do IRS (até 53% + sobretaxa de solidariedade).\n\nNão residentes: sujeitos a taxas e regras distintas, incluindo possíveis convenções de dupla tributação. Esta calculadora destina-se exclusivamente a residentes fiscais em Portugal.",
        legal: "Art. 43.º, n.º 2 e Art. 72.º CIRS",
      },
      {
        id: "menos-valia",
        question: "O que é uma menos-valia e posso aproveitá-la?",
        answer:
          "Quando o valor de venda é inferior ao custo ajustado, obtém-se uma menos-valia (resultado negativo). Esta não é tributada, mas também não é imediatamente dedutível.\n\nO saldo negativo pode ser reportado e deduzido a mais-valias imobiliárias nos cinco anos seguintes. Este reporte aplica-se apenas a residentes fiscais em Portugal.",
        legal: "Art. 55.º CIRS",
      },
    ],
  },
  {
    id: "despesas",
    label: "Despesas dedutíveis",
    icon: "i-lucide-receipt",
    items: [
      {
        id: "despesas-dedutiveis",
        question: "Que despesas posso deduzir à mais-valia?",
        answer:
          "São dedutíveis três categorias:\n\n1. Despesas da aquisição: IMT, Imposto de Selo, emolumentos de escritura, certidões do Registo Predial.\n2. Encargos de valorização: obras realizadas nos últimos 12 anos que valorizem o imóvel, devidamente documentadas.\n3. Despesas da alienação: comissão imobiliária (com fatura), certificado energético (obrigatório).\n\nCada euro de despesa dedutível reduz diretamente a mais-valia tributável.",
        legal: "Art. 51.º CIRS",
      },
      {
        id: "comissoes-bancarias",
        question: "As comissões bancárias do crédito habitação são dedutíveis?",
        answer:
          "Não. A AT distingue claramente os custos da aquisição do imóvel dos custos do seu financiamento.\n\nNão são dedutíveis: comissão de dossier, comissão de formalização, avaliação bancária, registo de hipoteca, seguro de vida associado ao crédito.\n\nSão dedutíveis: IMT, Imposto de Selo da aquisição, emolumentos da escritura de compra e venda.",
        legal: "Art. 51.º CIRS",
      },
      {
        id: "requisitos-obras",
        question: "Que requisitos têm de ter as obras para serem dedutíveis?",
        answer:
          "A partir de 2025, a AT exige simultaneamente:\n\n1. Fatura com o NIF do proprietário (emitida em nome do contribuinte).\n2. Pagamento comprovado por meio rastreável: transferência bancária, Multibanco, cartão de débito ou crédito. Pagamentos em numerário não são aceites.\n3. Obras realizadas nos últimos 12 anos relativamente à data de venda.\n4. Obras que valorizem o imóvel (benfeitorias) — não são aceites obras de simples manutenção.",
        legal: "Art. 51.º CIRS — CAAD Proc. 634/2023",
      },
      {
        id: "comissao-imobiliaria-iva",
        question: "A comissão da imobiliária com IVA é dedutível na totalidade?",
        answer:
          "Sim, o valor total da fatura incluindo IVA é dedutível, desde que exista fatura emitida em nome do vendedor. A comissão imobiliária é considerada uma despesa inerente à alienação.\n\nHabitualmente representa entre 3% e 5% do valor de venda.",
        legal: "Art. 51.º, n.º 1, al. b) CIRS",
      },
      {
        id: "imovel-herdado-va",
        question: "O imóvel foi herdado — qual é o valor de aquisição?",
        answer:
          "O valor de aquisição para efeitos fiscais é o valor que serviu de base à liquidação do Imposto do Selo da herança (Verba 1.2 da TGIS), que corresponde geralmente ao valor patrimonial tributário (VPT) à data da herança.\n\nA data de aquisição é a data do óbito do autor da herança. Se o imóvel foi adquirido pelo falecido antes de 1989, a mais-valia pode estar excluída de tributação.",
        legal: "Art. 45.º CIRS",
      },
    ],
  },
  {
    id: "reinvestimento",
    label: "Reinvestimento em HPP",
    icon: "i-lucide-house",
    items: [
      {
        id: "condicoes-isencao",
        question: "Quais são as condições para beneficiar da isenção por reinvestimento?",
        answer:
          "Têm de se verificar TODAS as seguintes condições:\n\n1. O imóvel vendido é a habitação própria e permanente (HPP) do vendedor.\n2. Reinvestimento em nova HPP entre 24 meses antes e 36 meses após a data de venda.\n3. Apenas capitais próprios elegíveis — a parte financiada por novo crédito não conta.\n4. Domicílio fiscal no imóvel alienado nos 12 meses anteriores à venda (DL n.º 57/2024).\n5. Declaração de intenção de reinvestir no Quadro 5-A do Anexo G no ano da venda.",
        legal: "Art. 10.º, n.º 5 CIRS — DL n.º 57/2024",
      },
      {
        id: "prazo-reinvestimento",
        question: "Qual é o prazo para reinvestir?",
        answer:
          "O reinvestimento deve ocorrer entre 24 meses antes e 36 meses após a data da escritura de venda.\n\nAntes da venda: se adquiriu a nova HPP nos 24 meses anteriores, pode aplicar o produto da venda a esse reinvestimento (ex: amortizar o crédito da nova casa).\n\nApós a venda: tem até 36 meses para concluir a aquisição da nova HPP.\n\nAtenção: se ainda não reinvestiu na data de entrega do IRS, deve obrigatoriamente declarar a intenção no Quadro 5-A do Anexo G.",
        legal: "Art. 10.º, n.º 5, al. b) CIRS",
      },
      {
        id: "capital-em-divida",
        question: "O capital em dívida reduz o valor que tenho de reinvestir — porquê?",
        answer:
          "A isenção por reinvestimento aplica-se apenas ao capital próprio: o valor de venda menos o montante do empréstimo habitação em dívida à data da venda.\n\nA lógica é que a parte financiada pelo banco será usada para liquidar o crédito existente — não fica disponível para reinvestir. Apenas o valor líquido que o vendedor recebe efetivamente é elegível para exclusão de tributação.\n\nExemplo: Venda por 270.000€ com 163.000€ de capital em dívida → valor a reinvestir = 107.000€.",
        legal: "Art. 10.º, n.º 5, al. a) CIRS",
      },
      {
        id: "compra-antes-venda",
        question: "Já comprei a nova casa antes de vender a antiga — posso reinvestir?",
        answer:
          "Sim. O prazo de 24 meses antes da venda permite exatamente esta situação.\n\nO produto da venda deve ser aplicado a amortizar o crédito habitação da nova casa (amortização extraordinária) ou ao pagamento do preço restante. A operação deve ser documentada e declarada no Quadro 5-A do Anexo G no ano da venda.",
        legal: "Art. 10.º, n.º 5, al. b) CIRS",
      },
      {
        id: "imovel-construcao",
        question: "Posso reinvestir em imóvel em construção ou comprado na planta?",
        answer:
          "Sim, desde que a aquisição seja formalizada (escritura definitiva ou contrato-promessa com tradição de posse) dentro do prazo de 36 meses após a venda. O reinvestimento em construção de habitação própria também é elegível.\n\nGuarde toda a documentação: contratos-promessa, recibos de pagamento, licenças de construção.",
        legal: "Art. 10.º, n.º 5 CIRS",
      },
      {
        id: "reinvestimento-parcial",
        question: "O que é o reinvestimento parcial e como é calculada a isenção?",
        answer:
          "Quando reinveste apenas uma parte do valor elegível, a isenção é proporcional:\n\nMV isenta = MV total × (valor reinvestido / valor a reinvestir)\n\nExemplo: MV = 60.000€, valor a reinvestir = 100.000€, valor reinvestido = 70.000€\n→ MV isenta = 60.000€ × 70% = 42.000€\n→ MV tributável (após reinvestimento) = 18.000€ × 50% = 9.000€",
        legal: "Art. 10.º, n.º 9 CIRS",
      },
    ],
  },
  {
    id: "declaracao",
    label: "Declaração de IRS",
    icon: "i-lucide-file-text",
    items: [
      {
        id: "como-declarar",
        question: "Em que quadro do Anexo G declaro a mais-valia?",
        answer:
          "A mais-valia imobiliária é declarada no Quadro 4 do Anexo G da Modelo 3 (campo 401 — alienação de imóveis).\n\nSe pretender beneficiar da isenção por reinvestimento, preencha também o Quadro 5-A (intenção de reinvestir) no ano da venda — mesmo que o reinvestimento ainda não esteja concluído.\n\nNos anos seguintes, se o reinvestimento for concluído, declare os valores no Quadro 5-B ou 5-C conforme o momento do reinvestimento.",
        legal: "Art. 57.º CIRS — Instrução n.º 1/2023 AT",
      },
      {
        id: "declarar-intencao",
        question:
          "Tenho de declarar a intenção de reinvestir mesmo que ainda não tenha reinvestido?",
        answer:
          "Sim, obrigatoriamente. A declaração de intenção no Quadro 5-A do Anexo G no ano da venda é uma condição essencial para beneficiar da isenção — não é opcional.\n\nA falta desta declaração impede definitivamente o acesso ao benefício, mesmo que o reinvestimento venha a ser concluído dentro do prazo legal.\n\nEsta declaração deve ser feita mesmo que o reinvestimento já esteja concluído à data de entrega do IRS.",
        legal: "Art. 10.º, n.º 6 CIRS",
      },
      {
        id: "nao-reinvestir-prazo",
        question: "E se não reinvestir dentro do prazo — o que acontece?",
        answer:
          "Se declarou intenção de reinvestir e não o concretizar dentro dos 36 meses, fica obrigado a entregar uma declaração de substituição referente ao ano da venda no ano em que o prazo expira.\n\nO imposto em falta é exigível acrescido de juros compensatórios calculados desde o prazo de pagamento voluntário original.\n\nRecomenda-se acompanhamento por contabilista certificado nestas situações.",
        legal: "Art. 10.º, n.º 6 e 7 CIRS",
      },
      {
        id: "englobamento",
        question: "Como funciona o englobamento obrigatório desde 2023?",
        answer:
          "Desde 2023, as mais-valias imobiliárias de residentes são obrigatoriamente englobadas: somam-se a todos os outros rendimentos do ano e são tributadas pelas taxas progressivas do IRS.\n\nIsso significa que a taxa efetiva pode atingir 48% + sobretaxa de solidariedade (2,5% ou 5%) nos escalões mais elevados. Não existe a opção pela taxa autónoma de 28% que existia anteriormente.\n\nPor isso é importante considerar o rendimento coletável total do ano da venda ao calcular o imposto estimado.",
        legal: "Art. 43.º, n.º 2 e Art. 68.º CIRS — Lei n.º 24-D/2022",
      },
      {
        id: "compensar-menos-valias",
        question: "Posso compensar a mais-valia com menos-valias de outros imóveis?",
        answer:
          "Sim. O saldo entre mais e menos-valias imobiliárias é apurado globalmente no mesmo ano fiscal. Se tiver mais-valias num imóvel e menos-valias noutro, compensam-se.\n\nSe o saldo global for negativo, esse valor pode ser reportado e deduzido a mais-valias imobiliárias dos cinco anos seguintes.",
        legal: "Art. 55.º CIRS",
      },
    ],
  },
  {
    id: "casos-especiais",
    label: "Casos especiais",
    icon: "i-lucide-layers",
    items: [
      {
        id: "adquirido-antes-1989",
        question: "O imóvel foi adquirido antes de 1989 — estou isento?",
        answer:
          "Sim. Imóveis adquiridos antes de 1 de janeiro de 1989 estão excluídos de tributação de mais-valias, independentemente do valor de venda ou da mais-valia apurada.\n\nEsta exclusão aplica-se à data de aquisição original — em caso de herança, usa-se a data de óbito do autor da herança, não a data de aquisição pelo falecido.",
        legal: "Art. 5.º do DL n.º 442-A/88 (CIRS original)",
      },
      {
        id: "propriedade-conjunta",
        question: "Imóvel em propriedade conjunta — como funciona?",
        answer:
          "Cada comproprietário declara a sua quota-parte da mais-valia (habitualmente 50% para casais) na respetiva declaração de IRS.\n\nA isenção por reinvestimento é apreciada individualmente: cada cônjuge tem de cumprir os requisitos separadamente (domicílio fiscal, intenção de reinvestir, valor reinvestido). Em tributação conjunta, a mais-valia é declarada mas o IRS é calculado com o quociente familiar.",
        legal: "Art. 10.º e Art. 69.º CIRS",
      },
      {
        id: "doacao",
        question: "Recebi o imóvel por doação — como calculo o valor de aquisição?",
        answer:
          "O valor de aquisição corresponde ao valor que serviu de base à liquidação do Imposto do Selo na doação (Verba 1.2 da TGIS), que em regra é o VPT à data da doação.\n\nA data de aquisição é a data da escritura de doação. Se o imóvel foi adquirido pelo doador antes de 1989 e houve tributação do donatário ao abrigo do Código do IS, a regra pode variar — consulte um contabilista.",
        legal: "Art. 45.º CIRS",
      },
    ],
  },
];

export function getAllFaqItems(): FaqItem[] {
  return FAQ_CATEGORIES.flatMap((cat) => cat.items);
}
