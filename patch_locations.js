const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const locationDict = `
const locationTranslations = {
  "zh": {
    "Estadio Azteca, Mexico City": "阿兹特克体育场, 墨西哥城",
    "Estadio Akron, Guadalajara": "阿克伦体育场, 瓜达拉哈拉",
    "Estadio BBVA, Monterrey": "BBVA体育场, 蒙特雷",
    "BMO Field, Toronto": "BMO球场, 多伦多",
    "BC Place, Vancouver": "不列颠哥伦比亚体育场, 温哥华",
    "SoFi Stadium, Los Angeles": "SoFi体育场, 洛杉矶",
    "Levi's Stadium, San Francisco Bay Area": "李维斯体育场, 旧金山湾区",
    "MetLife Stadium, New York/New Jersey": "大都会人寿体育场, 纽约/新泽西",
    "Gillette Stadium, Boston": "吉列体育场, 波士顿",
    "NRG Stadium, Houston": "NRG体育场, 休斯敦",
    "AT&T Stadium, Dallas": "AT&T体育场, 达拉斯",
    "Lincoln Financial Field, Philadelphia": "林肯金融球场, 费城",
    "Mercedes-Benz Stadium, Atlanta": "梅赛德斯-奔驰体育场, 亚特兰大",
    "Lumen Field, Seattle": "流明球场, 西雅图",
    "Hard Rock Stadium, Miami": "硬石体育场, 迈阿密",
    "GEHA Field at Arrowhead Stadium, Kansas City": "箭头体育场, 堪萨斯城",
    "America": "美洲", "Europe": "欧洲", "Asia": "亚洲", "Australia": "大洋洲", "Pacific": "太平洋",
    "New York": "纽约", "Chicago": "芝加哥", "Denver": "丹佛", "Los Angeles": "洛杉矶", "Mexico City": "墨西哥城",
    "Vancouver": "温哥华", "Toronto": "多伦多", "Bogota": "波哥大", "Sao Paulo": "圣保罗", "Argentina": "阿根廷", "Buenos Aires": "布宜诺斯艾利斯",
    "London": "伦敦", "Paris": "巴黎", "Madrid": "马德里", "Berlin": "柏林", "Moscow": "莫斯科",
    "Riyadh": "利雅得", "Dubai": "迪拜", "Kolkata": "加尔各答", "Shanghai": "上海", "Tokyo": "东京", "Seoul": "首尔",
    "Sydney": "悉尼", "Auckland": "奥克兰", "UTC": "协调世界时 (UTC)"
  },
  "es": {
    "Estadio Azteca, Mexico City": "Estadio Azteca, Ciudad de México",
    "SoFi Stadium, Los Angeles": "SoFi Stadium, Los Ángeles",
    "Levi's Stadium, San Francisco Bay Area": "Levi's Stadium, Área de la Bahía de SF",
    "MetLife Stadium, New York/New Jersey": "MetLife Stadium, Nueva York/NJ",
    "Lincoln Financial Field, Philadelphia": "Lincoln Financial Field, Filadelfia",
    "America": "América", "Europe": "Europa", "Asia": "Asia", "Australia": "Australia", "Pacific": "Pacífico",
    "New York": "Nueva York", "Los Angeles": "Los Ángeles", "Mexico City": "Ciudad de México", "Sao Paulo": "São Paulo",
    "London": "Londres", "Paris": "París", "Berlin": "Berlín", "Moscow": "Moscú", "Tokyo": "Tokio", "Seoul": "Seúl", "Sydney": "Sídney", "UTC": "Tiempo Universal Coordinado (UTC)"
  },
  "pt": {
    "Estadio Azteca, Mexico City": "Estádio Azteca, Cidade do México",
    "SoFi Stadium, Los Angeles": "SoFi Stadium, Los Angeles",
    "Levi's Stadium, San Francisco Bay Area": "Levi's Stadium, Área da Baía de SF",
    "MetLife Stadium, New York/New Jersey": "MetLife Stadium, Nova York/NJ",
    "Lincoln Financial Field, Philadelphia": "Lincoln Financial Field, Filadélfia",
    "America": "América", "Europe": "Europa", "Asia": "Ásia", "Australia": "Austrália", "Pacific": "Pacífico",
    "New York": "Nova York", "Mexico City": "Cidade do México", "Sao Paulo": "São Paulo", "London": "Londres", "Paris": "Paris", "Berlin": "Berlim", "Moscow": "Moscou", "Tokyo": "Tóquio", "Seoul": "Seul", "Sydney": "Sydney", "UTC": "Tempo Universal Coordenado (UTC)"
  },
  "fr": {
    "Estadio Azteca, Mexico City": "Stade Azteca, Mexico",
    "Lincoln Financial Field, Philadelphia": "Lincoln Financial Field, Philadelphie",
    "America": "Amérique", "Europe": "Europe", "Asia": "Asie", "Australia": "Australie", "Pacific": "Pacifique",
    "New York": "New York", "Mexico City": "Mexico", "Sao Paulo": "São Paulo", "London": "Londres", "Paris": "Paris", "Berlin": "Berlin", "Moscow": "Moscou", "Tokyo": "Tokyo", "Seoul": "Séoul", "UTC": "Temps Universel Coordonné (UTC)"
  },
  "ar": {
    "Estadio Azteca, Mexico City": "ملعب أزتيكا، مكسيكو سيتي",
    "Estadio Akron, Guadalajara": "ملعب أكرون، غوادالاخارا",
    "Estadio BBVA, Monterrey": "ملعب بي بي في إيه، مونتيري",
    "BMO Field, Toronto": "بي إم أو فيلد، تورونتو",
    "BC Place, Vancouver": "بي سي بليس، فانكوفر",
    "SoFi Stadium, Los Angeles": "ملعب صوفي، لوس أنجلوس",
    "Levi's Stadium, San Francisco Bay Area": "ملعب ليفي، منطقة خليج سان فرانسيسكو",
    "MetLife Stadium, New York/New Jersey": "ملعب ميتلايف، نيويورك/نيوجيرسي",
    "Gillette Stadium, Boston": "ملعب جيليت، بوسطن",
    "NRG Stadium, Houston": "ملعب إن آر جي، هيوستن",
    "AT&T Stadium, Dallas": "ملعب إيه تي آند تي، دالاس",
    "Lincoln Financial Field, Philadelphia": "لينكولن فاينانشال فيلد، فيلادلفيا",
    "Mercedes-Benz Stadium, Atlanta": "ملعب مرسيدس بنز، أتلانتا",
    "Lumen Field, Seattle": "لوماين فيلد، سياتل",
    "Hard Rock Stadium, Miami": "ملعب هارد روك، ميامي",
    "GEHA Field at Arrowhead Stadium, Kansas City": "ملعب أروهيد، كانساس سيتي",
    "America": "أمريكا", "Europe": "أوروبا", "Asia": "آسيا", "Australia": "أستراليا", "Pacific": "المحيط الهادئ",
    "New York": "نيويورك", "Chicago": "شيكاغو", "Denver": "دنفر", "Los Angeles": "لوس أنجلوس", "Mexico City": "مكسيكو سيتي",
    "Vancouver": "فانكوفر", "Toronto": "تورونتو", "Bogota": "بوغوتا", "Sao Paulo": "ساو باولو", "Argentina": "الأرجنتين", "Buenos Aires": "بوينس آيرس",
    "London": "لندن", "Paris": "باريس", "Madrid": "مدريد", "Berlin": "برلين", "Moscow": "موسكو",
    "Riyadh": "الرياض", "Dubai": "دبي", "Kolkata": "كلكتا", "Shanghai": "شنغهاي", "Tokyo": "طوكيو", "Seoul": "سيول",
    "Sydney": "سيدني", "Auckland": "أوكلاند", "UTC": "توقيت عالمي منسق (UTC)"
  }
};

function getLocString(str) {
    if (!str) return "";
    if (currentLang === "en") return str.replace(/_/g, " ");
    const dict = locationTranslations[currentLang];
    if (!dict) return str.replace(/_/g, " ");
    
    // Direct match (for venues)
    if (dict[str]) return dict[str];
    
    // Sub-string replacement for timezones
    let res = str.replace(/_/g, " ");
    // Replace America/New_York -> America / New York first
    res = res.replace(/\\//g, " / ");
    
    // Replace each known part
    for (const [en, tr] of Object.entries(dict)) {
        res = res.replace(new RegExp(\`\\\\b\${en}\\\\b\`, 'g'), tr);
    }
    return res;
}
`;

