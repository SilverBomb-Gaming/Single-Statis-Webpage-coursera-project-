const API_URL = "https://api.github.com/repos/SilverBomb-Gaming/Single-Statis-Webpage-coursera-project-/issues?state=open&labels=recommendation&per_page=100";
const CACHE_KEY = "approvedRecommendations_v1";

const recList = document.getElementById("recommendationList");
const recStatus = document.getElementById("recommendationStatus");

function escapeText(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatRecommendation(body) {
  if (!body) return "";
  return escapeText(body.trim()).replace(/\r?\n/g, "<br />");
}

function parseIssueBody(bodyText) {
  if (!bodyText) return { name: "", recommendation: "" };
  const nameMatch = bodyText.match(/Name:\s*(.*)/i);
  const recMatch = bodyText.match(/Recommendation:\s*([\s\S]*)/i);
  return {
    name: nameMatch ? nameMatch[1].trim() : "",
    recommendation: recMatch ? recMatch[1].trim() : bodyText.trim(),
  };
}

function createMetaText(entry) {
  const pieces = [];
  const hasName = Boolean(entry.name);
  const hasLogin = Boolean(entry.login);

  if (hasName && hasLogin && entry.name !== entry.login) {
    pieces.push(`${entry.name} (${entry.login})`);
  } else if (hasName || hasLogin) {
    pieces.push(entry.name || entry.login);
  } else {
    pieces.push("GitHub user");
  }

  if (entry.createdAt) {
    const date = new Date(entry.createdAt);
    if (!Number.isNaN(date.valueOf())) {
      pieces.push(
        date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      );
    }
  }

  return pieces.join(" • ");
}

function renderRecommendations(items) {
  if (!recList) return;
  recList.innerHTML = "";

  if (!items.length) {
    setStatus("No approved recommendations yet. Be the first to share one on GitHub!");
    return;
  }

  clearStatus();

  items.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "recommendation";

    const text = document.createElement("p");
    text.className = "recommendation-text";
    text.innerHTML = `“${formatRecommendation(entry.text)}”`;

    const meta = document.createElement("p");
    meta.className = "recommendation-meta";
    meta.textContent = createMetaText(entry);

    card.appendChild(text);
    card.appendChild(meta);
    recList.appendChild(card);
  });
}

function setStatus(message, isError = false) {
  if (!recStatus) return;
  recStatus.textContent = message;
  recStatus.hidden = !message;
  recStatus.classList.toggle("error", isError);
}

function clearStatus() {
  setStatus("");
}

function setBusy(isBusy) {
  if (!recList) return;
  recList.setAttribute("aria-busy", String(isBusy));
}

function saveCache(items) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch (_) {
    // ignore storage failures
  }
}

function readCache() {
  try {
    const stored = sessionStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (_) {
    return null;
  }
}

function issueHasLabel(issue, labelName) {
  const target = labelName.toLowerCase();
  return issue.labels?.some(
    (label) => typeof label.name === "string" && label.name.toLowerCase() === target
  );
}

function toEntry(issue) {
  const parsed = parseIssueBody(issue.body || "");
  return {
    id: issue.id,
    text: parsed.recommendation,
    name: parsed.name,
    login: issue.user?.login || "",
    createdAt: issue.created_at,
  };
}

async function fetchRecommendations() {
  const response = await fetch(API_URL, {
    headers: { Accept: "application/vnd.github+json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }

  return response.json();
}

async function hydrateRecommendations() {
  if (!recList || !recStatus) return;

  const cached = readCache();
  if (cached?.length) {
    renderRecommendations(cached);
  } else {
    setStatus("Loading recommendations...");
  }

  setBusy(true);

  try {
    const issues = await fetchRecommendations();
    const approved = issues
      .filter((issue) => issueHasLabel(issue, "recommendation"))
      .filter((issue) => issueHasLabel(issue, "approved"))
      .map(toEntry);

    renderRecommendations(approved);
    saveCache(approved);
  } catch (error) {
    console.error("Unable to load recommendations", error);
    if (cached?.length) {
      setStatus(
        "Showing cached recommendations. Live updates are temporarily unavailable.",
        true
      );
    } else {
      recList.innerHTML = "";
      setStatus("Recommendations temporarily unavailable. Please try again later.", true);
    }
  } finally {
    setBusy(false);
  }
}

hydrateRecommendations();
