import { INITIAL_PRODUCTS } from "./model.js";
const STORAGE_KEY = "vitrine_data_v1";
const THEME_KEY = "vitrine_theme_v1";

/* ---------- Modo Cliente (declarado cedo) ---------- */
/* Declarar aqui garante que renderProducts() possa checar modoCliente já no primeiro render */
let modoCliente = JSON.parse(localStorage.getItem("modo_cliente")) || false;

/* ---------- ESTADO ---------- */
let produtos =
  JSON.parse(localStorage.getItem(STORAGE_KEY)) || INITIAL_PRODUCTS;
let theme = JSON.parse(localStorage.getItem(THEME_KEY)) || {
  primary: "var(--primary)",
  accent: "var(--accent)",
  pageBg: "var(--page-bg)",
  cardBg: "var(--card-bg)",
  text: "var(--text)",
  radius: 12,
  shadow: 8,
  anim: 280,
  dark: false,
  logo: "",
};

/* ---------- FUNCOES ---------- */
function saveToStorage(k, v) {
  localStorage.setItem(k, JSON.stringify(v));
}
function escapeHtml(s) {
  return String(s || "").replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[ch])
  );
}

const categoriesEl = document.getElementById("categories");
const categoriesContainer = document.getElementById("categoriesContainer");
const searchInput = document.getElementById("searchInput");
let currentCategory = null;

function renderCategories() {
  categoriesEl.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.className = "cat-btn active";
  allBtn.innerText = "Todos";
  allBtn.onclick = () => {
    currentCategory = null;
    setActiveCat(allBtn);
    renderProducts();
  };
  categoriesEl.appendChild(allBtn);
  Object.keys(produtos).forEach((k) => {
    const b = document.createElement("button");
    b.className = "cat-btn";
    b.innerText = k[0].toUpperCase() + k.slice(1);
    b.onclick = () => {
      currentCategory = k;
      setActiveCat(b);
      renderProducts();
    };
    categoriesEl.appendChild(b);
  });
}
function setActiveCat(el) {
  document
    .querySelectorAll(".cat-btn")
    .forEach((x) => x.classList.remove("active"));
  el.classList.add("active");
}

function criarLinkWhatsApp(nome) {
  return (
    "https://wa.me/5585998414150?text=" +
    encodeURIComponent("Olá! Tenho interesse no produto: " + nome)
  );
}

function createCardHtml(p, cat, index) {
  const out = p.fora ? "out-of-stock" : "";
  return `<div class="product ${out}" data-cat="${cat}" data-index="${index}">
    <img src="${p.img}" alt="${escapeHtml(p.nome)}">
    <div class="p-title">${escapeHtml(p.nome)}</div>
    <div class="p-desc">${escapeHtml(p.desc || "")}</div>
    <div class="p-price">${
      p.fora ? "❌ Fora de estoque" : "R$ " + escapeHtml(p.preco)
    }</div>
    <div class="prod-actions">
      <a class="btn" href="${criarLinkWhatsApp(
        p.nome
      )}" target="_blank" style="background:var(--accent);color:#fff">WhatsApp</a>
      <button class="icon-btn" onclick="toggleEstoque('${cat}',${index})">${
    p.fora ? "✔ Dispo" : "🛑 Fora"
  }</button>
      <button class="icon-btn" onclick="openConfirm('${cat}',${index})">🗑 Excluir</button>
    </div>
  </div>`;
}

