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

  /* ================================
     LANGUAGE CONFIG
  ================================ */

  const LANGUAGES = {
    english: {
      optionLabel: "English Language"
    }
  };

  /* ================================
     DOM ELEMENTS
  ================================ */

  const regionSelect = document.getElementById("regionSelect");
  const languageSelect = document.getElementById("languageSelect");
  const timeEl = document.getElementById("times");

  /* ================================
     POPULATE DROPDOWNS
  ================================ */

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

  /* ================================
     TIME RENDERING
  ================================ */

  function renderTimes() {
    const region = REGIONS[regionSelect.value];

    const regionText =
      regionSelect.selectedOptions[0].textContent;
    const languageText =
      languageSelect.selectedOptions[0].textContent;

    const times = region.zones
      .map(z => {
        const time = new Date().toLocaleTimeString("en-US", {
          timeZone: z.tz,
          hour: "2-digit",
          minute: "2-digit"
        });
        return `${z.city}: ${time}`;
      })
      .join(" | ");

    timeEl.textContent = times;

  }

  regionSelect.addEventListener("change", renderTimes);
  languageSelect.addEventListener("change", renderTimes);

  setInterval(renderTimes, 1000);
  renderTimes();

  /* ================================
     THEME TOGGLE
  ================================ */

  const themeToggle = document.getElementById("themeToggle");

  // default state
  themeToggle.checked = document.body.classList.contains("dark");

  themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
  });


  /* ================================
     NEWS SLIDER
  ================================ */

  const track = document.getElementById("news-track");
  const slider = document.getElementById("news-slider");
  let currentOffset = 0;
  const slideAmount = 340;

  document.getElementById("slideLeft").onclick = () => {
    currentOffset = Math.min(currentOffset + slideAmount, 0);
    track.style.transform = `translateX(${currentOffset}px)`;
  };

  document.getElementById("slideRight").onclick = () => {
    const maxScroll = slider.offsetWidth - track.scrollWidth;
    currentOffset = Math.max(currentOffset - slideAmount, maxScroll);
    track.style.transform = `translateX(${currentOffset}px)`;
  };

  /* ================================
     FETCH NEWS
  ================================ */

  fetch("./output_events.json")
    .then(res => res.json())
    .then(data => {
      data.events.forEach(event => {
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

      track.style.transform = "translateX(0px)";
    })
    .catch(err => console.error("Failed to load news:", err));
});
