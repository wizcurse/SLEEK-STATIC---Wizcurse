// Cleaned JavaScript containing only UI Logic, Canvas Particles, UI Navigation, Games, Music, & Slick AI Chat
// Excludes proxy-specific controller logic, Scramjet frame initialization, and URL routing

window.SLEEK_API = window.SLEEK_API || {
	openRouterKey: "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",
	openRouterTextModel: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
	openRouterVisionModel: "google/gemma-3-27b-it:free",
	youtubeKey: "AIzaSyBxaesmC67RCgSnWXM87JqH67grCP3PmeA",
};

const SLEEK_TITLE = "Sleek Science - learn science in an easy and enaging way!";
document.title = SLEEK_TITLE;
const sleekFavicon = document.querySelector('link[data-sleek-favicon], link[rel="icon"]') || document.createElement("link");
sleekFavicon.rel = "icon";
sleekFavicon.type = "image/png";
sleekFavicon.href = "/sleek-logo.png";
sleekFavicon.dataset.sleekFavicon = "true";
if (!sleekFavicon.isConnected) document.head.append(sleekFavicon);

const nativeFetch = window.fetch.bind(window);

function responseJson(payload, status = 200) {
	return new Response(JSON.stringify(payload), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

window.fetch = async (input, options = {}) => {
	const requestUrl = typeof input === "string" ? input : input?.url || "";
	const api = window.SLEEK_API;

	if (requestUrl.startsWith("/api/music/search") && api.youtubeKey) {
		const query = new URL(requestUrl, location.origin).searchParams.get("q") || "";
		const youtubeUrl = new URL("https://www.googleapis.com/youtube/v3/search");
		youtubeUrl.search = new URLSearchParams({
			part: "snippet",
			q: query,
			type: "video",
			maxResults: "10",
			key: api.youtubeKey,
		});
		const response = await nativeFetch(youtubeUrl);
		const payload = await response.json();
		if (!response.ok) return responseJson({ error: payload.error?.message || "YouTube search failed." }, response.status);
		return responseJson((payload.items || []).map((item) => ({
			id: item.id?.videoId,
			title: item.snippet?.title || "Untitled",
			channel: item.snippet?.channelTitle || "YouTube",
			thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
		})).filter((item) => item.id));
	}

	if (requestUrl === "/api/slick/chat" && api.openRouterKey) {
		const requestBody = typeof options.body === "string" ? JSON.parse(options.body) : {};
		const messages = requestBody.messages || [];
		const hasImage = messages.some((message) =>
			Array.isArray(message?.content) &&
			message.content.some((part) => part?.type === "image_url"),
		);
		const response = await nativeFetch("https://openrouter.ai/api/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${api.openRouterKey}`,
				"HTTP-Referer": location.origin,
				"X-Title": "SLEEK",
			},
			body: JSON.stringify({
				model: hasImage ? api.openRouterVisionModel : api.openRouterTextModel,
				messages,
			}),
		});
		const payload = await response.json();
		if (!response.ok) return responseJson({ error: payload.error?.message || "OpenRouter request failed." }, response.status);
		return responseJson({ reply: payload.choices?.[0]?.message?.content || "No response." });
	}

	return nativeFetch(input, options);
};

const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const homeParticlesCanvas = document.getElementById("sj-home-particles");
const settingsButton = document.getElementById("sj-settings");
const settingsPanel = document.getElementById("sj-settings-panel");
const accountButton = document.getElementById("sj-account");
const accountPanel = document.getElementById("sj-account-panel");
const accountName = document.getElementById("sj-account-name");
const accountNameLabel = document.getElementById("sj-account-name-label");
const accountAvatar = document.getElementById("sj-account-avatar");
const accountAvatarFile = document.getElementById("sj-account-avatar-file");
const historyList = document.getElementById("sj-history-list");
const historyToggle = document.getElementById("sj-history-toggle");
const homeClock = document.getElementById("sj-home-clock");
const incognitoToggle = document.getElementById("sj-incognito-toggle");
const languageSelect = document.getElementById("sj-language-select");
const clockSelect = document.getElementById("sj-clock-select");
const accountClock = document.getElementById("sj-account-clock");
const particlesToggle = document.getElementById("sj-particles-toggle");
const animationsToggle = document.getElementById("sj-animations-toggle");
const compactToggle = document.getElementById("sj-compact-toggle");
const brandName = document.getElementById("sj-brand-name");
const themeUpload = document.getElementById("sj-theme-upload");
const themeUploadStatus = document.getElementById("sj-theme-upload-status");
const closeSettings = () => (settingsPanel.hidden = true);

const cloakOptions = [
	{ id: "sleek", name: "SLEEK", title: SLEEK_TITLE, favicon: "/sleek-logo.png" },
	{ id: "google", name: "Google", title: "Google", favicon: "https://www.google.com/favicon.ico" },
	{ id: "khan", name: "Khan Academy", title: "Khan Academy", favicon: "https://www.khanacademy.org/favicon.ico" },
	{ id: "coursera", name: "Coursera", title: "Coursera", favicon: "https://www.coursera.org/favicon.ico" },
	{ id: "Canvas", name: "Canvas", title: "Dashboard", favicon: "https://parents.canvaslms.com/favicon.ico" },
	{ id: "wikipedia", name: "Wikipedia", title: "Wikipedia", favicon: "https://www.wikipedia.org/static/favicon/wikipedia.ico" },
	{ id: "ixl", name: "IXL", title: "Student Dashboard", favicon: "https://www.ixl.com/favicon.ico" },
	{ id: "desmos", name: "Desmos", title: "Desmos | Beautiful Math", favicon: "https://www.desmos.com/favicon.ico" },
	{ id: "quizlet", name: "Quizlet", title: "Quizlet", favicon: "https://quizlet.com/favicon.ico" },
	{ id: "kahoot", name: "Kahoot!", title: "Kahoot!", favicon: "https://favicon.run/favicon?domain=kahoot.com&sz=32" },
	{ id: "edpuzzle", name: "Edpuzzle", title: "Edpuzzle", favicon: "https://favicon.run/favicon?domain=edpuzzle.com&sz=32" },
	{ id: "schoology", name: "Schoology", title: "Schoology", favicon: "https://favicon.run/favicon?domain=schoology.com&sz=32" },
];

const applyCloak = (cloakId) => {
	const option = cloakOptions.find((item) => item.id === cloakId) || cloakOptions[0];
	document.title = option.title;
	let favicon = document.querySelector('link[data-sleek-favicon], link[rel="icon"]');
	if (!favicon) {
		favicon = document.createElement("link");
		favicon.rel = "icon";
		favicon.dataset.sleekFavicon = "true";
		document.head.append(favicon);
	}
	favicon.type = option.id === "sleek" ? "image/png" : "image/x-icon";
	favicon.href = option.favicon;
	localStorage.setItem("sleek-cloak", option.id);
	document.querySelectorAll("[data-cloak]").forEach((item) => item.classList.toggle("active", item.dataset.cloak === option.id));
};

const bookmarkButton = document.getElementById("sj-bookmark");
const quickLinks = document.getElementById("sj-quick-links");
const savedBar = document.getElementById("sj-saved-bar");
const savedLinks = document.getElementById("sj-saved-links");
const musicButton = document.getElementById("sj-music-button");
const toolsPanel = document.getElementById("sj-tools-panel");
const musicPage = document.getElementById("sj-music-page");
const musicClose = document.getElementById("sj-music-close");
const gamesPage = document.getElementById("sj-games-page");
const slickPage = document.getElementById("sj-slick-page");
const slickClose = document.getElementById("sj-slick-close");
const slickForm = document.getElementById("sj-slick-form");
const slickInput = document.getElementById("sj-slick-input");
const slickImage = document.getElementById("sj-slick-image");
const slickAttachment = document.getElementById("sj-slick-attachment");
const slickAttachmentPreview = document.getElementById("sj-slick-attachment-preview");
const slickAttachmentName = document.getElementById("sj-slick-attachment-name");
const slickAttachmentRemove = document.getElementById("sj-slick-attachment-remove");
const slickMessages = document.getElementById("sj-slick-messages");
const slickStatus = document.getElementById("sj-slick-status");
const slickChatList = document.getElementById("sj-slick-chat-list");
const slickNewChat = document.getElementById("sj-slick-new-chat");
const slickSidebarToggle = document.getElementById("sj-slick-sidebar-toggle");
const slickChatSearch = document.getElementById("sj-slick-search");
const slickGreeting = document.getElementById("sj-slick-greeting");
const gamesClose = document.getElementById("sj-games-close");
const gamesQuery = document.getElementById("sj-games-query");
const gamesStatus = document.getElementById("sj-games-status");
const gamesGrid = document.getElementById("sj-games-grid");
const gameStage = document.getElementById("sj-game-stage");
const gameStageFrame = document.getElementById("sj-game-stage-frame");
const gameStageTitle = document.getElementById("sj-game-stage-title");
const gameStageBack = document.getElementById("sj-game-stage-back");
const gameStageFullscreen = document.getElementById("sj-game-stage-fullscreen");
const nowPlaying = document.getElementById("sj-now-playing");
const playerChannel = document.getElementById("sj-player-channel");
const youtubePlayerElement = document.getElementById("sj-youtube-player");
const musicSearch = document.getElementById("sj-music-search");
const musicSubmit = document.getElementById("sj-music-submit");
const musicQuery = document.getElementById("sj-music-query");
const musicStatus = document.getElementById("sj-music-status");
const musicResults = document.getElementById("sj-music-results");
const miniPlayer = document.getElementById("sj-mini-player");
const miniPlayerHandle = document.getElementById("sj-mini-player-handle");
const miniClose = document.getElementById("sj-mini-close");
const miniPlayerFab = document.getElementById("sj-mini-player-fab");
const miniTitle = document.getElementById("sj-mini-title");
const miniArtist = document.getElementById("sj-mini-artist");
const miniCurrentTime = document.getElementById("sj-mini-current-time");
const miniTotalTime = document.getElementById("sj-mini-total-time");
const miniProgressFill = document.getElementById("sj-mini-progress-fill");
const miniToggle = document.getElementById("sj-mini-toggle");
const miniPrev = document.getElementById("sj-mini-prev");
const miniNext = document.getElementById("sj-mini-next");
const playlistContainer = document.getElementById("sj-playlists");
const newPlaylistButton = document.getElementById("sj-create-playlist");
const playlistPrompt = document.getElementById("sj-playlist-prompt");
const playlistNameInput = document.getElementById("sj-playlist-name-input");
const playlistConfirmButton = document.getElementById("sj-playlist-confirm");
const playlistCancelButton = document.getElementById("sj-playlist-cancel");

