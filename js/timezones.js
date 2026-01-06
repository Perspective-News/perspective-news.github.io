import { getState } from "./state.js";

let intervalId = null;

export function startTimeChips(data) {
  const container = document.getElementById("timesContainer");
  if (!container) return;

  const render = () => {
    const s = getState();
    const regionIdForTime = (s.page === "international" && s.regionId === "all")
      ? (data?.regions?.[0]?.id || "south-asia")
      : s.regionId;

    const region = (data.regions || []).find(r => r.id === regionIdForTime) || data.regions?.[0];
    const cities = (region?.cities || []).slice(0, 3);

    container.innerHTML = "";
    cities.forEach(c => {
      const chip = document.createElement("div");
      chip.className = "time-chip";
      chip.innerHTML = `<span>${escapeHtml(c.name)}</span><strong>${formatTime(c.tz)}</strong>`;
      container.appendChild(chip);
    });
  };

  render();
  window.addEventListener("perspective:filtersChanged", render);

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(render, 1000 * 10); // update every 10s
}

function formatTime(timeZone) {
  try {
    const fmt = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone
    });
    return fmt.format(new Date());
  } catch {
    const fmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
    return fmt.format(new Date());
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#039;"
  }[m]));
}
