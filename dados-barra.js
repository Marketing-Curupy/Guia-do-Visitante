// ========================================
// GOOGLE SHEETS
// Dados vindos da planilha
// ========================================

const PLANILHA_ID = "1bk3bk1CcHgB1PmAMN-yZzR4ZnSaoxNLhiBfa4BcPEUI";

const URL_PARAMETROS =
  `https://docs.google.com/spreadsheets/d/${PLANILHA_ID}/gviz/tq?tqx=out:csv&gid=1869682511`;


// ========================================
// DADOS GLOBAIS
// ========================================

let CONFIG = {
  ingressosOnline: "",
  googleMaps: "",
  whatsappGeral: ""
};

let HORARIOS_FUNCIONAMENTO = {};


// ========================================
// CONFIG E HORÁRIOS
// ========================================

async function carregarParametrosGerais() {
  const linhas = await carregarCSV(URL_PARAMETROS);

  linhas.forEach((linha) => {
    const tipo = linha[0];
    const coluna1 = linha[1];
    const coluna2 = linha[2];
    const coluna3 = linha[3];
    const coluna4 = linha[4];

    if (tipo === "config") {
      CONFIG[coluna1] = coluna2;
    }

    if (tipo === "horario") {
      HORARIOS_FUNCIONAMENTO[coluna1] = {
        label: coluna2,
        horario: coluna3,
        classe: coluna4
      };
    }
  });
}
