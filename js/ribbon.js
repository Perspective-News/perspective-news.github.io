import { getState, setState } from "./state.js";

export function initRibbonUI(data, page) {
  const regionSelect = document.getElementById("regionSelect");
  const languageSelect = document.getElementById("languageSelect");

  if (regionSelect) {
    regionSelect.innerHTML = "";

    // For international page: include "All regions" option for content feed,
    // but time chips still use the selected region if not "all".
    if (page === "international") {
      regionSelect.appendChild(new Option("All Regions (feed)", "all"));
    }

    (data.regions || []).forEach(r => {
      regionSelect.appendChild(new Option(r.label, r.id));
    });
  }

  if (languageSelect) {
    languageSelect.innerHTML = "";
    (data.languages || []).forEach(l => {
      languageSelect.appendChild(new Option(l.label, l.id));
    });
  }

  const s = getState();
  if (regionSelect) regionSelect.value = (page === "international" ? (s.regionId || "all") : s.regionId);
  if (languageSelect) languageSelect.value = s.languageId;

  regionSelect?.addEventListener("change", () => {
    const s2 = getState();
    setState({ regionId: regionSelect.value });
    window.dispatchEvent(new CustomEvent("perspective:filtersChanged"));
  });

  languageSelect?.addEventListener("change", () => {
    setState({ languageId: languageSelect.value });
    window.dispatchEvent(new CustomEvent("perspective:filtersChanged"));
  });
}

export function setActiveNav(page) {
  const links = document.querySelectorAll(".navlinks a[data-nav]");
  links.forEach(a => a.classList.remove("active"));
  const current = document.querySelector(`.navlinks a[data-nav="${page}"]`);
  if (current) current.classList.add("active");
}
