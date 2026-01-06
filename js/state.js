const KEY = "perspective_state_v1";

let state = {
  theme: "light",
  regionId: null,
  languageId: null,
  search: "",
  page: "index",
  site: null
};

export function initState(data, page) {
  const saved = safeParse(localStorage.getItem(KEY));
  const theme = saved?.theme || (document.documentElement.dataset.theme || "light");

  const defaultRegion = data?.regions?.[0]?.id || "south-asia";
  const defaultLang = data?.languages?.[0]?.id || "en";

  const regionId = saved?.regionId || defaultRegion;
  const languageId = saved?.languageId || defaultLang;

  state = {
    ...state,
    theme,
    regionId,
    languageId,
    search: saved?.search || "",
    page
  };

  document.documentElement.dataset.theme = theme;
  persist();
}

export function getState() {
  return { ...state };
}

export function setState(next) {
  state = { ...state, ...next };
  persist();
}

function persist() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function safeParse(x) {
  try { return JSON.parse(x); } catch { return null; }
}
