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

/* ============================= */
/* BARRA DE STATUS */
/* ============================= */

function parqueJaFechouHoje() {
  const agora = new Date();
  const hora = agora.getHours();
  const minuto = agora.getMinutes();

  return hora > 17 || (hora === 17 && minuto >= 30);
}

function montarDataISO(ano, mesNome, dia) {
  const mesNumero = obterNumeroMes(mesNome) + 1;

  return `${ano}-${String(mesNumero).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function buscarDiaAtualNoCalendario() {
  const hoje = hojeISO();

  if (typeof CALENDARIOS_FUNCIONAMENTO === "undefined") {
    return null;
  }

  for (const calendario of CALENDARIOS_FUNCIONAMENTO) {
    for (const dia of calendario.dias) {
      const dataISO = montarDataISO(calendario.ano, calendario.mes, dia.dia);

      if (dataISO === hoje) {
        return {
          ...dia,
          data: dataISO,
          mes: calendario.mes,
          ano: calendario.ano
        };
      }
    }
  }

  return null;
}

function buscarProximaAberturaNoCalendario() {
  const hoje = hojeISO();

  if (typeof CALENDARIOS_FUNCIONAMENTO === "undefined") {
    return null;
  }

  const aberturas = [];

  CALENDARIOS_FUNCIONAMENTO.forEach((calendario) => {
    calendario.dias.forEach((dia) => {
      const dataISO = montarDataISO(calendario.ano, calendario.mes, dia.dia);

      if (dataISO > hoje && dia.status !== "fechado") {
        const info = HORARIOS_FUNCIONAMENTO[dia.status];

        aberturas.push({
          ...dia,
          data: dataISO,
          mes: calendario.mes,
          ano: calendario.ano,
          horario: info ? info.horario : ""
        });
      }
    });
  });

  return aberturas.sort((a, b) => a.data.localeCompare(b.data))[0] || null;
}

function gerarValoresBarra(status) {
  if (
    typeof VALORES_BILHETERIA !== "undefined" &&
    VALORES_BILHETERIA[status]
  ) {
    return VALORES_BILHETERIA[status];
  }

  return {
    visitante: 0,
    kids: 0,
    convidadoSocio: 0
  };
}

function renderizarBarra() {
  const barra = $("#barraStatus");
  if (!barra) return;

  const diaAtual = buscarDiaAtualNoCalendario();

  const hojeAberto =
    diaAtual &&
    diaAtual.status !== "fechado" &&
    !parqueJaFechouHoje();

  if (hojeAberto) {
    const info = HORARIOS_FUNCIONAMENTO[diaAtual.status];
    const valores = gerarValoresBarra(diaAtual.status);

    barra.innerHTML = `
      <div class="barra-inner">
        <div class="barra-status">
          <strong>🟢 Parque aberto hoje</strong>
          <span>${formatarData(diaAtual.data)}</span>
          <span>${info ? info.horario : ""}</span>
        </div>

        <div class="barra-precos">
          <span class="barra-precos-title">🎟️ Bilheteria hoje:</span>
          <span class="preco-pill">Adulto ${formatarMoeda(valores.visitante)}</span>
          <span class="preco-pill">Kids ${formatarMoeda(valores.kids)}</span>
          <span class="preco-pill">Convidado de Sócio ${formatarMoeda(valores.convidadoSocio)}</span>
        </div>

        <button class="link-meia" onclick="abrirModal('modalMeia')">
          ℹ️ Ver regras de meia-entrada
        </button>
      </div>
    `;

    return;
  }

  const proxima = buscarProximaAberturaNoCalendario();

  barra.innerHTML = `
    <div class="barra-inner barra-fechado">
      <div class="barra-status">
        <strong style="color:#e03131;">🔴 Parque fechado agora</strong>
        <span>
          Próxima abertura:
          ${proxima ? `${formatarData(proxima.data)} • ${proxima.horario}` : "em breve"}
        </span>
      </div>

      <button class="link-meia" onclick="abrirModal('modalMeia')">
        ℹ️ Ver regras de meia-entrada
      </button>
    </div>
  `;
}

/* ============================= */
/* BUSCA RÁPIDA */
/* ============================= */

function textoContem(texto, palavras) {
  return palavras.some((palavra) => texto.includes(palavra));
}

function buscarRapido() {
  const campo = document.getElementById("campoBusca");
  if (!campo) return;

  const texto = campo.value.toLowerCase().trim();

  if (texto.length < 3) return;

  if (
    textoContem(texto, [
      "ingresso",
      "ingressos",
      "valor",
      "valores",
      "preço",
      "preco",
      "comprar",
      "compra",
      "ticket",
      "bilheteria"
    ])
  ) {
    openIngressosModal();
    campo.value = "";
    return;
  }

  if (
    textoContem(texto, [
      "calendario",
      "calendário",
      "funcionamento",
      "horario",
      "horário",
      "abre",
      "aberto",
      "fechado",
      "dia",
      "data"
    ])
  ) {
    abrirModal("modalCalendario");
    campo.value = "";
    return;
  }

  if (
    textoContem(texto, [
      "meia",
      "meia entrada",
      "meia-entrada",
      "gratuidade",
      "pcd",
      "tea",
      "autista",
      "idoso",
      "estudante",
      "professor"
    ])
  ) {
    abrirModal("modalMeia");
    campo.value = "";
    return;
  }

  if (
    textoContem(texto, [
      "hospedagem",
      "hotel",
      "pousada",
      "dormir",
      "hospedar"
    ])
  ) {
    abrirEmBreve("Hospedagem");
    campo.value = "";
    return;
  }

  if (
    textoContem(texto, [
      "associado",
      "associados",
      "associação",
      "associacao",
      "clube",
      "sócio",
      "socio"
    ])
  ) {
    abrirEmBreve("Clube de Associados");
    campo.value = "";
    return;
  }

  if (
    textoContem(texto, [
      "mapa",
      "chegar",
      "localização",
      "localizacao",
      "endereço",
      "endereco",
      "rota",
      "gps"
    ])
  ) {
    abrirMapa();
    campo.value = "";
    return;
  }

  if (
    textoContem(texto, [
      "ajuda",
      "dúvida",
      "duvida",
      "atendimento",
      "whatsapp",
      "falar"
    ])
  ) {
    abrirModal("modalAjuda");
    campo.value = "";
  }
}

/* ============================= */
/* CALENDÁRIO */
/* ============================= */

function renderizarCalendarios() {
  const container = $("#calendariosContainer");
  if (!container) return;

  if (typeof CALENDARIOS_FUNCIONAMENTO === "undefined") {
    container.innerHTML = "<p>Calendário indisponível no momento.</p>";
    return;
  }

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

      const dataISO = `${calendario.ano}-${String(mesNumero + 1).padStart(2, "0")}-${String(dia.dia).padStart(2, "0")}`;
      const dataPassada = dataISO < hojeISO();

      const classeDia = dataPassada ? "dia-passado" : info.classe;

      const textoDia = dataPassada
        ? "Encerrado"
        : dia.status === "fechado"
          ? "Fechado"
          : info.horario;

      return `
        <button
          class="cal-dia ${classeDia}"
          onclick="abrirInfoDia(${index}, ${dia.dia})"
        >
          <strong>${dia.dia}</strong>
          <span>${textoDia}</span>
        </button>
      `;
    })
    .join("");

  destino.innerHTML = `
    <div class="calendario-funcionamento">
      <h3>${calendario.mes} ${calendario.ano}</h3>
      <p>${calendario.observacao || ""}</p>

      <div class="legenda-funcionamento">
        <button onclick="filtrarCalendario('dia-semana')">
          <b class="legenda-cor semana"></b> Dias de semana
        </button>

        <button onclick="filtrarCalendario('dia-fim-semana')">
          <b class="legenda-cor fim"></b> Fins de semana
        </button>

        <button onclick="filtrarCalendario('dia-feriado')">
          <b class="legenda-cor feriado"></b> Feriados
        </button>

        <button onclick="filtrarCalendario('dia-fechado')">
          <b class="legenda-cor fechado"></b> Fechado
        </button>

        <button onclick="filtrarCalendario(null)">
          Mostrar todos
        </button>
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

function filtrarCalendario(classe) {
  document.querySelectorAll(".cal-dia").forEach((dia) => {
    dia.classList.remove("oculto");

    if (classe && !dia.classList.contains(classe)) {
      dia.classList.add("oculto");
    }
  });
}

function gerarValoresBilheteria(status) {
  const valores = VALORES_BILHETERIA[status];

  if (!valores) return "";

  return `
    <div class="dia-bloco">
      <strong>🎟 Valor da bilheteria</strong>
      <p>Adulto: ${formatarMoeda(valores.visitante)}</p>
      <p>Kids: ${formatarMoeda(valores.kids)}</p>
      <p>Convidado de sócio: ${formatarMoeda(valores.convidadoSocio)}</p>
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

  const dataTexto = `${String(numeroDia).padStart(2, "0")} de ${calendario.mes} de ${calendario.ano}`;

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

      ${gerarValoresBilheteria(dia.status)}

      <div class="dia-bloco">
        <strong>📍 Como chegar</strong>
        <button class="btn azul" onclick="abrirMapa()">Abrir mapa</button>
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

/* ============================= */
/* EM BREVE */
/* ============================= */

function abrirEmBreve(titulo) {
  const tituloModal = $("#tituloEmBreve");
  const textoModal = $("#textoEmBreve");

  if (tituloModal) {
    tituloModal.textContent = titulo || "Em breve";
  }

  if (textoModal) {
    textoModal.textContent =
      "Esta área está em desenvolvimento e será disponibilizada em breve.";
  }

  abrirModal("modalEmBreve");
}

/* ============================= */
/* MAPA */
/* ============================= */

function abrirMapa() {
  const destino = "-11.8015771,-55.4722897";

  if (!navigator.geolocation) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destino}`, "_blank");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      const origem = `${pos.coords.latitude},${pos.coords.longitude}`;

      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}&travelmode=driving`,
        "_blank"
      );
    },
    function () {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${destino}&travelmode=driving`,
        "_blank"
      );
    }
  );
}
/* ============================= */
/* GALERIA */
/* ============================= */

