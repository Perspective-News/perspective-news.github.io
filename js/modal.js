let mount = null;
let lastFocus = null;

export function initModal() {
  mount = document.getElementById("modalMount");
  if (!mount) return;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

export function openSourcesModal({ headline, sources }) {
  if (!mount) return;
  closeModal();

  lastFocus = document.activeElement;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  const modal = document.createElement("div");
  modal.className = "modal";

  const header = document.createElement("div");
  header.className = "modal-header";

  const left = document.createElement("div");
  left.innerHTML = `
    <h3 class="modal-title">Sources</h3>
    <p class="modal-sub">${escapeHtml(headline || "")}</p>
  `;

  const closeBtn = document.createElement("button");
  closeBtn.className = "modal-close";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", closeModal);

  header.appendChild(left);
  header.appendChild(closeBtn);

  const body = document.createElement("div");
  body.className = "modal-body";

  const list = document.createElement("ol");
  list.className = "source-list";

  (sources || []).forEach(s => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = s.name;
    li.appendChild(a);
    list.appendChild(li);
  });

  body.appendChild(list);

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  mount.appendChild(overlay);

  closeBtn.focus();
}

export function closeModal() {
  if (!mount) return;
  const overlay = mount.querySelector(".modal-overlay");
  if (overlay) overlay.remove();
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  lastFocus = null;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#039;"
  }[m]));
}
