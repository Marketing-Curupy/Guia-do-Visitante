// ==========================================
// DADOS DA BARRA FIXA
// Atualize este arquivo a cada mês ou a cada dois meses.
// ==========================================
//
// data: formato AAAA-MM-DD
// status: "aberto" ou "fechado"
// horario: texto livre
// valores: bilheteria presencial do dia

const DADOS_BARRA = [
  {
    data: "2026-06-07",
    status: "aberto",
    horario: "08h30 às 17h30",
    valores: {
      visitante: 86,
      kids: 45,
      convidadoSocio: 50
    }
  },
  {
    data: "2026-06-08",
    status: "fechado",
    horario: "",
    valores: {
      visitante: "",
      kids: "",
      convidadoSocio: ""
    }
  },
  {
    data: "2026-06-09",
    status: "fechado",
    horario: "",
    valores: {
      visitante: "",
      kids: "",
      convidadoSocio: ""
    }
  },
  {
    data: "2026-06-10",
    status: "aberto",
    horario: "09h às 17h30",
    valores: {
      visitante: 86,
      kids: 45,
      convidadoSocio: 50
    }
  },
  {
    data: "2026-06-11",
    status: "aberto",
    horario: "09h às 17h30",
    valores: {
      visitante: 86,
      kids: 45,
      convidadoSocio: 50
    }
  },
  {
    data: "2026-06-12",
    status: "aberto",
    horario: "09h às 17h30",
    valores: {
      visitante: 86,
      kids: 45,
      convidadoSocio: 50
    }
  },
  {
    data: "2026-06-13",
    status: "aberto",
    horario: "08h30 às 17h30",
    valores: {
      visitante: 86,
      kids: 45,
      convidadoSocio: 50
    }
  },
  {
    data: "2026-06-14",
    status: "aberto",
    horario: "08h30 às 17h30",
    valores: {
      visitante: 86,
      kids: 45,
      convidadoSocio: 50
    }
  }
];

// Links gerais usados na página
const CONFIG = {
  ingressosOnline: "http://172.19.0.6:3003/ingressos",
  googleMaps: "https://maps.google.com/?q=Curupy+Sinop+MT",
  whatsappGeral: "https://wa.me/5500000000000"
};