function abrirFoto(src) {
  const foto = $("#fotoAberta");
  if (!foto) return;

  foto.src = src;
  abrirModal("modalFoto");
}

/* ============================= */
/* AJUDA */
/* ============================= */

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
      "Crianças de 0 a 4 anos têm entrada gratuita mediante apresentação do documento oficial com foto. De 5 a 11 anos utilizam ingresso Kids. Caso não seja apresentado o ducomento oficial da criança comprovando a idade o valor cobrado será o valor integral conforme a tabela vigente do dia na bilheteria.A partir de 12 anos utilizam ingresso Individual."
  },
  {
    pergunta: "Posso levar alimentos e bebidas?",
    resposta:
      "Não é permitida a entrada de alimentos e bebidas no parque. São permitidos apenas água, tereré e chimarrão. Em caso de dúvidas, entre em contato com nossa Central de Atendimento."
  },
  {
    pergunta: "Tem estacionamento?",
    resposta:
      "Sim. O estacionamento do parque é gratuito."
  },
  {
    pergunta: "Tem guarda-volumes?",
    resposta:
      "Sim. Disponibilizamos guarda-volumes no espaço da lanchonete. O serviço possui uma taxa de utilização pago à parte."
  },
  {
    pergunta: "Quais formas de pagamento são aceitas?",
    resposta:
      "Aceitamos PIX, cartões de débito e crédito e a Pulseira de Consumo. Se preferir pagar em dinheiro, basta recarregar sua Pulseira de Consumo em nosso ponto de recarga, em anexo a sorveteria, dentro do parque."
  },
{
  pergunta: "Posso sair e retornar ao parque no mesmo dia?",
  resposta: `Sim! Você pode sair e retornar ao parque no mesmo dia, desde que a pulseira de acesso permaneça intacta e devidamente presa ao pulso.

Caso a pulseira seja retirada, rompida ou danificada, ela perderá a validade e não poderá ser reutilizada. Nessa situação, será necessário adquirir um novo ingresso para acessar o parque.`
}

];

