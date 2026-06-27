// ========================================
// GOOGLE SHEETS
// Dados vindos da planilha
// ========================================

const PLANILHA_ID = "1bk3bk1CcHgB1PmAMN-yZzR4ZnSaoxNLhiBfa4BcPEUI";

const URL_PARAMETROS =
  `https://docs.google.com/spreadsheets/d/${PLANILHA_ID}/gviz/tq?tqx=out:csv&gid=1869682511`;

const URL_CALENDARIO_FUNCIONAMENTO =
  `https://docs.google.com/spreadsheets/d/${PLANILHA_ID}/gviz/tq?tqx=out:csv&gid=1837692081`;


// ========================================
// DADOS GLOBAIS
// Mantém o padrão do código
// ========================================

let CONFIG = {
  ingressosOnline: "",
  googleMaps: "",
  whatsappGeral: ""
};

let VALORES_BILHETERIA = {
  semana: {
    visitante: 0,
    kids: 0,
    convidadoSocio: 0
  },

  fimDeSemana: {
    visitante: 0,
    kids: 0,
    convidadoSocio: 0
  },

  feriado: {
    visitante: 0,
    kids: 0,
    convidadoSocio: 0
  }
};

let HORARIOS_FUNCIONAMENTO = {
  semana: {
    label: "",
    horario: "",
    classe: ""
  },

  fimDeSemana: {
    label: "",
    horario: "",
    classe: ""
  },

  feriado: {
    label: "",
    horario: "",
    classe: ""
  },

  fechado: {
    label: "",
    horario: "",
    classe: ""
  }
};
