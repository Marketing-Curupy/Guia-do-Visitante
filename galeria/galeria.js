console.log("GALERIA CARREGADA");
const FOTOS_GALERIA = [
  { src: "galeria/foto-1.jpg", titulo: "Acqua Rampa" },
  { src: "galeria/foto-2.jpg", titulo: "Acqua Half" },
  { src: "galeria/foto-3.png", titulo: "Torre de Toboáguas" },
  { src: "galeria/foto-4.JPG", titulo: "Ilha da Magia" },
  { src: "galeria/foto-5.png", titulo: "Piscina de Ondas infantil" },
  { src: "galeria/foto-6.jpg", titulo: "Piscina de Ondas adulto" },
  { src: "galeria/foto-7.jpg", titulo: "Playground" }
];

function renderizarGaleriaCurupy() {
  const galeria = document.getElementById("galeriaCurupy");
  if (!galeria) return;

  galeria.innerHTML = FOTOS_GALERIA.map((foto, index) => `
    <button
      type="button"
      class="foto-card ${index === 0 ? "foto-grande" : ""}"
      onclick="abrirFoto('${foto.src}')"
      aria-label="${foto.titulo}"
    >
      <img src="${foto.src}" alt="${foto.titulo}" loading="lazy">
      <div class="foto-overlay">
        <span>${foto.titulo}</span>
      </div>
    </button>
  `).join("");
}

document.addEventListener("DOMContentLoaded", renderizarGaleriaCurupy);