function renderizarAjuda() {
  const container = $("#ajudaContainer");
  if (!container) return;

  container.innerHTML = `
    
    ${AJUDA.map((item, index) => {
      return `
        <button class="help-item" onclick="abrirResposta(${index})">
          ${item.pergunta}
        </button>

        <div class="help-answer hidden" id="resposta-${index}">
          ${item.resposta}
        </div>
      `;
    }).join("")}

    <div class="help-cta">
      <div class="help-cta-icon">❓</div>

      <div class="help-cta-texto">
        <strong>Ainda com dúvidas?</strong>

        <p>
          Não encontrou sua resposta acima?
          Escolha o assunto e fale conosco pelo WhatsApp.
        </p>
      </div>

      <div class="help-cta-buttons">

        <button onclick="abrirWhatsAppAjuda('ingressos')">
          🎟️ Ingressos
        </button>

        <button onclick="abrirWhatsAppAjuda('acesso')">
          🚪 Acesso ao parque
        </button>

        <button onclick="abrirWhatsAppAjuda('meia')">
          🎫 Meia-entrada
        </button>

        <button onclick="abrirWhatsAppAjuda('outros')">
          💬 Outros assuntos
        </button>

      </div>
    </div>
  `;
}

function abrirWhatsAppAjuda(tipo) {

  let mensagem = "";

  switch (tipo) {
    case "ingressos":
      mensagem = "Olá! Tenho dúvidas sobre ingressos.";
      break;

    case "acesso":
      mensagem = "Olá! Tenho dúvidas sobre acesso ao parque.";
      break;

    case "meia":
      mensagem = "Olá! Tenho dúvidas sobre meia-entrada.";
      break;

    default:
      mensagem = "Olá! Tenho uma dúvida e gostaria de falar com a equipe.";
  }

  window.open(
    `https://wa.me/556696454707?text=${encodeURIComponent(mensagem)}`,
    "_blank"
  );
}