// Insert after getTeamName
code = code.replace(/function getTeamName\([^)]*\)\s*\{[^}]*\n\}/, match => match + "\n\n" + locationDict);

// Replace populate timezone dropdown to use getLocString and make it callable from updateLanguage
const populateRegex = /\/\/ Populate Timezone Dropdown[\s\S]*?(?=\/\/ Theme Toggle Logic)/;
const newPopulate = `// Populate Timezone Dropdown
const tzSelect = document.getElementById("timezoneSelect");
function renderTimezoneOptions() {
    tzSelect.innerHTML = "";
    majorTimezones.forEach(tz => {
        const opt = document.createElement("option");
        opt.value = tz;
        opt.textContent = getLocString(tz);
        if (tz === currentTimezone) {
            opt.selected = true;
        }
        tzSelect.appendChild(opt);
    });
}
renderTimezoneOptions();

`;
code = code.replace(populateRegex, newPopulate);

// Update updateLanguage to call renderTimezoneOptions
code = code.replace('const t = i18n[currentLang];', 'const t = i18n[currentLang];\n    renderTimezoneOptions();');

// Replace match.venue with getLocString(match.venue) in renderMatches
code = code.replace(/📍 \$\{match\.venue\}/g, '📍 ${getLocString(match.venue)}');
code = code.replace(/📅 \$\{match\.venue\}/g, '📅 ${getLocString(match.venue)}');
code = code.replace(/Venue: \$\{match\.venue\}/g, 'Venue: ${getLocString(match.venue)}');

fs.writeFileSync('app.js', code);
console.log("Done");
