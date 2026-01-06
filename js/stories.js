import { getState } from "./state.js";
import { openSourcesModal } from "./modal.js";

// =============================
// FRONTEND NORMALIZATION MAPS
// =============================

const REGION_NORMALIZATION_MAP = {
  "south asia": "south-asia",
  "southeast asia": "southeast-asia",
  "east asia": "east-asia",
  "middle east": "middle-east",
  "central asia": "central-asia"
};

const LANGUAGE_NORMALIZATION_MAP = {
  "english": "en",
  "en": "en",
  "hindi": "hi",
  "hi": "hi",
  "bengali": "bn",
  "bn": "bn",
  "punjabi": "pa",
  "pa": "pa",
  "japanese": "ja",
  "ja": "ja",
  "mandarin": "zh",
  "chinese": "zh",
  "zh": "zh"
};

function normalizeRegionId(value) {
  if (!value) return null;
  const key = value.toString().trim().toLowerCase();
  return REGION_NORMALIZATION_MAP[key] || key.replace(/\s+/g, "-");
}

function normalizeLanguageId(value) {
  if (!value) return null;
  const key = value.toString().trim().toLowerCase();
  return LANGUAGE_NORMALIZATION_MAP[key] || key;
}


/* =========================================================
   PUBLIC API
========================================================= */

export function renderStoriesForPage(storyPayload, siteConfig, page) {
  const stories = storyPayload?.stories || [];

  const bigMount = document.getElementById("bigCards");
  const smallMount = document.getElementById("smallCards");

  if (!bigMount || !smallMount) return;

  const state = getState();
  const regionId = state.regionId;
  const languageId = state.languageId;
  const query = (state.search || "").trim().toLowerCase();

  /* -------------------------------------------------------
     FILTERING
  ------------------------------------------------------- */

  let filtered = stories.filter(story => {
    const storyRegionIds = (story.regionIds || [])
      .map(normalizeRegionId)
      .filter(Boolean);

    const storyLanguageIds = (story.languageIds || [])
      .map(normalizeLanguageId)
      .filter(Boolean);

    const matchesLanguage = storyLanguageIds.includes(languageId);

    const matchesRegion =
      page === "international"
        ? true
        : storyRegionIds.includes(regionId);

    return matchesLanguage && matchesRegion;
  });


  /* -------------------------------------------------------
     SEARCH
  ------------------------------------------------------- */

  if (query) {
    filtered = filtered.filter(story => {
      const headline = (story.headline || "").toLowerCase();
      const summary = (story.summary || "").toLowerCase();
      const sources = (story.sources || [])
        .map(s => (s.name || "").toLowerCase())
        .join(" ");

      return (
        headline.includes(query) ||
        summary.includes(query) ||
        sources.includes(query)
      );
    });
  }

  /* -------------------------------------------------------
     SORT BY SOURCE COUNT (DESC)
  ------------------------------------------------------- */

  filtered.sort((a, b) => (b.sources?.length || 0) - (a.sources?.length || 0));

  const topStories = filtered.slice(0, 4);
  const remainingStories = filtered.slice(4);

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  bigMount.innerHTML = "";
  smallMount.innerHTML = "";

  topStories.forEach(story =>
    bigMount.appendChild(renderBigCard(story))
  );

  remainingStories.forEach(story =>
    smallMount.appendChild(renderSmallCard(story))
  );

  /* -------------------------------------------------------
     STATS (INDEX PAGE ONLY)
  ------------------------------------------------------- */

  if (page === "index") {
    const statStories = document.getElementById("statStories");
    const statSources = document.getElementById("statSources");

    if (statStories) statStories.textContent = String(filtered.length);

    if (statSources) {
      const totalSources = filtered.reduce(
        (sum, st) => sum + (st.sources?.length || 0),
        0
      );
      statSources.textContent = String(totalSources);
    }
  }
}

/* =========================================================
   CARD RENDERERS
========================================================= */

function renderBigCard(story) {
  const card = document.createElement("article");
  card.className = "card-big";

  /* -------- Content -------- */
  const content = document.createElement("div");
  content.className = "content";

  content.appendChild(renderCountries(story.countries));
  content.appendChild(renderTitle(story.headline));
  content.appendChild(renderSummary(story.summary));

  const meta = document.createElement("div");
  meta.className = "meta-row";

  const tag = document.createElement("div");
  tag.className = "tag";
  tag.textContent = "Most sources";

  const sourcesBtn = renderSourcesButton(story);

  meta.appendChild(tag);
  meta.appendChild(sourcesBtn);
  content.appendChild(meta);

  /* -------- Media -------- */
  const media = document.createElement("div");
  media.className = "media";

  const img = document.createElement("img");
  img.src = story.image || "assets/placeholder.svg";
  img.alt = story.headline || "Story image";
  img.onerror = () => (img.src = "assets/placeholder.svg");

  media.appendChild(img);

  card.appendChild(content);
  card.appendChild(media);

  return card;
}

function renderSmallCard(story) {
  const card = document.createElement("article");
  card.className = "card-small";

  const media = document.createElement("div");
  media.className = "media";

  const img = document.createElement("img");
  img.src = story.image || "assets/placeholder.svg";
  img.alt = story.headline || "Story image";
  img.onerror = () => (img.src = "assets/placeholder.svg");

  media.appendChild(img);

  const content = document.createElement("div");
  content.className = "content";

  content.appendChild(renderCountries(story.countries, 3));
  content.appendChild(renderTitle(story.headline));
  content.appendChild(renderSummary(story.summary));

  const meta = document.createElement("div");
  meta.className = "meta-row";

  meta.appendChild(renderSourcesButton(story));
  content.appendChild(meta);

  card.appendChild(media);
  card.appendChild(content);

  return card;
}

/* =========================================================
   UI HELPERS
========================================================= */

function renderCountries(countryCodes = [], limit = Infinity) {
  const row = document.createElement("div");
  row.className = "country-row";

  countryCodes.slice(0, limit).forEach(code => {
    const pill = document.createElement("div");
    pill.className = "country-item";

    const flag = document.createElement("span");
    flag.className = "flag";
    flag.textContent = countryFlag(code);

    const name = document.createElement("span");
    name.textContent = countryName(code);

    pill.appendChild(flag);
    pill.appendChild(name);
    row.appendChild(pill);
  });

  return row;
}

function renderTitle(text = "") {
  const h = document.createElement("h3");
  h.className = "card-title";
  h.textContent = text;
  return h;
}

function renderSummary(text = "") {
  const p = document.createElement("p");
  p.className = "card-summary";
  p.textContent = text;
  return p;
}

function renderSourcesButton(story) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "sources-btn";
  btn.innerHTML = `Sources <span class="tag">${story.sources?.length || 0}</span>`;

  btn.addEventListener("click", () => {
    openSourcesModal({
      headline: story.headline,
      sources: story.sources || []
    });
  });

  return btn;
}

/* =========================================================
   COUNTRY UTILITIES
========================================================= */

const COUNTRY_NAMES = {
  US: "United States",
  CA: "Canada",
  IN: "India",
  PK: "Pakistan",
  BD: "Bangladesh",
  LK: "Sri Lanka",
  NP: "Nepal",
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  ID: "Indonesia",
  PH: "Philippines",
  TH: "Thailand",
  SG: "Singapore",
  MY: "Malaysia",
  VN: "Vietnam"
};

function countryName(code) {
  return COUNTRY_NAMES[code] || code;
}

function countryFlag(code) {
  if (!code || code.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  return String.fromCodePoint(
    A + code.charCodeAt(0) - base,
    A + code.charCodeAt(1) - base
  );
}
