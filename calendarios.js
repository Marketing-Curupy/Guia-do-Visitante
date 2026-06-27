// ========================================
// GOOGLE SHEETS
// Dados vindos da planilha
// ========================================

const PLANILHA_ID = "1bk3bk1CcHgB1PmAMN-yZzR4ZnSaoxNLhiBfa4BcPEUI";

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


// ========================================
// TIPOS DE FUNCIONAMENTO
// Mantém igual para preservar o layout
// ========================================

const HORARIOS_FUNCIONAMENTO = {
  semana: {
    label: "Parque aberto",
    horario: "09h às 17h30",
    classe: "dia-semana"
  },

  fimDeSemana: {
    label: "Parque aberto",
    horario: "08h30 às 17h30",
    classe: "dia-fim-semana"
  },

  feriado: {
    label: "Parque aberto",
    horario: "08h30 às 17h30",
    classe: "dia-feriado"
  },

  fechado: {
    label: "Parque fechado",
    horario: "Fechado",
    classe: "dia-fechado"
  }
};
