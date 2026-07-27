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

  const state = {
    data: null,
    filter: "upcoming",
    search: "",
    detectedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    selectedTimezone: "auto",
    countdownTimer: null
  };

  const elements = {
    timezoneSelect: document.getElementById("timezoneSelect"),
    detectedTimezone: document.getElementById("detectedTimezone"),
    activeTimezoneLabel: document.getElementById("activeTimezoneLabel"),
    dataFreshness: document.getElementById("dataFreshness"),
    nextMatch: document.getElementById("nextMatch"),
    worldTimes: document.getElementById("worldTimes"),
    timeBoardMatch: document.getElementById("timeBoardMatch"),
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
    return state.data.matches
      .filter((match) => match.status !== "FINISHED" && new Date(match.kickoff).getTime() > now)
      .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))[0] || null;
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    window.setTimeout(() => elements.toast.classList.remove("show"), 2400);
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

    if (!match) {
      elements.nextMatch.innerHTML = `
        <div>
          <p class="next-stage">Schedule update</p>
          <h2 class="next-teams">The next round is being confirmed.</h2>
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
    renderFixtures();
  }

  function bindEvents() {
    elements.timezoneSelect.addEventListener("change", (event) => {
      state.selectedTimezone = event.target.value;
      localStorage.setItem("kickoff-timezone", state.selectedTimezone);
      renderAll();
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
      if (!button || !state.data) return;
      const match = state.data.matches.find((item) => item.id === button.dataset.calendarId);
      if (match) downloadCalendar(match);
    });
  }

  async function init() {
    bindEvents();
    const savedTimezone = localStorage.getItem("kickoff-timezone");
    if (savedTimezone && [...elements.timezoneSelect.options].some((option) => option.value === savedTimezone)) {
      state.selectedTimezone = savedTimezone;
      elements.timezoneSelect.value = savedTimezone;
    }

    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`Schedule request failed: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.matches) || data.matches.length === 0) throw new Error("Schedule is empty");
      state.data = data;
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
