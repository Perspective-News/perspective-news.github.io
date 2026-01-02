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
     NEWS FEED (INDEX ONLY)
  ================================ */

  const feed = document.getElementById("news-feed");
  const topGrid = document.getElementById("top-grid");
  const restList = document.getElementById("rest-list");
  const emptyState = document.getElementById("news-empty");

  const REGION_COUNTRIES = {
    "south-asia": [
      "India",
      "Pakistan",
      "Bangladesh",
      "Sri Lanka",
      "Nepal",
      "Bhutan",
      "Maldives",
      "Afghanistan"
    ],
    "southeast-asia": [
      "Singapore",
      "Thailand",
      "Malaysia",
      "Indonesia",
      "Philippines",
      "Vietnam",
      "Cambodia",
      "Laos",
      "Myanmar",
      "Brunei",
      "Timor-Leste"
    ],
    "east-asia": [
      "China",
      "Japan",
      "South Korea",
      "North Korea",
      "Taiwan",
      "Hong Kong",
      "Mongolia",
      "Macau"
    ],
    "central-asia": [
      "Kazakhstan",
      "Kyrgyzstan",
      "Tajikistan",
      "Turkmenistan",
      "Uzbekistan"
    ],
    "middle-east": [
      "United Arab Emirates",
      "UAE",
      "Saudi Arabia",
      "Qatar",
      "Kuwait",
      "Bahrain",
      "Oman",
      "Yemen",
      "Iran",
      "Iraq",
      "Syria",
      "Lebanon",
      "Jordan",
      "Israel",
      "Palestine",
      "Turkey"
    ]
  };

  const computeRegionCoverage = (event, regionKey) => {
    const cc = event?.country_coverage || {};
    const allow = new Set(REGION_COUNTRIES[regionKey] || []);

    let sum = 0;
    let matched = 0;

    Object.entries(cc).forEach(([country, pct]) => {
      if (allow.has(country)) {
        matched += 1;
        sum += Number(pct) || 0;
      }
    });

    if (matched > 0) return sum;

    return Math.max(
      0,
      ...Object.values(cc).map(v => Number(v) || 0)
    );
  };

  const normalizeCountryCoverage = countryCoverage => {
    return Object.entries(countryCoverage || {})
      .map(([k, v]) => [k, Number(v) || 0])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
  };

  // ---- global tooltip helpers (safe to keep inside this file) ----
function ensureCoverageTooltip() {
  let tip = document.querySelector(".coverage-tooltip");
  if (!tip) {
    tip = document.createElement("div");
    tip.className = "coverage-tooltip";
    document.body.appendChild(tip);
  }
  return tip;
}

function showTooltip(tip, text) {
  tip.textContent = text;
  tip.classList.add("show");
}

function hideTooltip(tip) {
  tip.classList.remove("show");
}

function moveTooltip(tip, clientX, clientY) {
  const pad = 12;
  let x = clientX + pad;
  let y = clientY + pad;

  // measure after text is set
  const rect = tip.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (x + rect.width + 8 > vw) x = clientX - rect.width - pad;
  if (y + rect.height + 8 > vh) y = clientY - rect.height - pad;

  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
}

// ---- REPLACE your existing buildCountryGraph with this ----
const buildCountryGraph = (coverageEntries, seed = "") => {
  const tooltip = ensureCoverageTooltip();

  const graph = document.createElement("div");
  graph.className = "country-graph";

  const n = Math.max(coverageEntries.length, 1);
  const stableSeed =
    (seed || "")
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;

  coverageEntries.forEach(([country, pct], i) => {
    const seg = document.createElement("div");
    seg.className = "country-segment";
    seg.style.flex = `${pct} 0 0`;

    const hue = (stableSeed + Math.round((i * 360) / n)) % 360;
    seg.style.background = `hsl(${hue}, 70%, 50%)`;

    // hover handlers
    seg.addEventListener("mouseenter", e => {
      showTooltip(tooltip, `${country}: ${pct.toFixed(2)}%`);
      moveTooltip(tooltip, e.clientX, e.clientY);
    });

    seg.addEventListener("mousemove", e => {
      moveTooltip(tooltip, e.clientX, e.clientY);
    });

    seg.addEventListener("mouseleave", () => {
      hideTooltip(tooltip);
    });

    graph.appendChild(seg);
  });

  return graph;
};


  const buildCard = (event, variant = "big") => {
    const card = document.createElement("article");
    card.className = `news-card ${
      variant === "small" ? "news-card--small" : ""
    }`;

    const regions = Object.keys(event?.regions || {});
    const metaLeft = regions.length
      ? regions
          .map(r => REGIONS[r]?.optionLabel || r)
          .join(" • ")
      : "";

    const ccEntries = normalizeCountryCoverage(event?.country_coverage);
    const strongest = ccEntries[0]?.[0] ? `Top: ${ccEntries[0][0]}` : "";
    const metaRight = event?.num_articles
      ? `${event.num_articles} sources`
      : "";

    const inner = document.createElement("div");
    inner.className = "news-card-inner";

    const content = document.createElement("div");
    content.className = "news-content";

    const meta = document.createElement("div");
    meta.className = "news-meta";
    meta.textContent = [metaLeft, strongest, metaRight]
      .filter(Boolean)
      .join(" — ");

    const title = document.createElement("h3");
    title.className = "news-title";
    title.textContent = event?.event_name || "Untitled";

    const summary = document.createElement("p");
    summary.className = "news-summary";
    summary.textContent = event?.summary_50_60_words || "";

    const graph = buildCountryGraph(
      ccEntries,
      String(event?.event_id ?? "")
    );

    content.append(meta, title, summary, graph);

    const visual = document.createElement("div");
    visual.className = "news-visual";
    visual.setAttribute("aria-hidden", "true");

    inner.append(content, visual);
    card.appendChild(inner);

    return card;
  };

  const renderFeedForRegion = (allEvents, regionKey) => {
    if (!topGrid || !restList || !emptyState) return;

    topGrid.innerHTML = "";
    restList.innerHTML = "";

    const filtered = (allEvents || [])
      .filter(e => e?.regions && e.regions[regionKey])
      .sort(
        (a, b) =>
          computeRegionCoverage(b, regionKey) -
          computeRegionCoverage(a, regionKey)
      );

    emptyState.hidden = filtered.length > 0;
    if (!filtered.length) return;

    filtered.slice(0, 4).forEach(e =>
      topGrid.appendChild(buildCard(e, "big"))
    );

    filtered.slice(4).forEach(e =>
      restList.appendChild(buildCard(e, "small"))
    );
  };

  if (feed && topGrid && restList && regionSelect) {
    fetch("./output_events.json")
      .then(res => res.json())
      .then(data => {
        const allEvents = data?.events || [];
        const render = () =>
          renderFeedForRegion(allEvents, regionSelect.value);
        render();
        regionSelect.addEventListener("change", render);
      })
      .catch(err => console.error("Failed to load news:", err));
  }

  /* ================================
     SOURCES LIST (HOW IT WORKS)
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

        sourcesByRegion[region] ||= [];
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
