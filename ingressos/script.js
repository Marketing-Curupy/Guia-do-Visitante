const AVAILABLE_DATES_API =
  "https://sofalta.eu/api/baratheon/v5/empreendimentos/curupyacquapark/web/vendaingressos/ingressos";

const API_BASE =
  "https://sofalta.eu/api/baratheon/v4/empreendimentos/curupyacquapark/produtos/ingressos/web?data=";

const CHECKOUT_BASE =
  "https://sofalta.eu/meuingresso/no/curupyacquapark/#/ingressos/";

let currentDate = new Date();
let selectedDate = null;

let datasDisponiveis = new Set();
const cacheDatas = {};

const monthTitle = document.getElementById("monthTitle");
const calendarGrid = document.getElementById("calendarGrid");
const dateModal = document.getElementById("dateModal");
const modalDate = document.getElementById("modalDate");
const closedMessage = document.getElementById("closedMessage");
const openContent = document.getElementById("openContent");
const ticketsList = document.getElementById("ticketsList");
const termsCheck = document.getElementById("termsCheck");
const chooseBtn = document.getElementById("chooseBtn");

document.addEventListener("DOMContentLoaded", async () => {
  await carregarDatasDisponiveis();
  renderCalendar();

  termsCheck.addEventListener("change", () => {
    chooseBtn.disabled = !termsCheck.checked;
  });

  chooseBtn.addEventListener("click", goToCheckout);
});

async function carregarDatasDisponiveis() {
  try {
    const response = await fetch(AVAILABLE_DATES_API);
    const data = await response.json();

    const objeto = data.object || data || {};

    datasDisponiveis = new Set(
      Object.keys(objeto).filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    );
  } catch (error) {
    datasDisponiveis = new Set();
  }
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const title = new Date(year, month, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });

  monthTitle.textContent = title;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = getTodayISO();

  let html = "";

  for (let i = 0; i < firstDay; i++) {
    html += `<button class="day empty" disabled></button>`;
  }

  for (let day = 1; day <= lastDate; day++) {
    const dateISO = toISODate(year, month, day);
    const disponivelNoSofalta = datasDisponiveis.has(dateISO);

    const classes = ["day"];

    if (dateISO === today) {
      classes.push("today");
    }

    if (!disponivelNoSofalta) {
      classes.push("closed");

      html += `
        <button class="${classes.join(" ")}" onclick="selectClosedDate('${dateISO}')">
          ${day}
        </button>
      `;
      continue;
    }

    if (dateISO <= today) {
      classes.push("past");

      html += `
        <button class="${classes.join(" ")}" onclick="selectToday('${dateISO}')">
          ${day}
          <small>hoje</small>
        </button>
      `;
      continue;
    }

    classes.push("available");

    html += `
      <button class="${classes.join(" ")}" onclick="selectDate('${dateISO}')">
        ${day}
        <small>online</small>
      </button>
    `;
  }

  calendarGrid.innerHTML = html;
}

async function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
}

function selectClosedDate(dateISO) {
  selectedDate = null;

  openModal();
  modalDate.textContent = formatDateBR(dateISO);

  closedMessage.style.display = "block";
  openContent.style.display = "none";

  closedMessage.innerHTML = `
    <strong>Parque fechado nesta data</strong>
    <p>Não há funcionamento nas segundas e terças.</p>
    <p>Escolha uma data marcada como <strong>online</strong> no calendário.</p>
  `;
}

function selectToday(dateISO) {
  selectedDate = null;

  openModal();
  modalDate.textContent = formatDateBR(dateISO);

  closedMessage.style.display = "block";
  openContent.style.display = "none";

  closedMessage.innerHTML = `
    <strong>Ingressos para hoje somente na bilheteria</strong>
    <p>Os ingressos para o dia de hoje são vendidos somente na bilheteria do parque.</p>
    <p>Os valores da bilheteria são diferentes dos valores da compra antecipada online.</p>
    <p>Para comprar online, é necessário adquirir o ingresso com pelo menos 1 dia de antecedência.</p>
  `;
}

