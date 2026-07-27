const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const legacyDirectories = ["match", "team", "time-in"];
let updated = 0;

for (const directory of legacyDirectories) {
  const fullDirectory = path.join(root, directory);
  if (!fs.existsSync(fullDirectory)) continue;

  for (const filename of fs.readdirSync(fullDirectory)) {
    if (!filename.endsWith(".html")) continue;
    const filePath = path.join(fullDirectory, filename);
    let html = fs.readFileSync(filePath, "utf8");
    const originalHtml = html;

    if (!html.includes('content="0; url=/world-cup-2026.html"')) {
      const archiveMeta = [
        '    <meta name="robots" content="noindex, follow">',
        '    <meta http-equiv="refresh" content="0; url=/world-cup-2026.html">',
        '    <link rel="canonical" href="https://kickofftracker.com/world-cup-2026.html">'
      ].join("\n");

      html = html
        .replace(/<link rel="canonical" href="[^"]*">\s*/i, "")
        .replace("</head>", `${archiveMeta}\n</head>`);
    }

    html = `${html.trimEnd()}\n`;
    if (html !== originalHtml) {
      fs.writeFileSync(filePath, html, "utf8");
      updated += 1;
    }
  }
}

console.log(`Archived ${updated} legacy World Cup pages.`);
