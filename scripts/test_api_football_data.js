const fs = require("fs");
const path = require("path");
const https = require("https");

const apiKey = String(process.env.API_FOOTBALL_KEY || "").trim();
if (!apiKey) {
  throw new Error("API_FOOTBALL_KEY is required.");
}
if (!/^[A-Za-z0-9_-]+$/.test(apiKey)) {
  throw new Error(
    "API_FOOTBALL_KEY contains invalid characters. Copy only the key value from API-Sports."
  );
}

const apiBase = "https://v3.football.api-sports.io";
const siteDataPath = path.join(__dirname, "..", "data", "champions-league.json");
const targetSeason = 2026;

const TEAM_ALIASES = new Map([
  ["agf aarhus", "aarhus"],
  ["aarhus gf", "aarhus"],
  ["red star belgrade", "crvena zvezda"],
  ["dinamo zagreb", "gnk dinamo"],
  ["gnk dinamo zagreb", "gnk dinamo"],
  ["heart of midlothian", "hearts"],
  ["heart of midlothian fc", "hearts"],
  ["ki klaksvik", "klaksvik"],
  ["kuopion palloseura", "kups"],
  ["kups kuopio", "kups"],
  ["fc kairat", "kairat almaty"],
  ["kairat", "kairat almaty"],
  ["fc iberia 1999", "iberia tbilisi"],
  ["fc iberia 1999 tbilisi", "iberia tbilisi"]
]);

function teamKey(name) {
  const normalized = String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(fc|cf|afc|sk|fk|nk|pfc)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return TEAM_ALIASES.get(normalized) || normalized;
}

function requestJson(pathname) {
  return new Promise((resolve, reject) => {
    const request = https.get(`${apiBase}${pathname}`, {
      headers: {
        "x-apisports-key": apiKey,
        "User-Agent": "KickoffTime/1.0"
      }
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`API-Football request failed with status ${response.statusCode}.`));
          return;
        }
        try {
          const data = JSON.parse(body);
          const errors = data.errors && Object.keys(data.errors).length
            ? JSON.stringify(data.errors)
            : "";
          if (errors) {
            reject(new Error(`API-Football returned an error: ${errors}`));
            return;
          }
          resolve(data);
        } catch (error) {
          reject(new Error(`API-Football returned invalid JSON: ${error.message}`));
        }
      });
    });
    request.setTimeout(20000, () => request.destroy(new Error("API-Football request timed out.")));
    request.on("error", reject);
  });
}

function markdownTable(rows) {
  if (!rows.length) return "_None_";
  return [
    "| Match | Issue |",
    "|---|---|",
    ...rows.slice(0, 12).map((row) => `| ${row.match} | ${row.issue} |`)
  ].join("\n");
}

function writeSummary(text) {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`, "utf8");
  }
}

function providerMatch(fixture) {
  const status = fixture.fixture && fixture.fixture.status && fixture.fixture.status.short;
  return {
    id: fixture.fixture && fixture.fixture.id,
    kickoff: fixture.fixture && fixture.fixture.date,
    home: fixture.teams && fixture.teams.home && fixture.teams.home.name,
    away: fixture.teams && fixture.teams.away && fixture.teams.away.name,
    finished: ["FT", "AET", "PEN"].includes(status),
    homeScore: fixture.goals && fixture.goals.home,
    awayScore: fixture.goals && fixture.goals.away
  };
}

async function main() {
  const leagueResponse = await requestJson(
    `/leagues?search=${encodeURIComponent("UEFA Champions League")}&season=${targetSeason}`
  );
  const leagueItem = (leagueResponse.response || []).find(
    (item) => item.league && item.league.name === "UEFA Champions League"
  );

  if (!leagueItem) {
    writeSummary(
      `# API-Football validation\n\n` +
      `**Not ready:** UEFA Champions League season ${targetSeason} was not returned by the API.`
    );
    process.exitCode = 1;
    return;
  }

  const fixtureResponse = await requestJson(
    `/fixtures?league=${leagueItem.league.id}&season=${targetSeason}`
  );
  const providerMatches = (fixtureResponse.response || []).map(providerMatch);
  const siteData = JSON.parse(fs.readFileSync(siteDataPath, "utf8"));
  const issues = [];
  let paired = 0;

  for (const siteMatch of siteData.matches) {
    const match = providerMatches.find(
      (candidate) =>
        teamKey(candidate.home) === teamKey(siteMatch.home) &&
        teamKey(candidate.away) === teamKey(siteMatch.away)
    );
    const label = `${siteMatch.home} vs ${siteMatch.away}`;

    if (!match) {
      issues.push({ match: label, issue: "Missing from API-Football" });
      continue;
    }

    paired += 1;
    const kickoffDifference = Math.abs(
      new Date(match.kickoff).getTime() - new Date(siteMatch.kickoff).getTime()
    );
    if (kickoffDifference > 5 * 60 * 1000) {
      issues.push({
        match: label,
        issue: `Kickoff differs: API ${match.kickoff}, site ${siteMatch.kickoff}`
      });
    }

    if (
      siteMatch.status === "FINISHED" &&
      match.finished &&
      (match.homeScore !== siteMatch.home_score || match.awayScore !== siteMatch.away_score)
    ) {
      issues.push({
        match: label,
        issue: `Score differs: API ${match.homeScore}-${match.awayScore}, site ${siteMatch.home_score}-${siteMatch.away_score}`
      });
    }
  }

  const ready = paired === siteData.matches.length && issues.length === 0;
  const summary = [
    "# API-Football validation",
    "",
    `- League: ${leagueItem.league.name} (ID ${leagueItem.league.id})`,
    `- API season: ${targetSeason}`,
    `- API fixtures returned: ${providerMatches.length}`,
    `- Current site fixtures: ${siteData.matches.length}`,
    `- Paired fixtures: ${paired}`,
    `- Validation issues: ${issues.length}`,
    `- Safe to integrate: **${ready ? "YES" : "NO"}**`,
    "",
    "## Differences",
    "",
    markdownTable(issues)
  ].join("\n");

  writeSummary(summary);
  if (!ready) process.exitCode = 1;
}

main().catch((error) => {
  writeSummary(`# API-Football validation\n\n**Test failed:** ${error.message}`);
  process.exitCode = 1;
});
