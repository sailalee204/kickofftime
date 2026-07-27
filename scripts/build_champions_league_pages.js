const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "data", "champions-league.json"), "utf8"));
const outputDir = path.join(root, "champions-league");
const matchDir = path.join(outputDir, "match");
const siteUrl = "https://kickofftracker.com";

fs.mkdirSync(matchDir, { recursive: true });

function cleanHtml(html) {
  return `${html.replace(/[ \t]+$/gm, "").trimEnd()}\n`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function matchSlug(match) {
  return slug(`${match.home}-vs-${match.away}`);
}

function formatInZone(dateValue, timezone, includeZone = true) {
  return new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...(includeZone ? { timeZoneName: "short" } : {})
  }).format(new Date(dateValue));
}

function firstLegSummary(match) {
  if (!match.stage.toLowerCase().includes("second leg")) return "";
  const firstLeg = data.matches.find((candidate) =>
    candidate.status === "FINISHED" &&
    candidate.home === match.away &&
    candidate.away === match.home
  );
  if (!firstLeg) return "";
  return `The first leg ended ${firstLeg.home} ${firstLeg.home_score}-${firstLeg.away_score} ${firstLeg.away}.`;
}

function analytics() {
  return `
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-X3D65XCZNY"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-X3D65XCZNY');
  </script>`;
}

