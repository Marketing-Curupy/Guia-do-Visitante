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
    .map(linha => {
      return linha
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map(celula =>
          celula
            .replace(/^"|"$/g, "")
            .replace(/""/g, '"')
            .trim()
        );
    });
}


// ========================================
// CALENDÁRIO DE FUNCIONAMENTO
// Agora vem da planilha
// ========================================

let CALENDARIOS_FUNCIONAMENTO = [];

async function carregarCalendariosFuncionamento() {
  const linhas = await carregarCSV(URL_CALENDARIO_FUNCIONAMENTO);

  const cabecalho = linhas[0];

  const dados = linhas.slice(1).map(linha => {
    const item = {};

    cabecalho.forEach((coluna, index) => {
      item[coluna] = linha[index] || "";
    });

    return item;
  });

  const meses = {};

  dados.forEach(item => {
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
      status: item.status
    };

    if (item.nome) {
      dia.nome = item.nome;
    }

    meses[chave].dias.push(dia);
  });

  CALENDARIOS_FUNCIONAMENTO = Object.values(meses);

  return CALENDARIOS_FUNCIONAMENTO;
}
