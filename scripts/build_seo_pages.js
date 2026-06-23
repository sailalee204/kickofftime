const fs = require('fs');
const path = require('path');

// 1. Read matches.js
const matchesText = fs.readFileSync(path.join(__dirname, '../matches.js'), 'utf-8');
let matches = [];
eval(matchesText.replace('const matches =', 'matches ='));

// 2. Read index.html as template
let template = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf-8');

// Ensure directories exist
const matchDir = path.join(__dirname, '../match');
const teamDir = path.join(__dirname, '../team');
const countryDir = path.join(__dirname, '../time-in');
if (!fs.existsSync(matchDir)) fs.mkdirSync(matchDir);
if (!fs.existsSync(teamDir)) fs.mkdirSync(teamDir);
if (!fs.existsSync(countryDir)) fs.mkdirSync(countryDir);

// Helper to format team names for URLs
function toSlug(text) {
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

let generatedMatchCount = 0;
let sitemapUrls = [];
const todayStr = new Date().toISOString().split('T')[0];

function addToSitemap(url, priority) {
    sitemapUrls.push(`  <url>\n    <loc>${url}</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${priority}</priority>\n  </url>`);
}

// Generate Match Pages
matches.forEach((match, index) => {
    const t1 = match.team1;
    const t2 = match.team2;
    const slug = toSlug(`${t1}-vs-${t2}`);
    const finalSlug = index > 47 && slug.includes('winner') ? `${slug}-${index}` : slug;
    
    const title = `${t1} vs ${t2} Kickoff Time - World Cup 2026 | KickoffTracker`;
    const description = `Find out the exact local kickoff time for the FIFA World Cup 2026 match between ${t1} and ${t2} at ${match.venue}. Converts to your local timezone automatically.`;
    const url = `https://kickofftracker.com/match/${finalSlug}`;
    
    addToSitemap(url, '0.8');

    let pageHTML = template;
    
    // Replace Absolute Paths for CSS/JS since we are in a subfolder
    pageHTML = pageHTML.replace(/href="style\.css(\?v=\d+)?"/g, 'href="/style.css$1"');
    pageHTML = pageHTML.replace(/src="matches\.js(\?v=\d+)?"/g, 'src="/matches.js$1"');
    pageHTML = pageHTML.replace(/src="patch_locations\.js(\?v=\d+)?"/g, 'src="/patch_locations.js$1"');
    pageHTML = pageHTML.replace(/src="app\.js(\?v=\d+)?"/g, 'src="/app.js$1"');
    pageHTML = pageHTML.replace(/href="apple-touch-icon\.png"/g, 'href="/apple-touch-icon.png"');
    pageHTML = pageHTML.replace(/href="favicon-/g, 'href="/favicon-');
    pageHTML = pageHTML.replace(/wc_out\.json/g, '/wc_out.json');
    
    // Replace Meta Tags
    pageHTML = pageHTML.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    pageHTML = pageHTML.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
    pageHTML = pageHTML.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
    
    pageHTML = pageHTML.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`);
    pageHTML = pageHTML.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`);
    pageHTML = pageHTML.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
    
    pageHTML = pageHTML.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${title}">`);
    pageHTML = pageHTML.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${description}">`);

    // Inject Initial Search to automatically filter in app.js
    const initScript = `<script>window.INITIAL_SEARCH = "${t1}"; window.INITIAL_SEARCH_2 = "${t2}"; window.INITIAL_TAB = "all";</script>`;
    pageHTML = pageHTML.replace('</head>', `    ${initScript}\n</head>`);

    fs.writeFileSync(path.join(matchDir, `${finalSlug}.html`), pageHTML);
    generatedMatchCount++;
});

// Generate Team Pages
const uniqueTeams = new Set();
matches.forEach(m => {
    if (!m.team1.match(/^[1-4W]/) && !m.team1.includes('Winner') && !m.team1.includes('Runner')) uniqueTeams.add(m.team1);
    if (!m.team2.match(/^[1-4W]/) && !m.team2.includes('Winner') && !m.team2.includes('Runner')) uniqueTeams.add(m.team2);
});

let generatedTeamCount = 0;
uniqueTeams.forEach(team => {
    const slug = toSlug(team);
    const title = `${team} Match Schedule & Kickoff Times - World Cup 2026`;
    const description = `View the full FIFA World Cup 2026 match schedule and local kickoff times for ${team}. Automatically converts to your timezone.`;
    const url = `https://kickofftracker.com/team/${slug}`;
    
    addToSitemap(url, '0.9');

    let pageHTML = template;
    
    pageHTML = pageHTML.replace(/href="style\.css(\?v=\d+)?"/g, 'href="/style.css$1"');
    pageHTML = pageHTML.replace(/src="matches\.js(\?v=\d+)?"/g, 'src="/matches.js$1"');
    pageHTML = pageHTML.replace(/src="patch_locations\.js(\?v=\d+)?"/g, 'src="/patch_locations.js$1"');
    pageHTML = pageHTML.replace(/src="app\.js(\?v=\d+)?"/g, 'src="/app.js$1"');
    pageHTML = pageHTML.replace(/href="apple-touch-icon\.png"/g, 'href="/apple-touch-icon.png"');
    pageHTML = pageHTML.replace(/href="favicon-/g, 'href="/favicon-');
    pageHTML = pageHTML.replace(/wc_out\.json/g, '/wc_out.json');
    
    pageHTML = pageHTML.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    pageHTML = pageHTML.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
    pageHTML = pageHTML.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
    pageHTML = pageHTML.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`);
    pageHTML = pageHTML.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`);
    pageHTML = pageHTML.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);

    const initScript = `<script>window.INITIAL_SEARCH = "${team}"; window.INITIAL_TAB = "all";</script>`;
    pageHTML = pageHTML.replace('</head>', `    ${initScript}\n</head>`);

    fs.writeFileSync(path.join(teamDir, `${slug}.html`), pageHTML);
    generatedTeamCount++;
});