function renderProducts() {
  categoriesContainer.innerHTML = "";
  const termo = (searchInput.value || "").toLowerCase();

  for (const cat of Object.keys(produtos)) {
    if (currentCategory && cat !== currentCategory) continue;
    const divCat = document.createElement("div");
    divCat.className = "category-grid";

    produtos[cat].forEach((p, i) => {
      if (
        termo &&
        !p.nome.toLowerCase().includes(termo) &&
        !p.desc.toLowerCase().includes(termo)
      )
        return;

      let html = createCardHtml(p, cat, i);

      // Se estiver no modo cliente → remove botões de edição
      if (modoCliente) {
        html = html.replace(
          /<div class="prod-actions">[\s\S]*?<\/div>/,
          `
    <div class="prod-actions">
      <a class="btn" href="${criarLinkWhatsApp(p.nome)}"
         target="_blank"
         style="background:var(--accent);color:#fff">WhatsApp</a>
    </div>
  `
        );
      }

      divCat.insertAdjacentHTML("beforeend", html);
    });

    categoriesContainer.appendChild(divCat);
  }

  // Botao adicionar produto NO FINAL de todas categorias
  if (!modoCliente) {
    const addCard = document.createElement("div");
    addCard.className = "add-card";
    addCard.innerHTML =
      "<div style='text-align:center'><div style='font-size:34px;line-height:1'>+</div><div class='muted'>Adicionar Produto</div></div>";
    addCard.onclick = () => openAddPopup(currentCategory || "eletronicos");
    categoriesContainer.appendChild(addCard);
  }
}

/* ---------- ESTOQUE ---------- */
function toggleEstoque(cat, index) {
  produtos[cat][index].fora = !produtos[cat][index].fora;
  saveToStorage(STORAGE_KEY, produtos);
  renderProducts();
}
let pendingDelete = null;
function openConfirm(cat, index) {
  pendingDelete = { cat, index };
  alert("Confirme exclusão no botão de confirmação!");
}
document
  .getElementById("searchInput")
  .addEventListener("input", () => renderProducts());

/* ---------- ADD PRODUCT ---------- */
function openAddPopup(cat) {
  const nome = prompt("Nome do produto:");
  if (!nome) return;
  const preco = prompt("Preço:");
  if (!preco) return;
  const desc = prompt("Descrição:") || "";
  const img =
    prompt("URL da imagem:") ||
    "https://via.placeholder.com/400x300?text=Produto";
  if (!produtos[cat]) produtos[cat] = [];
  produtos[cat].push({
    nome: nome,
    preco: preco,
    desc: desc,
    img: img,
    fora: false,
  });
  saveToStorage(STORAGE_KEY, produtos);
  renderProducts();
}

/* ---------- ALTERAR TÍTULO ---------- */
function alterarTitulo() {
  const novoTitulo =
    document.getElementById("titleInput").value || "Vitrine de Produtos";
  document.getElementById("vitrineTitle").innerText = novoTitulo;
}

/* ---------- ALTERAR COR DO TÍTULO ---------- */
const titleColorInput = document.getElementById("titleColor");
if (titleColorInput) {
  titleColorInput.addEventListener("input", function () {
    document.getElementById("vitrineTitle").style.color = this.value;
  });
}

/* ---------- PERSONALIZAÇÃO ---------- */
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
settingsBtn.onclick = () =>
  (settingsPanel.style.display =
    settingsPanel.style.display === "block" ? "none" : "block");

const themeEls = {
  primary: document.getElementById("headerBg"),
  accent: document.getElementById("accentColor"),
  pageBg: document.getElementById("pageBg"),
  cardBg: document.getElementById("cardBg"),
  text: document.getElementById("textColor"),
  radius: document.getElementById("radiusRange"),
  shadow: document.getElementById("shadowRange"),
  anim: document.getElementById("animSelect"),
  setLight: document.getElementById("setLight"),
  setDark: document.getElementById("setDark"),
  logoInput: document.getElementById("logoInput"),
};

function applyTheme() {
  document.documentElement.style.setProperty("--primary", theme.primary);
  document.documentElement.style.setProperty("--accent", theme.accent);
  document.documentElement.style.setProperty("--page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--card-bg", theme.cardBg);
  document.documentElement.style.setProperty("--text", theme.text);
  document.documentElement.style.setProperty("--radius", theme.radius + "px");
  document.documentElement.style.setProperty(
    "--shadow-strength",
    theme.shadow / 100
  );
  document.documentElement.style.setProperty(
    "--anim-duration",
    theme.anim + "ms"
  );
  document.body.classList.toggle("dark", theme.dark);
  if (theme.logo) document.getElementById("logoImg").src = theme.logo;
  document.getElementById("logoImg").style.display = theme.logo
    ? "block"
    : "none";
}

