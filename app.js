// Registrácia service workeru len na http/https
if ('serviceWorker' in navigator && /^https?:$/.test(window.location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}

// Premenné
const grid = document.getElementById("grid");
const modal = document.getElementById("modal");
const videoPlayer = document.getElementById("videoPlayer");
const modalTitle = document.getElementById("modalTitle");
const modalSize = document.getElementById("modalSize");
const modalDate = document.getElementById("modalDate");
const downloadBtn = document.getElementById("downloadBtn");
const closeModalBtn = document.getElementById("closeModal");

const saved = localStorage.getItem("galleryExportedLinks");
let links = saved ? JSON.parse(saved) : [];

// Thumbnail generátor
function getThumb(link) {
  return 'icons/placeholder-192.svg';
}

// Render gridu
function renderGrid(filter = "") {
  grid.innerHTML = "";
  const filtered = links.filter(l => l.toLowerCase().includes(filter.toLowerCase()));
  if (!filtered.length) {
    const msg = document.createElement("div");
    msg.className = "meta";
    msg.textContent = "Žiadne videá. Importuj TXT alebo vlož URL.";
    grid.appendChild(msg);
    return;
  }

  filtered.forEach((link, i) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.className = "thumb";
    img.src = getThumb(link);
    img.onerror = () => { img.src = 'icons/placeholder-192.svg'; };

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = "Video " + (i + 1);

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = "Veľkosť: neznáma • Dátum: neznámy";

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(meta);

    card.addEventListener("click", () => openModal(link, i));
    grid.appendChild(card);
  });
}

// Otvorenie modalu
function openModal(link, i) {
  modal.style.display = "flex";
  modalTitle.textContent = "Video " + (i + 1);
  modalSize.textContent = "Veľkosť: neznáma";
  modalDate.textContent = "Dátum: neznámy";
  videoPlayer.src = link;

  downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = link;
    a.download = "video" + (i + 1);
    a.click();
  };
}

// Zatvorenie modalu
closeModalBtn.onclick = () => {
  modal.style.display = "none";
  videoPlayer.pause();
  videoPlayer.src = "";
};

// Export TXT
document.getElementById("exportBtn").onclick = () => {
  if (!links.length) {
    alert("Nie je čo exportovať.");
    return;
  }
  const blob = new Blob([links.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gallery_urls.txt";
  a.click();
  URL.revokeObjectURL(url);
  alert("Export hotový: " + links.length + " odkazov.");
};

// Vyhľadávanie
document.getElementById("searchInput").addEventListener("input", e => {
  renderGrid(e.target.value);
});

// Prepnutie grid/list
document.getElementById("toggleView").onclick = () => {
  grid.classList.toggle("list");
  grid.classList.toggle("grid");
};

// Prepnutie dark/light
document.getElementById("toggleMode").onclick = () => {
  document.body.classList.toggle("light-mode");
};

// Playlist
document.getElementById("playlistBtn").onclick = () => {
  let idx = 0;
  function playNext() {
    if (idx < links.length) {
      openModal(links[idx], idx);
      videoPlayer.onended = () => {
        idx++;
        playNext();
      };
    }
  }
  playNext();
};

// Import TXT súboru
const fileInput = document.getElementById("fileInput");
document.getElementById("importBtn").onclick = () => fileInput.click();

fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const text = ev.target.result;
    const newLinks = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
    links = [...new Set([...links, ...newLinks])];
    localStorage.setItem("galleryExportedLinks", JSON.stringify(links));
    renderGrid();
    alert("Načítaných " + newLinks.length + " odkazov!");
  };
  reader.readAsText(file);
});

// Inicializácia
renderGrid();