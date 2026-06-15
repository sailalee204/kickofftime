const fs = require('fs');

const API_TOKEN = "32c68282e7e948139b35e1b2aff0f7de";
const API_BASE = "https://api.football-data.org/v4";

async function test() {
    const response = await fetch(`${API_BASE}/competitions/WC/matches`, {
        headers: { "X-Auth-Token": API_TOKEN }
    });
    const data = await response.json();
    
    let txt = fs.readFileSync('matches.js', 'utf8');
    eval(txt.replace('const matches =', 'global.matches ='));
    
    const apiNameMap = {
        "Korea Republic": "South Korea",
        "Czechia": "Czech Republic",
        "Bosnia and Herzegovina": "Bosnia & Herzegovina",
        "Bosnia-Herzegovina": "Bosnia & Herzegovina",
        "Cape Verde Islands": "Cape Verde",
        "IR Iran": "Iran",
        "Congo DR": "DR Congo",
        "Côte d'Ivoire": "Ivory Coast",
        "United States": "USA",
        "Türkiye": "Turkey",
        "Curaçao": "Curaçao"
    };
    
    data.matches.forEach(apiMatch => {
        const apiHome = apiNameMap[apiMatch.homeTeam.name] || apiMatch.homeTeam.name;
        const apiAway = apiNameMap[apiMatch.awayTeam.name] || apiMatch.awayTeam.name;
        const apiDate = apiMatch.utcDate;
        
        const idx = global.matches.findIndex(m => {
            const apiTime = new Date(apiDate).getTime();
            const mTime = new Date(m.time_utc).getTime();
            const within36Hours = Math.abs(mTime - apiTime) < 36 * 60 * 60 * 1000;
            const sameTeams = (m.team1 === apiHome && m.team2 === apiAway) ||
                              (m.team1 === apiHome || m.team2 === apiAway);
            return within36Hours && sameTeams;
        });
        
        if (idx !== -1) {
            console.log(`MAPPED: API(${apiHome} vs ${apiAway}) -> matches.js[${idx}](${global.matches[idx].team1} vs ${global.matches[idx].team2})`);
        } else {
            console.log(`FAILED TO MAP: API(${apiHome} vs ${apiAway}) at ${apiDate}`);
        }
    });
}
test();