function abrirPaginaHospedagem() {
  window.location.href = "hospedagem.html";
}

function abrirPaginaAssociados() {
  window.location.href = "associados.html";
}

function abrirResposta(index) {
  document.querySelectorAll(".help-answer").forEach((item, i) => {
    if (i === index) {
      item.classList.toggle("hidden");
    } else {
      item.classList.add("hidden");
    }
  });
}

/* ============================= */
/* MODAL DE INGRESSOS */
/* ============================= */

function openIngressosModal() {

  const modal = document.getElementById("ingressosModal");
  const iframe = document.getElementById("iframeIngressos");

  if (!modal) return;

  if (iframe && CONFIG.ingressosOnline) {
    iframe.src = CONFIG.ingressosOnline;
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeIngressosModal() {
  const modal = document.getElementById("ingressosModal");

  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

/* ============================= */
/* ANIMAÇÕES LEVES */
/* ============================= */

function ativarAnimacoes() {
  document.querySelectorAll(".card, .atalho-card, .info button").forEach((item, index) => {
    item.style.animationDelay = `${index * 0.06}s`;
    item.classList.add("animar-entrada");
  });
}

/* ============================= */
/* INICIALIZAÇÃO */
/* ============================= */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await carregarParametrosGerais();
    await carregarCalendariosFuncionamento();

    console.log("CONFIG", CONFIG);
    console.log("VALORES_BILHETERIA", VALORES_BILHETERIA);
    console.log("HORARIOS_FUNCIONAMENTO", HORARIOS_FUNCIONAMENTO);
    console.log("CALENDARIOS_FUNCIONAMENTO", CALENDARIOS_FUNCIONAMENTO);
  } catch (erro) {
    console.error("Erro ao carregar dados da planilha:", erro);

    const barra = document.getElementById("barraStatus");
    if (barra) {
      barra.innerHTML = `
        <div class="barra-inner barra-fechado">
          <div class="barra-status">
            <strong style="color:#e03131;">⚠️ Dados indisponíveis</strong>
            <span>Não foi possível carregar a planilha.</span>
          </div>
        </div>
      `;
    }
  }

  renderizarBarra();
  renderizarAjuda();
  ativarAnimacoes();
  ativarBarraFixaAoRolar();

  const btnMapa = $("#btnMapa");

  if (btnMapa) {
    btnMapa.addEventListener("click", abrirMapa);
  }

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("open");
      }
    });
  });
});

/* ============================= */
/* ACCORDION MEIA-ENTRADA */
/* ============================= */

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


/* ============================= */
/* BARRA FIXA AO ROLAR */
/* ============================= */

function ativarBarraFixaAoRolar() {
  const barra = document.getElementById("barraStatus");
  if (!barra) return;

  const pontoAtivacao = barra.offsetTop;

  window.addEventListener("scroll", () => {
    if (window.scrollY >= pontoAtivacao) {
      barra.classList.add("fixa");
    } else {
      barra.classList.remove("fixa");
    }
  });
}