let youtubePlayer;
let youtubeReady;
let musicQueue = [];
let musicQueueIndex = -1;
let miniPlayerTicker = null;
const PLAYLISTS_KEY = "sleek-playlists";
const LIKED_SONGS_KEY = "sleek-liked-songs";
let playlists = [];
let likedSongs = [];

const ACCOUNT_KEY = "sleek-account";
const HISTORY_KEY = "sleek-history";
const HISTORY_ENABLED_KEY = "sleek-history-enabled";
const LANGUAGE_KEY = "sleek-language";
const CLOCK_FORMAT_KEY = "sleek-clock-format";
let account;
let browsingHistory;
let historyEnabled = localStorage.getItem(HISTORY_ENABLED_KEY) !== "false";
let incognitoMode = false;
let language = localStorage.getItem(LANGUAGE_KEY) || "en";
let clockFormat = localStorage.getItem(CLOCK_FORMAT_KEY) || "24";

try {
	account = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || '{"name":"Guest","avatar":"\\uF4D7"}');
	if (!account || typeof account !== "object") throw new Error();
} catch {
	account = { name: "Guest", avatar: "\uF4D7" };
}
try {
	browsingHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
	if (!Array.isArray(browsingHistory)) throw new Error();
} catch {
	browsingHistory = [];
}

const defaultQuickLinks = [
	{ title: "YouTube", url: "https://www.youtube.com", favicon: "https://www.youtube.com/favicon.ico" },
	{ title: "GitHub", url: "https://github.com", favicon: "https://github.com/favicon.ico" },
	{ title: "Incinerate+", url: "https://incinerateplus.opik.net/", favicon: "https://incinerateplus.opik.net/favicon.png" },
	{ title: "TikTok", url: "https://www.tiktok.com", favicon: "https://www.tiktok.com/favicon.ico" },
	{ title: "Discord", url: "https://discord.com", favicon: "https://favicon.run/favicon?domain=discord.com&sz=32" },
	{ title: "Spotify", url: "https://open.spotify.com", favicon: "https://open.spotify.com/favicon.ico" },
	{ title: "Reddit", url: "https://www.reddit.com", favicon: "https://www.reddit.com/favicon.ico" },
	{ title: "Google", url: "https://www.google.com", favicon: "https://www.google.com/favicon.ico" },
];

const favoriteUrls = new Map();

function canonicalizeUrl(url) {
	try {
		const parsed = new URL(url);
		parsed.hash = "";
		if (parsed.pathname === "/") parsed.pathname = "/";
		return parsed.href;
	} catch {
		return url;
	}
}

try {
	const savedFavorites = JSON.parse(localStorage.getItem("sleek-favorites") || "[]");
	if (Array.isArray(savedFavorites)) {
		for (const favorite of savedFavorites) {
			if (Array.isArray(favorite) && favorite.length === 2 && favorite[1]?.url) {
				const url = canonicalizeUrl(favorite[1].url);
				favoriteUrls.set(url, { ...favorite[1], url });
			} else if (favorite?.url) {
				const url = canonicalizeUrl(favorite.url);
				favoriteUrls.set(url, { ...favorite, url });
			}
		}
	}
} catch {
	localStorage.removeItem("sleek-favorites");
}

function saveFavorites() {
	localStorage.setItem("sleek-favorites", JSON.stringify([...favoriteUrls]));
}

const friendlySiteNames = {
	"youtube.com": "YouTube",
	"github.com": "GitHub",
	"google.com": "Google",
	"discord.com": "Discord",
	"spotify.com": "Spotify",
	"reddit.com": "Reddit",
	"tiktok.com": "TikTok",
};

function siteDetails(url, fallbackTitle = "") {
	try {
		const parsed = new URL(url);
		const hostname = parsed.hostname.replace(/^www\./i, "");
		return {
			title:
				friendlySiteNames[hostname] ||
				(fallbackTitle && fallbackTitle !== parsed.hostname
					? fallbackTitle
					: hostname),
			favicon: `${parsed.origin}/favicon.ico`,
		};
	} catch {
		return { title: fallbackTitle || "Saved page", favicon: "" };
	}
}

function saveAccount() {
	localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}

function saveHistory() {
	localStorage.setItem(HISTORY_KEY, JSON.stringify(browsingHistory));
}

function recordHistory(url) {
	if (!historyEnabled || incognitoMode || !/^https?:\/\//i.test(url)) return;
	const details = siteDetails(url);
	browsingHistory = [
		{ url, title: details.title, visitedAt: Date.now() },
		...browsingHistory.filter((item) => item.url !== url),
	].slice(0, 50);
	saveHistory();
}

function updateAccountClock() {
	const now = new Date();
	const formattedTime = now.toLocaleTimeString(language === "es" ? "es-ES" : "en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: clockFormat === "12",
	});
	if (accountClock) accountClock.textContent = formattedTime;
	if (homeClock) homeClock.textContent = formattedTime;
}

function startClockUpdates() {
	if (window.__sleekClockInterval) return;
	window.__sleekClockInterval = window.setInterval(() => {
		updateAccountClock();
	}, 1000);
}

function applyLanguage() {
	document.documentElement.lang = language;
}

function sanitizePlaylistList(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((playlist) => {
		if (!playlist || typeof playlist !== "object") return false;
		if (typeof playlist.name !== "string") return false;
		const normalizedName = playlist.name.trim();
		return normalizedName && !["Liked songs", "Your likes"].includes(normalizedName) && Array.isArray(playlist.tracks);
	});
}

function loadPlaylists() {
	try {
		const raw = localStorage.getItem(PLAYLISTS_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		playlists = sanitizePlaylistList(parsed);
		localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
	} catch {
		playlists = [];
		localStorage.setItem(PLAYLISTS_KEY, JSON.stringify([]));
	}
}

function savePlaylists() {
	localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

function loadLikedSongs() {
	try {
		const raw = localStorage.getItem(LIKED_SONGS_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		likedSongs = Array.isArray(parsed) ? parsed : [];
	} catch {
		likedSongs = [];
	}
}

function saveLikedSongs() {
	localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(likedSongs));
}

function isTrackLiked(track) {
	return Boolean(track && likedSongs.some((entry) => entry?.id === track.id));
}

function toggleLikedSong(track) {
	if (!track) return false;
	const index = likedSongs.findIndex((entry) => entry?.id === track.id);
	if (index >= 0) {
		likedSongs.splice(index, 1);
		saveLikedSongs();
		return false;
	}
	likedSongs.unshift({ id: track.id, title: track.title, channel: track.channel, thumbnail: track.thumbnail || "" });
	saveLikedSongs();
	return true;
}

function createPlaylist(name) {
	const safeName = String(name || "").trim();
	if (!safeName) return;
	if (playlists.some((playlist) => playlist.name.toLowerCase() === safeName.toLowerCase())) return;
	playlists.unshift({ name: safeName, tracks: [] });
	savePlaylists();
	renderPlaylists();
}

function addTrackToPlaylist(playlistName, track) {
	const target = playlists.find((playlist) => playlist.name === playlistName);
	if (!target || !track) return;
	if (target.tracks.some((item) => item.id === track.id)) return;
	target.tracks.push({
		id: track.id,
		title: track.title,
		channel: track.channel,
		thumbnail: track.thumbnail || "",
	});
	savePlaylists();
	renderPlaylists();
}

function renderPlaylists() {
	if (!playlistContainer) return;
	playlistContainer.replaceChildren();
	if (!playlists.length) {
		const empty = document.createElement("div");
		empty.className = "playlist-card";
		empty.innerHTML = "<h4>No playlists yet</h4><small>Create one to save tracks.</small>";
		playlistContainer.append(empty);
		return;
	}
	for (const playlist of playlists) {
		const card = document.createElement("div");
		card.className = "playlist-card";
		card.innerHTML = `
			<h4>${playlist.name}</h4>
			<small>${playlist.tracks.length} track${playlist.tracks.length === 1 ? "" : "s"}</small>
			<div class="playlist-card-actions">
				<button type="button" data-playlist-name="${playlist.name}">Play</button>
				<button type="button" data-save-current="${playlist.name}">Save current</button>
			</div>
		`;
		const playButton = card.querySelector("[data-playlist-name]");
		const saveButton = card.querySelector("[data-save-current]");
		playButton.addEventListener("click", () => {
			if (!playlist.tracks.length) return;
			musicQueue = playlist.tracks;
			musicQueueIndex = 0;
			playMusicResult(playlist.tracks[0], playlist.tracks);
		});
		saveButton.addEventListener("click", () => {
			if (!musicQueue.length || musicQueueIndex < 0) return;
			addTrackToPlaylist(playlist.name, musicQueue[musicQueueIndex]);
		});
		playlistContainer.append(card);
	}
}

function renderAccount() {
	accountName.value = account.name || "Guest";
	accountNameLabel.textContent = account.name || "Guest";
	accountAvatar.textContent = account.avatar?.startsWith("data:") ? "" : "\uF4D7";
	accountAvatar.parentElement.style.backgroundImage = account.avatar?.startsWith("data:")
		? `url(${account.avatar})`
		: "none";
	accountAvatar.parentElement.classList.toggle("has-image", account.avatar?.startsWith("data:") === true);
	historyToggle.checked = historyEnabled;
	incognitoToggle.checked = incognitoMode;
	languageSelect.value = language;
	clockSelect.value = clockFormat;
	updateAccountClock();
	historyList.replaceChildren();
	if (!browsingHistory.length) {
		const empty = document.createElement("span");
		empty.className = "history-empty";
		empty.textContent = "No browsing history yet";
		historyList.append(empty);
		return;
	}
	for (const item of browsingHistory) {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "history-item";
		button.title = item.url;
		button.innerHTML = `<strong>${item.title}</strong><small>${new URL(item.url).hostname}</small>`;
		button.addEventListener("click", () => void navigate(item.url).catch(showProxyError));
		historyList.append(button);
	}
}

function addSiteLink(container, link) {
	const details = siteDetails(link.url, link.title);
	const button = document.createElement("button");
	button.type = "button";
	button.className = container === savedLinks ? "saved-link" : "quick-link";
	button.title = link.url;
	button.dataset.quickUrl = link.url;
	const icon = document.createElement("img");
	icon.className = "quick-link-icon";
	icon.src = link.favicon || details.favicon;
	icon.alt = "";
	icon.onerror = () => {
		const fallback = document.createElement("span");
		fallback.className = "site-fallback-icon";
		fallback.textContent = "🌐";
		icon.replaceWith(fallback);
	};
	button.append(icon, document.createTextNode(details.title));
	if (container === savedLinks) {
		const item = document.createElement("div");
		item.className = "saved-item";
		const remove = document.createElement("button");
		remove.type = "button";
		remove.className = "saved-remove";
		remove.title = "Remove from Saved";
		remove.setAttribute("aria-label", `Remove ${details.title} from Saved`);
		remove.textContent = "×";
		remove.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();
			favoriteUrls.delete(canonicalizeUrl(link.url));
			saveFavorites();
			renderQuickLinks();
		});
		item.append(button, remove);
		container.append(item);
	} else {
		container.append(button);
	}
}

