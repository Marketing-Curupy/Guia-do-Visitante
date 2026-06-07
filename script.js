const API_BASE =
  "https://sofalta.eu/api/baratheon/v4/empreendimentos/curupyacquapark/produtos/ingressos/web?data=";

const CHECKOUT_BASE =
  "https://sofalta.eu/meuingresso/no/curupyacquapark/#/ingressos/";

let selectedDate = null;

const visitDate = document.getElementById("visitDate");
const searchBtn = document.getElementById("searchBtn");
const dateModal = document.getElementById("dateModal");
const modalDate = document.getElementById("modalDate");
const closedMessage = document.getElementById("closedMessage");
const openContent = document.getElementById("openContent");
const ticketsList = document.getElementById("ticketsList");
const termsCheck = document.getElementById("termsCheck");
const chooseBtn = document.getElementById("chooseBtn");

searchBtn.addEventListener("click", async () => {
  const date = visitDate.value;

  if (!date) {
    alert("Selecione uma data para consultar os valores.");
    return;
  }

  selectedDate = date;

  openModal();
  await loadTickets(date);
});

termsCheck.addEventListener("change", () => {
  chooseBtn.disabled = !termsCheck.checked;
});

chooseBtn.addEventListener("click", () => {
  if (!selectedDate) return;

  const brDate = formatDateForCheckout(selectedDate);
  const encodedDate = btoa(brDate);

  window.open(CHECKOUT_BASE + encodedDate, "_blank");
});

function openModal() {
  dateModal.classList.add("active");
  termsCheck.checked = false;
  chooseBtn.disabled = true;
}

function closeModal() {
  dateModal.classList.remove("active");
}

async function loadTickets(date) {
  modalDate.textContent = formatDateBR(date);

  ticketsList.innerHTML = `
    <div class="loading">
      Carregando ingressos disponíveis...
    </div>
  `;

  const today = getTodayISO();

  if (date <= today) {
    showClosedMessage();
    return;
  }

  try {
    const response = await fetch(API_BASE + date);

    if (!response.ok) {
      throw new Error("Erro ao consultar ingressos.");
    }

    const data = await response.json();
    const tickets = normalizeTickets(data);

    if (!tickets.length) {
      ticketsList.innerHTML = `
        <div class="closed-message active-message">
          <strong>Nenhum ingresso online disponível para esta data.</strong>
          <p>Tente selecionar outra data disponível no calendário.</p>
        </div>
      `;
      return;
    }

    showOpenContent();
    renderTickets(tickets);
  } catch (error) {
    ticketsList.innerHTML = `
      <div class="closed-message active-message">
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
    const onlinePrice =
      ticket?.tarifarios?.[0]?.valor ||
      ticket?.valor ||
      ticket?.valorOriginal ||
      0;

    return {
      name: ticket.nome || "Ingresso",
      description: ticket.descricao || "",
      image: ticket.imagem || "",
      price: onlinePrice,
    };
  });
}

function renderTickets(tickets) {
  ticketsList.innerHTML = tickets
    .map((ticket) => {
      return `
        <div class="ticket-card">
          ${
            ticket.image
              ? `<img src="${ticket.image}" alt="${ticket.name}">`
              : `<div class="ticket-image-placeholder"></div>`
          }

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

function showClosedMessage() {
  closedMessage.style.display = "block";
  openContent.style.display = "none";
}

function showOpenContent() {
  closedMessage.style.display = "none";
  openContent.style.display = "block";
}

function formatMoney(value) {
  const number = Number(value || 0);

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateBR(date) {
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

function formatDateForCheckout(date) {
  const [year, month, day] = date.split("-");

  return `${day}-${month}-${year}`;
}

function getTodayISO() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
