const API_BASE =
  "https://sofalta.eu/api/baratheon/v4/empreendimentos/curupyacquapark/produtos/ingressos/web?data=";

const CHECKOUT_BASE =
  "https://sofalta.eu/meuingresso/no/curupyacquapark/#/ingressos/";

let currentDate = new Date();
let selectedDate = null;

const cacheDatas = {};

const monthTitle = document.getElementById("monthTitle");
const calendarGrid = document.getElementById("calendarGrid");
const dateModal = document.getElementById("dateModal");
const modalDate = document.getElementById("modalDate");
const closedMessage = document.getElementById("closedMessage");
const openContent = document.getElementById("openContent");
const ticketsList = document.getElementById("ticketsList");
const chooseBtn = document.getElementById("chooseBtn");

document.addEventListener("DOMContentLoaded", async () => {
  await renderCalendar();
  chooseBtn.addEventListener("click", goToCheckout);
});

async function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthTitle.textContent = new Date(year, month, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = getTodayISO();

  calendarGrid.innerHTML = `<div class="loading">Carregando datas disponíveis...</div>`;

  const consultas = [];

  for (let day = 1; day <= lastDate; day++) {
    consultas.push(verificarIngressosDisponiveis(toISODate(year, month, day)));
  }

  await Promise.all(consultas);

  let html = "";

  for (let i = 0; i < firstDay; i++) {
    html += `<button class="day empty" disabled></button>`;
  }

  for (let day = 1; day <= lastDate; day++) {
    const dateISO = toISODate(year, month, day);
    const tickets = cacheDatas[dateISO] || [];
    const temIngresso = tickets.length > 0;
    const temPromocao = tickets.some(ehPromocional);
    const classes = ["day"];

    if (dateISO === today) classes.push("today");

    if (temIngresso && dateISO > today) {
      classes.push("available");

      html += `
        <button class="${classes.join(" ")}" onclick="selectDate('${dateISO}')">
          ${day}
          ${temPromocao ? `<span class="promo-dot">%</span>` : ""}
          <small>online</small>
        </button>
      `;
      continue;
    }

    if (temIngresso && dateISO === today) {
      classes.push("today-blocked");

      html += `
        <button class="${classes.join(" ")}" onclick="selectToday('${dateISO}')">
          ${day}
          ${temPromocao ? `<span class="promo-dot">%</span>` : ""}
          <small>hoje</small>
        </button>
      `;
      continue;
    }

    classes.push("closed");

    html += `
      <button class="${classes.join(" ")}" onclick="selectClosedDate('${dateISO}')">
        ${day}
      </button>
    `;
  }

  calendarGrid.innerHTML = html;
}

async function verificarIngressosDisponiveis(dateISO) {
  if (Array.isArray(cacheDatas[dateISO])) {
    return cacheDatas[dateISO].length > 0;
  }

  try {
    const response = await fetch(API_BASE + dateISO);

    if (!response.ok) {
      cacheDatas[dateISO] = [];
      return false;
    }

    const data = await response.json();
    cacheDatas[dateISO] = normalizeTickets(data);

    return cacheDatas[dateISO].length > 0;
  } catch {
    cacheDatas[dateISO] = [];
    return false;
  }
}

async function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  await renderCalendar();
}

async function selectClosedDate(dateISO) {
  selectedDate = null;

  openModal();
  modalDate.textContent = formatDateBR(dateISO);

  closedMessage.style.display = "block";
  openContent.style.display = "none";

  closedMessage.innerHTML = `
    <strong>Parque fechado nesta data</strong>
    <p>Hoje o parque está fechado. Consulte a próxima data de abertura.</p>
    <p class="loading">Buscando próxima data disponível...</p>
  `;

  const nextDate = await findNextOpenDate(dateISO);

  closedMessage.innerHTML = `
    <strong>Parque fechado nesta data</strong>
    <p>Hoje o parque está fechado. Consulte a próxima data de abertura.</p>
    ${
      nextDate
        ? `<p><strong>Próxima data de abertura:</strong> ${formatDateBR(nextDate)}</p>`
        : `<p>Não encontramos uma próxima data disponível no momento.</p>`
    }
  `;
}

function selectToday(dateISO) {
  selectedDate = null;

  openModal();
  modalDate.textContent = formatDateBR(dateISO);

  closedMessage.style.display = "block";
  openContent.style.display = "none";

  closedMessage.innerHTML = `
    <strong>Compra online indisponível para hoje</strong>
    <p>Os ingressos para o dia de hoje são vendidos somente na bilheteria do parque.</p>
    <p>Os valores da bilheteria são diferentes dos valores da compra antecipada online.</p>
    <p>Para comprar online, é necessário adquirir o ingresso com pelo menos 1 dia de antecedência.</p>
  `;
}

