// ========================================
// CALENDÁRIO DE FUNCIONAMENTO
// Atualizar a cada mês ou a cada dois meses
// ========================================

const CALENDARIOS_FUNCIONAMENTO = [
  {
    mes: "Junho",
    ano: "2026",
    observacao:
      "Consulte abaixo os dias de funcionamento do parque em junho.",
    dias: [
      { dia: 1, status: "fechado" },
      { dia: 2, status: "fechado" },
      { dia: 3, status: "semana" },
      { dia: 4, status: "feriado", nome: "Corpus Christi" },
      { dia: 5, status: "semana" },
      { dia: 6, status: "fimDeSemana" },
      { dia: 7, status: "fimDeSemana" },

      { dia: 8, status: "fechado" },
      { dia: 9, status: "fechado" },
      { dia: 10, status: "semana" },
      { dia: 11, status: "semana" },
      { dia: 12, status: "semana" },
      { dia: 13, status: "feriado", nome: "Padroeiro de Sinop" },
      { dia: 14, status: "fimDeSemana" },

      { dia: 15, status: "fechado" },
      { dia: 16, status: "fechado" },
      { dia: 17, status: "semana" },
      { dia: 18, status: "semana" },
      { dia: 19, status: "semana" },
      { dia: 20, status: "fimDeSemana" },
      { dia: 21, status: "fimDeSemana" },

      { dia: 22, status: "fechado" },
      { dia: 23, status: "fechado" },
      { dia: 24, status: "semana" },
      { dia: 25, status: "semana" },
      { dia: 26, status: "semana" },
      { dia: 27, status: "fimDeSemana" },
      { dia: 28, status: "fimDeSemana" },

      { dia: 29, status: "fechado" },
      { dia: 30, status: "fechado" }
    ]
  },

  {
    mes: "Julho",
    ano: "2026",
    observacao:
      "Mês de férias: parque aberto todos os dias em julho.",
    dias: [
      { dia: 1, status: "semana" },
      { dia: 2, status: "semana" },
      { dia: 3, status: "semana" },
      { dia: 4, status: "fimDeSemana" },
      { dia: 5, status: "fimDeSemana" },

      { dia: 6, status: "semana" },
      { dia: 7, status: "semana" },
      { dia: 8, status: "semana" },
      { dia: 9, status: "semana" },
      { dia: 10, status: "semana" },
      { dia: 11, status: "fimDeSemana" },
      { dia: 12, status: "fimDeSemana" },

      { dia: 13, status: "semana" },
      { dia: 14, status: "semana" },
      { dia: 15, status: "semana" },
      { dia: 16, status: "semana" },
      { dia: 17, status: "semana" },
      { dia: 18, status: "fimDeSemana" },
      { dia: 19, status: "fimDeSemana" },

      { dia: 20, status: "semana" },
      { dia: 21, status: "semana" },
      { dia: 22, status: "semana" },
      { dia: 23, status: "semana" },
      { dia: 24, status: "semana" },
      { dia: 25, status: "fimDeSemana" },
      { dia: 26, status: "fimDeSemana" },

      { dia: 27, status: "semana" },
      { dia: 28, status: "semana" },
      { dia: 29, status: "semana" },
      { dia: 30, status: "semana" },
      { dia: 31, status: "semana" }
    ]
  }
];

// ========================================
// TIPOS DE FUNCIONAMENTO
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