// Generate Country/Timezone Pages (pSEO for geo-searches)
const targetCountries = [
    "Australia", "United Kingdom", "China", "India", "Philippines", "South Africa", 
    "Nigeria", "Malaysia", "Singapore", "New Zealand", "Ireland", "UAE", "Saudi Arabia", 
    "Qatar", "Japan", "South Korea", "Germany", "France", "Spain", "Italy", "Brazil", 
    "Argentina", "Colombia", "Peru", "Chile", "Vietnam", "Thailand", "Indonesia",
    "Egypt", "Morocco", "Senegal", "Ghana", "Kenya", "Pakistan", "Bangladesh",
    "Taiwan", "Hong Kong", "Mexico", "USA", "Canada"
];

let generatedCountryCount = 0;
targetCountries.forEach(country => {
    const slug = toSlug(country);
    const title = `What Time is the World Cup 2026 in ${country}? | KickoffTime`;
    const description = `Find out exactly what time every FIFA World Cup 2026 match kicks off in ${country}. Automatically converts the entire tournament schedule to your local timezone.`;
    const url = `https://kickofftracker.com/time-in/${slug}`;
    
    addToSitemap(url, '0.9');

    let pageHTML = template;
    
    pageHTML = pageHTML.replace(/href="style\.css(\?v=\d+)?"/g, 'href="/style.css$1"');
    pageHTML = pageHTML.replace(/src="matches\.js(\?v=\d+)?"/g, 'src="/matches.js$1"');
    pageHTML = pageHTML.replace(/src="patch_locations\.js(\?v=\d+)?"/g, 'src="/patch_locations.js$1"');
    pageHTML = pageHTML.replace(/src="app\.js(\?v=\d+)?"/g, 'src="/app.js$1"');
    pageHTML = pageHTML.replace(/href="apple-touch-icon\.png"/g, 'href="/apple-touch-icon.png"');
    pageHTML = pageHTML.replace(/href="favicon-/g, 'href="/favicon-');
    pageHTML = pageHTML.replace(/wc_out\.json/g, '/wc_out.json');
    
    pageHTML = pageHTML.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    pageHTML = pageHTML.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
    pageHTML = pageHTML.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
    pageHTML = pageHTML.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`);
    pageHTML = pageHTML.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`);
    pageHTML = pageHTML.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);

    // No initial search filter for country pages, show all matches
    const initScript = `<script>window.INITIAL_TAB = "all";</script>`;
    pageHTML = pageHTML.replace('</head>', `    ${initScript}\n</head>`);

    fs.writeFileSync(path.join(countryDir, `${slug}.html`), pageHTML);
    generatedCountryCount++;
});


// Update sitemap.xml
let sitemapText = fs.readFileSync(path.join(__dirname, '../sitemap.xml'), 'utf-8');
// remove the closing tag
sitemapText = sitemapText.replace('</urlset>', '');
// inject new urls
sitemapText += sitemapUrls.join('\n') + '\n</urlset>';
fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), sitemapText);

console.log(`Generated ${generatedMatchCount} match pages, ${generatedTeamCount} team pages, ${generatedCountryCount} country pages, and updated sitemap.xml!`);
