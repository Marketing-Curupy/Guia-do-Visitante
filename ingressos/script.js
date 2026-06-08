const API_BASE =
  "https://sofalta.eu/api/baratheon/v4/empreendimentos/curupyacquapark/produtos/ingressos/web?data=";

const CHECKOUT_BASE =
  "https://sofalta.eu/meuingresso/no/curupyacquapark/#/ingressos/";

let currentDate = new Date();
let selectedDate = null;

const monthTitle = document.getElementById("monthTitle");
const calendarGrid = document.getElementById("calendarGrid");
const dateModal = document.getElementById("dateModal");
const modalDate = document.getElementById("modalDate");
const closedMessage = document.getElementById("closedMessage");
const openContent = document.getElementById("openContent");
const ticketsList = document.getElementById("ticketsList");
const termsCheck = document.getElementById("termsCheck");
const chooseBtn = document.getElementById("chooseBtn");

const cacheDatas = {};

document.addEventListener("DOMContentLoaded", async () => {
  await renderCalendar();

  termsCheck.addEventListener("change", () => {
    chooseBtn.disabled = !termsCheck.checked;
  });

  chooseBtn.addEventListener("click", goToCheckout);
});

async function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const title = new Date(year, month, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });

  monthTitle.textContent = title;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  calendarGrid.innerHTML = `
    <div class="loading">Carregando datas disponíveis...</div>
  `;

  let html = "";

  for (let i = 0; i < firstDay; i++) {
    html += `<button class="day empty" disabled></button>`;
  }

  for (let day = 1; day <= lastDate; day++) {
    const dateISO = toISODate(year, month, day);
    const today = getTodayISO();

    const classes = ["day"];

    if (dateISO === today) {
      classes.push("today");
    }

    if (dateISO <= today) {
      classes.push("past");

      html += `
        <button class="${classes.join(" ")}" disabled>
          ${day}
        </button>
      `;

      continue;
    }

    const temIngresso = await verificarIngressosDisponiveis(dateISO);

    if (temIngresso) {
      classes.push("available");

      html += `
        <button class="${classes.join(" ")}" onclick="selectDate('${dateISO}')">
          ${day}
          <small>online</small>
        </button>
      `;
    } else {
      classes.push("closed");

      html += `
        <button class="${classes.join(" ")}" disabled>
          ${day}
        </button>
      `;
    }
  }

  calendarGrid.innerHTML = html;
}

async function verificarIngressosDisponiveis(dateISO) {
  if (cacheDatas[dateISO]) {
    return cacheDatas[dateISO].length > 0;
  }

  try {
    const response = await fetch(API_BASE + dateISO);

    if (!response.ok) {
      cacheDatas[dateISO] = [];
      return false;
    }

    const data = await response.json();
    const tickets = normalizeTickets(data);

    cacheDatas[dateISO] = tickets;

    return tickets.length > 0;
  } catch (error) {
    cacheDatas[dateISO] = [];
    return false;
  }
}

async function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  await renderCalendar();
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
      showClosedMessage();
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
        ticket?.valor ??
        ticket?.valorOriginal ??
        0;

      return {
        id: ticket.iditens || ticket.id || "",
        name: ticket.nome || "Ingresso",
        description: cleanText(ticket.descricao || ""),
        image: ticket.imagem || "",
        price,
        quantity: ticket.ingressosParaGerar || 1
      };
    })
    .filter((ticket) => ticket.price > 0);
}

function renderTickets(tickets) {
  ticketsList.innerHTML = tickets
    .map((ticket) => {
      const icon = getTicketIcon(ticket);

      return `
        <div class="ticket-card">
          <div class="ticket-icon">
            ${icon}
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
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 7h8a2 2 0 0 1 2 2v1.2a1.8 1.8 0 0 0 0 3.6V15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1.2a1.8 1.8 0 0 0 0-3.6V9a2 2 0 0 1 2-2Z"/>
        <path d="M10 7v10"/>
        <path d="M9 4h8a2 2 0 0 1 2 2v1"/>
      </svg>
    `;
  }

  if (
    nome.includes("kids") ||
    nome.includes("criança") ||
    nome.includes("infantil")
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3"/>
        <path d="M6.5 19a5.5 5.5 0 0 1 11 0"/>
        <path d="M8 7 6.5 5.5"/>
        <path d="M16 7l1.5-1.5"/>
      </svg>
    `;
  }

  if (
    nome.includes("melhor idade") ||
    nome.includes("idoso")
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="7" r="3"/>
        <path d="M12 10v10"/>
        <path d="M8 14h8"/>
        <path d="M15 20h3"/>
        <path d="M12 20H8"/>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14a2 2 0 0 1 2 2v1.5a2 2 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a2 2 0 0 0 0-3V9a2 2 0 0 1 2-2Z"/>
      <path d="M9 7v10"/>
      <path d="M13 10h4"/>
      <path d="M13 14h4"/>
    </svg>
  `;
}

function openModal() {
  dateModal.classList.add("active");
}

function closeModal() {
  dateModal.classList.remove("active");
}

function showClosedMessage() {
  closedMessage.style.display = "block";
  openContent.style.display = "none";
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