function renderQuickLinks() {
	quickLinks.replaceChildren();
	const heading = document.createElement("p");
	heading.className = "quick-links-heading";
	heading.textContent = "Quick links";
	quickLinks.append(heading);
	const list = document.createElement("div");
	list.className = "quick-links-list";
	defaultQuickLinks.forEach((link) => {
		addSiteLink(list, link);
	});
	quickLinks.append(list);
	renderSavedLinks();
}

function renderSavedLinks() {
	savedLinks.replaceChildren();
	const hasSaved = favoriteUrls.size > 0;
	savedBar.hidden = !hasSaved;
	document.body.classList.toggle("has-saved", hasSaved);
	for (const link of favoriteUrls.values()) {
		addSiteLink(savedLinks, link);
	}
	requestAnimationFrame(() => {
		document.body.style.setProperty(
			"--saved-bar-height",
			hasSaved ? `${savedBar.getBoundingClientRect().bottom}px` : "120px",
		);
	});
}

function getCurrentBookmarkUrl() {
	const value = proxyActiveTab?.url || document.getElementById("sj-tab-address")?.value || "";
	return /^https?:\/\//i.test(value) ? canonicalizeUrl(value) : "";
}

function updateBookmarkState() {
	if (!bookmarkButton) return;
	const url = getCurrentBookmarkUrl();
	const saved = Boolean(url && favoriteUrls.has(url));
	bookmarkButton.textContent = saved ? "★" : "☆";
	bookmarkButton.classList.toggle("saved", saved);
	bookmarkButton.setAttribute("aria-pressed", String(saved));
}

bookmarkButton?.addEventListener("click", (event) => {
	event.preventDefault();
	const url = getCurrentBookmarkUrl();
	if (!url) return;
	if (favoriteUrls.has(url)) favoriteUrls.delete(url);
	else {
		const details = siteDetails(url);
		favoriteUrls.set(url, { title: details.title, url, favicon: details.favicon });
	}
	saveFavorites();
	renderQuickLinks();
	updateBookmarkState();
});

document.body.classList.add("is-home");
renderQuickLinks();

let realGames = Array.isArray(window.__SLEEK_GAMES_CATALOG__) ? window.__SLEEK_GAMES_CATALOG__ : [];

function syncGamesMenuIcon() {
	const menuIcon = document.querySelector('[data-panel-route="sleek://games"] .tool-icon');
	if (menuIcon) menuIcon.innerHTML = '<i class="bi bi-controller" aria-hidden="true"></i>';
}
syncGamesMenuIcon();

async function loadGamesCatalog() {
	if (realGames.length) {
		if (gamesStatus) gamesStatus.textContent = `${realGames.length} ported games available locally in SLEEK.`;
		syncGamesMenuIcon();
		renderGames();
		return;
	}
	try {
		const response = await fetch("/api/games/catalog");
		if (!response.ok) throw new Error(`Games catalog returned ${response.status}`);
		const catalog = await response.json();
		if (Array.isArray(catalog) && catalog.length) {
			realGames = catalog;
			syncGamesMenuIcon();
			if (gamesStatus) gamesStatus.textContent = `${catalog.length} ported games available locally in SLEEK.`;
			renderGames();
		}
	} catch (error) {
		console.warn("Could not load the extended games catalog", error);
	}
}

function launchGame(game) {
	if (!gameStage || !gameStageFrame) return;
	gamesGrid.hidden = true;
	gameStage.hidden = false;
	gameStageTitle.textContent = game.title;
	gamesStatus.textContent = `${game.title} is running locally inside SLEEK.`;
	gameStageFrame.src = game.path;
	gameStageFrame.focus();
}

function closeGame() {
	if (document.fullscreenElement) void document.exitFullscreen?.();
	gameStage.hidden = true;
	gameStageFrame.src = "about:blank";
	gamesGrid.hidden = false;
	gamesStatus.textContent = "Choose a game. Every title runs from SLEEK's local game library.";
}

function renderGames() {
	if (!gamesGrid) return;
	const query = String(gamesQuery?.value || "").trim().toLocaleLowerCase();
	const selectedFilter = document.querySelector(".games-filter.active")?.dataset.gameFilter || "all";
	const visibleGames = realGames.filter((game) => {
		const matchesFilter = selectedFilter === "all" || game.category === selectedFilter;
		const searchText = `${game.title} ${game.description} ${game.label}`.toLocaleLowerCase();
		return matchesFilter && (!query || searchText.includes(query));
	});
	gamesGrid.replaceChildren();
	if (!visibleGames.length) {
		const empty = document.createElement("p");
		empty.className = "games-empty";
		empty.textContent = "No games match that search.";
		gamesGrid.append(empty);
		return;
	}
	for (const game of visibleGames) {
		const card = document.createElement("article");
		card.className = "game-card";
		card.tabIndex = 0;
		card.setAttribute("role", "button");
		card.setAttribute("aria-label", `Play ${game.title}`);
		const cover = document.createElement("div");
		cover.className = "game-card-cover";
		const showGameIcon = () => {
			cover.replaceChildren();
			cover.innerHTML = '<i class="bi bi-controller" aria-hidden="true"></i>';
		};
		if (game.cover) {
			const image = document.createElement("img");
			image.src = game.cover;
			image.alt = `${game.title} cover`;
			image.loading = "lazy";
			image.addEventListener("error", showGameIcon, { once: true });
			cover.append(image);
		} else {
			showGameIcon();
		}
		const category = document.createElement("span");
		category.className = "game-card-category";
		category.textContent = game.label;
		const title = document.createElement("h3");
		title.textContent = game.title;
		const description = document.createElement("p");
		description.textContent = game.description;
		card.addEventListener("click", () => launchGame(game));
		card.addEventListener("keydown", (event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				launchGame(game);
			}
		});
		card.append(cover, title, category, description);
		gamesGrid.append(card);
	}
}

