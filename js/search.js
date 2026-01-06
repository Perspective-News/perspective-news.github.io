import { getState, setState } from "./state.js";

export function initSearch(onChange) {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const s = getState();
  input.value = s.search || "";

  let t = null;
  input.addEventListener("input", () => {
    const v = input.value || "";
    setState({ search: v });

    if (t) clearTimeout(t);
    t = setTimeout(() => {
      onChange?.();
    }, 120);
  });
}
