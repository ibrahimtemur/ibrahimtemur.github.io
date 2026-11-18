/* ==========================================================================
   LIVE GITHUB API REPOSITORY SYNCHRONIZATION
   Updates stars, forks, and language on curated repos & surfaces new public repos.
   ========================================================================== */

import { GITHUB_USERNAME, PROJECTS_DATA } from "./projects-data.js?v=15";
import { t } from "./i18n.js?v=15";

let githubSyncedState = "syncing"; // 'syncing' | 'synced' | 'fallback'

/**
 * Returns the current GitHub sync state ('syncing' | 'synced' | 'fallback').
 */
export function getGitHubSyncState() {
  return githubSyncedState;
}

/**
 * Updates the GitHub status indicator text & classes using active i18n dictionary.
 */
export function updateGitHubStatusLabel() {
  const statusWrap = document.getElementById("githubSyncStatus");
  const statusEl = document.getElementById("githubSyncText");
  if (!statusEl) return;

  if (githubSyncedState === "synced") {
    statusEl.textContent = t("github.synced");
    statusWrap?.classList.add("is-synced");
  } else if (githubSyncedState === "fallback") {
    statusEl.textContent = t("github.fallback");
    statusWrap?.classList.remove("is-synced");
  } else {
    statusEl.textContent = t("github.syncing");
    statusWrap?.classList.remove("is-synced");
  }
}

/**
 * Fetches live repository metadata from GitHub API and updates PROJECTS_DATA.
 */
export async function syncWithGitHubApi(onUpdate = null) {
  githubSyncedState = "syncing";
  updateGitHubStatusLabel();

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const repos = await response.json();

    if (Array.isArray(repos)) {
      const knownRepos = new Set(
        PROJECTS_DATA.map((p) => (p.repoName ? p.repoName.toLowerCase() : null)).filter(Boolean)
      );
      knownRepos.add(GITHUB_USERNAME.toLowerCase());
      knownRepos.add(`${GITHUB_USERNAME.toLowerCase()}.github.io`);

      repos.forEach((repo) => {
        if (!repo || !repo.name) return;
        const lowerName = repo.name.toLowerCase();

        const match = PROJECTS_DATA.find(
          (p) => p.repoName && p.repoName.toLowerCase() === lowerName
        );
        if (match) {
          match.stars =
            typeof repo.stargazers_count === "number" ? repo.stargazers_count : match.stars;
          match.forks =
            typeof repo.forks_count === "number" ? repo.forks_count : match.forks;
          if (repo.language) {
            match.language = repo.language;
          }
          return;
        }

        if (!knownRepos.has(lowerName) && !repo.fork) {
          knownRepos.add(lowerName);
          const langTag = repo.language || "Software";
          const inferredCat = ["Dart", "Swift", "Kotlin"].includes(repo.language)
            ? "mobile"
            : ["C", "C++"].includes(repo.language)
            ? "iot"
            : ["Python", "Java"].includes(repo.language)
            ? "desktop"
            : "web";

          PROJECTS_DATA.push({
            id: `gh-${repo.name}`,
            repoName: repo.name,
            categories: [inferredCat],
            primaryCategory: inferredCat,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            language: repo.language || null,
            title: {
              tr: repo.name,
              en: repo.name
            },
            categoryBadge: {
              tr: `GitHub Repo · ${langTag}`,
              en: `GitHub Repo · ${langTag}`
            },
            description: (() => {
              const rawDesc = (repo.description || "")
                .replace(/\(\s*(?:Aydın\s+)?Adnan\s+Menderes\s+(?:Üniversitesi|University)(?:\s*\(AD[ÜU]\))?\s*\)/gi, "")
                .replace(/(?:Aydın\s+)?Adnan\s+Menderes\s+(?:Üniversitesi|University)(?:\s*\(AD[ÜU]\))?/gi, "")
                .replace(/\(\s*AD[ÜU]\s*\)/gi, "")
                .replace(/(?<![\p{L}\p{N}])AD[ÜU](?![\p{L}\p{N}])/giu, "")
                .replace(/\s{2,}/g, " ")
                .replace(/\s+([,.;:!?])/g, "$1")
                .trim();
              return {
                tr: rawDesc || "GitHub üzerinde yayınlanan açık kaynak yazılım projesi.",
                en: rawDesc || "Open-source software project published on GitHub."
              };
            })(),
            tech: [langTag, "Git", "Open Source"],
            links: [
              ...(repo.homepage
                ? [{ labelTr: "Canlı Demo", labelEn: "Live Demo", url: repo.homepage, type: "live" }]
                : []),
              { labelTr: "GitHub", labelEn: "GitHub", url: repo.html_url, type: "repo" }
            ]
          });
        }
      });

      githubSyncedState = "synced";
      updateGitHubStatusLabel();
      if (typeof onUpdate === "function") onUpdate(PROJECTS_DATA);
      window.dispatchEvent(new CustomEvent("portfolio:projects-updated"));
    }
  } catch (_) {
    githubSyncedState = "fallback";
    updateGitHubStatusLabel();
  }
}
