(() => {
  "use strict";

  const DATA_URL = "/data/champions-league.json";
  const WORLD_ZONES = [
    ["Your time", "selected"],
    ["London", "Europe/London"],
    ["India", "Asia/Kolkata"],
    ["China", "Asia/Shanghai"],
    ["New York", "America/New_York"],
    ["Sydney", "Australia/Sydney"]
  ];

  const WATCH_REGIONS = {
    global: {
      label: "Other region",
      partners: []
    },
    uk: {
      label: "United Kingdom",
      partners: [
        { name: "HBO Max", url: "https://www.hbomax.com/" },
        { name: "BBC", url: "https://www.bbc.com/sport/football", note: "Highlights" }
      ]
    },
    usa: {
      label: "United States",
      partners: [
        { name: "Paramount+", url: "https://www.cbssports.com/" },
        { name: "TUDN", url: "https://www.tudn.com/" },
        { name: "DAZN", url: "https://www.dazn.com/" }
      ]
    },
    canada: {
      label: "Canada",
      partners: [{ name: "DAZN", url: "https://www.dazn.com/" }]
    },
    australia: {
      label: "Australia",
      partners: [{ name: "Stan Sport", url: "https://www.stan.com.au/" }]
    },
    bangladesh: {
      label: "Bangladesh",
      partners: [
        { name: "Sony", url: "https://www.sonyliv.com/" },
        { name: "Tapmad", url: "https://www.tapmad.com/" }
      ]
    },
    india: {
      label: "Indian sub-continent",
      partners: [{ name: "Sony", url: "https://www.sonyliv.com/" }]
    },
    china: {
      label: "China",
      partners: [{ name: "iQIYI Sports", url: "https://www.iqiyisports.com/" }]
    },
    singapore: {
      label: "Singapore",
      partners: [{ name: "beIN", url: "https://connect.beinsports.com/" }]
    },
    malaysia: {
      label: "Malaysia",
      partners: [{ name: "beIN", url: "https://connect.beinsports.com/" }]
    },
    indonesia: {
      label: "Indonesia",
      partners: [
        { name: "beIN", url: "https://connect.beinsports.com/" },
        { name: "SCTV", url: "https://www.sctv.co.id/" }
      ]
    },
    japan: {
      label: "Japan",
      partners: [
        { name: "WOWOW", url: "https://wod.wowow.co.jp/" },
        { name: "U-NEXT", url: "https://video.unext.jp/", note: "Highlights" }
      ]
    },
    newZealand: {
      label: "New Zealand",
      partners: [{ name: "DAZN", url: "https://www.dazn.com/" }]
    },
    southAfrica: {
      label: "South Africa",
      partners: [{ name: "SuperSport", url: "https://supersport.com/" }]
    },
    nigeria: {
      label: "Nigeria",
      partners: [{ name: "SuperSport", url: "https://supersport.com/" }]
    },
    mena: {
      label: "Middle East / North Africa",
      partners: [{ name: "beIN", url: "https://www.bein.com/" }]
    },
    germany: {
      label: "Germany",
      partners: [
        { name: "DAZN", url: "https://www.dazn.com/" },
        { name: "ZDF", url: "https://www.zdf.de/" }
      ]
    },
    france: {
      label: "France",
      partners: [
        { name: "Canal+", url: "https://www.canalplus.com/" },
        { name: "M6", url: "https://www.m6.fr/" }
      ]
    },
    spain: {
      label: "Spain",
      partners: [
        { name: "Movistar Plus+", url: "https://ver.movistarplus.es/" },
        { name: "RTVE", url: "https://www.rtve.es/" }
      ]
    },
    italy: {
      label: "Italy",
      partners: [
        { name: "Sky", url: "https://www.sky.it/" },
        { name: "Prime Video", url: "https://www.amazon.it/gp/video/", note: "Selected matches" }
      ]
    },
    brazil: {
      label: "Brazil",
      partners: [
        { name: "TNT Sports", url: "https://www.hbomax.com/" },
        { name: "SBT", url: "https://www.sbt.com.br/" }
      ]
    },
    argentina: {
      label: "Argentina",
      partners: [
        { name: "FOX Sports", url: "https://www.foxsports.com.ar/" },
        { name: "ESPN", url: "https://www.disneyplus.com/" }
      ]
    },
    mexico: {
      label: "Mexico",
      partners: [
        { name: "Max", url: "https://www.hbomax.com/" },
        { name: "FOX", url: "https://www.foxsports.com.mx/" }
      ]
    }
  };

  const state = {
    data: null,
    filter: "upcoming",
    search: "",
    detectedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    selectedTimezone: "auto",
    favoriteTeam: "",
    selectedWatchRegion: "auto",
    countdownTimer: null
  };

  const elements = {
    timezoneSelect: document.getElementById("timezoneSelect"),
    detectedTimezone: document.getElementById("detectedTimezone"),
    activeTimezoneLabel: document.getElementById("activeTimezoneLabel"),
    dataFreshness: document.getElementById("dataFreshness"),
    nextMatchLabel: document.getElementById("nextMatchLabel"),
    nextMatch: document.getElementById("nextMatch"),
    worldTimes: document.getElementById("worldTimes"),
    timeBoardMatch: document.getElementById("timeBoardMatch"),
    teamSelect: document.getElementById("teamSelect"),
    followTeamButton: document.getElementById("followTeamButton"),
    followStatus: document.getElementById("followStatus"),
    teamSubscription: document.getElementById("teamSubscription"),
    watchRegionSelect: document.getElementById("watchRegionSelect"),
    watchPartners: document.getElementById("watchPartners"),
    fixtureList: document.getElementById("fixtureList"),
    fixtureSearch: document.getElementById("fixtureSearch"),
    emptyState: document.getElementById("emptyState"),
    toast: document.getElementById("toast")
  };

  function activeTimezone() {
    return state.selectedTimezone === "auto" ? state.detectedTimezone : state.selectedTimezone;
  }

  function timezoneLabel(timezone) {
    if (timezone === state.detectedTimezone) return `${timezone} (detected)`;
    return timezone.replaceAll("_", " ");
  }

  function formatParts(dateValue, timezone) {
    const date = new Date(dateValue);
    const dateText = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      weekday: "short",
      day: "numeric",
      month: "short"
    }).format(date);
    const timeText = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short"
    }).format(date);
    return { dateText, timeText };
  }

  function formatUpdated(dateValue) {
    const { dateText, timeText } = formatParts(dateValue, activeTimezone());
    return `Verified ${dateText}, ${timeText}`;
  }

  function matchSlug(match) {
    return `${match.home}-vs-${match.away}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function teamSlug(team) {
    return String(team)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function nextScheduledMatch() {
    const now = Date.now();
    const matches = state.data.matches
      .filter((match) => match.status !== "FINISHED" && new Date(match.kickoff).getTime() > now)
      .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
    if (!state.favoriteTeam) return matches[0] || null;
    return matches.find((match) => match.home === state.favoriteTeam || match.away === state.favoriteTeam) || null;
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    window.setTimeout(() => elements.toast.classList.remove("show"), 2400);
  }

  function teams() {
    return [...new Set(state.data.matches.flatMap((match) => [match.home, match.away]))]
      .sort((a, b) => a.localeCompare(b));
  }

  function teamCalendarUrl(team) {
    return new URL(`/calendars/champions-league/${teamSlug(team)}.ics`, window.location.origin).href;
  }

  function detectedWatchRegion() {
    const timezone = activeTimezone();
    const exact = {
      "Asia/Dhaka": "bangladesh",
      "Asia/Kolkata": "india",
      "Asia/Shanghai": "china",
      "Asia/Singapore": "singapore",
      "Asia/Kuala_Lumpur": "malaysia",
      "Asia/Jakarta": "indonesia",
      "Asia/Tokyo": "japan",
      "Pacific/Auckland": "newZealand",
      "Australia/Sydney": "australia",
      "Africa/Johannesburg": "southAfrica",
      "Africa/Lagos": "nigeria",
      "Europe/London": "uk",
      "Europe/Berlin": "germany",
      "Europe/Paris": "france",
      "Europe/Madrid": "spain",
      "Europe/Rome": "italy",
      "America/Toronto": "canada",
      "America/Sao_Paulo": "brazil",
      "America/Argentina/Buenos_Aires": "argentina",
      "America/Mexico_City": "mexico"
    };
    if (exact[timezone]) return exact[timezone];
    if (timezone.startsWith("America/")) return "usa";
    if (timezone.startsWith("Australia/")) return "australia";
    if (timezone.startsWith("Africa/") || timezone.startsWith("Asia/Riyadh") || timezone.startsWith("Asia/Dubai")) return "mena";
    return "global";
  }

  function activeWatchRegion() {
    return state.selectedWatchRegion === "auto" ? detectedWatchRegion() : state.selectedWatchRegion;
  }

  function renderTeamTools() {
    const availableTeams = teams();
    const selectedValue = elements.teamSelect.value || state.favoriteTeam;
    elements.teamSelect.innerHTML = [
      '<option value="">Choose a club</option>',
      ...availableTeams.map((team) => `<option value="${escapeHtml(team)}">${escapeHtml(team)}</option>`)
    ].join("");
    if (availableTeams.includes(selectedValue)) elements.teamSelect.value = selectedValue;

    if (!state.favoriteTeam) {
      elements.followStatus.textContent = "Not following a club";
      elements.teamSubscription.innerHTML = "<p>Select a club from the current verified schedule.</p>";
      return;
    }

    const teamMatches = state.data.matches
      .filter((match) => match.home === state.favoriteTeam || match.away === state.favoriteTeam)
      .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
    const upcoming = teamMatches.find((match) =>
      match.status !== "FINISHED" && new Date(match.kickoff).getTime() > Date.now()
    );
    const calendarUrl = teamCalendarUrl(state.favoriteTeam);
    const webcalUrl = calendarUrl.replace(/^https?:/, "webcal:");
    const googleUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(calendarUrl)}`;
    const nextText = upcoming
      ? `${formatParts(upcoming.kickoff, activeTimezone()).dateText}, ${formatParts(upcoming.kickoff, activeTimezone()).timeText} · ${upcoming.home} vs ${upcoming.away}`
      : "No future fixture is currently confirmed.";

    elements.followStatus.textContent = `Following ${state.favoriteTeam}`;
    elements.teamSubscription.innerHTML = `
      <div class="subscription-summary">
        <strong>${escapeHtml(state.favoriteTeam)}</strong>
        <button class="remove-team-button" type="button" data-remove-team title="Stop following" aria-label="Stop following ${escapeHtml(state.favoriteTeam)}">×</button>
      </div>
      <p>${escapeHtml(nextText)}</p>
      <div class="subscription-actions">
        <a class="primary-button compact-button" href="${escapeHtml(googleUrl)}" target="_blank" rel="noopener" data-calendar-subscribe="google">Google Calendar</a>
        <a class="secondary-button compact-button" href="${escapeHtml(webcalUrl)}" data-calendar-subscribe="webcal">Apple / Outlook</a>
        <button class="secondary-button compact-button" type="button" data-copy-calendar-url="${escapeHtml(calendarUrl)}">Copy calendar link</button>
      </div>`;
  }

  function renderWatchInfo() {
    const selected = state.selectedWatchRegion;
    const autoLabel = WATCH_REGIONS[detectedWatchRegion()].label;
    elements.watchRegionSelect.innerHTML = [
      `<option value="auto">Detected: ${escapeHtml(autoLabel)}</option>`,
      ...Object.entries(WATCH_REGIONS)
        .filter(([key]) => key !== "global")
        .map(([key, region]) => `<option value="${key}">${escapeHtml(region.label)}</option>`)
    ].join("");
    elements.watchRegionSelect.value = selected;

    const region = WATCH_REGIONS[activeWatchRegion()];
    if (!region.partners.length) {
      elements.watchPartners.innerHTML = `
        <p>No local partner is listed in this quick view.</p>
        <a class="secondary-button compact-button" href="https://www.uefa.com/uefachampionsleague/news/0253-0d82037aaedd-f371c464f919-1000--tv-channels-live-streams/" target="_blank" rel="noopener">Check UEFA's full list</a>`;
      return;
    }

    elements.watchPartners.innerHTML = region.partners.map((partner) => `
      <a class="watch-partner" href="${escapeHtml(partner.url)}" target="_blank" rel="noopener" data-watch-partner="${escapeHtml(partner.name)}">
        <strong>${escapeHtml(partner.name)}</strong>
        <span>${escapeHtml(partner.note || "UEFA-listed partner")}</span>
      </a>`).join("");
  }

  function countdownText(kickoff) {
    const remaining = new Date(kickoff).getTime() - Date.now();
    if (remaining <= 0) return "Kickoff time reached";
    const totalMinutes = Math.floor(remaining / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
  }

  function renderNextMatch() {
    const match = nextScheduledMatch();
    window.clearInterval(state.countdownTimer);
    elements.nextMatchLabel.textContent = state.favoriteTeam ? `${state.favoriteTeam} · Next kickoff` : "Next kickoff";

    if (!match) {
      elements.nextMatch.innerHTML = `
        <div>
          <p class="next-stage">Schedule update</p>
          <h2 class="next-teams">${state.favoriteTeam ? `No confirmed ${escapeHtml(state.favoriteTeam)} fixture.` : "The next round is being confirmed."}</h2>
          <p class="next-meta">The last verified schedule remains available below.</p>
        </div>`;
      elements.timeBoardMatch.textContent = "No upcoming kickoff is currently confirmed.";
      elements.worldTimes.innerHTML = "";
      return;
    }

    const formatted = formatParts(match.kickoff, activeTimezone());
    elements.nextMatch.innerHTML = `
      <div>
        <p class="next-stage">${escapeHtml(match.stage)}</p>
        <h2 id="nextMatchHeading" class="next-teams">${escapeHtml(match.home)} <span aria-hidden="true">vs</span> ${escapeHtml(match.away)}</h2>
        <p class="next-meta">${formatted.dateText} · ${formatted.timeText} · ${escapeHtml(timezoneLabel(activeTimezone()))}</p>
      </div>
      <div class="countdown-panel">
        <p class="countdown-label">Starts in</p>
        <div class="countdown" id="nextCountdown">${countdownText(match.kickoff)}</div>
        <button class="primary-button" type="button" data-calendar-id="${escapeHtml(match.id)}">Add to calendar</button>
      </div>`;

    state.countdownTimer = window.setInterval(() => {
      const countdown = document.getElementById("nextCountdown");
      if (countdown) countdown.textContent = countdownText(match.kickoff);
    }, 30000);

    renderWorldTimes(match);
  }

  function renderWorldTimes(match) {
    elements.timeBoardMatch.textContent = `${match.home} vs ${match.away}`;
    elements.worldTimes.innerHTML = WORLD_ZONES.map(([city, configuredZone]) => {
      const timezone = configuredZone === "selected" ? activeTimezone() : configuredZone;
      const formatted = formatParts(match.kickoff, timezone);
      const label = configuredZone === "selected" ? "Your time" : city;
      return `
        <div class="world-time">
          <div class="world-time-city">${escapeHtml(label)}</div>
          <time class="world-time-clock" datetime="${escapeHtml(match.kickoff)}">${formatted.timeText}</time>
          <div class="world-time-date">${formatted.dateText}</div>
        </div>`;
    }).join("");
  }

  function filteredMatches() {
    const query = state.search.trim().toLowerCase();
    return state.data.matches
      .filter((match) => {
        if (state.filter === "upcoming" && match.status === "FINISHED") return false;
        if (state.filter === "results" && match.status !== "FINISHED") return false;
        if (state.filter === "following" && (!state.favoriteTeam || (match.home !== state.favoriteTeam && match.away !== state.favoriteTeam))) return false;
        if (!query) return true;
        return `${match.home} ${match.away}`.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        const direction = state.filter === "results" ? -1 : 1;
        return (new Date(a.kickoff) - new Date(b.kickoff)) * direction;
      });
  }

  function renderFixtures() {
    const matches = filteredMatches();
    elements.emptyState.hidden = matches.length > 0;
    elements.fixtureList.innerHTML = matches.map((match) => {
      const formatted = formatParts(match.kickoff, activeTimezone());
      const finished = match.status === "FINISHED";
      const scoreHome = finished ? `<span class="fixture-score">${match.home_score}</span>` : "";
      const scoreAway = finished ? `<span class="fixture-score">${match.away_score}</span>` : "";
      const action = finished
        ? `<a class="calendar-button" href="/champions-league/match/${matchSlug(match)}.html">Match details</a>`
        : `<button class="calendar-button" type="button" data-calendar-id="${escapeHtml(match.id)}">Add to calendar</button>`;
      return `
        <article class="fixture-card${finished ? " finished" : ""}">
          <div>
            <div class="fixture-stage">${escapeHtml(match.stage)}</div>
            <div class="fixture-date">${formatted.dateText}</div>
            <div class="fixture-teams">
              <div class="fixture-team"><span>${escapeHtml(match.home)}</span>${scoreHome}</div>
              <div class="fixture-team"><span>${escapeHtml(match.away)}</span>${scoreAway}</div>
            </div>
          </div>
          <div class="fixture-side">
            <div>
              <div class="fixture-time">${finished ? "FT" : formatted.timeText}</div>
              <div class="fixture-status">${finished ? "Final result" : timezoneLabel(activeTimezone())}</div>
            </div>
            ${action}
          </div>
        </article>`;
    }).join("");
  }

  function escapeIcs(value) {
    return String(value)
      .replaceAll("\\", "\\\\")
      .replaceAll("\n", "\\n")
      .replaceAll(",", "\\,")
      .replaceAll(";", "\\;");
  }

  function toIcsUtc(date) {
    return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }

  function downloadCalendar(match) {
    const start = new Date(match.kickoff);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const title = `${match.home} vs ${match.away}`;
    const description = `${state.data.competition} ${state.data.season}\\n${match.stage}\\nVerified schedule from KickoffTime`;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//KickoffTime//Football Fixtures//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${escapeIcs(match.id)}@kickofftracker.com`,
      `DTSTAMP:${toIcsUtc(new Date())}`,
      `DTSTART:${toIcsUtc(start)}`,
      `DTEND:${toIcsUtc(end)}`,
      `SUMMARY:${escapeIcs(title)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${matchSlug(match)}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("Calendar file downloaded");
    if (typeof window.gtag === "function") {
      window.gtag("event", "calendar_download", { match_id: match.id, competition: "champions_league" });
    }
  }

  function renderAll() {
    elements.detectedTimezone.textContent = timezoneLabel(activeTimezone());
    elements.activeTimezoneLabel.textContent = timezoneLabel(activeTimezone());
    elements.dataFreshness.textContent = formatUpdated(state.data.updated_at);
    renderNextMatch();
    renderTeamTools();
    renderWatchInfo();
    renderFixtures();
  }

  function bindEvents() {
    elements.timezoneSelect.addEventListener("change", (event) => {
      state.selectedTimezone = event.target.value;
      localStorage.setItem("kickoff-timezone", state.selectedTimezone);
      renderAll();
    });

    elements.followTeamButton.addEventListener("click", () => {
      const team = elements.teamSelect.value;
      if (!team) {
        showToast("Choose a club first");
        return;
      }
      state.favoriteTeam = team;
      localStorage.setItem("kickoff-favorite-team", team);
      renderAll();
      showToast(`Following ${team}`);
      if (typeof window.gtag === "function") {
        window.gtag("event", "team_follow", { team });
      }
    });

    elements.watchRegionSelect.addEventListener("change", (event) => {
      state.selectedWatchRegion = event.target.value;
      localStorage.setItem("kickoff-watch-region", state.selectedWatchRegion);
      renderWatchInfo();
    });

    document.querySelectorAll(".filter-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter;
        document.querySelectorAll(".filter-button").forEach((item) => item.classList.toggle("active", item === button));
        renderFixtures();
      });
    });

    elements.fixtureSearch.addEventListener("input", (event) => {
      state.search = event.target.value;
      renderFixtures();
    });

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-calendar-id]");
      if (button && state.data) {
        const match = state.data.matches.find((item) => item.id === button.dataset.calendarId);
        if (match) downloadCalendar(match);
        return;
      }

      const copyButton = event.target.closest("[data-copy-calendar-url]");
      if (copyButton) {
        navigator.clipboard.writeText(copyButton.dataset.copyCalendarUrl)
          .then(() => showToast("Calendar subscription link copied"))
          .catch(() => showToast("Unable to copy the calendar link"));
        if (typeof window.gtag === "function") {
          window.gtag("event", "calendar_subscribe", { method: "copy", team: state.favoriteTeam });
        }
        return;
      }

      const removeButton = event.target.closest("[data-remove-team]");
      if (removeButton) {
        state.favoriteTeam = "";
        localStorage.removeItem("kickoff-favorite-team");
        renderAll();
        showToast("Club removed");
        return;
      }

      const subscribeLink = event.target.closest("[data-calendar-subscribe]");
      if (subscribeLink && typeof window.gtag === "function") {
        window.gtag("event", "calendar_subscribe", {
          method: subscribeLink.dataset.calendarSubscribe,
          team: state.favoriteTeam
        });
      }

      const partnerLink = event.target.closest("[data-watch-partner]");
      if (partnerLink && typeof window.gtag === "function") {
        window.gtag("event", "watch_partner_click", {
          partner: partnerLink.dataset.watchPartner,
          region: activeWatchRegion()
        });
      }
    });
  }

  async function init() {
    bindEvents();
    const savedTimezone = localStorage.getItem("kickoff-timezone");
    if (savedTimezone && [...elements.timezoneSelect.options].some((option) => option.value === savedTimezone)) {
      state.selectedTimezone = savedTimezone;
      elements.timezoneSelect.value = savedTimezone;
    }
    state.favoriteTeam = localStorage.getItem("kickoff-favorite-team") || "";
    state.selectedWatchRegion = localStorage.getItem("kickoff-watch-region") || "auto";
    if (state.selectedWatchRegion !== "auto" && !WATCH_REGIONS[state.selectedWatchRegion]) {
      state.selectedWatchRegion = "auto";
    }

    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`Schedule request failed: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.matches) || data.matches.length === 0) throw new Error("Schedule is empty");
      state.data = data;
      if (state.favoriteTeam && !teams().includes(state.favoriteTeam)) {
        state.favoriteTeam = "";
        localStorage.removeItem("kickoff-favorite-team");
      }
      renderAll();
    } catch (error) {
      elements.dataFreshness.textContent = "Schedule temporarily unavailable";
      elements.nextMatch.innerHTML = `
        <div>
          <p class="next-stage">Unable to load fixtures</p>
          <h2 class="next-teams">Please try again shortly.</h2>
          <p class="next-meta">No unverified replacement data has been shown.</p>
        </div>`;
      console.error(error);
    }
  }

  init();
})();