settingsButton.addEventListener("click", () => {
	settingsPanel.hidden = !settingsPanel.hidden;
});
accountButton.addEventListener("click", () => {
	accountPanel.hidden = !accountPanel.hidden;
	if (!accountPanel.hidden) renderAccount();
});
document.getElementById("sj-account-close").addEventListener("click", () => {
	accountPanel.hidden = true;
});
accountPanel.addEventListener("click", (event) => {
	if (event.target === accountPanel) accountPanel.hidden = true;
});
accountName.addEventListener("input", () => {
	account.name = accountName.value.trim() || "Guest";
	accountNameLabel.textContent = account.name;
	slickGreeting.textContent = getSlickGreeting();
	saveAccount();
});
historyToggle.addEventListener("change", () => {
	historyEnabled = historyToggle.checked;
	localStorage.setItem(HISTORY_ENABLED_KEY, String(historyEnabled));
});
incognitoToggle.addEventListener("change", () => {
	incognitoMode = incognitoToggle.checked;
	document.body.classList.toggle("incognito-mode", incognitoMode);
});
languageSelect.addEventListener("change", () => {
	language = languageSelect.value;
	localStorage.setItem(LANGUAGE_KEY, language);
	applyLanguage();
	updateAccountClock();
});
clockSelect.addEventListener("change", () => {
	clockFormat = clockSelect.value;
	localStorage.setItem(CLOCK_FORMAT_KEY, clockFormat);
	updateAccountClock();
});
accountAvatarFile.addEventListener("change", () => {
	const file = accountAvatarFile.files?.[0];
	if (!file || !file.type.startsWith("image/")) return;
	const reader = new FileReader();
	reader.addEventListener("load", () => {
		if (typeof reader.result !== "string") return;
		account.avatar = reader.result;
		saveAccount();
		renderAccount();
	});
	reader.readAsDataURL(file);
});
document.getElementById("sj-clear-history").addEventListener("click", () => {
	browsingHistory = [];
	saveHistory();
	renderAccount();
});
document.getElementById("sj-settings-close").addEventListener("click", closeSettings);
settingsPanel.addEventListener("click", (event) => {
	if (event.target === settingsPanel) closeSettings();
});

let homeParticleField = [];
let homeParticleAnimation = null;

function initializeHomeParticles() {
	if (!homeParticlesCanvas) return;
	const context = homeParticlesCanvas.getContext("2d");
	if (!context) return;
	const updateSize = () => {
		const width = window.innerWidth;
		const height = window.innerHeight - 42;
		homeParticlesCanvas.width = width;
		homeParticlesCanvas.height = height;
		const particleCount = Math.min(160, Math.max(90, Math.round((width * height) / 16)));
		homeParticleField = Array.from({ length: particleCount }, () => ({
			x: Math.random() * width,
			y: Math.random() * height,
			dx: (Math.random() - 0.5) * 0.8,
			dy: (Math.random() - 0.5) * 0.8,
			radius: Math.random() * 2.2 + 1.2,
			alpha: Math.random() * 0.7 + 0.25,
		}));
	};
	const render = () => {
		if (!homeParticlesCanvas || !document.body.classList.contains("is-home") || document.body.classList.contains("particles-off")) {
			if (homeParticleAnimation) {
				cancelAnimationFrame(homeParticleAnimation);
				homeParticleAnimation = null;
			}
			return;
		}
		const width = homeParticlesCanvas.width;
		const height = homeParticlesCanvas.height;
		context.clearRect(0, 0, width, height);
		for (const particle of homeParticleField) {
			particle.x += particle.dx;
			particle.y += particle.dy;
			if (particle.x < -4) particle.x = width + 4;
			if (particle.x > width + 4) particle.x = -4;
			if (particle.y < -4) particle.y = height + 4;
			if (particle.y > height + 4) particle.y = -4;
			context.beginPath();
			context.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
			context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
			context.fill();
		}
		homeParticleAnimation = requestAnimationFrame(render);
	};
	updateSize();
	if (homeParticleAnimation) cancelAnimationFrame(homeParticleAnimation);
	homeParticleAnimation = requestAnimationFrame(render);
	window.addEventListener("resize", updateSize, { passive: true });
}

particlesToggle.addEventListener("change", () => {
	document.body.classList.toggle("particles-off", !particlesToggle.checked);
	if (particlesToggle.checked && document.body.classList.contains("is-home")) {
		initializeHomeParticles();
	} else if (homeParticleAnimation) {
		cancelAnimationFrame(homeParticleAnimation);
		homeParticleAnimation = null;
	}
});

initializeHomeParticles();
animationsToggle.addEventListener("change", () => document.body.classList.toggle("animations-off", !animationsToggle.checked));
compactToggle.addEventListener("change", () => document.body.classList.toggle("compact-home", compactToggle.checked));

const settingsNav = document.querySelector(".settings-nav");
const settingsPages = document.querySelector(".settings-pages");
const resetHomeButton = document.getElementById("sj-reset-home");
if (resetHomeButton) {
	resetHomeButton.closest(".settings-info-row")?.removeAttribute("hidden");
}
settingsNav.insertAdjacentHTML("afterbegin", '<button class="settings-nav-item" type="button" data-settings-page="general">General</button>');
settingsPages.insertAdjacentHTML("afterbegin", `<section class="settings-page" data-settings-page-content="general"><p class="settings-page-label">General</p><h3>Cloaking</h3><p class="settings-about">Choose a familiar identity for this tab.</p><div class="cloak-options">${cloakOptions.map((item) => `<button class="cloak-choice" type="button" data-cloak="${item.id}"><img src="${item.favicon}" alt="" /> <span>${item.name}</span></button>`).join("")}</div><div class="panic-settings"><div class="panic-setting"><span><strong>Panic key</strong><small>Press any key to leave this page instantly.</small></span><button id="sj-panic-key" class="settings-action" type="button">Set key</button></div><label class="panic-setting panic-destination"><span><strong>Panic destination</strong><small>Where the panic key should send you.</small></span><input id="sj-panic-url" type="url" placeholder="https://www.google.com" /></label><p id="sj-panic-status" class="settings-status">No panic key set.</p></div></section>`);

for (const button of document.querySelectorAll("[data-settings-page]")) { button.addEventListener("click", () => { const page = button.dataset.settingsPage; document.querySelectorAll("[data-settings-page]").forEach((item) => item.classList.toggle("active", item === button)); document.querySelectorAll("[data-settings-page-content]").forEach((item) => item.classList.toggle("active", item.dataset.settingsPageContent === page)); }); }
const savedTheme = localStorage.getItem("sleek-theme") || "black";
document.body.dataset.theme = savedTheme;
const savedWallpaper = localStorage.getItem("sleek-wallpaper");
if (savedWallpaper) document.body.style.backgroundImage = `url(${JSON.stringify(savedWallpaper)})`;
for (const button of document.querySelectorAll("[data-theme-choice]")) { button.classList.toggle("active", button.dataset.themeChoice === savedTheme); button.addEventListener("click", () => { document.body.dataset.theme = button.dataset.themeChoice; localStorage.setItem("sleek-theme", button.dataset.themeChoice); document.querySelectorAll("[data-theme-choice]").forEach((item) => item.classList.toggle("active", item === button)); }); }
const savedAccent = localStorage.getItem("sleek-accent");
if (savedAccent) document.body.style.setProperty("--accent", savedAccent);
for (const button of document.querySelectorAll("[data-accent]")) { button.classList.toggle("active", button.dataset.accent === savedAccent); button.addEventListener("click", () => { const accent = button.dataset.accent; document.body.style.setProperty("--accent", accent); localStorage.setItem("sleek-accent", accent); document.querySelectorAll(".logo-wrapper h1").forEach((item) => { item.style.color = accent; }); document.querySelectorAll("[data-accent]").forEach((item) => item.classList.toggle("active", item === button)); }); }
brandName.addEventListener("input", () => { document.querySelectorAll(".logo-wrapper h1").forEach((item) => item.textContent = brandName.value.trim() || "SLEEK"); });
themeUpload.addEventListener("change", () => { const file = themeUpload.files[0]; if (!file) return; themeUploadStatus.textContent = `${file.name} ready to import.`; if (file.name.endsWith(".json")) { const reader = new FileReader(); reader.onload = () => { try { const theme = JSON.parse(reader.result); if (theme.name) { brandName.value = theme.name; document.querySelectorAll(".logo-wrapper h1").forEach((item) => item.textContent = theme.name); } if (theme.accent) { document.body.style.setProperty("--accent", theme.accent); localStorage.setItem("sleek-accent", theme.accent); } if (theme.theme) { document.body.dataset.theme = theme.theme; localStorage.setItem("sleek-theme", theme.theme); } if (theme.wallpaper || theme.background) { const wallpaper = theme.wallpaper || theme.background; document.body.style.backgroundImage = `url(${JSON.stringify(wallpaper)})`; localStorage.setItem("sleek-wallpaper", wallpaper); } themeUploadStatus.textContent = `${file.name} applied.`; } catch { themeUploadStatus.textContent = "Invalid theme JSON."; } }; reader.readAsText(file); } });
const savedDensity = localStorage.getItem("sleek-density") || "normal";
document.body.dataset.density = savedDensity;
for (const button of document.querySelectorAll("[data-density-choice]")) { button.classList.toggle("active", button.dataset.densityChoice === savedDensity); button.addEventListener("click", () => { document.body.dataset.density = button.dataset.densityChoice; localStorage.setItem("sleek-density", button.dataset.densityChoice); document.querySelectorAll("[data-density-choice]").forEach((item) => item.classList.toggle("active", item === button)); }); }
const searchEngineInput = document.getElementById("sj-search-engine");
const tabSearchEngineInput = document.getElementById("sj-tab-search-engine");
const engineButtons = document.querySelectorAll("[data-engine]");
const savedSearchEngine = localStorage.getItem("sleek-search-engine");
const initialSearchEngine = savedSearchEngine || searchEngineInput?.value || "https://duckduckgo.com/?q=%s";
if (searchEngineInput) searchEngineInput.value = initialSearchEngine;
if (tabSearchEngineInput) tabSearchEngineInput.value = initialSearchEngine;
engineButtons.forEach((button) => {
	button.classList.toggle("active", button.dataset.engine === initialSearchEngine);
	button.addEventListener("click", () => {
		const engine = button.dataset.engine;
		if (!engine) return;
		if (searchEngineInput) searchEngineInput.value = engine;
		if (tabSearchEngineInput) tabSearchEngineInput.value = engine;
		localStorage.setItem("sleek-search-engine", engine);
		engineButtons.forEach((item) => item.classList.toggle("active", item === button));
	});
});
for (const button of document.querySelectorAll("[data-cloak]")) button.addEventListener("click", () => applyCloak(button.dataset.cloak));
applyCloak(localStorage.getItem("sleek-cloak") || "sleek");

