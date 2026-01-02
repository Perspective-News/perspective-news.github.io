document.addEventListener("DOMContentLoaded", () => {
  /* ================================
     REGION CONFIG
  ================================ */

  const REGIONS = {
    "south-asia": {
      optionLabel: "South Asia Edition",
      zones: [
        { city: "Delhi", tz: "Asia/Kolkata" },
        { city: "Karachi", tz: "Asia/Karachi" },
        { city: "Dhaka", tz: "Asia/Dhaka" },
        { city: "Colombo", tz: "Asia/Colombo" },
        { city: "Kathmandu", tz: "Asia/Kathmandu" }
      ]
    },
    "southeast-asia": {
      optionLabel: "Southeast Asia Edition",
      zones: [
        { city: "Bangkok", tz: "Asia/Bangkok" },
        { city: "Jakarta", tz: "Asia/Jakarta" },
        { city: "Singapore", tz: "Asia/Singapore" },
        { city: "Manila", tz: "Asia/Manila" }
      ]
    },
    "east-asia": {
      optionLabel: "East Asia Edition",
      zones: [
        { city: "Tokyo", tz: "Asia/Tokyo" },
        { city: "Seoul", tz: "Asia/Seoul" },
        { city: "Beijing", tz: "Asia/Shanghai" }
      ]
    },
    "central-asia": {
      optionLabel: "Central Asia Edition",
      zones: [
        { city: "Almaty", tz: "Asia/Almaty" },
        { city: "Tashkent", tz: "Asia/Tashkent" }
      ]
    },
    "middle-east": {
      optionLabel: "Middle East Edition",
      zones: [
        { city: "Dubai", tz: "Asia/Dubai" },
        { city: "Riyadh", tz: "Asia/Riyadh" },
        { city: "Tehran", tz: "Asia/Tehran" }
      ]
    }
  };

  const LANGUAGES = {
    english: { optionLabel: "English Language" }
  };

  /* ================================
     DOM ELEMENTS
  ================================ */

  const regionSelect = document.getElementById("regionSelect");
  const languageSelect = document.getElementById("languageSelect");
  const timeEl = document.getElementById("times");
  const themeToggle = document.getElementById("themeToggle");

  /* ================================
     POPULATE DROPDOWNS
  ================================ */

  if (regionSelect && languageSelect) {
    Object.entries(REGIONS).forEach(([key, region]) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = region.optionLabel;
      regionSelect.appendChild(opt);
    });

    Object.entries(LANGUAGES).forEach(([key, lang]) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = lang.optionLabel;
      languageSelect.appendChild(opt);
    });

    regionSelect.value = "south-asia";
    languageSelect.value = "english";

    const renderTimes = () => {
      const region = REGIONS[regionSelect.value];
      if (!region || !timeEl) return;

      timeEl.textContent = region.zones
        .map(z => {
          const time = new Date().toLocaleTimeString("en-US", {
            timeZone: z.tz,
            hour: "2-digit",
            minute: "2-digit"
          });
          return `${z.city}: ${time}`;
        })
        .join(" | ");
    };

    regionSelect.addEventListener("change", renderTimes);
    languageSelect.addEventListener("change", renderTimes);

    setInterval(renderTimes, 1000);
    renderTimes();
  }

  /* ================================
     THEME TOGGLE
  ================================ */

  if (themeToggle) {
    themeToggle.checked = document.body.classList.contains("dark");

    themeToggle.addEventListener("change", () => {
      document.body.classList.toggle("dark");
      document.body.classList.toggle("light");
    });
  }

  /* ================================
     NEWS SLIDER (INDEX ONLY)
  ================================ */

  const track = document.getElementById("news-track");
  const slider = document.getElementById("news-slider");
  const btnLeft = document.getElementById("slideLeft");
  const btnRight = document.getElementById("slideRight");

  if (track && slider && btnLeft && btnRight) {
    let currentOffset = 0;
    const slideAmount = 340;

    btnLeft.onclick = () => {
      currentOffset = Math.min(currentOffset + slideAmount, 0);
      track.style.transform = `translateX(${currentOffset}px)`;
    };

    btnRight.onclick = () => {
      const maxScroll = slider.offsetWidth - track.scrollWidth;
      currentOffset = Math.max(currentOffset - slideAmount, maxScroll);
      track.style.transform = `translateX(${currentOffset}px)`;
    };

    fetch("./output_events.json")
      .then(res => res.json())
      .then(data => {
        if (!data?.events?.length) return;

        data.events.forEach(event => {
          const card = document.createElement("div");
          card.className = "news-card";

          const sourcesHTML = (event.sources || [])
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
      })
      .catch(err => console.error("Failed to load news:", err));
  }

  /* ================================
     SOURCES LIST (HOW IT WORKS ONLY)
  ================================ */

  const sourcesGrid = document.getElementById("sources-grid");
  if (!sourcesGrid) return;

  fetch("./sources.csv")
    .then(res => res.text())
    .then(csvText => {
      const rows = csvText.split("\n").slice(1);
      const sourcesByRegion = {};

      rows.forEach(row => {
        if (!row.trim()) return;

        const cols = row.split(",");
        const sourceName = cols[0]?.trim();
        const region = cols[4]?.trim();

        if (!sourceName || !region) return;

        if (!sourcesByRegion[region]) {
          sourcesByRegion[region] = [];
        }

        sourcesByRegion[region].push(sourceName);
      });

      Object.entries(sourcesByRegion).forEach(([region, sources]) => {
        const card = document.createElement("div");
        card.className = "mini-card";

        card.innerHTML = `
          <div class="mini-title">${formatRegion(region)}</div>
          <p class="mini-text">
            ${sources.slice(0, 10).join(", ")}
            ${sources.length > 10 ? "…" : ""}
          </p>
        `;

        sourcesGrid.appendChild(card);
      });
    })
    .catch(() => {
      sourcesGrid.innerHTML =
        "<p class='section-text'>Unable to load sources list.</p>";
    });

  function formatRegion(region) {
    return region
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }
});
