import { loadSiteConfig, loadStories } from "./dataService.js";
import { getState, initState, setState } from "./state.js";
import { initThemeUI } from "./theme.js";
import { initRibbonUI, setActiveNav } from "./ribbon.js";
import { startTimeChips } from "./timezones.js";
import { initModal } from "./modal.js";
import { initSearch } from "./search.js";
import { renderStoriesForPage } from "./stories.js";

async function boot() {
  const page = document.body.dataset.page || "index";

  const siteConfig = await loadSiteConfig();
  const storyData = await loadStories();

  initState(siteConfig, page);
  initThemeUI();
  initModal();
  initRibbonUI(siteConfig, page);
  initSearch(() => refresh(siteConfig, storyData, page));
  setActiveNav(page);

  wireSiteLinks(siteConfig);
  startTimeChips(siteConfig);

  refresh(siteConfig, storyData, page);

  window.addEventListener("perspective:filtersChanged", () =>
    refresh(siteConfig, storyData, page)
  );
}

function wireSiteLinks(config) {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  document.getElementById("footerGithub")?.setAttribute("href", config.site.links.githubRepo);
  document.getElementById("footerLinkedIn")?.setAttribute("href", config.site.links.linkedin);
  document.getElementById("suggestionBtn")?.setAttribute("href", config.site.links.suggestionForm);
  document.getElementById("githubBtn")?.setAttribute("href", config.site.links.githubRepo);

  const logo = document.getElementById("brandLogo");
  if (logo) logo.src = config.site.logoPath;

  setState({ site: config.site });
}

function refresh(siteConfig, storyData, page) {
  renderStoriesForPage(
    { stories: storyData.stories },
    siteConfig,
    page
  );
}

boot();
