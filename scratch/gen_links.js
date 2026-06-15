const fs = require('fs');
const matchesText = fs.readFileSync('matches.js', 'utf-8');
let matches = [];
eval(matchesText.replace('const matches =', 'matches ='));

const uniqueTeams = new Set();
matches.forEach(m => {
    if (!m.team1.match(/^[1-4W]/) && !m.team1.includes('Winner')) uniqueTeams.add(m.team1);
    if (!m.team2.match(/^[1-4W]/) && !m.team2.includes('Winner')) uniqueTeams.add(m.team2);
});

const toSlug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const links = Array.from(uniqueTeams).sort().map(t => `<a href="/team/${toSlug(t)}">${t}</a>`).join(' | ');

const html = `
    <!-- SEO Internal Links -->
    <div class="seo-footer-links" style="font-size: 0.75rem; color: #666; text-align: center; max-width: 1000px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6;">
        <p style="margin-bottom: 0.5rem; color: #888;">Team Schedules:</p>
        ${links}
    </div>
`;

fs.writeFileSync('scratch/footer_links.txt', html);
console.log('Done');
