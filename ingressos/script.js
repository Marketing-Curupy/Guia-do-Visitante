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

document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();

  termsCheck.addEventListener("change", () => {
    chooseBtn.disabled = !termsCheck.checked;
  });

  chooseBtn.addEventListener("click", goToCheckout);
});

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const title = new Date(year, month, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  monthTitle.textContent = title;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  let html = "";

  for (let i = 0; i < firstDay; i++) {
    html += `<button class="day empty" disabled></button>`;
  }

  for (let day = 1; day <= lastDate; day++) {
    const dateISO = toISODate(year, month, day);
    const today = getTodayISO();

    const classes = ["day"];

    if (dateISO === today) classes.push("today");
    if (dateISO <= today) classes.push("past");
    if (dateISO > today) classes.push("available");

    html += `
      <button class="${classes.join(" ")}" onclick="selectDate('${dateISO}')">
        ${day}
        ${dateISO > today ? "<small>online</small>" : ""}
      </button>
    `;
  }

  calendarGrid.innerHTML = html;
}

function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
}

async function selectDate(dateISO) {
  selectedDate = dateISO;

  openModal();
  modalDate.textContent = formatDateBR(dateISO);

  termsCheck.checked = false;
  chooseBtn.disabled = true;

  if (dateISO <= getTodayISO()) {
    showClosedMessage();
    return;
  }

  showOpenContent();

  ticketsList.innerHTML = `
    <div class="loading">Carregando ingressos disponíveis...</div>
  `;

  try {
    const response = await fetch(API_BASE + dateISO);

    if (!response.ok) {
      throw new Error("Erro ao consultar ingressos.");
    }

    const data = await response.json();
    const tickets = normalizeTickets(data);

    if (!tickets.length) {
      ticketsList.innerHTML = `
        <div class="closed-message" style="display:block">
          <strong>Nenhum ingresso online disponível para esta data.</strong>
          <p>Tente selecionar outra data no calendário.</p>
        </div>
      `;
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

  return list.map((ticket) => {
    const price =
      ticket?.tarifarios?.[0]?.valor ??
      ticket?.valor ??
      ticket?.valorOriginal ??
      0;

    return {
      name: ticket.nome || "Ingresso",
      description: cleanText(ticket.descricao || ""),
      image: ticket.imagem || "",
      price,
    };
  });
}

function renderTickets(tickets) {
  ticketsList.innerHTML = tickets
    .map((ticket) => {

      let icon = "🎟️";

      const nome = ticket.name.toLowerCase();

      if (
        nome.includes("kids") ||
        nome.includes("criança") ||
        nome.includes("infantil")
      ) {
        icon = "🧒";
      }

      else if (
        nome.includes("melhor idade") ||
        nome.includes("idoso")
      ) {
        icon = "👴";
      }

      else if (
        nome.includes("individual") ||
        nome.includes("adulto")
      ) {
        icon = "👨";
      }

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
    currency: "BRL",
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
