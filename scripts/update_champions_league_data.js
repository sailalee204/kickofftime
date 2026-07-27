const fs = require("fs");
const path = require("path");
const https = require("https");

const token = process.env.FOOTBALL_DATA_TOKEN;
if (!token) {
  throw new Error("FOOTBALL_DATA_TOKEN is required.");
}

const outputPath = path.join(__dirname, "..", "data", "champions-league.json");
const endpoint = "https://api.football-data.org/v4/competitions/CL/matches?season=2026";

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        "X-Auth-Token": token,
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
          reject(new Error(`Football data request failed with status ${response.statusCode}.`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error("Football data response was not valid JSON."));
        }
      });
    });
    request.setTimeout(20000, () => request.destroy(new Error("Football data request timed out.")));
    request.on("error", reject);
  });
}

function stageLabel(stage) {
  if (!stage) return "Champions League";
  const knownStages = {
    QUALIFICATION: "Qualifying",
    PLAYOFFS: "Play-offs",
    LEAGUE_STAGE: "League phase",
    LAST_16: "Round of 16",
    QUARTER_FINALS: "Quarter-finals",
    SEMI_FINALS: "Semi-finals",
    FINAL: "Final"
  };
  return knownStages[stage] || stage.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeMatch(match) {
  const home = match.homeTeam && match.homeTeam.name;
  const away = match.awayTeam && match.awayTeam.name;
  if (!match.id || !match.utcDate || !home || !away) return null;

  const normalized = {
    id: `fd-${match.id}`,
    stage: stageLabel(match.stage),
    kickoff: match.utcDate,
    home,
    away,
    status: match.status === "FINISHED" ? "FINISHED" : "SCHEDULED"
  };

  if (normalized.status === "FINISHED") {
    const score = match.score && match.score.fullTime;
    if (!Number.isInteger(score && score.home) || !Number.isInteger(score && score.away)) return null;
    normalized.home_score = score.home;
    normalized.away_score = score.away;
  }

  return normalized;
}

async function main() {
  const response = await requestJson(endpoint);
  if (!Array.isArray(response.matches)) {
    throw new Error("Football data response did not contain a matches array.");
  }

  const matches = response.matches
    .map(normalizeMatch)
    .filter(Boolean)
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));

  if (matches.length < 10) {
    throw new Error(`Rejected suspicious schedule update containing only ${matches.length} valid matches.`);
  }

  const nextData = {
    competition: "UEFA Champions League",
    season: "2026/27",
    updated_at: new Date().toISOString(),
    source_name: "football-data.org",
    source_url: "https://www.football-data.org/",
    official_reference: "https://www.uefa.com/uefachampionsleague/",
    matches
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(nextData, null, 2)}\n`, "utf8");
  console.log(`Saved ${matches.length} validated Champions League matches.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