function shellStart({ title, description, canonical }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${siteUrl}/og-kickofftime.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/style.css?v=5">
  ${analytics()}
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/" aria-label="KickoffTime home">
      <span class="brand-mark" aria-hidden="true">KT</span>
      <span>KICKOFF<span>TIME</span></span>
    </a>
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/">Fixtures</a>
      <a href="/champions-league/">Season guide</a>
      <a href="/world-cup-2026.html">World Cup archive</a>
      <a href="/about.html">About</a>
    </nav>
  </header>`;
}

function shellEnd() {
  return `
  <footer class="site-footer">
    <div class="brand footer-brand"><span class="brand-mark" aria-hidden="true">KT</span><span>KICKOFF<span>TIME</span></span></div>
    <p>Football times made clear across timezones.</p>
    <nav aria-label="Footer navigation">
      <a href="/about.html">About</a>
      <a href="/contact.html">Contact</a>
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
    </nav>
    <p class="legal">Independent fan utility. Not affiliated with or endorsed by UEFA, FIFA, or any club.</p>
  </footer>
</body>
</html>`;
}

function buildMatchPage(match) {
  const finished = match.status === "FINISHED";
  const title = finished
    ? `${match.home} ${match.home_score}-${match.away_score} ${match.away} | Champions League Result`
    : `${match.home} vs ${match.away} Kickoff Time in Your Timezone`;
  const description = finished
    ? `${match.home} beat or drew ${match.away} ${match.home_score}-${match.away_score} in the 2026/27 Champions League ${match.stage}.`
    : `See ${match.home} vs ${match.away} in your local timezone, with kickoff times for the UK, India, China, USA, and Australia plus a calendar download.`;
  const canonical = `${siteUrl}/champions-league/match/${matchSlug(match)}.html`;
  const firstLeg = firstLegSummary(match);
  const scoreOrTeams = finished
    ? `${escapeHtml(match.home)} ${match.home_score}-${match.away_score} ${escapeHtml(match.away)}`
    : `${escapeHtml(match.home)} vs ${escapeHtml(match.away)}`;
  const statusLine = finished
    ? "Full-time result"
    : `${formatInZone(match.kickoff, "UTC")} · Official schedule reference`;
  const zones = [
    ["United Kingdom", "Europe/London"],
    ["India", "Asia/Kolkata"],
    ["China", "Asia/Shanghai"],
    ["New York", "America/New_York"],
    ["Los Angeles", "America/Los_Angeles"],
    ["Sydney", "Australia/Sydney"]
  ];
  const zoneRows = zones.map(([label, timezone]) =>
    `<li><strong>${label}</strong><span>${formatInZone(match.kickoff, timezone)}</span></li>`
  ).join("");
  const calendarButton = finished ? "" : `<button class="primary-button" type="button" id="downloadCalendar">Add to calendar</button>`;

  return `${shellStart({ title, description, canonical })}
  <main class="content-page">
    <p class="eyebrow">${escapeHtml(match.stage)} · Champions League 2026/27</p>
    <h1>${scoreOrTeams}</h1>
    <p>${escapeHtml(statusLine)}</p>

    <section class="result-board">
      <span id="localDateLabel">${finished ? "Completed match" : "Kickoff in your timezone"}</span>
      <strong id="localKickoff">${finished ? scoreOrTeams : "Detecting your local time..."}</strong>
      <span id="localTimezone"></span>
    </section>

    ${calendarButton}

    <h2>${finished ? "Match result" : "Kickoff times around the world"}</h2>
    ${finished
      ? `<p>${escapeHtml(match.home)} and ${escapeHtml(match.away)} completed this ${escapeHtml(match.stage.toLowerCase())} fixture with a ${match.home_score}-${match.away_score} final score.</p>`
      : `<ul class="timezone-list">${zoneRows}</ul>`}

    ${firstLeg ? `<h2>First-leg position</h2><p>${escapeHtml(firstLeg)} The winner on aggregate advances to the third qualifying round.</p>` : ""}

    <h2>About this fixture</h2>
    <p>This match is part of the ${escapeHtml(match.stage.toLowerCase())} in the 2026/27 UEFA Champions League. KickoffTime stores the schedule in UTC and converts it on your device, which avoids errors when a match falls on the following day in Asia or Australia.</p>
    <p>Schedule last checked ${escapeHtml(formatInZone(data.updated_at, "UTC"))}. Check the linked official competition source if you are travelling or making time-sensitive plans.</p>
    <p><a class="text-link" href="${escapeHtml(data.source_url)}" target="_blank" rel="noopener">View the schedule source</a> · <a class="text-link" href="/">See all Champions League fixtures</a></p>
  </main>
  <script>
    (() => {
      const kickoff = new Date(${JSON.stringify(match.kickoff)});
      const finished = ${JSON.stringify(finished)};
      const localKickoff = document.getElementById("localKickoff");
      const localTimezone = document.getElementById("localTimezone");
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      if (!finished) {
        localKickoff.textContent = new Intl.DateTimeFormat("en", {
          weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZoneName: "short"
        }).format(kickoff);
      }
      localTimezone.textContent = timezone.replaceAll("_", " ");

      const calendarButton = document.getElementById("downloadCalendar");
      if (calendarButton) {
        calendarButton.addEventListener("click", () => {
          const end = new Date(kickoff.getTime() + 7200000);
          const utc = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\\.\\d{3}Z$/, "Z");
          const ics = [
            "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//KickoffTime//Football Fixtures//EN",
            "BEGIN:VEVENT", "UID:${escapeHtml(match.id)}@kickofftracker.com",
            "DTSTART:" + utc(kickoff), "DTEND:" + utc(end),
            "SUMMARY:${escapeHtml(match.home)} vs ${escapeHtml(match.away)}",
            "DESCRIPTION:UEFA Champions League 2026/27 - ${escapeHtml(match.stage)}",
            "END:VEVENT", "END:VCALENDAR"
          ].join("\\r\\n");
          const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = "${matchSlug(match)}.ics";
          anchor.click();
          URL.revokeObjectURL(url);
        });
      }
    })();
  </script>
  ${shellEnd()}`;
}

function buildSeasonGuide() {
  const upcoming = data.matches.filter((match) => match.status !== "FINISHED").length;
  const title = "2026/27 Champions League Dates, Format and Local Kickoff Times";
  const description = "Champions League 2026/27 qualifying, league phase, knockout, draw, and final dates, with upcoming fixtures converted to your local timezone.";
  const canonical = `${siteUrl}/champions-league/`;
  return `${shellStart({ title, description, canonical })}
  <main class="content-page">
    <p class="eyebrow">2026/27 season guide</p>
    <h1>Champions League dates and local kickoff times</h1>
    <p>The 2026/27 competition runs from July 2026 to the final in Madrid on 5 June 2027. KickoffTime currently tracks ${upcoming} confirmed upcoming qualifying fixtures and converts them to each visitor's local timezone.</p>

    <h2>Qualification schedule</h2>
    <ul>
      <li><strong>Second qualifying round:</strong> 21/22 and 28/29 July 2026</li>
      <li><strong>Third qualifying round:</strong> 4/5 and 11 August 2026</li>
      <li><strong>Play-offs:</strong> 18/19 and 25/26 August 2026</li>
      <li><strong>League phase draw:</strong> 27 August 2026</li>
    </ul>

    <h2>League phase dates</h2>
    <p>Matchday 1 begins on 8 September. The eight matchdays continue through 27 January 2027, followed by knockout play-offs in February, the round of 16 in March, quarter-finals in April, and semi-finals in late April and early May.</p>

    <h2>Why local dates can differ</h2>
    <p>A European evening kickoff may fall after midnight in India, China, Singapore, or Australia. KickoffTime converts from the stored UTC time, including daylight-saving changes, so the date shown on your device is the date you should put in your calendar.</p>

    <p><a class="primary-button" href="/">Open the live fixture tool</a></p>
    <p><a class="text-link" href="${escapeHtml(data.source_url)}" target="_blank" rel="noopener">Check the source schedule</a></p>
  </main>
  ${shellEnd()}`;
}

data.matches.forEach((match) => {
  fs.writeFileSync(path.join(matchDir, `${matchSlug(match)}.html`), cleanHtml(buildMatchPage(match)), "utf8");
});
fs.writeFileSync(path.join(outputDir, "index.html"), cleanHtml(buildSeasonGuide()), "utf8");

const lastModified = data.updated_at.slice(0, 10);
const coreUrls = [
  ["/", "1.0"],
  ["/champions-league/", "0.9"],
  ["/world-cup-2026.html", "0.7"],
  ["/about.html", "0.4"],
  ["/contact.html", "0.3"],
  ["/privacy.html", "0.3"],
  ["/terms.html", "0.3"]
];
const matchUrls = data.matches.map((match) => [
  `/champions-league/match/${matchSlug(match)}.html`,
  match.status === "FINISHED" ? "0.6" : "0.8"
]);
const sitemapEntries = [...coreUrls, ...matchUrls].map(([url, priority]) => `  <url>
    <loc>${siteUrl}${url}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${url.includes("/match/") ? "daily" : "weekly"}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");

console.log(`Generated ${data.matches.length} Champions League match pages and sitemap.xml.`);
