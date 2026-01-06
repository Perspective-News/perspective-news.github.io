export async function loadSiteConfig() {
  const res = await fetch("data/siteConfig.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load siteConfig.json");
  return res.json();
}

export async function loadStories() {
  const res = await fetch("data/stories.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load stories.json");
  return res.json();
}
