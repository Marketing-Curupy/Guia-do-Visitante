function $(selector) {
  return document.querySelector(selector);
}

function abrirModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add("open");

  if (id === "modalCalendario") {
    renderizarCalendarios();
  }

  if (id === "modalIngressos") {
    carregarIngressos();
  }
}

function fecharModal(id) {
  document.getElementById(id).classList.remove("open");
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
  if (valor === "" || valor === null || valor === undefined) {
    return "";
  }

  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

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

function carregarIngressos() {
  const iframe = $("#iframeIngressos");

  if (iframe && !iframe.src) {
    iframe.src = CONFIG.ingressosOnline;
  }
}

function renderizarCalendarios() {
  const container = $("#calendariosContainer");

  if (!container) return;

  if (!CALENDARIOS_FUNCIONAMENTO.length) {
    container.innerHTML = "<p>Calendário em atualização.</p>";
    return;
  }

  const botoes = CALENDARIOS_FUNCIONAMENTO
    .map((calendario, index) => {
      return `
        <button onclick="mostrarCalendario(${index})">
          ${calendario.titulo}
        </button>
      `;
    })
    .join("");

  container.innerHTML = `
    <p>Selecione o mês para consultar os dias e horários de funcionamento.</p>

    <div class="calendarios-tabs">
      ${botoes}
    </div>

    <div id="calendarioImagem"></div>
  `;

  mostrarCalendario(0);
}

function mostrarCalendario(index) {
  const calendario = CALENDARIOS_FUNCIONAMENTO[index];
  const destino = $("#calendarioImagem");

  destino.innerHTML = `
    <h3>${calendario.titulo}</h3>
    <p>${calendario.descricao}</p>
    <img class="calendario-img" src="${calendario.imagem}" alt="${calendario.descricao}">
  `;
}

const AJUDA = [
  {
    pergunta: "Posso comprar ingresso para hoje pelo site?",
    resposta: "Não. Compras online devem ser realizadas com pelo menos 1 dia de antecedência."
  },
  {
    pergunta: "Posso comprar ingresso na bilheteria?",
    resposta: "Sim. A bilheteria funciona presencialmente nos dias de abertura do parque."
  },
  {
    pergunta: "Criança paga ingresso?",
    resposta: "Crianças de 0 a 4 anos têm entrada gratuita mediante documento oficial com foto. De 5 a 11 anos utilizam ingresso Kids. A partir de 12 anos utilizam ingresso Visitante."
  },
  {
    pergunta: "Posso levar alimentos e bebidas?",
    resposta: "Não é permitida a entrada com alimentos e bebidas. Exceções: água para consumo pessoal, leite e alimentação para bebês, e alimentos para visitantes com restrições alimentares ou condições de saúde específicas mediante laudo ou documento comprobatório."
  },
  {
    pergunta: "Tem estacionamento?",
    resposta: "Sim. O estacionamento do parque é gratuito."
  },
  {
    pergunta: "Tem guarda-volumes?",
    resposta: "Sim. O guarda-volumes fica ao lado da lanchonete e possui cobrança à parte."
  },
  {
    pergunta: "Quais formas de pagamento são aceitas?",
    resposta: "Aceitamos PIX, cartões de débito, cartões de crédito e dinheiro. O dinheiro pode ser utilizado para realizar recargas dentro do parque."
  },
  {
    pergunta: "Posso sair e retornar ao parque?",
    resposta: "Sim, desde que a pulseira de acesso permaneça intacta. Caso seja retirada ou danificada, será necessário adquirir um novo Day Use."
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
  resposta.classList.toggle("hidden");
}

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
document.addEventListener("click", function(e){

    if(!e.target.closest(".accordion-header")){
        return;
    }

    const item = e.target.closest(".accordion-item");

    document.querySelectorAll(".accordion-item").forEach((accordion)=>{

        if(accordion !== item){
            accordion.classList.remove("active");

            accordion.querySelector("span").innerHTML = "⌄";
        }

    });

    item.classList.toggle("active");

    const seta = item.querySelector("span");

    if(item.classList.contains("active")){
        seta.innerHTML = "⌃";
    }else{
        seta.innerHTML = "⌄";
    }

});
