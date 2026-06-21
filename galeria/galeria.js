const FOTOS_GALERIA = [
  {
    src: "assets/galeria/foto-1.jpg",
    titulo: "Piscinas do Curupy"
  },
  {
    src: "assets/galeria/foto-2.jpg",
    titulo: "Diversão em família"
  },
  {
    src: "assets/galeria/foto-3.jpg",
    titulo: "Toboáguas"
  },
  {
    src: "assets/galeria/foto-4.jpg",
    titulo: "Área infantil"
  },
  {
    src: "assets/galeria/foto-5.jpg",
    titulo: "Momentos no parque"
  },
  {
    src: "assets/galeria/foto-6.jpg",
    titulo: "Curupy Acqua Park"
  }
];

function renderizarGaleriaCurupy() {
  const galeria = document.getElementById("galeriaCurupy");
  if (!galeria) return;

  galeria.innerHTML = FOTOS_GALERIA.map((foto, index) => `
    <button
      class="foto-card ${index === 0 ? "foto-grande" : ""}"
      onclick="abrirFoto('${foto.src}')"
      aria-label="${foto.titulo}"
    >
      <img src="${foto.src}" alt="${foto.titulo}" loading="lazy">
    </button>
  `).join("");
}

document.addEventListener("DOMContentLoaded", renderizarGaleriaCurupy);