const panicKeyButton = document.getElementById("sj-panic-key");
const panicUrlInput = document.getElementById("sj-panic-url");
const panicStatus = document.getElementById("sj-panic-status");
let panicKey = localStorage.getItem("sleek-panic-key") || "";
panicUrlInput.value = localStorage.getItem("sleek-panic-url") || "https://www.google.com";

const updatePanicStatus = () => { panicStatus.textContent = panicKey ? `Panic key: ${panicKey}` : "No panic key set."; panicKeyButton.textContent = panicKey || "Set key"; };
panicUrlInput.addEventListener("change", () => { try { const url = new URL(panicUrlInput.value); if (!/^https?:$/.test(url.protocol)) throw new Error(); localStorage.setItem("sleek-panic-url", url.href); panicStatus.textContent = `Destination saved: ${url.hostname}`; } catch { panicStatus.textContent = "Use a valid http:// or https:// URL."; } });
panicKeyButton.addEventListener("click", () => { panicKeyButton.textContent = "Press any key..."; panicStatus.textContent = "Press the key you want to use."; const capture = (event) => { event.preventDefault(); event.stopPropagation(); panicKey = event.key; localStorage.setItem("sleek-panic-key", panicKey); updatePanicStatus(); window.removeEventListener("keydown", capture, true); }; window.addEventListener("keydown", capture, true); });
window.addEventListener("keydown", (event) => { if (panicKey && event.key === panicKey && !event.repeat) { const destination = localStorage.getItem("sleek-panic-url") || panicUrlInput.value; try { const url = new URL(destination); if (/^https?:$/.test(url.protocol)) window.location.assign(url.href); } catch {} } });
updatePanicStatus();

if (musicButton) {
	musicButton.addEventListener("click", () => {
		toolsPanel.hidden = !toolsPanel.hidden;
		musicButton.setAttribute("aria-expanded", String(!toolsPanel.hidden));
	});
}

let slickConversation = [];
const slickChats = [];
let activeSlickChat = null;
let slickImageData = null;
const slickWaves = document.getElementById("sj-slick-waves");
const slickWaveContext = slickWaves?.getContext("2d");
let slickWaveFrame = 0;
let slickWaveSize = { width: 0, height: 0 };
let slickWaveFrameTime = 0;

function createSlickStar() {
	return {
		x: (Math.random() * 2 - 1) * 1.35,
		y: (Math.random() * 2 - 1) * 1.35,
		z: Math.random() * 1.05 + 0.15,
		speed: 0.28 + Math.random() * 0.45,
	};
}
const slickStars = Array.from({ length: 260 }, () => createSlickStar());

function resetSlickStar(star) {
	Object.assign(star, createSlickStar());
}

