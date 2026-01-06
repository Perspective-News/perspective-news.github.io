import { getState, setState } from "./state.js";

export function initThemeUI() {
  const btn = document.getElementById("themeToggleBtn");
  const label = document.getElementById("themeLabel");
  if (!btn || !label) return;

  sync(label);

  btn.addEventListener("click", () => {
    const s = getState();
    const nextTheme = s.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    setState({ theme: nextTheme });
    sync(label);
    window.dispatchEvent(new CustomEvent("perspective:themeChanged"));
  });
}

function sync(labelEl) {
  const s = getState();
  labelEl.textContent = s.theme === "dark" ? "Dark" : "Light";
}
