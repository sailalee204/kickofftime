const fs = require("fs");
const path = require("path");
const https = require("https");

const token = process.env.FOOTBALL_DATA_TOKEN;
if (!token) {
  throw new Error("FOOTBALL_DATA_TOKEN is required.");
}

const outputPath = path.join(__dirname, "..", "data", "champions-league.json");
const targetSeason = "2026";
const competitionEndpoint = "https://api.football-data.org/v4/competitions/CL/matches";
const seasonEndpoint = `${competitionEndpoint}?season=${targetSeason}`;

const TEAM_IDENTITIES = [
  ["Aarhus", ["AGF Aarhus", "Aarhus GF"]],
  ["Ararat-Armenia", ["FC Ararat-Armenia"]],
  ["Celje", ["NK Celje"]],
  ["Crvena Zvezda", ["FK Crvena Zvezda", "Red Star Belgrade"]],
  ["Egnatia", ["KF Egnatia"]],
  ["Fenerbahçe", ["Fenerbahce", "Fenerbahce Istanbul", "Fenerbahçe SK"]],
  ["GNK Dinamo", ["Dinamo Zagreb", "GNK Dinamo Zagreb"]],
  ["Górnik Zabrze", ["Gornik Zabrze"]],
  ["Hapoel Beer-Sheva", ["Hapoel Be'er Sheva", "Hapoel Beer Sheva"]],
  ["Hearts", ["Heart of Midlothian", "Heart of Midlothian FC"]],
  ["Iberia Tbilisi", ["FC Iberia 1999", "FC Iberia 1999 Tbilisi"]],
  ["Kairat Almaty", ["FC Kairat", "Kairat"]],
  ["Kauno Žalgiris", ["FK Kauno Zalgiris", "Kauno Zalgiris"]],
  ["Klaksvík", ["KI Klaksvik", "KÍ Klaksvík", "Klaksvik"]],
  ["KuPS Kuopio", ["KuPS", "Kuopion Palloseura"]],
  ["Larne", ["Larne FC"]],
  ["Lech Poznań", ["Lech Poznan"]],
  ["Levski Sofia", ["PFC Levski Sofia"]],
  ["Lincoln Red Imps", ["Lincoln Red Imps FC"]],
  ["Mjällby", ["Mjallby", "Mjällby AIF"]],
  ["Omonia", ["AC Omonia", "Omonia Nicosia"]],
  ["Sabah", ["Sabah FC", "Sabah FK"]],
  ["Shamrock Rovers", ["Shamrock Rovers FC"]],
  ["Slovan Bratislava", ["SK Slovan Bratislava", "ŠK Slovan Bratislava"]],
  ["Sturm Graz", ["SK Sturm Graz"]],
  ["Thun", ["FC Thun"]],
  ["Universitatea Craiova", ["CS Universitatea Craiova"]],
  ["Víkingur Reykjavík", ["Vikingur Reykjavik", "Víkingur Reykjavik"]]
];

function teamKey(name) {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const TEAM_NAME_LOOKUP = new Map();
for (const [canonical, aliases] of TEAM_IDENTITIES) {
  TEAM_NAME_LOOKUP.set(teamKey(canonical), canonical);
  for (const alias of aliases) TEAM_NAME_LOOKUP.set(teamKey(alias), canonical);
}

function canonicalTeamName(name) {
  return TEAM_NAME_LOOKUP.get(teamKey(name)) || name;
}

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
          const error = new Error(`Football data request failed with status ${response.statusCode}.`);
          error.statusCode = response.statusCode;
          reject(error);
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

function responseSeason(response) {
  if (response.filters && response.filters.season) {
    return String(response.filters.season);
  }

  const matchWithSeason = Array.isArray(response.matches)
    ? response.matches.find((match) => match.season && match.season.startDate)
    : null;
  return matchWithSeason ? String(matchWithSeason.season.startDate).slice(0, 4) : "";
}

async function fetchTargetSeason() {
  try {
    return await requestJson(seasonEndpoint);
  } catch (error) {
    if (error.statusCode !== 404) throw error;

    console.warn(
      `football-data.org does not currently expose Champions League season ${targetSeason}; checking its current season.`
    );
    const currentResponse = await requestJson(competitionEndpoint);
    const currentSeason = responseSeason(currentResponse);

    if (currentSeason !== targetSeason) {
      console.warn(
        `football-data.org currently reports Champions League season ${currentSeason || "unknown"}. ` +
        `Keeping the existing verified ${targetSeason}/27 schedule.`
      );
      return null;
    }

    return currentResponse;
  }
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
  const homeName = match.homeTeam && (match.homeTeam.shortName || match.homeTeam.name);
  const awayName = match.awayTeam && (match.awayTeam.shortName || match.awayTeam.name);
  const home = homeName && canonicalTeamName(homeName);
  const away = awayName && canonicalTeamName(awayName);
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
  const response = await fetchTargetSeason();
  if (!response) return;

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