function resizeSlickWaves() {
	if (!slickWaves || !slickWaveContext) return;
	const bounds = slickWaves.getBoundingClientRect();
	const ratio = Math.min(window.devicePixelRatio || 1, 2);
	slickWaveSize = { width: bounds.width, height: bounds.height };
	slickWaves.width = Math.max(1, Math.floor(bounds.width * ratio));
	slickWaves.height = Math.max(1, Math.floor(bounds.height * ratio));
	slickWaveContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function animateSlickWaves(time) {
	if (!slickWaveContext || !slickWaves || slickPage.hidden || !document.body.classList.contains("slick-open")) {
		slickWaveFrame = 0;
		return;
	}
	const { width, height } = slickWaveSize;
	if (!width || !height) resizeSlickWaves();
	slickWaveContext.clearRect(0, 0, width, height);
	const frameDelta = Math.min(40, slickWaveFrameTime ? time - slickWaveFrameTime : 16);
	slickWaveFrameTime = time;
	const centerX = width / 2;
	const centerY = height / 2;
	const perspective = Math.min(width, height) * 0.9;
	for (const star of slickStars) {
		const previousZ = Math.max(0.12, star.z);
		star.z -= star.speed * frameDelta / 1000;
		const projectedX = centerX + (star.x / Math.max(0.12, star.z)) * perspective;
		const projectedY = centerY + (star.y / Math.max(0.12, star.z)) * perspective;
		if (star.z <= 0.12 || projectedX < -120 || projectedX > width + 120 || projectedY < -120 || projectedY > height + 120) {
			resetSlickStar(star);
			continue;
		}
		const previousX = centerX + (star.x / previousZ) * perspective;
		const previousY = centerY + (star.y / previousZ) * perspective;
		const depth = 1 - Math.min(1, star.z / 1.2);
		const radius = 0.65 + depth * 2.4;
		slickWaveContext.beginPath();
		slickWaveContext.moveTo(previousX, previousY);
		slickWaveContext.lineTo(projectedX, projectedY);
		slickWaveContext.strokeStyle = `rgba(255, 255, 255, ${0.18 + depth * 0.62})`;
		slickWaveContext.lineWidth = radius;
		slickWaveContext.stroke();
	}
	slickWaveFrame = window.requestAnimationFrame(animateSlickWaves);
}

function ensureSlickStarfield() {
	resizeSlickWaves();
	if (!slickPage.hidden && !slickWaveFrame && document.body.classList.contains("slick-open")) {
		slickWaveFrame = window.requestAnimationFrame(animateSlickWaves);
	}
}
window.addEventListener("resize", resizeSlickWaves);
ensureSlickStarfield();

function clearSlickAttachment() {
	if (slickImage) slickImage.value = "";
	slickImageData = null;
	if (slickAttachment) slickAttachment.hidden = true;
	if (slickAttachmentPreview) slickAttachmentPreview.removeAttribute("src");
	if (slickAttachmentName) slickAttachmentName.textContent = "";
}

slickAttachmentRemove?.addEventListener("click", () => {
	clearSlickAttachment();
	slickStatus.textContent = "Powered by OpenRouter";
});

slickImage?.addEventListener("change", () => {
	const file = slickImage.files?.[0];
	if (!file) {
		clearSlickAttachment();
		slickStatus.textContent = "Powered by OpenRouter";
		return;
	}
	if (!file.type.startsWith("image/")) {
		clearSlickAttachment();
		slickStatus.textContent = "Please choose an image file.";
		return;
	}
	const reader = new FileReader();
	reader.addEventListener("load", () => {
		slickImageData = { name: file.name, dataUrl: String(reader.result || "") };
		if (slickAttachmentPreview) slickAttachmentPreview.src = slickImageData.dataUrl;
		if (slickAttachmentName) slickAttachmentName.textContent = file.name;
		if (slickAttachment) slickAttachment.hidden = false;
		slickStatus.textContent = `Image attached: ${file.name}`;
	});
	reader.readAsDataURL(file);
});

function renderSlickMarkdown(text) {
	const escaped = text.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
	const inlineMarkdown = (line) => line
		.replace(/`([^`]+)`/g, "<code>$1</code>")
		.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
		.replace(/__([^_\n]+)__/g, "<strong>$1</strong>")
		.replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
		.replace(/_([^_\n]+)_/g, "<em>$1</em>");
	return escaped.split("\n").map((line) => {
		const heading = line.match(/^(#{1,6})\s+(.+)$/);
		if (heading) return `<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`;
		return inlineMarkdown(line);
	}).join("\n");
}

function addSlickMessage(role, text, imageData = null) {
	const message = document.createElement("div");
	message.className = `slick-message slick-message-${role}`;
	const label = document.createElement("strong");
	label.textContent = role === "user" ? "You" : "Slick";
	const content = document.createElement("div");
	content.className = "slick-message-content";
	const textNode = document.createElement("div");
	if (role === "assistant") textNode.innerHTML = renderSlickMarkdown(text);
	else textNode.textContent = text;
	content.append(textNode);
	message.append(label, content);
	if (imageData && role === "user") {
		const group = document.createElement("div");
		group.className = "slick-message-user-group";
		const image = document.createElement("img");
		image.className = "slick-message-image";
		image.src = imageData.dataUrl;
		image.alt = imageData.name ? `Attached image: ${imageData.name}` : "Attached image";
		group.append(image, message);
		slickMessages.append(group);
	} else {
		slickMessages.append(message);
	}
	slickMessages.scrollTop = slickMessages.scrollHeight;
}

function addSlickThinking() {
	const message = document.createElement("div");
	message.className = "slick-message slick-message-assistant slick-thinking";
	const label = document.createElement("strong");
	label.textContent = "Slick";
	const content = document.createElement("div");
	content.className = "slick-message-content";
	content.innerHTML = '<span class="slick-thinking-label">Slick is thinking</span><span class="slick-thinking-dots" aria-label="Loading"><i></i><i></i><i></i></span>';
	message.append(label, content);
	slickMessages.append(message);
	slickMessages.scrollTop = slickMessages.scrollHeight;
	return message;
}

function resetSlickChatView() {
	slickMessages.replaceChildren();
	slickMessages.classList.add("slick-messages-empty");
	slickPage.classList.remove("slick-has-messages");
}

function getSlickGreeting() {
	return "Hi, what's on your mind?";
}

function renderSlickChatList() {
	slickChatList.replaceChildren();
	const query = slickChatSearch?.value.trim().toLowerCase() || "";
	for (const chat of slickChats.filter((item) => !query || item.title.toLowerCase().includes(query))) {
		const button = document.createElement("button");
		button.className = `slick-chat-item${chat === activeSlickChat ? " active" : ""}`;
		button.type = "button";
		button.innerHTML = '<i class="bi bi-chat-left-text" aria-hidden="true"></i><span></span>';
		button.querySelector("span").textContent = chat.title;
		button.addEventListener("click", () => selectSlickChat(chat));
		slickChatList.append(button);
	}
}

function selectSlickChat(chat) {
	if (!chat || chat === activeSlickChat && slickConversation === chat.messages) return;
	activeSlickChat = chat;
	slickConversation = chat.messages;
	slickMessages.replaceChildren();
	if (!chat.messages.length) {
		resetSlickChatView();
	} else {
		slickMessages.classList.remove("slick-messages-empty");
		slickPage.classList.add("slick-has-messages");
		for (const message of chat.messages) {
			if (message.role === "assistant") {
				addSlickMessage("assistant", message.content);
				continue;
			}
			if (Array.isArray(message.content)) {
				const textPart = message.content.find((part) => part.type === "text");
				const imagePart = message.content.find((part) => part.type === "image_url");
				addSlickMessage("user", textPart?.text || "Analyze this image.", imagePart ? { dataUrl: imagePart.image_url.url, name: "Attached image" } : null);
			} else {
				addSlickMessage("user", message.content);
			}
		}
	}
	renderSlickChatList();
}

function startSlickChat() {
	const chat = { id: crypto.randomUUID?.() || String(Date.now()), title: "New chat", messages: [] };
	slickChats.unshift(chat);
	selectSlickChat(chat);
}

slickGreeting.textContent = getSlickGreeting();
const firstSlickChat = { id: "first", title: "New chat", messages: slickConversation };
activeSlickChat = firstSlickChat;
slickChats.push(firstSlickChat);
renderSlickChatList();
slickNewChat.addEventListener("click", startSlickChat);

slickSidebarToggle?.addEventListener("click", () => {
	const collapsed = slickPage.classList.toggle("slick-sidebar-collapsed");
	slickSidebarToggle.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
	slickSidebarToggle.setAttribute("title", collapsed ? "Expand sidebar" : "Collapse sidebar");
});

slickChatSearch?.addEventListener("input", renderSlickChatList);

document.querySelectorAll("[data-slick-prompt]").forEach((prompt) => {
	prompt.addEventListener("click", () => {
		slickInput.value = prompt.dataset.slickPrompt || "";
		slickInput.focus();
	});
});

slickForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const content = slickInput.value.trim();
	if ((!content && !slickImageData) || slickForm.dataset.busy === "true") return;
	slickForm.dataset.busy = "true";
	slickMessages.classList.remove("slick-messages-empty");
	slickPage.classList.add("slick-has-messages");
	ensureSlickStarfield();
	slickInput.value = "";
	const attachedImage = slickImageData;
	clearSlickAttachment();
	addSlickMessage("user", content || (attachedImage ? "Analyze this image" : ""), attachedImage);
	const userMessage = attachedImage
		? { role: "user", content: [{ type: "text", text: content || "Analyze this image." }, { type: "image_url", image_url: { url: attachedImage.dataUrl } }] }
		: { role: "user", content };
	slickConversation.push(userMessage);
	if (activeSlickChat && activeSlickChat.title === "New chat") {
		activeSlickChat.title = (content || "Chat message").slice(0, 32);
		renderSlickChatList();
	}
	const thinkingMessage = addSlickThinking();
	slickStatus.textContent = "Slick is thinking...";
	try {
		const response = await fetch("/api/slick/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: slickConversation }) });
		const payload = await response.json();
		if (!response.ok) throw new Error(payload.error || "Slick could not answer.");
		thinkingMessage.remove();
		addSlickMessage("assistant", payload.reply);
		slickConversation.push({ role: "assistant", content: payload.reply });
		slickStatus.textContent = "Powered by OpenRouter";
	} catch (error) {
		thinkingMessage.remove();
		addSlickMessage("assistant", error instanceof Error ? error.message : "Slick could not answer.");
		slickStatus.textContent = "Check your OpenRouter settings in .env.";
	} finally {
		slickForm.dataset.busy = "false";
		slickInput.focus();
	}
});

/* The duplicate text pasted after this point is ignored. */
/*

```javascript
// Element References
const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const homeParticlesCanvas = document.getElementById("sj-home-particles");
const settingsButton = document.getElementById("sj-settings");
const settingsPanel = document.getElementById("sj-settings-panel");
const accountButton = document.getElementById("sj-account");
const accountPanel = document.getElementById("sj-account-panel");
const accountName = document.getElementById("sj-account-name");
const accountNameLabel = document.getElementById("sj-account-name-label");
const accountAvatar = document.getElementById("sj-account-avatar");
const accountAvatarFile = document.getElementById("sj-account-avatar-file");
const historyList = document.getElementById("sj-history-list");
const historyToggle = document.getElementById("sj-history-toggle");
const homeClock = document.getElementById("sj-home-clock");
const incognitoToggle = document.getElementById("sj-incognito-toggle");
const languageSelect = document.getElementById("sj-language-select");
const clockSelect = document.getElementById("sj-clock-select");
const accountClock = document.getElementById("sj-account-clock");
const particlesToggle = document.getElementById("sj-particles-toggle");
const animationsToggle = document.getElementById("sj-animations-toggle");
const compactToggle = document.getElementById("sj-compact-toggle");
const brandName = document.getElementById("sj-brand-name");
const themeUpload = document.getElementById("sj-theme-upload");
const themeUploadStatus = document.getElementById("sj-theme-upload-status");
const closeSettings = () => (settingsPanel.hidden = true);

const bookmarkButton = document.getElementById("sj-bookmark");
const quickLinks = document.getElementById("sj-quick-links");
const savedBar = document.getElementById("sj-saved-bar");
const savedLinks = document.getElementById("sj-saved-links");
const musicButton = document.getElementById("sj-music-button");
const toolsPanel = document.getElementById("sj-tools-panel");
const musicPage = document.getElementById("sj-music-page");
const musicClose = document.getElementById("sj-music-close");
const gamesPage = document.getElementById("sj-games-page");
const slickPage = document.getElementById("sj-slick-page");
const slickClose = document.getElementById("sj-slick-close");
const slickForm = document.getElementById("sj-slick-form");
const slickInput = document.getElementById("sj-slick-input");
const slickImage = document.getElementById("sj-slick-image");
const slickAttachment = document.getElementById("sj-slick-attachment");
const slickAttachmentPreview = document.getElementById("sj-slick-attachment-preview");
const slickAttachmentName = document.getElementById("sj-slick-attachment-name");
const slickAttachmentRemove = document.getElementById("sj-slick-attachment-remove");
const slickMessages = document.getElementById("sj-slick-messages");
const slickStatus = document.getElementById("sj-slick-status");
const slickChatList = document.getElementById("sj-slick-chat-list");
const slickNewChat = document.getElementById("sj-slick-new-chat");
const slickSidebarToggle = document.getElementById("sj-slick-sidebar-toggle");
const slickChatSearch = document.getElementById("sj-slick-search");
const slickGreeting = document.getElementById("sj-slick-greeting");
const gamesClose = document.getElementById("sj-games-close");
const gamesQuery = document.getElementById("sj-games-query");
const gamesStatus = document.getElementById("sj-games-status");
const gamesGrid = document.getElementById("sj-games-grid");
const gameStage = document.getElementById("sj-game-stage");
const gameStageFrame = document.getElementById("sj-game-stage-frame");
const gameStageTitle = document.getElementById("sj-game-stage-title");
const gameStageBack = document.getElementById("sj-game-stage-back");
const gameStageFullscreen = document.getElementById("sj-game-stage-fullscreen");
const nowPlaying = document.getElementById("sj-now-playing");
const playerChannel = document.getElementById("sj-player-channel");
const youtubePlayerElement = document.getElementById("sj-youtube-player");
const musicSearch = document.getElementById("sj-music-search");
const musicSubmit = document.getElementById("sj-music-submit");
const musicQuery = document.getElementById("sj-music-query");
const musicStatus = document.getElementById("sj-music-status");
const musicResults = document.getElementById("sj-music-results");
const miniPlayer = document.getElementById("sj-mini-player");
const miniPlayerHandle = document.getElementById("sj-mini-player-handle");
const miniClose = document.getElementById("sj-mini-close");
const miniPlayerFab = document.getElementById("sj-mini-player-fab");
const miniTitle = document.getElementById("sj-mini-title");
const miniArtist = document.getElementById("sj-mini-artist");
const miniCurrentTime = document.getElementById("sj-mini-current-time");
const miniTotalTime = document.getElementById("sj-mini-total-time");
const miniProgressFill = document.getElementById("sj-mini-progress-fill");
const miniToggle = document.getElementById("sj-mini-toggle");
const miniPrev = document.getElementById("sj-mini-prev");
const miniNext = document.getElementById("sj-mini-next");
const playlistContainer = document.getElementById("sj-playlists");
const newPlaylistButton = document.getElementById("sj-create-playlist");
const playlistPrompt = document.getElementById("sj-playlist-prompt");
const playlistNameInput = document.getElementById("sj-playlist-name-input");
const playlistConfirmButton = document.getElementById("sj-playlist-confirm");
const playlistCancelButton = document.getElementById("sj-playlist-cancel");

// State and Constants
let youtubePlayer;
let youtubeReady;
let musicQueue = [];
let musicQueueIndex = -1;
let miniPlayerTicker = null;
const PLAYLISTS_KEY = "sleek-playlists";
const LIKED_SONGS_KEY = "sleek-liked-songs";
let playlists = [];
let likedSongs = [];

const ACCOUNT_KEY = "sleek-account";
const HISTORY_KEY = "sleek-history";
const HISTORY_ENABLED_KEY = "sleek-history-enabled";
const LANGUAGE_KEY = "sleek-language";
const CLOCK_FORMAT_KEY = "sleek-clock-format";
let account;
let browsingHistory;
let historyEnabled = localStorage.getItem(HISTORY_ENABLED_KEY) !== "false";
let incognitoMode = false;
let language = localStorage.getItem(LANGUAGE_KEY) || "en";
let clockFormat = localStorage.getItem(CLOCK_FORMAT_KEY) || "24";

try {
	account = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || '{"name":"Guest","avatar":"\\uF4D7"}');
	if (!account || typeof account !== "object") throw new Error();
} catch {
	account = { name: "Guest", avatar: "\uF4D7" };
}

