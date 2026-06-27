const CONFIG = {
  ingressosOnline: "ingressos/index.html",
 googleMaps: "https://www.google.com/maps/dir/?api=1&destination=-11.8015771,-55.4722897&travelmode=driving",
  whatsappGeral: "https://wa.me/556630153214"
};

const VALORES_BILHETERIA = {
  semana: {
    visitante: 86,
    kids: 40,
    convidadoSocio: 50
  },

  fimDeSemana: {
    visitante: 124,
    kids: 60,
    convidadoSocio: 78
  },

  feriado: {
    visitante: 124,
    kids: 60,
    convidadoSocio: 78
  }
};

const HORARIOS_FUNCIONAMENTO = {
  semana: {
    horario: "09h às 17h30",
    classe: "dia-semana"
  },

  fimDeSemana: {
    horario: "08h30 às 17h30",
    classe: "dia-fim-semana"
  },

  feriado: {
    horario: "08h30 às 17h30",
    classe: "dia-feriado"
  },

  fechado: {
    horario: "Fechado",
    classe: "dia-fechado"
  }
};
