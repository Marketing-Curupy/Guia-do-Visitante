function $(selector) {
  return document.querySelector(selector);
}

function abrirModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.classList.add("open");

  if (id === "modalCalendario") {
    renderizarCalendarios();
  }
function fecharModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.classList.remove("open");
}

function hojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);

  return data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit"
  });
}

function formatarMoeda(valor) {
  if (valor === "" || valor === null || valor === undefined) return "";

  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/* BARRA FIXA */

function buscarDiaAtual() {
  const hoje = hojeISO();
  return DADOS_BARRA.find((item) => item.data === hoje);
}

function buscarProximaAbertura() {
  const hoje = hojeISO();

  return DADOS_BARRA
    .filter((item) => item.status === "aberto" && item.data > hoje)
    .sort((a, b) => a.data.localeCompare(b.data))[0];
}

function renderizarBarra() {
  const barra = $("#barraStatus");
  if (!barra) return;

  const diaAtual = buscarDiaAtual();

  if (diaAtual && diaAtual.status === "aberto") {
    const valores = diaAtual.valores;

    barra.innerHTML = `
      <div class="barra-inner">
        <div class="barra-status">
          <strong>🟢 Parque aberto hoje</strong>
          <span>${formatarData(diaAtual.data)}</span>
          <span>${diaAtual.horario}</span>
        </div>

        <div class="barra-precos">
          <span class="barra-precos-title">🎟️ Bilheteria hoje:</span>
          <span class="preco-pill">Visitante ${formatarMoeda(valores.visitante)}</span>
          <span class="preco-pill">Kids ${formatarMoeda(valores.kids)}</span>
          <span class="preco-pill">Convidado ${formatarMoeda(valores.convidadoSocio)}</span>
        </div>

        <button class="link-meia" onclick="abrirModal('modalMeia')">
          ℹ️ Ver regras de meia-entrada
        </button>
      </div>
    `;

    return;
  }

  const proxima = buscarProximaAbertura();

  barra.innerHTML = `
    <div class="barra-inner">
      <div class="barra-status">
        <strong style="color:#e03131;">🔴 Parque fechado hoje</strong>
        <span>Próximo dia de abertura: ${
          proxima ? formatarData(proxima.data) : "em breve"
        }</span>
      </div>

      <button class="link-meia" onclick="abrirModal('modalMeia')">
        ℹ️ Ver regras de meia-entrada
      </button>
    </div>
  `;
}
/* CALENDÁRIO DE FUNCIONAMENTO */

function renderizarCalendarios() {
  const container = $("#calendariosContainer");
  if (!container) return;

  const botoes = CALENDARIOS_FUNCIONAMENTO
    .map((calendario, index) => {
      return `
        <button onclick="mostrarCalendario(${index})">
          ${calendario.mes} ${calendario.ano}
        </button>
      `;
    })
    .join("");

  container.innerHTML = `
    <p>Selecione o mês para consultar os dias e horários de funcionamento.</p>

    <div class="calendarios-tabs">
      ${botoes}
    </div>

    <div id="calendarioRenderizado"></div>
  `;

  mostrarCalendario(0);
}

function obterNumeroMes(nomeMes) {
  const meses = {
    Janeiro: 0,
    Fevereiro: 1,
    Março: 2,
    Abril: 3,
    Maio: 4,
    Junho: 5,
    Julho: 6,
    Agosto: 7,
    Setembro: 8,
    Outubro: 9,
    Novembro: 10,
    Dezembro: 11
  };

  return meses[nomeMes];
}

function mostrarCalendario(index) {
  const calendario = CALENDARIOS_FUNCIONAMENTO[index];
  const destino = $("#calendarioRenderizado");

  if (!calendario || !destino) return;

  const mesNumero = obterNumeroMes(calendario.mes);

  const primeiroDiaSemana = new Date(
    Number(calendario.ano),
    mesNumero,
    1
  ).getDay();

  const espacosVazios = Array.from({ length: primeiroDiaSemana })
    .map(() => `<div></div>`)
    .join("");

  const dias = calendario.dias
    .map((dia) => {
      const info = HORARIOS_FUNCIONAMENTO[dia.status];
      if (!info) return "";

      return `
        <button
          class="cal-dia ${info.classe}"
          onclick="abrirInfoDia(${index}, ${dia.dia})"
        >
          <strong>${dia.dia}</strong>
          <span>${dia.status === "fechado" ? "Fechado" : info.horario}</span>
        </button>
      `;
    })
    .join("");

  destino.innerHTML = `
    <div class="calendario-funcionamento">
      <h3>${calendario.mes} ${calendario.ano}</h3>
      <p>${calendario.observacao}</p>

      <div class="legenda-funcionamento">
        <span><b class="legenda-cor semana"></b> Dias de semana: 09h às 17h30</span>
        <span><b class="legenda-cor fim"></b> Fins de semana: 08h30 às 17h30</span>
        <span><b class="legenda-cor feriado"></b> Feriados e datas especiais: 08h30 às 17h30</span>
        <span><b class="legenda-cor fechado"></b> Parque fechado</span>
      </div>

      <div class="cal-grid">
        <div>Dom</div>
        <div>Seg</div>
        <div>Ter</div>
        <div>Qua</div>
        <div>Qui</div>
        <div>Sex</div>
        <div>Sáb</div>

        ${espacosVazios}
        ${dias}
      </div>
    </div>
  `;
}

function abrirInfoDia(indexCalendario, numeroDia) {
  const calendario = CALENDARIOS_FUNCIONAMENTO[indexCalendario];
  if (!calendario) return;

  const dia = calendario.dias.find((item) => item.dia === numeroDia);
  if (!dia) return;

  const info = HORARIOS_FUNCIONAMENTO[dia.status];
  const conteudo = $("#conteudoDiaCalendario");

  if (!info || !conteudo) return;

  const dataTexto = `${String(numeroDia).padStart(2, "0")} de ${
    calendario.mes
  } de ${calendario.ano}`;

  if (dia.status === "fechado") {
    conteudo.innerHTML = `
      <div class="dia-info fechado">
        <h2>📅 ${dataTexto}</h2>

        <div class="dia-status vermelho">
          🔴 Parque fechado
        </div>

        <p>O parque não estará em funcionamento nesta data.</p>

        <p>Consulte outra data disponível no calendário para planejar sua visita.</p>
      </div>
    `;

    abrirModal("modalDiaCalendario");
    return;
  }

  conteudo.innerHTML = `
    <div class="dia-info">
      <h2>📅 ${dataTexto}</h2>

      <div class="dia-status verde">
        🟢 Parque aberto
      </div>

      <div class="dia-bloco">
        <strong>⏰ Horário de funcionamento</strong>
        <p>${info.horario}</p>
      </div>

      <div class="dia-bloco destaque-online">
        <strong>🎟️ Compra antecipada pelo site</strong>

        <p>
          Comprando pelo site oficial, você garante desconto exclusivo online,
          parcelamento e mais praticidade na entrada.
        </p>

        <ul>
          <li>Compras online devem ser realizadas com pelo menos 1 dia de antecedência.</li>
          <li>Não é possível comprar online para utilizar no mesmo dia.</li>
          <li>Para uso no mesmo dia, a compra é realizada exclusivamente na bilheteria do parque.</li>
        </ul>
      </div>
    </div>
  `;

  abrirModal("modalDiaCalendario");
}

/* AJUDA */

const AJUDA = [
  {
    pergunta: "Posso comprar ingresso para hoje pelo site?",
    resposta:
      "Não. Compras online devem ser realizadas com pelo menos 1 dia de antecedência."
  },
  {
    pergunta: "Posso comprar ingresso na bilheteria?",
    resposta:
      "Sim. A bilheteria funciona presencialmente nos dias de abertura do parque."
  },
  {
    pergunta: "Criança paga ingresso?",
    resposta:
      "Crianças de 0 a 4 anos têm entrada gratuita mediante documento oficial com foto. De 5 a 11 anos utilizam ingresso Kids. A partir de 12 anos utilizam ingresso Visitante."
  },
  {
    pergunta: "Posso levar alimentos e bebidas?",
    resposta:
      "Não é permitida a entrada com alimentos e bebidas. Exceções: água para consumo pessoal, leite e alimentação para bebês, e alimentos para visitantes com restrições alimentares ou condições de saúde específicas mediante laudo ou documento comprobatório."
  },
  {
    pergunta: "Tem estacionamento?",
    resposta: "Sim. O estacionamento do parque é gratuito."
  },
  {
    pergunta: "Tem guarda-volumes?",
    resposta:
      "Sim. O guarda-volumes fica ao lado da lanchonete e possui cobrança à parte."
  },
  {
    pergunta: "Quais formas de pagamento são aceitas?",
    resposta:
      "Aceitamos PIX, cartões de débito, cartões de crédito e dinheiro. O dinheiro pode ser utilizado para realizar recargas dentro do parque."
  },
  {
    pergunta: "Posso sair e retornar ao parque?",
    resposta:
      "Sim, desde que a pulseira de acesso permaneça intacta. Caso seja retirada ou danificada, será necessário adquirir um novo Day Use."
  }
];

function renderizarAjuda() {
  const container = $("#ajudaContainer");
  if (!container) return;

  container.innerHTML = AJUDA.map((item, index) => {
    return `
      <button class="help-item" onclick="abrirResposta(${index})">
        ${item.pergunta}
      </button>

      <div class="help-answer hidden" id="resposta-${index}">
        ${item.resposta}
      </div>
    `;
  }).join("");
}

function abrirResposta(index) {
  const resposta = document.getElementById(`resposta-${index}`);
  if (!resposta) return;

  resposta.classList.toggle("hidden");
}

/* INICIALIZAÇÃO */

document.addEventListener("DOMContentLoaded", () => {
  renderizarBarra();
  renderizarAjuda();

  const btnMapa = $("#btnMapa");

  if (btnMapa) {
    btnMapa.addEventListener("click", () => {
      window.open(CONFIG.googleMaps, "_blank");
    });
  }

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("open");
      }
    });
  });
});

/* ACCORDION MEIA-ENTRADA */

document.addEventListener("click", function (e) {
  if (!e.target.closest(".accordion-header")) return;

  const item = e.target.closest(".accordion-item");

  document.querySelectorAll(".accordion-item").forEach((accordion) => {
    if (accordion !== item) {
      accordion.classList.remove("active");

      const seta = accordion.querySelector("span");
      if (seta) seta.innerHTML = "⌄";
    }
  });

  item.classList.toggle("active");

  const seta = item.querySelector("span");

  if (seta) {
    seta.innerHTML = item.classList.contains("active") ? "⌃" : "⌄";
  }
});