async function selectDate(dateISO) {
  selectedDate = dateISO;

  openModal();
  modalDate.textContent = formatDateBR(dateISO);

  termsCheck.checked = false;
  chooseBtn.disabled = true;

  showOpenContent();

  ticketsList.innerHTML = `
    <div class="loading">Carregando ingressos disponíveis...</div>
  `;

  try {
    let tickets = cacheDatas[dateISO];

    if (!tickets) {
      const response = await fetch(API_BASE + dateISO);

      if (!response.ok) {
        throw new Error("Erro ao consultar ingressos.");
      }

      const data = await response.json();
      tickets = normalizeTickets(data);
      cacheDatas[dateISO] = tickets;
    }

    if (!tickets.length) {
      selectClosedDate(dateISO);
      return;
    }

    renderTickets(tickets);
  } catch (error) {
    ticketsList.innerHTML = `
      <div class="closed-message" style="display:block">
        <strong>Não foi possível carregar os ingressos.</strong>
        <p>Tente novamente em alguns instantes.</p>
      </div>
    `;
  }
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
      return `
        <div class="ticket-card">
          <div class="ticket-icon">
            ${getTicketIcon(ticket)}
          </div>

          <div>
            <span>${ticket.name}</span>
            <small>${ticket.description}</small>
          </div>

          <strong>${formatMoney(ticket.price)}</strong>
        </div>
      `;
    })
    .join("");
}

function getTicketIcon(ticket) {
  const nome = ticket.name.toLowerCase();
  const descricao = ticket.description.toLowerCase();

  if (
    nome.includes("duplo") ||
    descricao.includes("duplo") ||
    ticket.quantity === 2
  ) {
    return `
      <svg viewBox="0 0 24 24">
        <path d="M5 8h14a2 2 0 0 1 2 2v1.2a2 2 0 0 0 0 3.6V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.2a2 2 0 0 0 0-3.6V10a2 2 0 0 1 2-2Z"></path>
        <path d="M8 8v10"></path>
        <path d="M13 11h5"></path>
        <path d="M13 15h5"></path>
        <path d="M6 5h12"></path>
      </svg>
    `;
  }

  if (
    nome.includes("kids") ||
    nome.includes("infantil") ||
    nome.includes("criança") ||
    nome.includes("crianca")
  ) {
    return `
      <svg viewBox="0 0 24 24">
        <path d="M5 8h14a2 2 0 0 1 2 2v1.2a2 2 0 0 0 0 3.6V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.2a2 2 0 0 0 0-3.6V10a2 2 0 0 1 2-2Z"></path>
        <path d="M8 8v10"></path>
        <path d="M14 12h4"></path>
        <path d="M16 10v4"></path>
      </svg>
    `;
  }

  if (
    nome.includes("melhor idade") ||
    nome.includes("idoso")
  ) {
    return `
      <svg viewBox="0 0 24 24">
        <path d="M5 8h14a2 2 0 0 1 2 2v1.2a2 2 0 0 0 0 3.6V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.2a2 2 0 0 0 0-3.6V10a2 2 0 0 1 2-2Z"></path>
        <path d="M8 8v10"></path>
        <path d="M14 12h4"></path>
        <path d="M16 10v4"></path>
        <path d="M14 15h4"></path>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24">
      <path d="M5 8h14a2 2 0 0 1 2 2v1.2a2 2 0 0 0 0 3.6V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.2a2 2 0 0 0 0-3.6V10a2 2 0 0 1 2-2Z"></path>
      <path d="M8 8v10"></path>
      <path d="M13 11h5"></path>
      <path d="M13 15h5"></path>
    </svg>
  `;
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
  if (!selectedDate || chooseBtn.disabled) return;

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