try {
	browsingHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
	if (!Array.isArray(browsingHistory)) throw new Error();
} catch {
	browsingHistory = [];
}

const cloakOptions = [
	{ id: "sleek", name: "SLEEK", title: "SLEEK", favicon: "/sleek-logo.png" },
	{ id: "google", name: "Google", title: "Google", favicon: "[https://www.google.com/favicon.ico](https://www.google.com/favicon.ico)" },
	{ id: "khan", name: "Khan Academy", title: "Khan Academy", favicon: "[https://www.khanacademy.org/favicon.ico](https://www.khanacademy.org/favicon.ico)" },
	{ id: "coursera", name: "Coursera", title: "Coursera", favicon: "[https://www.coursera.org/favicon.ico](https://www.coursera.org/favicon.ico)" },
	{ id: "Canvas", name: "Canvas", title: "Dashboard", favicon: "[https://parents.canvaslms.com/favicon.ico](https://parents.canvaslms.com/favicon.ico)" },
	{ id: "wikipedia", name: "Wikipedia", title: "Wikipedia", favicon: "[https://www.wikipedia.org/static/favicon/wikipedia.ico](https://www.wikipedia.org/static/favicon/wikipedia.ico)" },
	{ id: "ixl", name: "IXL", title: "Student Dashboard", favicon: "[https://www.ixl.com/favicon.ico](https://www.ixl.com/favicon.ico)" },
	{ id: "desmos", name: "Desmos", title: "Desmos | Beautiful Math", favicon: "[https://www.desmos.com/favicon.ico](https://www.desmos.com/favicon.ico)" },
	{ id: "quizlet", name: "Quizlet", title: "Quizlet", favicon: "[https://quizlet.com/favicon.ico](https://quizlet.com/favicon.ico)" },
	{ id: "kahoot", name: "Kahoot!", title: "Kahoot!", favicon: "[https://favicon.run/favicon?domain=kahoot.com&sz=32](https://favicon.run/favicon?domain=kahoot.com&sz=32)" },
	{ id: "edpuzzle", name: "Edpuzzle", title: "Edpuzzle", favicon: "[https://favicon.run/favicon?domain=edpuzzle.com&sz=32](https://favicon.run/favicon?domain=edpuzzle.com&sz=32)" },
	{ id: "schoology", name: "Schoology", title: "Schoology", favicon: "[https://favicon.run/favicon?domain=schoology.com&sz=32](https://favicon.run/favicon?domain=schoology.com&sz=32)" },
];

const applyCloak = (cloakId) => {
	const option = cloakOptions.find((item) => item.id === cloakId) || cloakOptions[0];
	document.title = option.title;
	let favicon = document.querySelector('link[data-sleek-favicon], link[rel="icon"]');
	if (!favicon) {
		favicon = document.createElement("link");
		favicon.rel = "icon";
		favicon.dataset.sleekFavicon = "true";
		document.head.append(favicon);
	}
	favicon.type = option.id === "sleek" ? "image/png" : "image/x-icon";
	favicon.href = option.favicon;
	localStorage.setItem("sleek-cloak", option.id);
	document.querySelectorAll("[data-cloak]").forEach((item) => item.classList.toggle("active", item.dataset.cloak === option.id));
};

const defaultQuickLinks = [
	{ title: "YouTube", url: "[https://www.youtube.com](https://www.youtube.com)", favicon: "[https://www.youtube.com/favicon.ico](https://www.youtube.com/favicon.ico)" },
	{ title: "GitHub", url: "[https://github.com](https://github.com)", favicon: "[https://github.com/favicon.ico](https://github.com/favicon.ico)" },
	{ title: "Incinerate+", url: "[https://incinerateplus.opik.net/](https://incinerateplus.opik.net/)", favicon: "[https://incinerateplus.opik.net/favicon.png](https://incinerateplus.opik.net/favicon.png)" },
	{ title: "TikTok", url: "[https://www.tiktok.com](https://www.tiktok.com)", favicon: "[https://www.tiktok.com/favicon.ico](https://www.tiktok.com/favicon.ico)" },
	{ title: "Discord", url: "[https://discord.com](https://discord.com)", favicon: "[https://favicon.run/favicon?domain=discord.com&sz=32](https://favicon.run/favicon?domain=discord.com&sz=32)" },
	{ title: "Spotify", url: "[https://open.spotify.com](https://open.spotify.com)", favicon: "[https://open.spotify.com/favicon.ico](https://open.spotify.com/favicon.ico)" },
	{ title: "Reddit", url: "[https://www.reddit.com](https://www.reddit.com)", favicon: "[https://www.reddit.com/favicon.ico](https://www.reddit.com/favicon.ico)" },
	{ title: "Google", url: "[https://www.google.com](https://www.google.com)", favicon: "[https://www.google.com/favicon.ico](https://www.google.com/favicon.ico)" },
];

const favoriteUrls = new Map();

function canonicalizeUrl(url) {
	try {
		const parsed = new URL(url);
		parsed.hash = "";
		if (parsed.pathname === "/") parsed.pathname = "/";
		return parsed.href;
	} catch {
		return url;
	}
}

