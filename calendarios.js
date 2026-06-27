// ========================================
// GOOGLE SHEETS
// Dados vindos da planilha
// ========================================

const URL_CALENDARIO_FUNCIONAMENTO =
  `https://docs.google.com/spreadsheets/d/${PLANILHA_ID}/gviz/tq?tqx=out:csv&gid=1837692081`;


// ========================================
// LEITOR CSV
// ========================================

async function carregarCSV(url) {
  const response = await fetch(url);
  const texto = await response.text();

  return texto
    .trim()
    .split("\n")
    .map((linha) => {
      return linha
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((celula) =>
          celula
            .replace(/^"|"$/g, "")
            .replace(/""/g, '"')
            .trim()
        );
    });
}


// ========================================
// CONVERTER VALORES
// Aceita: 57 | 57.00 | 57,00 | R$ 57,00
// ========================================

function converterValor(valor) {
  if (valor === "" || valor === null || valor === undefined) return 0;

  return Number(
    String(valor)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  ) || 0;
}


// ========================================
// CALENDÁRIO DE FUNCIONAMENTO
// Agora vem da planilha
// ========================================

let CALENDARIOS_FUNCIONAMENTO = [];

async function carregarCalendariosFuncionamento() {
  const linhas = await carregarCSV(URL_CALENDARIO_FUNCIONAMENTO);

  if (!linhas.length) {
    CALENDARIOS_FUNCIONAMENTO = [];
    return CALENDARIOS_FUNCIONAMENTO;
  }

  const cabecalho = linhas[0];

  const dados = linhas.slice(1).map((linha) => {
    const item = {};

    cabecalho.forEach((coluna, index) => {
      item[coluna] = linha[index] || "";
    });

    return item;
  });

  const meses = {};

  dados.forEach((item) => {
    if (!item.mes || !item.ano || !item.dia || !item.status) return;

    const chave = `${item.mes}-${item.ano}`;

    if (!meses[chave]) {
      meses[chave] = {
        mes: item.mes,
        ano: item.ano,
        observacao: item.observacao || "",
        dias: []
      };
    }

    const dia = {
      dia: Number(item.dia),
      status: item.status,

      visitante: converterValor(item.visitante),
      kids: converterValor(item.kids),
      convidadoSocio: converterValor(item.convidadoSocio)
    };

    if (item.nome) {
      dia.nome = item.nome;
    }

    meses[chave].dias.push(dia);
  });

  CALENDARIOS_FUNCIONAMENTO = Object.values(meses).map((calendario) => {
    calendario.dias.sort((a, b) => a.dia - b.dia);
    return calendario;
  });

  return CALENDARIOS_FUNCIONAMENTO;
}
