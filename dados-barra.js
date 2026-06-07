// ========================================
// DADOS DA BARRA FIXA
// Atualizar conforme calendário vigente
// ========================================

const DADOS_BARRA = [
  {
    data: "2026-06-03",
    status: "aberto",
    horario: "09h às 17h30",
    valores: {
      visitante: 86,
      kids: 45,
      convidadoSocio: 55
    }
  },

  {
    data: "2026-06-04",
    status: "aberto",
    horario: "08h30 às 17h30",
    valores: {
      visitante: 124,
      kids: 55,
      convidadoSocio: 78
    }
  },

  {
    data: "2026-06-05",
    status: "aberto",
    horario: "09h às 17h30",
    valores: {
      visitante: 86,
      kids: 45,
      convidadoSocio: 55
    }
  },

  {
    data: "2026-06-06",
    status: "aberto",
    horario: "08h30 às 17h30",
    valores: {
      visitante: 124,
      kids: 55,
      convidadoSocio: 78
    }
  },

  {
    data: "2026-06-07",
    status: "aberto",
    horario: "08h30 às 17h30",
    valores: {
      visitante: 124,
      kids: 55,
      convidadoSocio: 78
    }
  }
];

const CONFIG = {
  ingressosOnline: "http://172.19.0.6:3000/ingressos",
  googleMaps: "https://maps.google.com/?q=Curupy+Acqua+Park",
  whatsappGeral: "https://wa.me/5566999999999"
};