if (themeEls.primary)
  themeEls.primary.oninput = (e) => {
    theme.primary = e.target.value;
    applyTheme();
  };
if (themeEls.accent)
  themeEls.accent.oninput = (e) => {
    theme.accent = e.target.value;
    applyTheme();
  };
if (themeEls.pageBg)
  themeEls.pageBg.oninput = (e) => {
    theme.pageBg = e.target.value;
    applyTheme();
  };
if (themeEls.cardBg)
  themeEls.cardBg.oninput = (e) => {
    theme.cardBg = e.target.value;
    applyTheme();
  };
if (themeEls.text)
  themeEls.text.oninput = (e) => {
    theme.text = e.target.value;
    applyTheme();
  };
if (themeEls.radius)
  themeEls.radius.oninput = (e) => {
    theme.radius = e.target.value;
    applyTheme();
  };
if (themeEls.shadow)
  themeEls.shadow.oninput = (e) => {
    theme.shadow = e.target.value;
    applyTheme();
  };
if (themeEls.anim)
  themeEls.anim.onchange = (e) => {
    theme.anim = parseInt(e.target.value);
    applyTheme();
  };
if (themeEls.setLight)
  themeEls.setLight.onclick = () => {
    theme.dark = false;
    applyTheme();
  };
if (themeEls.setDark)
  themeEls.setDark.onclick = () => {
    theme.dark = true;
    applyTheme();
  };
if (themeEls.logoInput)
  themeEls.logoInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (end) => {
      theme.logo = end.target.result;
      applyTheme();
    };
    reader.readAsDataURL(file);
  };

const saveThemeBtn = document.getElementById("saveTheme");
if (saveThemeBtn)
  saveThemeBtn.onclick = () => {
    saveToStorage(THEME_KEY, theme);
    alert("Tema salvo no navegador!");
  };
const resetThemeBtn = document.getElementById("resetTheme");
if (resetThemeBtn)
  resetThemeBtn.onclick = () => {
    localStorage.removeItem(THEME_KEY);
    theme = {
      primary: "var(--primary)",
      accent: "var(--accent)",
      pageBg: "var(--page-bg)",
      cardBg: "var(--card-bg)",
      text: "var(--text)",
      radius: 12,
      shadow: 8,
      anim: 280,
      dark: false,
      logo: "",
    };
    applyTheme();
  };

/* ---------- INIT ---------- */
renderCategories();
renderProducts();
applyTheme();

/* ----- MODO CLIENTE / EDIÇÃO ----- */
const modeBtn = document.getElementById("modeBtn");
const settingsBtn2 = document.getElementById("settingsBtn");

function aplicarModo() {
  if (modoCliente) {
    document
      .querySelectorAll(".icon-btn")
      .forEach((b) => (b.style.display = "none"));

    // --- AQUI: esconder botões de adicionar produto ---
    document
      .querySelectorAll(".add-product, #addProduct, .addProduct")
      .forEach((b) => (b.style.display = "none"));

    if (settingsBtn2) settingsBtn2.style.display = "none";

    const panel = document.getElementById("settingsPanel");
    if (panel) panel.style.display = "none";

    if (modeBtn) modeBtn.innerText = "👁️ Modo Edição";
  } else {
    document
      .querySelectorAll(".icon-btn")
      .forEach((b) => (b.style.display = "block"));

    // --- AQUI: voltar a mostrar ---
    document
      .querySelectorAll(".add-product, #addProduct, .addProduct")
      .forEach((b) => (b.style.display = "flex"));

    if (settingsBtn2) settingsBtn2.style.display = "block";

    if (modeBtn) modeBtn.innerText = "👁️ Modo Cliente";
  }
}

if (modeBtn) {
  modeBtn.onclick = () => {
    modoCliente = !modoCliente;
    localStorage.setItem("modo_cliente", JSON.stringify(modoCliente));
    aplicarModo();
    renderProducts();
  };
}

document.addEventListener("DOMContentLoaded", () => {
  aplicarModo();
});
