document.addEventListener("DOMContentLoaded", () => {
  /* ===== Theme toggle ===== */
  const toggle = document.getElementById("themeToggle");
  toggle.onclick = () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
  };

  /* ===== Time ribbon ===== */
  const zones = {
    Delhi: "Asia/Kolkata",
    Karachi: "Asia/Karachi",
    Dhaka: "Asia/Dhaka",
    Colombo: "Asia/Colombo"
  };

  function updateTimes() {
    const el = document.getElementById("times");
    el.innerHTML = Object.entries(zones)
      .map(
        ([c, z]) =>
          `${c}: ${new Date().toLocaleTimeString("en-US", {
            timeZone: z,
            hour: "2-digit",
            minute: "2-digit"
          })}`
      )
      .join(" | ");
  }

  setInterval(updateTimes, 1000);
  updateTimes();

  /* ===== News slider ===== */
  const track = document.getElementById("news-track");
  const slider = document.getElementById("news-slider");

  let currentOffset = 0;
  const slideAmount = 340;

  document.getElementById("slideLeft").onclick = () => {
    currentOffset = Math.min(currentOffset + slideAmount, 0);
    track.style.transform = `translateX(${currentOffset}px)`;
  };

  document.getElementById("slideRight").onclick = () => {
    const maxScroll =
      slider.offsetWidth - track.scrollWidth;
    currentOffset = Math.max(currentOffset - slideAmount, maxScroll);
    track.style.transform = `translateX(${currentOffset}px)`;
  };

  /* ===== Fetch events ===== */
  fetch("./output_events.json")
    .then(res => res.json())
    .then(data => {
      const events = data.events;

      events.forEach(event => {
        const card = document.createElement("div");
        card.className = "news-card";

        const sourcesHTML = event.sources
          .map(
            s =>
              `<a href="${s.website_link}" target="_blank" rel="noopener noreferrer">${s.source_name}</a>`
          )
          .join(" • ");

        card.innerHTML = `
          <h4>${event.event_name}</h4>
          <p>${event.summary_50_60_words}</p>
          <div class="sources">${sourcesHTML}</div>
        `;

        track.appendChild(card);
      });

      /* 🔑 IMPORTANT: reset slider after render */
      currentOffset = 0;
      track.style.transform = "translateX(0px)";
    })
    .catch(err => console.error("Failed to load events", err));
});