try {
	const savedFavorites = JSON.parse(localStorage.getItem("sleek-favorites") || "[]");
	if (Array.isArray(savedFavorites)) {
		for (const favorite of savedFavorites) {
			if (Array.isArray(favorite) && favorite.length === 2 && favorite[1]?.url) {
				const url = canonicalizeUrl(favorite[1].url);
				favoriteUrls.set(url, { ...favorite[1], url });
						} else if (favorite
*/

const proxyFrameWrapper = document.getElementById("sj-frame-wrapper");
const proxyFrames = document.getElementById("sj-frames");
const proxyTabs = document.getElementById("sj-tabs");
const proxyNewTab = document.getElementById("sj-new-tab");
const proxyTabAddress = document.getElementById("sj-tab-address");
const proxyLoading = document.getElementById("sj-loading");
const proxyError = document.getElementById("sj-error");
const proxyErrorCode = document.getElementById("sj-error-code");
const proxyHome = "sleek://home";
const proxyMusic = "sleek://music";
const proxyGames = "sleek://sleekstation";
const proxySlick = "sleek://slick";
let proxyController;
let proxyActiveTab;
let proxyInitPromise;
let proxyTabCount = 0;
const proxyTabList = [];

function showProxyError(reason) {
	const message = reason instanceof Error ? reason.message : String(reason);
	if (proxyError) proxyError.textContent = message;
	if (proxyErrorCode) proxyErrorCode.textContent = reason?.stack || "";
}

function clearProxyError() {
	if (proxyError) proxyError.textContent = "";
	if (proxyErrorCode) proxyErrorCode.textContent = "";
}

function proxyNormalizeUrl(value) {
	const input = String(value || "").trim();
	if (!input) return proxyHome;
	if (/^[a-z][a-z\d+.-]*:\/\//i.test(input)) return input;
	if (input.includes(".") && !input.includes(" ")) return `https://${input}`;
	const engine = document.getElementById("sj-search-engine")?.value || "https://duckduckgo.com/?q=%s";
	return engine.replace("%s", encodeURIComponent(input));
}

function setProxyAddress(value) {
	if (address) address.value = value === proxyHome ? "" : value;
	if (proxyTabAddress) proxyTabAddress.value = value;
}

function showProxyHome(tab = proxyActiveTab || createProxyTab()) {
	if (tab.frameElement) tab.frameElement.src = "about:blank";
	tab.url = proxyHome;
	const title = tab.button?.querySelector(".sj-tab-title");
	if (title) title.textContent = "New tab";
	proxyActiveTab = tab;
	setProxyAddress(proxyHome);
	updateBookmarkState();
	if (musicPage) musicPage.hidden = true;
	if (gamesPage) gamesPage.hidden = true;
	if (slickPage) slickPage.hidden = true;
	document.body.classList.add("is-home");
	document.body.classList.remove("music-open", "games-open", "slick-open");
	if (proxyFrameWrapper) proxyFrameWrapper.style.display = "none";
	if (proxyLoading) proxyLoading.hidden = true;
}

function selectProxyTab(tab) {
	proxyActiveTab = tab;
	proxyTabList.forEach((item) => {
		item.button.classList.toggle("active", item === tab);
		item.frameElement.classList.toggle("active", item === tab);
	});
	if (tab.url === proxyHome || !tab.url) showProxyHome(tab);
	else if (tab.url === proxyMusic || tab.url === proxyGames || tab.url === "sleek://games" || tab.url === proxySlick) openInternalPage(tab.url);
	else {
		setProxyAddress(tab.url);
		document.body.classList.remove("is-home");
		if (proxyFrameWrapper) proxyFrameWrapper.style.display = "flex";
	}
}

function closeProxyTab(tab) {
	if (proxyTabList.length === 1) return;
	const index = proxyTabList.indexOf(tab);
	proxyTabList.splice(index, 1);
	tab.button.remove();
	tab.frameElement.remove();
	if (tab === proxyActiveTab) selectProxyTab(proxyTabList[Math.max(0, index - 1)]);
}

function createProxyTab() {
	const button = proxyTabList.length === 0 ? document.getElementById("sj-home-tab") : document.createElement("button");
	const tab = { button, frameElement: document.createElement("iframe"), frame: null, url: proxyHome };
	proxyTabCount += 1;
	button.type = "button";
	button.className = "sj-tab";
	button.innerHTML = '<span class="sj-tab-title">New tab</span><span class="sj-tab-close" aria-label="Close tab">&times;</span>';
	button.addEventListener("click", (event) => {
		if (event.target.closest(".sj-tab-close")) closeProxyTab(tab);
		else selectProxyTab(tab);
	});
	if (!button.isConnected && proxyTabs) proxyTabs.insertBefore(button, proxyNewTab);
	tab.frameElement.className = "sj-frame";
	tab.frameElement.title = `SLEEK tab ${proxyTabCount}`;
	proxyFrames?.append(tab.frameElement);
	proxyTabList.push(tab);
	selectProxyTab(tab);
	if (proxyController) attachProxyFrame(tab);
	return tab;
}

function attachProxyFrame(tab) {
	if (tab.frame || !proxyController) return;
	tab.frame = proxyController.createFrame(tab.frameElement);
	tab.frameElement.addEventListener("load", () => {
		if (tab === proxyActiveTab && proxyLoading) proxyLoading.hidden = true;
	});
}

async function initProxy() {
	if (proxyInitPromise) return proxyInitPromise;
	proxyInitPromise = (async () => {
		if (!proxyActiveTab) createProxyTab();
		const registrationPromise = navigator.serviceWorker.ready;
		await loadProxyScript("/scramjet/scramjet.js", "$scramjet");
		const runtimePromise = Promise.all([
			loadProxyScript("/controller/controller.api.js", "$scramjetController"),
			loadProxyScript("/epoxy/index.js", "EpoxyTransport"),
		]);
		const [registration] = await Promise.all([registrationPromise, runtimePromise]);
		if (!globalThis.$scramjetController || !globalThis.$scramjet || !globalThis.EpoxyTransport) {
			throw new Error("The Scramjet proxy runtime did not load correctly. Refresh the page.");
		}
		const { Controller } = globalThis.$scramjetController;
		const { defaultConfig } = globalThis.$scramjet;
		const EpoxyTransport = globalThis.EpoxyTransport.default;
		const serviceworker = navigator.serviceWorker.controller ?? registration.active;
		if (!serviceworker) throw new Error("The proxy service worker is not active yet. Refresh the page.");
		const transport = new EpoxyTransport({ wisp: window.WISP_URL || "wss://wisp.mercurywork.shop/" });
		await transport.init();
		proxyController = new Controller({ serviceworker, transport, scramjetConfig: defaultConfig });
		await proxyController.wait();
		proxyTabList.forEach(attachProxyFrame);
	})().catch((reason) => {
		proxyInitPromise = null;
		showProxyError(reason);
		throw reason;
	});
	return proxyInitPromise;
}

function loadProxyScript(src, globalName) {
	if (globalThis[globalName]) return Promise.resolve();
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.fetchPriority = "high";
		script.onload = () => {
			if (globalThis[globalName]) resolve();
			else reject(new Error(`Proxy runtime did not expose ${globalName}: ${src}`));
		};
		script.onerror = () => reject(new Error(`Could not load proxy runtime: ${src}`));
		document.head.append(script);
	});
}

async function navigate(value) {
	const url = proxyNormalizeUrl(value);
	if (url === proxyHome) return showProxyHome(proxyActiveTab || createProxyTab());
	if (url === proxyMusic || url === proxyGames || url === "sleek://games" || url === proxySlick) {
		return openInternalPage(url === "sleek://games" ? proxyGames : url);
	}
	await initProxy();
	if (!proxyActiveTab) createProxyTab();
	if (!proxyActiveTab.frame) throw new Error("The proxy frame is not ready yet.");
	clearProxyError();
	proxyActiveTab.url = url;
	const title = proxyActiveTab.button.querySelector(".sj-tab-title");
	if (title) title.textContent = new URL(url).hostname;
	setProxyAddress(url);
	updateBookmarkState();
	recordHistory(url);
	document.body.classList.remove("is-home");
	if (proxyFrameWrapper) proxyFrameWrapper.style.display = "flex";
	if (proxyLoading) proxyLoading.hidden = false;
	proxyActiveTab.frame.go(url);
}

form?.addEventListener("submit", (event) => {
	event.preventDefault();
	void navigate(address?.value).catch(showProxyError);
});
document.getElementById("sj-tab-address-bar")?.addEventListener("submit", (event) => {
	event.preventDefault();
	void navigate(proxyTabAddress?.value).catch(showProxyError);
});
document.getElementById("sj-back")?.addEventListener("click", () => proxyActiveTab?.frame?.back());
document.getElementById("sj-forward")?.addEventListener("click", () => proxyActiveTab?.frame?.forward());
document.getElementById("sj-reload")?.addEventListener("click", () => proxyActiveTab?.frame?.reload());
document.getElementById("sj-home")?.addEventListener("click", () => showProxyHome());
proxyNewTab?.addEventListener("click", () => createProxyTab());

for (const menuItem of document.querySelectorAll("[data-panel-route]")) {
	menuItem.addEventListener("click", (event) => {
		event.preventDefault();
		void navigate(menuItem.dataset.panelRoute).catch(showProxyError);
	});
}

for (const container of [quickLinks, savedLinks]) {
	container?.addEventListener("click", (event) => {
		const button = event.target.closest("[data-quick-url]");
		if (!button) return;
		event.preventDefault();
		void navigate(button.dataset.quickUrl).catch(showProxyError);
	});
}

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/sw.js").then(() => initProxy()).catch(showProxyError);
} else {
	showProxyError("This browser does not support service workers.");
}

const slickMenuItem = document.createElement("button");
slickMenuItem.type = "button";
slickMenuItem.dataset.panelRoute = "sleek://slick";
slickMenuItem.innerHTML = '<span class="tool-icon"><i class="bi bi-stars" aria-hidden="true"></i></span><span><strong>Slick</strong><small>AI CHAT</small></span>';
toolsPanel?.append(slickMenuItem);

function openSlickPage() {
	openInternalPage(proxySlick);
}

slickMenuItem.addEventListener("click", openSlickPage);
slickClose?.addEventListener("click", () => {
	showProxyHome(proxyActiveTab || createProxyTab());
});

function ensureSlickHomeButton() {
	let button = document.getElementById("sj-slick-close");
	if (!button) {
		button = document.createElement("button");
		button.id = "sj-slick-close";
		button.type = "button";
		button.className = "slick-home-button";
		button.setAttribute("aria-label", "Go home");
		button.textContent = "⌂";
		slickPage?.querySelector(".slick-header")?.append(button);
	}
	if (button.dataset.homeBound !== "true") {
		button.addEventListener("click", goHome);
		button.dataset.homeBound = "true";
	}
	return button;
}

function openInternalPage(route) {
	const normalizedRoute = route === "sleek://games" ? proxyGames : route;
	const tab = proxyActiveTab || createProxyTab();
	if (tab.frameElement) tab.frameElement.src = "about:blank";
	if (musicPage) musicPage.hidden = normalizedRoute !== proxyMusic;
	if (gamesPage) gamesPage.hidden = normalizedRoute !== proxyGames;
	if (slickPage) slickPage.hidden = normalizedRoute !== proxySlick;
	const gameStage = document.getElementById("sj-game-stage");
	if (gameStage && normalizedRoute !== proxyGames) gameStage.hidden = true;
	if (proxyFrameWrapper) proxyFrameWrapper.style.display = "none";
	if (proxyLoading) proxyLoading.hidden = true;
	if (toolsPanel) toolsPanel.hidden = true;
	if (musicButton) musicButton.setAttribute("aria-expanded", "false");
	tab.url = normalizedRoute;
	proxyActiveTab = tab;
	const title = tab.button?.querySelector(".sj-tab-title");
	if (title) title.textContent = normalizedRoute === proxyMusic ? "Sleekify" : normalizedRoute === proxyGames ? "Sleekstation" : "Slick";
	setProxyAddress(normalizedRoute);
	document.body.classList.remove("is-home", "music-open", "games-open", "slick-open");
	if (normalizedRoute === proxyMusic) document.body.classList.add("music-open");
	if (normalizedRoute === proxyGames) document.body.classList.add("games-open");
	if (normalizedRoute === proxySlick) {
		document.body.classList.add("slick-open");
		ensureSlickHomeButton();
		ensureSlickStarfield();
	}
	if (normalizedRoute === proxyGames) void loadGamesCatalog();
}

function goHome() {
	const tab = proxyActiveTab || createProxyTab();
	const gameStage = document.getElementById("sj-game-stage");
	if (gameStage) gameStage.hidden = true;
	if (gameStageFrame) gameStageFrame.src = "about:blank";
	showProxyHome(tab);
}

resetHomeButton?.addEventListener("click", () => goHome());

document.getElementById("sj-home")?.addEventListener("click", goHome);
musicClose?.addEventListener("click", goHome);
gamesClose?.addEventListener("click", goHome);
slickClose?.addEventListener("click", goHome);
gameStageBack?.addEventListener("click", () => {
	if (proxyActiveTab?.url === proxyGames) openInternalPage(proxyGames);
	else goHome();
});