async function selectDate(dateISO) {
  selectedDate = dateISO;

  openModal();
  modalDate.textContent = formatDateBR(dateISO);

  showOpenContent();

  ticketsList.innerHTML = `<div class="loading">Carregando ingressos disponíveis...</div>`;

  let tickets = cacheDatas[dateISO];

  if (!tickets) {
    await verificarIngressosDisponiveis(dateISO);
    tickets = cacheDatas[dateISO] || [];
  }

  if (!tickets.length) {
    selectClosedDate(dateISO);
    return;
  }

  renderTickets(tickets);
}

function normalizeTickets(data) {
  const list = Array.isArray(data)
    ? data
    : data.itens || data.produtos || data.ingressos || [];

  return list
    .map((ticket) => {
      const price =
        ticket?.tarifarios?.[0]?.valor ??
        ticket?.valorOriginal ??
        ticket?.valor ??
        0;

      return {
        id: ticket.iditens || ticket.id || "",
        name: ticket.nome || "Ingresso",
        description: cleanText(ticket.descricao || ""),
        price: Number(price || 0),
        quantity: ticket.ingressosParaGerar || 1
      };
    })
    .filter((ticket) => ticket.price > 0);
}

function renderTickets(tickets) {
  ticketsList.innerHTML = tickets
    .map((ticket) => {
      const promocional = ehPromocional(ticket);

      return `
        <div class="ticket-card ${promocional ? "ticket-promo" : ""}">
          <div class="ticket-icon">
            ${ticketIconSvg()}
          </div>

          <div class="ticket-info">
            ${promocional ? `<span class="promo-badge">Oferta especial</span>` : ""}
            <span class="ticket-name">${ticket.name}</span>
            <small>${getCategoriaIdade(ticket)}</small>
          </div>

          <strong>${formatMoney(ticket.price)}</strong>
        </div>
      `;
    })
    .join("");
}

function ehPromocional(ticket) {
  const nome = removeAccents(ticket.name.toLowerCase());

  const categoriasNormais = [
    "individual",
    "kids",
    "melhor idade"
  ];

  return !categoriasNormais.some((categoria) => nome.includes(categoria));
}

function getCategoriaIdade(ticket) {
  const nome = removeAccents(ticket.name.toLowerCase());

  if (nome.includes("kids")) return "5 a 11 anos";
  if (nome.includes("melhor idade")) return "60 anos ou mais";
  if (nome.includes("individual")) return "12 a 59 anos";
  if (nome.includes("duplo")) return "2 ingressos";

  return "Categoria promocional";
}

function ticketIconSvg() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7C4 5.9 4.9 5 6 5H18C19.1 5 20 5.9 20 7V10C18.9 10 18 10.9 18 12C18 13.1 18.9 14 20 14V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V14C5.1 14 6 13.1 6 12C6 10.9 5.1 10 4 10V7Z"></path>
      <path d="M12 8V16"></path>
    </svg>
  `;
}

async function findNextOpenDate(fromDateISO) {
  const start = new Date(fromDateISO + "T00:00:00");

  for (let i = 1; i <= 90; i++) {
    const next = new Date(start);
    next.setDate(start.getDate() + i);

    const dateISO = toISODate(next.getFullYear(), next.getMonth(), next.getDate());
    const hasTickets = await verificarIngressosDisponiveis(dateISO);

    if (hasTickets) return dateISO;
  }

  return null;
}

function openModal() {
  dateModal.classList.add("active");
}

function closeModal() {
  dateModal.classList.remove("active");
}

function showOpenContent() {
  closedMessage.style.display = "none";
  openContent.style.display = "block";
}

function goToCheckout() {
  if (!selectedDate) return;

  const checkoutDate = formatDateForCheckout(selectedDate);
  const encodedDate = btoa(checkoutDate);

  window.open(CHECKOUT_BASE + encodedDate, "_blank");
}

function formatMoney(value) {
  const number = Number(value || 0) / 100;

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function cleanText(text) {
  return String(text)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function removeAccents(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDateBR(dateISO) {
  const [year, month, day] = dateISO.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateForCheckout(dateISO) {
  const [year, month, day] = dateISO.split("-");
  return `${day}-${month}-${year}`;
}

function getTodayISO() {
  const today = new Date();

  return toISODate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
}

function toISODate(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const date = String(day).padStart(2, "0");

  return `${year}-${month}-${date}`;
}
