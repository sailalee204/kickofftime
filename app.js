// =============================================
// API Configuration
// =============================================
const API_TOKEN = "32c68282e7e948139b35e1b2aff0f7de";
const API_BASE = "https://api.football-data.org/v4";

// API team name → our internal team name
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

// Live data cache: key = UTC date string, value = API match object
let liveMatchData = {}; // keyed by our match index
let apiLoaded = false;

// Parse knockout placeholder codes into human-readable text
function parseKnockoutCode(code) {
    if (!code) return code;
    // Already a real team name
    if (!/^[1-4][A-L]$|^W\d+$|^L\d+$|^3/.test(code)) return code;
    
    const tWinner = i18n[currentLang]?.winner || "Winner";
    const tMatch = i18n[currentLang]?.match || "Match";
    const tGroup = i18n[currentLang]?.group || "Group";
    const tRunnerUp = i18n[currentLang]?.runnerUp || "Runner-up";
    const tThirdPlace = i18n[currentLang]?.thirdPlace || "3rd Place";
    const tFourthPlace = i18n[currentLang]?.fourthPlace || "4th Place";
    const tThirdPlaceMatch = i18n[currentLang]?.thirdPlaceMatch || "3rd Place Match";

    if (code.startsWith("W")) {
        if (currentLang === "zh") return `第${code.slice(1)}场胜者`;
        return `${tWinner} ${tMatch} ${code.slice(1)}`;
    }
    if (code.startsWith("L")) return tThirdPlaceMatch;
    
    const pos = code[0];
    const grp = code[1];
    const labels = { "1": tWinner, "2": tRunnerUp, "3": tThirdPlace, "4": tFourthPlace };
    
    if (grp && grp.match(/[A-L]/)) {
        if (currentLang === "zh") return `${labels[pos] || pos} · ${grp}组`;
        return `${labels[pos] || pos} · ${tGroup} ${grp}`;
    }
    
    return code; // e.g. "3A/B/C/D/F" → show as-is
}

// =============================================
// Bilingual Translations Dictionary

const teamTranslations = {
  "zh": {
    "Mexico": "墨西哥", "South Africa": "南非", "South Korea": "韩国", "Czech Republic": "捷克",
    "Canada": "加拿大", "Bosnia & Herzegovina": "波黑", "USA": "美国", "Paraguay": "巴拉圭",
    "Qatar": "卡塔尔", "Switzerland": "瑞士", "Brazil": "巴西", "Morocco": "摩洛哥",
    "Haiti": "海地", "Scotland": "苏格兰", "Australia": "澳大利亚", "Turkey": "土耳其",
    "Germany": "德国", "Curaçao": "库拉索", "Netherlands": "荷兰", "Japan": "日本",
    "Ivory Coast": "科特迪瓦", "Ecuador": "厄瓜多尔", "Sweden": "瑞典", "Tunisia": "突尼斯",
    "Spain": "西班牙", "Cape Verde": "佛得角", "Belgium": "比利时", "Egypt": "埃及",
    "Saudi Arabia": "沙特阿拉伯", "Uruguay": "乌拉圭", "Iran": "伊朗", "New Zealand": "新西兰",
    "France": "法国", "Senegal": "塞内加尔", "Iraq": "伊拉克", "Norway": "挪威",
    "Argentina": "阿根廷", "Algeria": "阿尔及利亚", "Austria": "奥地利", "Jordan": "约旦",
    "Portugal": "葡萄牙", "DR Congo": "刚果（金）", "England": "英格兰", "Croatia": "克罗地亚",
    "Ghana": "加纳", "Panama": "巴拿马", "Uzbekistan": "乌兹别克斯坦", "Colombia": "哥伦比亚"
  },
  "es": {
    "Mexico": "México", "South Africa": "Sudáfrica", "South Korea": "Corea del Sur", "Czech Republic": "Chequia",
    "Canada": "Canadá", "Bosnia & Herzegovina": "Bosnia y Herzegovina", "USA": "Estados Unidos", "Paraguay": "Paraguay",
    "Qatar": "Catar", "Switzerland": "Suiza", "Brazil": "Brasil", "Morocco": "Marruecos",
    "Haiti": "Haití", "Scotland": "Escocia", "Australia": "Australia", "Turkey": "Turquía",
    "Germany": "Alemania", "Curaçao": "Curazao", "Netherlands": "Países Bajos", "Japan": "Japón",
    "Ivory Coast": "Costa de Marfil", "Ecuador": "Ecuador", "Sweden": "Suecia", "Tunisia": "Túnez",
    "Spain": "España", "Cape Verde": "Cabo Verde", "Belgium": "Bélgica", "Egypt": "Egipto",
    "Saudi Arabia": "Arabia Saudí", "Uruguay": "Uruguay", "Iran": "Irán", "New Zealand": "Nueva Zelanda",
    "France": "Francia", "Senegal": "Senegal", "Iraq": "Irak", "Norway": "Noruega",
    "Argentina": "Argentina", "Algeria": "Argelia", "Austria": "Austria", "Jordan": "Jordania",
    "Portugal": "Portugal", "DR Congo": "RD Congo", "England": "Inglaterra", "Croatia": "Croacia",
    "Ghana": "Ghana", "Panama": "Panamá", "Uzbekistan": "Uzbekistán", "Colombia": "Colombia"
  },
  "pt": {
    "Mexico": "México", "South Africa": "África do Sul", "South Korea": "Coreia do Sul", "Czech Republic": "Tchéquia",
    "Canada": "Canadá", "Bosnia & Herzegovina": "Bósnia e Herzegovina", "USA": "Estados Unidos", "Paraguay": "Paraguai",
    "Qatar": "Catar", "Switzerland": "Suíça", "Brazil": "Brasil", "Morocco": "Marrocos",
    "Haiti": "Haiti", "Scotland": "Escócia", "Australia": "Austrália", "Turkey": "Turquia",
    "Germany": "Alemanha", "Curaçao": "Curaçao", "Netherlands": "Países Baixos", "Japan": "Japão",
    "Ivory Coast": "Costa do Marfim", "Ecuador": "Equador", "Sweden": "Suécia", "Tunisia": "Tunísia",
    "Spain": "Espanha", "Cape Verde": "Cabo Verde", "Belgium": "Bélgica", "Egypt": "Egito",
    "Saudi Arabia": "Arábia Saudita", "Uruguay": "Uruguai", "Iran": "Irã", "New Zealand": "Nova Zelândia",
    "France": "França", "Senegal": "Senegal", "Iraq": "Iraque", "Norway": "Noruega",
    "Argentina": "Argentina", "Algeria": "Argélia", "Austria": "Áustria", "Jordan": "Jordânia",
    "Portugal": "Portugal", "DR Congo": "RD Congo", "England": "Inglaterra", "Croatia": "Croácia",
    "Ghana": "Gana", "Panama": "Panamá", "Uzbekistan": "Uzbequistão", "Colombia": "Colômbia"
  },
  "fr": {
    "Mexico": "Mexique", "South Africa": "Afrique du Sud", "South Korea": "Corée du Sud", "Czech Republic": "Tchéquie",
    "Canada": "Canada", "Bosnia & Herzegovina": "Bosnie-Herzégovine", "USA": "États-Unis", "Paraguay": "Paraguay",
    "Qatar": "Qatar", "Switzerland": "Suisse", "Brazil": "Brésil", "Morocco": "Maroc",
    "Haiti": "Haïti", "Scotland": "Écosse", "Australia": "Australie", "Turkey": "Turquie",
    "Germany": "Allemagne", "Curaçao": "Curaçao", "Netherlands": "Pays-Bas", "Japan": "Japon",
    "Ivory Coast": "Côte d’Ivoire", "Ecuador": "Équateur", "Sweden": "Suède", "Tunisia": "Tunisie",
    "Spain": "Espagne", "Cape Verde": "Cap-Vert", "Belgium": "Belgique", "Egypt": "Égypte",
    "Saudi Arabia": "Arabie saoudite", "Uruguay": "Uruguay", "Iran": "Iran", "New Zealand": "Nouvelle-Zélande",
    "France": "France", "Senegal": "Sénégal", "Iraq": "Irak", "Norway": "Norvège",
    "Argentina": "Argentine", "Algeria": "Algérie", "Austria": "Autriche", "Jordan": "Jordanie",
    "Portugal": "Portugal", "DR Congo": "RD Congo", "England": "Angleterre", "Croatia": "Croatie",
    "Ghana": "Ghana", "Panama": "Panama", "Uzbekistan": "Ouzbékistan", "Colombia": "Colombie"
  },
  "ar": {
    "Mexico": "المكسيك", "South Africa": "جنوب أفريقيا", "South Korea": "كوريا الجنوبية", "Czech Republic": "التشيك",
    "Canada": "كندا", "Bosnia & Herzegovina": "البوسنة والهرسك", "USA": "الولايات المتحدة", "Paraguay": "باراغواي",
    "Qatar": "قطر", "Switzerland": "سويسرا", "Brazil": "البرازيل", "Morocco": "المغرب",
    "Haiti": "هايتي", "Scotland": "اسكتلندا", "Australia": "أستراليا", "Turkey": "تركيا",
    "Germany": "ألمانيا", "Curaçao": "كوراساو", "Netherlands": "هولندا", "Japan": "اليابان",
    "Ivory Coast": "ساحل العاج", "Ecuador": "الإكوادور", "Sweden": "السويد", "Tunisia": "تونس",
    "Spain": "إسبانيا", "Cape Verde": "الرأس الأخضر", "Belgium": "بلجيكا", "Egypt": "مصر",
    "Saudi Arabia": "السعودية", "Uruguay": "أورغواي", "Iran": "إيران", "New Zealand": "نيوزيلندا",
    "France": "فرنسا", "Senegal": "السنغال", "Iraq": "العراق", "Norway": "النرويج",
    "Argentina": "الأرجنتين", "Algeria": "الجزائر", "Austria": "النمسا", "Jordan": "الأردن",
    "Portugal": "البرتغال", "DR Congo": "الكونغو", "England": "إنجلترا", "Croatia": "كرواتيا",
    "Ghana": "غانا", "Panama": "بنما", "Uzbekistan": "أوزبكستان", "Colombia": "كولومبيا"
  }
};

function getTeamName(englishName) {
    if (currentLang === "en") return englishName;
    if (teamTranslations[currentLang] && teamTranslations[currentLang][englishName]) {
        return teamTranslations[currentLang][englishName];
    }
    return englishName;
}

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


const shareI18n = {
    en: {
        shareMatch: "Share",
        shareCopyImg: "🖼️ Copy Image",
        shareSaveImg: "⬇️ Save Image",
        shareTwitter: "🐦 Share on X / Twitter",
        shareCopyLink: "🔗 Copy Link",
        shareCopyText: "📋 Copy Text",
        wc2026: "World Cup 2026",
        kickoff: "Kickoff",
        myKickoff: "My local kickoff",
        checkTime: "Check your local time",
        seeTime: "See your local time",
        seeAllMatches: "See all matches in your local time",
        yourTime: "Your local time",
        schedule: "Schedule",
        followTeam: "Follow {team} at the World Cup 2026!",
        fullSchedule: "Check their full match schedule in your local time"
    },
    zh: {
        shareMatch: "分享",
        shareCopyImg: "🖼️ 复制图片",
        shareSaveImg: "⬇️ 保存图片",
        shareTwitter: "🐦 分享到 X",
        shareCopyLink: "🔗 复制链接",
        shareCopyText: "📋 复制文本",
        wc2026: "2026世界杯",
        kickoff: "开赛时间",
        myKickoff: "本地开赛时间",
        checkTime: "查看本地时间",
        seeTime: "查看本地时间",
        seeAllMatches: "查看所有比赛的本地时间",
        yourTime: "您的本地时间",
        schedule: "赛程",
        followTeam: "在2026世界杯关注 {team}！",
        fullSchedule: "使用本地时间查看完整赛程"
    },
    es: {
        shareMatch: "Compartir",
        shareCopyImg: "🖼️ Copiar Imagen",
        shareSaveImg: "⬇️ Guardar Imagen",
        shareTwitter: "🐦 Compartir en X",
        shareCopyLink: "🔗 Copiar Enlace",
        shareCopyText: "📋 Copiar Texto",
        wc2026: "Mundial 2026",
        kickoff: "Inicio",
        myKickoff: "Mi hora de inicio",
        checkTime: "Consulta tu hora local",
        seeTime: "Ver tu hora local",
        seeAllMatches: "Ver todos los partidos en tu hora local",
        yourTime: "Tu hora local",
        schedule: "Calendario",
        followTeam: "¡Sigue a {team} en el Mundial 2026!",
        fullSchedule: "Consulta su calendario en tu hora local"
    },
    pt: {
        shareMatch: "Compartilhar",
        shareCopyImg: "🖼️ Copiar Imagem",
        shareSaveImg: "⬇️ Salvar Imagem",
        shareTwitter: "🐦 Compartilhar no X",
        shareCopyLink: "🔗 Copiar Link",
        shareCopyText: "📋 Copiar Texto",
        wc2026: "Copa do Mundo 2026",
        kickoff: "Início",
        myKickoff: "Meu início local",
        checkTime: "Verifique sua hora local",
        seeTime: "Veja sua hora local",
        seeAllMatches: "Veja todas as partidas na sua hora local",
        yourTime: "Sua hora local",
        schedule: "Calendário",
        followTeam: "Acompanhe {team} na Copa 2026!",
        fullSchedule: "Veja o calendário completo na sua hora local"
    },
    fr: {
        shareMatch: "Partager",
        shareCopyImg: "🖼️ Copier l'image",
        shareSaveImg: "⬇️ Enregistrer l'image",
        shareTwitter: "🐦 Partager sur X",
        shareCopyLink: "🔗 Copier le lien",
        shareCopyText: "📋 Copier le texte",
        wc2026: "Coupe du Monde 2026",
        kickoff: "Coup d'envoi",
        myKickoff: "Mon coup d'envoi local",
        checkTime: "Vérifiez votre heure locale",
        seeTime: "Voir votre heure locale",
        seeAllMatches: "Voir tous les matchs à votre heure locale",
        yourTime: "Votre heure locale",
        schedule: "Calendrier",
        followTeam: "Suivez {team} à la Coupe du Monde 2026 !",
        fullSchedule: "Consultez leur calendrier complet à votre heure locale"
    },
    ar: {
        shareMatch: "مشاركة",
        shareCopyImg: "🖼️ نسخ الصورة",
        shareSaveImg: "⬇️ حفظ الصورة",
        shareTwitter: "🐦 شارك على X",
        shareCopyLink: "🔗 نسخ الرابط",
        shareCopyText: "📋 نسخ النص",
        wc2026: "كأس العالم 2026",
        kickoff: "ركلة البداية",
        myKickoff: "وقت البداية المحلي",
        checkTime: "تحقق من وقتك المحلي",
        seeTime: "شاهد وقتك المحلي",
        seeAllMatches: "شاهد جميع المباريات بتوقيتك المحلي",
        yourTime: "وقتك المحلي",
        schedule: "جدول",
        followTeam: "تابع {team} في كأس العالم 2026!",
        fullSchedule: "تحقق من جدول مبارياتهم بتوقيتك المحلي"
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
    res = res.replace(/\//g, " / ");
    
    // Replace each known part
    for (const [en, tr] of Object.entries(dict)) {
        res = res.replace(new RegExp(`\\b${en}\\b`, 'g'), tr);
    }
    return res;
}

const i18n = {
    en: {
        title: "World Cup 2026 Timezone Converter",
        subtitle: "Convert all 104 matches of the FIFA World Cup 2026 to your local time. Never miss a kickoff.",
        tzLabel: "Your Timezone",
        searchPlaceholder: "Search by country, group, or stadium...",
        tabAll: "All Matches",
        tabGroup: "Group Stage",
        tabKnockout: "Knockout Stage",
        statsLabel: "Showing {count} of {total} matches",
        searchPlaceholder: "Search by country, group, or stadium...",
        emptyState: "No matches match your filter criteria.",
        addToCalendar: "Add to Cal",
        localTime: "Your Time",
        venueLabel: "Venue",
        todayTitle: "Today's Matches",
        nextMatch: "Next match in",
        liveNow: "LIVE",
        finished: "FT",
        btnDownloadAll: "📥 Download All 104 Matches",
        btnTeamCal: "⭐ Subscribe by Team",
        tzHelper: "Detected automatically. Adjust manually below if needed.",
        upcoming: "upcoming",
        finishedStats: "finished",
        faqTitle: "Frequently Asked Questions (FAQ)",
        subscribeTitle: "Coming Soon: Match Alerts 🚀",
        subscribeDesc: "Leave your email to be the first to know when this feature goes live.",
        subscribeBtn: "Join Waitlist",
        emailPlaceholder: "Enter your email address...",
        subSuccess: "🎉 Thanks for your interest! Email alerts are under active development. Stay tuned!",
        tournAlert: "Schedules for this tournament will be available closer to the event!",
        winner: "Winner",
        match: "Match",
        group: "Group",
        runnerUp: "Runner-up",
        thirdPlace: "3rd Place",
        fourthPlace: "4th Place",
        thirdPlaceMatch: "3rd Place Match",
        btnShare: "🎨 Share",
        matchEnded: "Match ended",
        shareTeamTitle: "Share Team Matches",
        optWc: "🏆 World Cup 2026",
        optPl: "⚽ Premier League 26/27 (Soon)",
        q1: "Will the matches automatically adjust to my local time?",
        a1: "Yes! The site detects your browser's local timezone automatically and translates every match kickoff to your exact local time.",
        q2: "Can I manually select a different timezone?",
        a2: "Absolutely. Use the timezone dropdown at the top to select any major city or UTC. Your choice will be saved for your next visit.",
        q3: "How do I add matches to my personal calendar?",
        a3: "Click the 'Add to Cal' button on any match card. It will download a standard .ics calendar file that you can import directly into Google Calendar, Apple Calendar, or Microsoft Outlook.",
        q4: "When does the FIFA World Cup 2026 start?",
        a4: "The opening match kicks off on Thursday, June 11, 2026 at the Estadio Azteca in Mexico City.",
        q5: "What time is the Argentina vs France match in UK time (BST)?",
        a5: "Most evening World Cup 2026 matches kick off at 19:00 UTC, which is 20:00 BST (British Summer Time, UTC+1). Select \"Europe/London\" from the timezone dropdown on this page to instantly see all 104 match times in UK local time.",
        q6: "What time does the World Cup 2026 play in India (IST)?",
        a6: "India Standard Time (IST) is UTC+5:30. A 19:00 UTC kickoff equals 00:30 IST the next day, and a 22:00 UTC match equals 03:30 IST. Select \"Asia/Kolkata\" from the timezone dropdown to see all World Cup 2026 match times in IST automatically.",
        q7: "What time do World Cup 2026 matches air in Australia (AEST/AEDT)?",
        a7: "Australia Eastern Standard Time (AEST) is UTC+10. A 19:00 UTC match equals 05:00 AEST the next morning. Select \"Australia/Sydney\" from the timezone dropdown to get all match times converted to Australian local time instantly.",
        q8: "What time are World Cup 2026 matches in China / CST (Beijing Time)?",
        a8: "China Standard Time (CST) is UTC+8. A 22:00 UTC kickoff equals 06:00 CST the next morning — which means many group stage evening matches will air in the early hours in China. Select \"Asia/Shanghai\" to see all 104 World Cup 2026 match times in Beijing/Shanghai local time.",
        q9: "Can I share a World Cup match time with my friends?",
        a9: "Yes! Click the '🎨 Share' button on any match card to open a share panel. You can download a beautiful card image showing the match details and your local time, then share it directly to WhatsApp, Telegram, Twitter/X, or any platform. You can also copy the link or the match text to send to friends.",
        q10: "How many teams are in the 2026 World Cup and who are the favorites?",
        a10: "For the first time, the 2026 World Cup features 48 teams across 12 groups (A–L). Tournament favorites include Brazil, France, Argentina (defending champions), England, Spain, Germany, Portugal, and the Netherlands. Host nations USA, Mexico, and Canada are also in the tournament. KickoffTime shows all their match schedules in your local time.",
        disclaimer: "Disclaimer: This website is an independent tool for fans and is not affiliated with, authorized, or endorsed by FIFA or the official World Cup organization. All product names, logos, and brands are property of their respective owners.",
        hostedIn: "Host Stadiums: USA, Canada, Mexico",
        groupStage: "Group Stage",
        knockoutStage: "Knockouts"
    },
    es: {
        title: "Conversor de Horarios Mundial 2026",
        subtitle: "Convierte los 104 partidos de la Copa Mundial de la FIFA 2026 a tu hora local. No te pierdas ningún saque inicial.",
        tzLabel: "Tu Zona Horaria",
        searchPlaceholder: "Buscar por país, grupo o estadio...",
        tabAll: "Todos los Partidos",
        tabGroup: "Fase de Grupos",
        tabKnockout: "Fase Eliminatoria",
        statsLabel: "Mostrando {count} de {total} partidos",
        searchPlaceholder: "Buscar por país, grupo o estadio...",
        emptyState: "No se encontraron partidos para este filtro.",
        addToCalendar: "Añadir a Cal",
        localTime: "Tu Hora",
        venueLabel: "Sede",
        todayTitle: "Partidos de Hoy",
        nextMatch: "Próximo partido en",
        liveNow: "EN VIVO",
        finished: "FIN",
        btnDownloadAll: "📥 Descargar los 104 Partidos",
        btnTeamCal: "⭐ Suscribirse por Equipo",
        tzHelper: "Detectado automáticamente. Ajusta manualmente a continuación si es necesario.",
        upcoming: "próximos",
        finishedStats: "terminados",
        faqTitle: "Preguntas Frecuentes (FAQ)",
        subscribeTitle: "Lista de Correo del Mundial 2026",
        subscribeDesc: "Únete a nuestra lista de espera para recibir actualizaciones y recordatorios del torneo.",
        subscribeBtn: "Unirse",
        emailPlaceholder: "Ingresa tu correo electrónico...",
        subSuccess: "¡Unido con éxito! Te mantendremos informado.",
        tournAlert: "¡Los horarios para este torneo estarán disponibles más cerca de la fecha!",
        winner: "Ganador",
        match: "Partido",
        group: "Grupo",
        runnerUp: "Subcampeón",
        thirdPlace: "3er Lugar",
        fourthPlace: "4to Lugar",
        thirdPlaceMatch: "Partido por el 3er Lugar",
        btnShare: "🎨 Compartir",
        matchEnded: "Partido finalizado",
        shareTeamTitle: "Compartir Partidos del Equipo",
        optWc: "🏆 Copa Mundial 2026",
        optPl: "⚽ Premier League 26/27 (Pronto)",
        q1: "¿Se ajustarán automáticamente los partidos a mi hora local?",
        a1: "¡Sí! El sitio detecta automáticamente la zona horaria de tu navegador y traduce cada inicio de partido a tu hora local exacta.",
        q2: "¿Puedo seleccionar manualmente una zona horaria diferente?",
        a2: "Totalmente. Utiliza el selector de zona horaria en la parte superior para seleccionar cualquier ciudad principal o UTC. Tu elección se guardará.",
        q3: "¿Cómo agrego partidos a mi calendario personal?",
        a3: "Haz clic en el botón 'Añadir a Cal' en cualquier tarjeta de partido. Descargará un archivo de calendario estándar .ics que puedes importar directamente en Google Calendar, Apple Calendar u Outlook.",
        q4: "¿Cuándo comienza la Copa Mundial de la FIFA 2026?",
        a4: "El partido inaugural se jugará el jueves 11 de junio de 2026 en el Estadio Azteca en la Ciudad de México.",
        q5: "¿A qué hora es el partido Argentina vs Francia en hora del Reino Unido (BST)?",
        a5: "La mayoría de los partidos vespertinos de la Copa Mundial 2026 comienzan a las 19:00 UTC, que son las 20:00 BST. Selecciona 'Europe/London' para ver al instante los partidos en hora local del Reino Unido.",
        q6: "¿A qué hora se juega la Copa Mundial 2026 en India (IST)?",
        a6: "La Hora Estándar de la India (IST) es UTC+5:30. Un inicio a las 19:00 UTC equivale a las 00:30 IST del día siguiente.",
        q7: "¿A qué hora se transmiten los partidos en Australia (AEST/AEDT)?",
        a7: "La Hora Estándar de Australia Oriental (AEST) es UTC+10. Un partido a las 19:00 UTC equivale a las 05:00 AEST de la mañana siguiente.",
        q8: "¿A qué hora son los partidos en China / CST (Hora de Beijing)?",
        a8: "La Hora Estándar de China (CST) es UTC+8. Un partido a las 22:00 UTC equivale a las 06:00 CST de la mañana siguiente.",
        q9: "¿Puedo compartir la hora de un partido con mis amigos?",
        a9: "¡Sí! Haz clic en el botón '🎨 Share' en cualquier tarjeta de partido para abrir el panel de compartir.",
        q10: "¿Cuántos equipos participan en el Mundial 2026 y quiénes son los favoritos?",
        a10: "El Mundial 2026 contará con 48 equipos en 12 grupos. Los favoritos incluyen a Brasil, Francia, Argentina, Inglaterra, España, Alemania, Portugal y Países Bajos.",
        disclaimer: "Descargo de responsabilidad: Este sitio web es una herramienta independiente para fanáticos y no está afiliado, autorizado ni respaldado por la FIFA ni la organización oficial del Mundial. Todos los nombres y logotipos son propiedad de sus respectivos dueños.",
        hostedIn: "Estadios Anfitriones: EE. UU., Canadá, México",
        groupStage: "Fase de Grupos",
        knockoutStage: "Eliminatorias"
    },
    pt: {
        title: "Conversor de Fuso Horário da Copa do Mundo 2026",
        subtitle: "Converta todas as 104 partidas da Copa do Mundo FIFA 2026 para o seu horário local. Nunca perca um jogo.",
        tzLabel: "Seu Fuso Horário",
        searchPlaceholder: "Pesquise por país, grupo ou estádio...",
        tabAll: "Todas as Partidas",
        tabGroup: "Fase de Grupos",
        tabKnockout: "Fase Eliminatória",
        statsLabel: "Mostrando {count} de {total} partidas",
        emptyState: "Nenhuma partida encontrada para este filtro.",
        addToCalendar: "Adicionar ao Cal",
        localTime: "Seu Horário",
        venueLabel: "Local",
        todayTitle: "Partidas de Hoje",
        nextMatch: "Próxima partida em",
        liveNow: "AO VIVO",
        finished: "FIM",
        btnDownloadAll: "📥 Baixar Todas as 104 Partidas",
        btnTeamCal: "⭐ Inscrever-se por Seleção",
        tzHelper: "Detectado automaticamente. Ajuste manualmente abaixo se necessário.",
        upcoming: "próximas",
        finishedStats: "encerradas",
        faqTitle: "Perguntas Frequentes (FAQ)",
        subscribeTitle: "Lista de E-mails da Copa 2026",
        subscribeDesc: "Participe da nossa lista de espera para receber atualizações importantes do calendário.",
        subscribeBtn: "Participar",
        emailPlaceholder: "Digite seu endereço de e-mail...",
        subSuccess: "Inscrito com sucesso!",
        tournAlert: "Os horários para este torneio estarão disponíveis em breve!",
        winner: "Vencedor",
        match: "Jogo",
        group: "Grupo",
        runnerUp: "Vice-campeão",
        thirdPlace: "3º Lugar",
        fourthPlace: "4º Lugar",
        thirdPlaceMatch: "Disputa do 3º Lugar",
        btnShare: "🎨 Compartilhar",
        matchEnded: "Partida encerrada",
        shareTeamTitle: "Compartilhar Partidas da Seleção",
        optWc: "🏆 Copa do Mundo 2026",
        optPl: "⚽ Premier League 26/27 (Em Breve)",
        q1: "As partidas se ajustarão automaticamente?",
        a1: "Sim! O site detecta automaticamente seu fuso horário.",
        q2: "Posso selecionar manualmente?",
        a2: "Sim, use o menu suspenso.",
        q3: "Como adiciono ao calendário?",
        a3: "Clique no botão Adicionar ao Cal.",
        q4: "Quando começa a Copa do Mundo 2026?",
        a4: "A partida de abertura será em 11 de junho de 2026.",
        q5: "A que horas é o jogo Argentina x França no horário do Reino Unido (BST)?",
        a5: "A maioria dos jogos noturnos da Copa do Mundo 2026 começa às 19:00 UTC, que é 20:00 BST. Selecione 'Europe/London' para ver no horário do Reino Unido.",
        q6: "A que horas a Copa do Mundo 2026 passa na Índia (IST)?",
        a6: "O Horário Padrão da Índia (IST) é UTC+5:30.",
        q7: "A que horas os jogos são transmitidos na Austrália (AEST/AEDT)?",
        a7: "O Horário da Austrália (AEST) é UTC+10.",
        q8: "A que horas são os jogos na China / CST (Horário de Pequim)?",
        a8: "O Horário Padrão da China (CST) é UTC+8.",
        q9: "Posso compartilhar o horário de um jogo com meus amigos?",
        a9: "Sim! Clique no botão '🎨 Share' em qualquer cartão de jogo.",
        q10: "Quantas seleções estão na Copa do Mundo 2026 e quem são os favoritos?",
        a10: "A Copa do Mundo 2026 terá 48 seleções em 12 grupos.",
        disclaimer: "Isenção de responsabilidade: Ferramenta independente.",
        hostedIn: "Estádios: EUA, Canadá, México",
        groupStage: "Fase de Grupos",
        knockoutStage: "Eliminatórias"
    },
    fr: {
        title: "Convertisseur de Fuseau Horaire Coupe du Monde 2026",
        subtitle: "Convertissez les 104 matchs à votre heure locale.",
        tzLabel: "Votre Fuseau Horaire",
        searchPlaceholder: "Rechercher par pays, groupe ou stade...",
        tabAll: "Tous les Matchs",
        tabGroup: "Phase de Groupes",
        tabKnockout: "Phase à Élimination Directe",
        statsLabel: "Affichage de {count} sur {total} matchs",
        emptyState: "Aucun match trouvé.",
        addToCalendar: "Ajouter au Cal",
        localTime: "Votre Heure",
        venueLabel: "Lieu",
        todayTitle: "Matchs d'aujourd'hui",
        nextMatch: "Prochain match dans",
        liveNow: "EN DIRECT",
        finished: "FIN",
        btnDownloadAll: "📥 Télécharger les 104 Matchs",
        btnTeamCal: "⭐ S'abonner par Équipe",
        tzHelper: "Détecté automatiquement. Ajustez manuellement ci-dessous si nécessaire.",
        upcoming: "à venir",
        finishedStats: "terminés",
        faqTitle: "Foire Aux Questions (FAQ)",
        subscribeTitle: "Liste de Diffusion Coupe du Monde 2026",
        subscribeDesc: "Rejoignez notre liste d'attente pour recevoir les mises à jour du calendrier.",
        subscribeBtn: "Rejoindre",
        emailPlaceholder: "Entrez votre adresse e-mail...",
        subSuccess: "Inscription réussie !",
        tournAlert: "Bientôt disponible !",
        winner: "Vainqueur",
        match: "Match",
        group: "Groupe",
        runnerUp: "Deuxième",
        thirdPlace: "3e Place",
        fourthPlace: "4e Place",
        thirdPlaceMatch: "Match pour la 3e Place",
        btnShare: "🎨 Partager",
        matchEnded: "Match terminé",
        shareTeamTitle: "Partager les Matchs de l'Équipe",
        optWc: "🏆 Coupe du Monde 2026",
        optPl: "⚽ Premier League 26/27 (Bientôt)",
        q1: "Les matchs s'ajustent-ils ?",
        a1: "Oui, automatiquement.",
        q2: "Puis-je changer de fuseau ?",
        a2: "Absolument.",
        q3: "Comment ajouter au calendrier ?",
        a3: "Cliquez sur Ajouter au Cal.",
        q4: "Quand commence la Coupe ?",
        a4: "Le 11 juin 2026.",
        q5: "À quelle heure a lieu le match Argentine - France à l'heure du Royaume-Uni (BST) ?",
        a5: "La plupart des matchs en soirée débutent à 19h00 UTC, soit 20h00 BST.",
        q6: "À quelle heure la Coupe du Monde 2026 est-elle diffusée en Inde (IST) ?",
        a6: "L'heure normale de l'Inde (IST) est UTC+5:30.",
        q7: "À quelle heure les matchs sont-ils diffusés en Australie (AEST/AEDT) ?",
        a7: "L'heure normale de l'Est de l'Australie (AEST) est UTC+10.",
        q8: "À quelle heure sont les matchs en Chine / CST (Heure de Pékin) ?",
        a8: "L'heure normale de la Chine (CST) est UTC+8.",
        q9: "Puis-je partager l'heure d'un match avec mes amis ?",
        a9: "Oui ! Cliquez sur le bouton '🎨 Share' sur n'importe quel match.",
        q10: "Combien d'équipes participent à la Coupe du Monde 2026 et qui sont les favoris ?",
        a10: "La Coupe du Monde 2026 comptera 48 équipes.",
        disclaimer: "Outil indépendant.",
        hostedIn: "Stades: USA, Canada, Mexique",
        groupStage: "Groupes",
        knockoutStage: "Élimination Directe"
    },
    ar: {
        title: "محول المنطقة الزمنية لكأس العالم 2026",
        subtitle: "قم بتحويل جميع المباريات البالغ عددها 104 إلى توقيتك المحلي.",
        tzLabel: "منطقتك الزمنية",
        searchPlaceholder: "البحث عن طريق البلد، المجموعة...",
        tabAll: "جميع المباريات",
        tabGroup: "دور المجموعات",
        tabKnockout: "مرحلة خروج المغلوب",
        statsLabel: "عرض {count} من {total} مباريات",
        emptyState: "لا توجد مباريات.",
        addToCalendar: "إضافة للتقويم",
        localTime: "وقتك",
        venueLabel: "المكان",
        todayTitle: "مباريات اليوم",
        nextMatch: "المباراة القادمة في",
        liveNow: "مباشر",
        finished: "نهاية",
        btnDownloadAll: "📥 تحميل جميع المباريات البالغ عددها 104",
        btnTeamCal: "⭐ اشترك حسب الفريق",
        tzHelper: "تم الكشف تلقائياً. قم بالتعديل يدوياً أدناه إذا لزم الأمر.",
        upcoming: "قادمة",
        finishedStats: "منتهية",
        faqTitle: "الأسئلة الشائعة",
        subscribeTitle: "القائمة البريدية لكأس العالم 2026",
        subscribeDesc: "انضم إلى قائمة الانتظار لتلقي تحديثات هامة بالجدول الزمني.",
        subscribeBtn: "الانضمام",
        emailPlaceholder: "أدخل عنوان بريدك الإلكتروني...",
        subSuccess: "تم الانضمام بنجاح!",
        tournAlert: "قريباً!",
        winner: "الفائز",
        match: "مباراة",
        group: "المجموعة",
        runnerUp: "الوصيف",
        thirdPlace: "المركز الثالث",
        fourthPlace: "المركز الرابع",
        thirdPlaceMatch: "مباراة المركز الثالث",
        btnShare: "🎨 مشاركة",
        matchEnded: "انتهت المباراة",
        shareTeamTitle: "مشاركة مباريات الفريق",
        optWc: "🏆 كأس العالم 2026",
        optPl: "⚽ الدوري الإنجليزي الممتاز 26/27 (قريباً)",
        q1: "هل تتكيف المباريات تلقائياً؟",
        a1: "نعم!",
        q2: "هل يمكنني اختيار منطقة مختلفة؟",
        a2: "بالتأكيد.",
        q3: "كيف أضيف للتقويم؟",
        a3: "اضغط إضافة للتقويم.",
        q4: "متى يبدأ كأس العالم؟",
        a4: "11 يونيو 2026.",
        q5: "متى تقام مباراة الأرجنتين وفرنسا بتوقيت المملكة المتحدة (BST)؟",
        a5: "تبدأ معظم مباريات كأس العالم 2026 المسائية الساعة 19:00 بتوقيت جرينتش، وهو الساعة 20:00 بالتوقيت الصيفي البريطاني.",
        q6: "متى تلعب مباريات كأس العالم 2026 في الهند (IST)؟",
        a6: "التوقيت الهندي (IST) هو UTC+5:30.",
        q7: "متى تُبث مباريات كأس العالم 2026 في أستراليا (AEST/AEDT)؟",
        a7: "التوقيت الأسترالي (AEST) هو UTC+10.",
        q8: "متى تُقام مباريات كأس العالم 2026 في الصين / توقيت بكين (CST)؟",
        a8: "توقيت الصين (CST) هو UTC+8.",
        q9: "هل يمكنني مشاركة وقت مباراة كأس العالم مع أصدقائي؟",
        a9: "نعم! انقر فوق الزر '🎨 Share' في أي بطاقة مباراة.",
        q10: "كم عدد الفرق في كأس العالم 2026 ومن هم المرشحون للفوز؟",
        a10: "لأول مرة، تضم كأس العالم 48 فريقًا.",
        disclaimer: "أداة مستقلة.",
        hostedIn: "الملاعب: أمريكا، كندا، المكسيك",
        groupStage: "المجموعات",
        knockoutStage: "خروج المغلوب"
    },
    zh: {
        title: "2026 世界杯时区转换器",
        subtitle: "将 104 场比赛一键转换为您的本地时间。永远不会错过开球。",
        tzLabel: "您的时区",
        searchPlaceholder: "按国家、小组或场馆搜索...",
        tabAll: "所有比赛",
        tabGroup: "小组赛",
        tabKnockout: "淘汰赛",
        statsLabel: "显示 {count} / {total} 场比赛",
        emptyState: "没有符合过滤条件的比赛。",
        addToCalendar: "加入日历",
        localTime: "您的时间",
        venueLabel: "场馆",
        todayTitle: "今日比赛",
        nextMatch: "下一场比赛倒计时",
        liveNow: "直播中",
        finished: "完赛",
        btnDownloadAll: "📥 下载所有104场比赛",
        btnTeamCal: "⭐ 按球队订阅",
        tzHelper: "自动检测。如需修改请在下方手动选择。",
        upcoming: "未赛",
        finishedStats: "完赛",
        faqTitle: "常见问题 (FAQ)",
        subscribeTitle: "即将推出：赛事提醒推送 🚀",
        subscribeDesc: "留下您的邮箱，功能上线时您将第一时间接到通知。",
        subscribeBtn: "加入列表",
        emailPlaceholder: "输入您的电子邮件地址...",
        subSuccess: "加入成功！我们会保持联系。",
        tournAlert: "其他赛事的赛程将在临近时公布！",
        winner: "胜者",
        match: "第",
        group: "小组",
        runnerUp: "小组第二",
        thirdPlace: "小组第三",
        fourthPlace: "小组第四",
        thirdPlaceMatch: "季军赛",
        btnShare: "🎨 分享",
        matchEnded: "比赛已结束",
        shareTeamTitle: "分享球队赛程",
        optWc: "🏆 2026 世界杯",
        optPl: "⚽ 26/27赛季英超 (敬请期待)",
        q1: "时间会自动转换为我的本地时间吗？",
        a1: "是的！网站会自动检测您浏览器的时区。",
        q2: "我可以手动切换时区吗？",
        a2: "可以，请使用顶部的下拉菜单。",
        q3: "如何添加到我的日历？",
        a3: "点击卡片上的‘加入日历’按钮即可下载 ICS 文件。",
        q4: "2026世界杯什么时候开始？",
        a4: "揭幕战将于2026年6月11日在墨西哥城阿兹特克体育场打响。",
        q5: "阿根廷对法国的比赛在英国时间（BST）是几点？",
        a5: "大多数2026年世界杯的晚间比赛在UTC时间19:00开球，相当于BST时间20:00。在页面顶部的时区下拉菜单中选择“Europe/London”即可查看所有比赛的英国时间。",
        q6: "2026年世界杯在印度（IST）是几点播出？",
        a6: "印度标准时间（IST）是UTC+5:30。UTC时间19:00的比赛相当于印度第二天凌晨00:30。选择“Asia/Kolkata”即可自动转换为印度时间。",
        q7: "2026年世界杯在澳大利亚（AEST/AEDT）是几点？",
        a7: "澳大利亚东部标准时间（AEST）是UTC+10。UTC时间19:00的比赛相当于澳洲第二天早上05:00。选择“Australia/Sydney”即可查看澳洲本地时间。",
        q8: "2026年世界杯在中国/北京时间（CST）是几点？",
        a8: "中国标准时间（CST）是UTC+8。UTC时间22:00的比赛相当于北京时间第二天早上06:00。这意味着许多晚间小组赛将在中国凌晨或清晨播出。选择“Asia/Shanghai”即可查看所有104场比赛的北京时间。",
        q9: "我可以和朋友分享世界杯比赛时间吗？",
        a9: "可以！点击任何比赛卡片上的“🎨 Share”按钮即可打开分享面板。您可以下载包含比赛详情和您当地时间的精美卡片图片，直接分享到微信、WhatsApp、Twitter等平台，也可以复制文本或链接发送给朋友。",
        q10: "2026年世界杯有多少支球队，夺冠热门是谁？",
        a10: "2026年世界杯首次扩军至48支球队，分为12个小组（A-L组）。夺冠热门包括巴西、法国、阿根廷（卫冕冠军）、英格兰、西班牙、德国、葡萄牙和荷兰。东道主美国、墨西哥和加拿大也参加了本届赛事。KickoffTime会以您的本地时间显示他们所有的比赛日程。",
        disclaimer: "免责声明：本网站是为球迷提供的独立工具，与 FIFA 或官方组织无关。",
        hostedIn: "主办国：美国、加拿大、墨西哥",
        groupStage: "小组赛",
        knockoutStage: "淘汰赛"
    }
};

// Flags Dictionary (ISO 3166-1 alpha-2 codes for flagcdn)
const teamCodes = {
    "Mexico": "mx",
    "South Africa": "za",
    "South Korea": "kr",
    "Czech Republic": "cz",
    "Canada": "ca",
    "Bosnia & Herzegovina": "ba",
    "USA": "us",
    "Paraguay": "py",
    "Qatar": "qa",
    "Switzerland": "ch",
    "Brazil": "br",
    "Morocco": "ma",
    "Haiti": "ht",
    "Scotland": "gb-sct",
    "Australia": "au",
    "Turkey": "tr",
    "Germany": "de",
    "Curaçao": "cw",
    "Netherlands": "nl",
    "Japan": "jp",
    "Ivory Coast": "ci",
    "Ecuador": "ec",
    "Sweden": "se",
    "Tunisia": "tn",
    "Spain": "es",
    "Cape Verde": "cv",
    "Belgium": "be",
    "Egypt": "eg",
    "Saudi Arabia": "sa",
    "Uruguay": "uy",
    "Iran": "ir",
    "New Zealand": "nz",
    "France": "fr",
    "Senegal": "sn",
    "Iraq": "iq",
    "Norway": "no",
    "Argentina": "ar",
    "Algeria": "dz",
    "Austria": "at",
    "Jordan": "jo",
    "Portugal": "pt",
    "DR Congo": "cd",
    "England": "gb-eng",
    "Croatia": "hr",
    "Ghana": "gh",
    "Panama": "pa",
    "Uzbekistan": "uz",
    "Colombia": "co"
};

function getFlag(teamName) {
    const code = teamCodes[teamName];
    if (code) {
        return `<img src="https://flagcdn.com/w40/${code}.png" width="20" style="vertical-align: middle; border-radius: 2px; box-shadow: 0 0 2px rgba(0,0,0,0.2);" alt="${teamName}">`;
    }
    // Check if it's a knockout placeholder (e.g. 1A, W73, etc.)
    return `<span style="font-size:1.1em;vertical-align:middle;">⚽</span>`;
}

// Major Timezone Options
const majorTimezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Mexico_City",
    "America/Vancouver",
    "America/Toronto",
    "America/Bogota",
    "America/Sao_Paulo",
    "America/Argentina/Buenos_Aires",
    "Europe/London",
    "Europe/Paris",
    "Europe/Madrid",
    "Europe/Berlin",
    "Europe/Moscow",
    "Asia/Riyadh",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Australia/Sydney",
    "Pacific/Auckland"
];

// App State
let currentLang = localStorage.getItem("wc_lang") || (navigator.language.startsWith("es") ? "es" : "en");
let currentTimezone = localStorage.getItem("wc_timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone;
let activeTab = "all"; // all, group, knockout
let activeGroup = "all"; // all, A, B, C...
let searchQuery = "";

// Ensure current timezone is in the select list
if (!majorTimezones.includes(currentTimezone)) {
    majorTimezones.unshift(currentTimezone);
}

// Populate Timezone Dropdown
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

// Theme Toggle Logic
const themeToggle = document.getElementById("themeToggle");
let currentTheme = localStorage.getItem("wc_theme");

if (!currentTheme) {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        currentTheme = "light";
    } else {
        currentTheme = "dark";
    }
}
document.documentElement.setAttribute("data-theme", currentTheme);
themeToggle.textContent = currentTheme === "dark" ? "☀️" : "🌙";

themeToggle.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeToggle.textContent = currentTheme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("wc_theme", currentTheme);
});

const langSelect = document.getElementById("langSelect");
if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener("change", (e) => {
        currentLang = e.target.value;
        localStorage.setItem("wc_lang", currentLang);
        document.documentElement.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");
        updateLanguage();
        renderMatches();
        renderTodaysBanner();
        const teamGrid = document.getElementById("teamCalGrid");
        if (teamGrid) teamGrid.innerHTML = "";
        if (document.getElementById("teamCalPanel")?.classList.contains("open")) {
            buildTeamCalPanel();
        }
    });
}
document.documentElement.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");

tzSelect.addEventListener("change", (e) => {
    currentTimezone = e.target.value;
    localStorage.setItem("wc_timezone", currentTimezone);
    renderMatches();
});

// Toast notification helper
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

const tournamentSelect = document.getElementById("tournamentSelect");
if (tournamentSelect) {
    tournamentSelect.addEventListener("change", (e) => {
        if (e.target.value !== "wc2026") {
            showToast(i18n[currentLang].tournAlert);
            e.target.value = "wc2026"; // Revert for now
        }
    });
}

const subscribeForm = document.getElementById("subscribeForm");
if (subscribeForm) {
    subscribeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("emailInput").value;
        const submitBtn = subscribeForm.querySelector("button");
        
        if (email) {
            const originalText = submitBtn.textContent;
            const originalBg = submitBtn.style.backgroundColor;
            const originalColor = submitBtn.style.color;
            
            submitBtn.textContent = "...";
            submitBtn.disabled = true;

            try {
                const WEBHOOK_URL = "https://forminit.com/f/6sqwnyffda0";
                if (WEBHOOK_URL !== "YOUR_FORMINIT_ENDPOINT_URL_HERE") {
                    const formData = new FormData();
                    formData.append("fi-sender-email", email);
                    formData.append("fi-text-timezone", currentTimezone);
                    formData.append("fi-text-source", "KickoffTime Website");

                    await fetch(WEBHOOK_URL, {
                        method: "POST",
                        body: formData,
                        headers: { "Accept": "application/json" }
                    });
                }
            } catch (error) {
                console.error("Subscription error:", error);
            }

            // Always show the success UI state even if fetch fails to keep it interactive
            submitBtn.textContent = "✅";
            submitBtn.style.backgroundColor = "#10b981";
            submitBtn.style.color = "#ffffff";
            
            showToast(i18n[currentLang].subSuccess);
            subscribeForm.reset();

            // Revert back after 3 seconds
            setTimeout(() => {
                submitBtn.style.backgroundColor = originalBg;
                submitBtn.style.color = originalColor;
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// Search & Filter Events
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderMatches();
});

// Setup Stage Tabs
const tabBtns = document.querySelectorAll(".tab-btn");
tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeTab = btn.dataset.tab;
        
        // Show/hide group filters sub-row
        const groupFilters = document.getElementById("groupFiltersRow");
        if (activeTab === "group") {
            groupFilters.style.display = "flex";
        } else {
            groupFilters.style.display = "none";
            activeGroup = "all";
            document.querySelectorAll(".group-btn").forEach(b => b.classList.remove("active"));
            document.querySelector(".group-btn[data-group='all']").classList.add("active");
        }
        
        renderMatches();
    });
});

// Setup Group Filter Buttons
const groupBtns = document.querySelectorAll(".group-btn");
groupBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        groupBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeGroup = btn.dataset.group;
        renderMatches();
    });
});

// Format Match Date & Time
function formatMatchTime(utcString, timezone, lang) {
    const date = new Date(utcString);
    
    // Check if valid date
    if (isNaN(date.getTime())) {
        return { dateStr: utcString, timeStr: "--:--", suffix: "" };
    }

    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: timezone
    };

    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone
    };

    const locales = { en: "en-US", es: "es-ES", pt: "pt-BR", fr: "fr-FR", ar: "ar-SA", zh: "zh-CN" };
    const targetLocale = locales[lang] || "en-US";

    const formatterDate = new Intl.DateTimeFormat(targetLocale, dateOptions);
    const formatterTime = new Intl.DateTimeFormat(targetLocale, timeOptions);

    let dateStr = formatterDate.format(date);
    let timeStr = formatterTime.format(date);

    // Capitalize first letter of localized date
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    // Extract AM/PM if they are at the end (for styling)
    let suffix = "";
    const timeMatch = timeStr.match(/^([\d:]+)\s+([a-zA-Z. ]+)$/);
    if (timeMatch) {
        timeStr = timeMatch[1];
        suffix = timeMatch[2].trim();
    } else if (timeStr.toLowerCase().includes("am")) {
        suffix = "AM";
        timeStr = timeStr.replace(/am/i, "").trim();
    } else if (timeStr.toLowerCase().includes("pm")) {
        suffix = "PM";
        timeStr = timeStr.replace(/pm/i, "").trim();
    }

    return { dateStr, timeStr, suffix };
}

// =============================================
// ICS Helpers
// =============================================
const formatICSDate = (date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

function buildVEVENT(match, index) {
    const startDate = new Date(match.time_utc);
    if (isNaN(startDate.getTime())) return null;
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const alarmDate = new Date(startDate.getTime() - 30 * 60 * 1000);

    const t1 = match.team1.replace(/[^\w\s]/g, "");
    const t2 = match.team2.replace(/[^\w\s]/g, "");
    const summary = `${t1} vs ${t2} - FIFA World Cup 2026`;
    const description = `FIFA World Cup 2026\\n${match.group}\\nVenue: ${getLocString(match.venue)}\\nConverted to your timezone by kickofftracker.com`;

    return [
        "BEGIN:VEVENT",
        `UID:match-${index}-2026@kickofftracker.com`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${match.venue}`,
        // 30-minute reminder alarm
        "BEGIN:VALARM",
        "TRIGGER:-PT30M",
        "ACTION:DISPLAY",
        `DESCRIPTION:⏱ Kickoff in 30 min: ${t1} vs ${t2}`,
        "END:VALARM",
        "END:VEVENT"
    ].join("\r\n");
}

function buildICSBlob(events) {
    const content = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//KickoffTime//NONSGML WC2026//EN",
        "X-WR-CALNAME:FIFA World Cup 2026 - KickoffTime",
        "X-WR-TIMEZONE:UTC",
        ...events,
        "END:VCALENDAR"
    ].join("\r\n");
    return new Blob([content], { type: "text/calendar;charset=utf-8" });
}

function triggerDownload(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// Single match ICS download
function downloadICS(match, index) {
    const vevent = buildVEVENT(match, index);
    if (!vevent) return;
    const blob = buildICSBlob([vevent]);
    const fn = `match-${index+1}_${match.team1.replace(/\s+/g, '_')}_vs_${match.team2.replace(/\s+/g, '_')}.ics`;
    triggerDownload(blob, fn);
    showToast("📅 Calendar event downloaded!");
}

// Download ALL 104 matches in one ICS
function downloadAllICS() {
    const events = matches
        .map((m, i) => buildVEVENT(m, i))
        .filter(Boolean);
    const blob = buildICSBlob(events);
    triggerDownload(blob, "FIFA_World_Cup_2026_All_Matches_KickoffTime.ics");
    showToast(`📅 All ${events.length} matches downloaded!`);
}
window.downloadAllICS = downloadAllICS;

// Download a specific team's matches
function downloadTeamICS(teamName) {
    const teamMatches = matches
        .map((m, i) => ({ m, i }))
        .filter(({ m }) => m.team1 === teamName || m.team2 === teamName);
    if (!teamMatches.length) { showToast("No matches found for this team."); return; }
    const events = teamMatches.map(({ m, i }) => buildVEVENT(m, i)).filter(Boolean);
    const blob = buildICSBlob(events);
    triggerDownload(blob, `WC2026_${teamName.replace(/\s+/g, '_')}_Schedule_KickoffTime.ics`);
    showToast(`📅 ${teamName}'s ${events.length} match(es) downloaded!`);
}
window.downloadTeamICS = downloadTeamICS;

// Toggle team calendar panel
function toggleTeamCalPanel() {
    const panel = document.getElementById("teamCalPanel");
    if (!panel) return;
    if (panel.classList.contains("open")) {
        panel.classList.remove("open");
    } else {
        buildTeamCalPanel();
        panel.classList.add("open");
    }
}
window.toggleTeamCalPanel = toggleTeamCalPanel;

function buildTeamCalPanel() {
    const grid = document.getElementById("teamCalGrid");
    if (!grid || grid.children.length > 0) return; // already built
    // Collect all unique real team names
    const teamSet = new Set();
    matches.forEach(m => {
        if (m.team1 && !m.team1.match(/^[1-4W]/)) teamSet.add(m.team1);
        if (m.team2 && !m.team2.match(/^[1-4W]/)) teamSet.add(m.team2);
    });
    const sorted = Array.from(teamSet).sort();
    sorted.forEach(team => {
        const wrap = document.createElement("div");
        wrap.className = "team-cal-wrap";
        wrap.style.display = "flex";
        wrap.style.gap = "0.5rem";
        
        const btn = document.createElement("button");
        btn.className = "team-cal-btn";
        btn.style.flexGrow = "1";
        btn.innerHTML = `${getFlag(team)} ${getTeamName(team)}`;
        btn.onclick = () => downloadTeamICS(team);
        
        const shareBtn = document.createElement("button");
        shareBtn.className = "team-cal-btn share-team-btn";
        shareBtn.innerHTML = `🎨`;
        shareBtn.title = i18n[currentLang].shareTeamTitle;
        shareBtn.style.flexGrow = "0";
        shareBtn.style.padding = "0.5rem 1rem";
        shareBtn.onclick = () => openTeamShareModal(team);
        
        wrap.appendChild(btn);
        wrap.appendChild(shareBtn);
        grid.appendChild(wrap);
    });
}

// =============================================
// Helper: Is a match finished?
// Priority: API status → time-based fallback
// =============================================
// Helper: Mock Score Generator for Demo Phase
// =============================================
function getMockScore(team1, team2) {
    const seedStr = team1 + team2;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    return {
        home: absHash % 4,
        away: (absHash >> 2) % 4
    };
}

// =============================================
// Match Status Evaluation
// A match is considered finished if:
//   1. API explicitly says FINISHED, OR
//   2. kickoff time + 115 min has already passed (and it's not LIVE)
// =============================================
function matchIsFinished(match, live) {
    if (live?.status === "FINISHED") return true;
    const isLive = live?.status === "IN_PLAY" || live?.status === "PAUSED";
    if (isLive) return false;
    // Time-based fallback: 115 minutes after kickoff
    const kickoff = new Date(match.time_utc);
    if (isNaN(kickoff.getTime())) return false;
    return Date.now() > kickoff.getTime() + 115 * 60 * 1000;
}

// Render Matches
function renderMatches() {
    const grid = document.getElementById("matchesGrid");
    grid.innerHTML = "";

    const t = i18n[currentLang];
    renderTimezoneOptions();

    // Filter Matches
    const filtered = matches.filter((match, idx) => {
        // Tab Filter
        const isKnockout = match.group.includes("Round") || match.group.includes("Quarter") || match.group.includes("Semi") || match.group.includes("Final") || match.group.includes("Third");
        if (activeTab === "group" && isKnockout) return false;
        if (activeTab === "knockout" && !isKnockout) return false;

        // Group Stage Filter (A-L)
        if (activeTab === "group" && activeGroup !== "all") {
            const expectedGroupStr = `Group ${activeGroup}`;
            if (match.group !== expectedGroupStr) return false;
        }

        // Search Query
        if (searchQuery) {
            const team1 = match.team1.toLowerCase();
            const team2 = match.team2.toLowerCase();
            const venue = match.venue.toLowerCase();
            const group = match.group.toLowerCase();
            if (!team1.includes(searchQuery) && !team2.includes(searchQuery) && !venue.includes(searchQuery) && !group.includes(searchQuery)) {
                return false;
            }
        }

        return true;
    });

    // Sort: LIVE first, then upcoming (chronological), then finished
    filtered.sort((a, b) => {
        const idxA = matches.indexOf(a);
        const idxB = matches.indexOf(b);
        const liveA = liveMatchData[idxA];
        const liveB = liveMatchData[idxB];
        const isFinishedA = matchIsFinished(a, liveA);
        const isFinishedB = matchIsFinished(b, liveB);
        const isLiveA = liveA?.status === "IN_PLAY" || liveA?.status === "PAUSED";
        const isLiveB = liveB?.status === "IN_PLAY" || liveB?.status === "PAUSED";

        // LIVE → top
        if (isLiveA && !isLiveB) return -1;
        if (!isLiveA && isLiveB) return 1;

        // Otherwise keep original order (by time)
        return new Date(a.time_utc) - new Date(b.time_utc);
    });

    // Count upcoming vs finished for stats
    const finishedCount = filtered.filter((m) => {
        const i = matches.indexOf(m);
        return matchIsFinished(m, liveMatchData[i]);
    }).length;
    const upcomingCount = filtered.length - finishedCount;

    // Update stats count
    const statsLabel = document.getElementById("statsLabel");
    let statsText = t.statsLabel.replace("{count}", filtered.length).replace("{total}", matches.length);
    if (finishedCount > 0 && upcomingCount > 0) {
        statsText += ` · ${upcomingCount} ${t.upcoming} · ${finishedCount} ${t.finishedStats}`;
    } else if (finishedCount > 0) {
        statsText += ` · ${finishedCount} ${t.finishedStats}`;
    }
    statsLabel.textContent = statsText;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚽</div>
                <p>${t.emptyState}</p>
            </div>
        `;
        return;
    }

    let pastDividerInserted = false;

    filtered.forEach((match, idx) => {
        const originalIndex = matches.indexOf(match);
        const live = liveMatchData[originalIndex];
        const { dateStr, timeStr, suffix } = formatMatchTime(match.time_utc, currentTimezone, currentLang);
        
        const isKnockout = match.group.includes("Round") || match.group.includes("Quarter") || match.group.includes("Semi") || match.group.includes("Final") || match.group.includes("Third");
        const isHostNation = ["USA","Mexico","Canada"].includes(match.team1) || ["USA","Mexico","Canada"].includes(match.team2);
        const isLive = live?.status === "IN_PLAY" || live?.status === "PAUSED";
        const isFinished = matchIsFinished(match, live);
        const isImportant = isKnockout || isHostNation || isLive;

        // Insert past-matches divider before the first finished match
        if (isFinished && !pastDividerInserted) {
            pastDividerInserted = true;
            const divider = document.createElement("div");
            divider.className = "past-matches-divider";
            divider.innerHTML = `<span>✅ Past Matches</span>`;
            grid.appendChild(divider);
        }

        let displayGroup = match.group;
        const groupTranslations = {
            es: { "Group": "Grupo", "Round of 32": "Dieciseisavos", "Round of 16": "Octavos", "Quarter-finals": "Cuartos", "Semi-finals": "Semis", "Third-place play-off": "3er Puesto", "Final": "Gran Final" },
            pt: { "Group": "Grupo", "Round of 32": "Fase de 32", "Round of 16": "Oitavas", "Quarter-finals": "Quartas", "Semi-finals": "Semis", "Third-place play-off": "3º Lugar", "Final": "Final" },
            fr: { "Group": "Groupe", "Round of 32": "32e de Finale", "Round of 16": "16e de Finale", "Quarter-finals": "Quarts", "Semi-finals": "Demies", "Third-place play-off": "3e Place", "Final": "Finale" },
            zh: { "Group": "小组", "Round of 32": "32强", "Round of 16": "16强", "Quarter-finals": "四分之一", "Semi-finals": "半决赛", "Third-place play-off": "季军赛", "Final": "决赛" },
            ar: { "Group": "مجموعة", "Round of 32": "دور الـ32", "Round of 16": "دور الـ16", "Quarter-finals": "ربع النهائي", "Semi-finals": "نصف النهائي", "Third-place play-off": "المركز الثالث", "Final": "النهائي" }
        };
        if (groupTranslations[currentLang]) {
            const gt = groupTranslations[currentLang];
            for (const [en, tr] of Object.entries(gt)) {
                displayGroup = displayGroup.replace(en, tr);
            }
        }

        // Resolve team names: use API data, then knockout code parser, then raw
        const team1Raw = live?.homeTeam || parseKnockoutCode(match.team1);
        const team2Raw = live?.awayTeam || parseKnockoutCode(match.team2);
        
        let team1Display = team1Raw;
        let team2Display = team2Raw;
        const isTeam1Placeholder = /^[1-4][A-L]|^W\d|^L\d|Winner|Runner|3rd/.test(team1Raw);
        const isTeam2Placeholder = /^[1-4][A-L]|^W\d|^L\d|Winner|Runner|3rd/.test(team2Raw);
        if (!isTeam1Placeholder) team1Display = getTeamName(team1Raw);
        if (!isTeam2Placeholder) team2Display = getTeamName(team2Raw);

        // Score / Status badge
        let statusHTML = "";
        if (isLive) {
            statusHTML = `<span class="badge-live">● ${t.liveNow}</span>`;
        } else if (isFinished) {
            if (live && live.homeScore !== null && live.homeScore !== undefined) {
                statusHTML = `<span class="badge-ft">${t.finished} &nbsp; ${live.homeScore} – ${live.awayScore}</span>`;
            } else {
                const mock = getMockScore(match.team1, match.team2);
                statusHTML = `<span class="badge-ft">${t.finished} &nbsp; ${mock.home} – ${mock.away}</span>`;
            }
        }

        const card = document.createElement("div");
        card.className = `match-card ${isImportant ? 'important' : ''} ${isLive ? 'is-live' : ''} ${isFinished ? 'is-finished' : ''}`;

        card.innerHTML = `
            <div class="match-header">
                <span class="match-group">${displayGroup}</span>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    ${statusHTML}
                    <span class="match-number">#${originalIndex + 1}</span>
                </div>
            </div>
            <div class="match-teams">
                <div class="team-row">
                    <span class="team-flag">${getFlag(team1Raw)}</span>
                    <span class="team-name ${isTeam1Placeholder ? 'placeholder' : ''}">${team1Display}</span>
                </div>
                <div class="team-row">
                    <span class="team-flag">${getFlag(team2Raw)}</span>
                    <span class="team-name ${isTeam2Placeholder ? 'placeholder' : ''}">${team2Display}</span>
                </div>
            </div>
            <div class="match-time-info">
                <div class="time-details">
                    <div class="local-date">${dateStr}</div>
                    <div class="local-time">
                        ${isFinished ? `<span style="font-size:0.9rem;color:var(--text-muted)">${t.matchEnded}</span>` : `${timeStr}${suffix ? `<span class="time-suffix">${suffix}</span>` : ''}`}
                    </div>
                    <div class="match-venue">📍 ${getLocString(match.venue)}</div>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.4rem; align-items:flex-end;">
                    <button class="add-calendar-btn" onclick="triggerICS(${originalIndex})">
                        📅 ${t.addToCalendar}
                    </button>
                    <button class="share-btn" onclick="openShareModal(${originalIndex})">
                        ${t.btnShare}
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Global hook for inline onclick
window.triggerICS = function(originalIndex) {
    downloadICS(matches[originalIndex], originalIndex);
};

// =============================================
// Share Modal + Canvas Card System
// =============================================
let currentShareIndex = null;
let currentShareTeam = null;

function openShareModal(matchIndex) {
    currentShareIndex = matchIndex;
    currentShareTeam = null;
    const match = matches[matchIndex];
    const live = liveMatchData[matchIndex];
    const team1Raw = live?.homeTeam || parseKnockoutCode(match.team1);
    const team2Raw = live?.awayTeam || parseKnockoutCode(match.team2);
    const team1 = getTeamName(team1Raw);
    const team2 = getTeamName(team2Raw);
    const { dateStr, timeStr, suffix } = formatMatchTime(match.time_utc, currentTimezone, currentLang);

    // Update modal title
    document.getElementById("shareModalTitle").textContent = `🎨 ${shareI18n[currentLang].shareMatch}: ${team1} vs ${team2}`;

    // Update Twitter link
    const tweetText = encodeURIComponent(
        `🏆 ${team1} vs ${team2} — ${shareI18n[currentLang].wc2026}\n` +
        `⏰ ${shareI18n[currentLang].kickoff}: ${timeStr} ${suffix} (${dateStr})\n` +
        `${shareI18n[currentLang].checkTime} → kickofftracker.com`
    );
    document.getElementById("btnShareTwitter").href =
        `https://twitter.com/intent/tweet?text=${tweetText}`;

    // Store share text for copy
    document.getElementById("btnCopyText").dataset.text =
        `🏆 ${team1} vs ${team2} — ${shareI18n[currentLang].wc2026}\n` +
        `⏰ ${shareI18n[currentLang].myKickoff}: ${timeStr} ${suffix} (${dateStr})\n` +
        `📅 ${getLocString(match.venue)}\n` +
        `🌐 ${shareI18n[currentLang].seeAllMatches} → https://kickofftracker.com`;

    // Render Canvas card
    renderShareCanvas(team1, team2, dateStr, timeStr, suffix, match);

    // Open overlay
    document.getElementById("shareModalOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
}
window.openShareModal = openShareModal;

function closeShareModal(event) {
    if (event && event.target !== document.getElementById("shareModalOverlay")) return;
    document.getElementById("shareModalOverlay").classList.remove("open");
    document.body.style.overflow = "";
}
window.closeShareModal = closeShareModal;

// Keyboard ESC to close
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeShareModal(null);
});

// ---- Canvas Card Renderer ----
function renderShareCanvas(team1, team2, dateStr, timeStr, suffix, match) {
    const canvas = document.getElementById("shareCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 800, H = 420;
    canvas.width = W;
    canvas.height = H;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#0d1117");
    bgGrad.addColorStop(0.5, "#111827");
    bgGrad.addColorStop(1, "#0d1117");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Gold top border stripe
    const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
    goldGrad.addColorStop(0, "hsl(45,85%,58%)");
    goldGrad.addColorStop(0.5, "hsl(150,75%,42%)");
    goldGrad.addColorStop(1, "hsl(45,85%,58%)");
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, W, 5);

    // Subtle glow blob top-left
    const glowGrad = ctx.createRadialGradient(200, 150, 0, 200, 150, 350);
    glowGrad.addColorStop(0, "hsla(45,85%,58%,0.07)");
    glowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);

    // --- Trophy icon area ---
    ctx.font = "52px serif";
    ctx.textAlign = "center";
    ctx.fillText("🏆", W / 2, 72);

    // --- VS Teams line ---
    ctx.font = "bold 38px 'Outfit', 'Inter', sans-serif";
    ctx.fillStyle = "#f0f4ff";
    ctx.textAlign = "center";
    const vsText = `${team1}  vs  ${team2}`;
    ctx.fillText(vsText, W / 2, 140);

    // Gold underline
    ctx.strokeStyle = "hsl(45,85%,58%)";
    ctx.lineWidth = 2;
    const textWidth = Math.min(ctx.measureText(vsText).width + 40, W - 80);
    ctx.beginPath();
    ctx.moveTo((W - textWidth) / 2, 152);
    ctx.lineTo((W + textWidth) / 2, 152);
    ctx.stroke();

    // --- Match Stage / Group ---
    ctx.font = "500 15px 'Inter', sans-serif";
    ctx.fillStyle = "hsl(45,85%,58%)";
    ctx.textAlign = "center";
    ctx.fillText(`FIFA WORLD CUP 2026 · ${match.group.toUpperCase()}`, W / 2, 185);

    // --- Time block ---
    // Background pill
    const pillW = 340, pillH = 80;
    const pillX = (W - pillW) / 2, pillY = 205;
    ctx.fillStyle = "hsla(45,85%,58%,0.1)";
    roundRect(ctx, pillX, pillY, pillW, pillH, 16);
    ctx.fill();
    ctx.strokeStyle = "hsla(45,85%,58%,0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Time text
    ctx.font = "bold 42px 'Outfit', 'Inter', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(`${timeStr} ${suffix}`, W / 2, pillY + 50);

    // --- Date & Venue ---
    ctx.font = "500 16px 'Inter', sans-serif";
    ctx.fillStyle = "hsla(220,20%,96%,0.65)";
    ctx.textAlign = "center";
    ctx.fillText(dateStr, W / 2, 312);

    ctx.font = "14px 'Inter', sans-serif";
    ctx.fillStyle = "hsla(220,20%,96%,0.45)";
    ctx.fillText(`📍 ${getLocString(match.venue)}`, W / 2, 338);

    // --- Timezone label ---
    ctx.font = "13px 'Inter', sans-serif";
    ctx.fillStyle = "hsla(45,85%,58%,0.8)";
    ctx.fillText(`${shareI18n[currentLang].yourTime}: ${currentTimezone.replace(/_/g, " ")}`, W / 2, 364);

    // --- Bottom branding bar ---
    ctx.fillStyle = "hsla(220,20%,96%,0.06)";
    ctx.fillRect(0, H - 48, W, 48);

    ctx.font = "bold 15px 'Outfit', 'Inter', sans-serif";
    ctx.fillStyle = "hsl(45,85%,58%)";
    ctx.textAlign = "left";
    ctx.fillText("⏱ KICKOFF TIME", 28, H - 17);

    ctx.font = "13px 'Inter', sans-serif";
    ctx.fillStyle = "hsla(220,20%,96%,0.45)";
    ctx.textAlign = "right";
    ctx.fillText("kickofftracker.com", W - 28, H - 17);
}

// Utility: rounded rectangle path
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Download the canvas as PNG
function downloadShareImage() {
    const canvas = document.getElementById("shareCanvas");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    
    if (currentShareIndex !== null) {
        const match = matches[currentShareIndex];
        const t1 = match.team1.replace(/\s+/g, "_");
        const t2 = match.team2.replace(/\s+/g, "_");
        link.download = `WC2026_${t1}_vs_${t2}_KickoffTime.png`;
    } else if (currentShareTeam) {
        link.download = `WC2026_${currentShareTeam.replace(/\s+/g, "_")}_Schedule.png`;
    } else {
        link.download = "WC2026_Schedule.png";
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("🖼️ Image saved!");
}
window.downloadShareImage = downloadShareImage;

// Copy canvas image to clipboard
async function copyShareImage() {
    const canvas = document.getElementById("shareCanvas");
    try {
        canvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                showToast("🖼️ Image copied to clipboard!");
            } catch {
                // Fallback: download instead
                downloadShareImage();
                showToast("📥 Copied failed — image downloaded instead.");
            }
        }, "image/png");
    } catch {
        downloadShareImage();
    }
}
window.copyShareImage = copyShareImage;

// Copy share text to clipboard
async function copyShareText() {
    const btn = document.getElementById("btnCopyText");
    const text = btn.dataset.text || "";
    try {
        await navigator.clipboard.writeText(text);
        showToast("📋 Match info copied!");
    } catch {
        showToast("Could not copy text.");
    }
}
window.copyShareText = copyShareText;

// ---- Team Share Modal ----
function openTeamShareModal(teamName) {
    currentShareIndex = null;
    currentShareTeam = teamName;
    
    const teamDisplay = getTeamName(teamName);
    
    // Update modal title
    document.getElementById("shareModalTitle").textContent = `🎨 ${shareI18n[currentLang].shareMatch}: ${teamDisplay} ${shareI18n[currentLang].schedule}`;
    
    // Update Twitter link
    const tweetText = encodeURIComponent(
        `🏆 ${shareI18n[currentLang].followTeam.replace('{team}', teamDisplay)}\n` +
        `${shareI18n[currentLang].fullSchedule} → kickofftracker.com`
    );
    document.getElementById("btnShareTwitter").href = `https://twitter.com/intent/tweet?text=${tweetText}`;
    
    document.getElementById("btnCopyText").dataset.text =
        `🏆 ${teamDisplay} — ${shareI18n[currentLang].wc2026} ${shareI18n[currentLang].schedule}\n` +
        `🌐 ${shareI18n[currentLang].seeAllMatches} → https://kickofftracker.com`;
        
    renderTeamShareCanvas(teamName);
    document.getElementById("shareModalOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
}
window.openTeamShareModal = openTeamShareModal;

// ---- Team Share Canvas Renderer ----
function renderTeamShareCanvas(teamName) {
    const teamDisplay = getTeamName(teamName);
    const canvas = document.getElementById("shareCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 800, H = 420;
    canvas.width = W;
    canvas.height = H;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#0d1117");
    bgGrad.addColorStop(0.5, "#111827");
    bgGrad.addColorStop(1, "#0d1117");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Gold top border stripe
    const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
    goldGrad.addColorStop(0, "hsl(45,85%,58%)");
    goldGrad.addColorStop(0.5, "hsl(150,75%,42%)");
    goldGrad.addColorStop(1, "hsl(45,85%,58%)");
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, W, 5);

    // Subtle glow blob top-left
    const glowGrad = ctx.createRadialGradient(200, 150, 0, 200, 150, 350);
    glowGrad.addColorStop(0, "hsla(45,85%,58%,0.07)");
    glowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);

    // Header Text
    ctx.font = "bold 38px 'Outfit', 'Inter', sans-serif";
    ctx.fillStyle = "#f0f4ff";
    ctx.textAlign = "center";
    ctx.fillText(`${teamDisplay || teamName} ${shareI18n[currentLang].schedule}`, W / 2, 60);

    ctx.font = "500 15px 'Inter', sans-serif";
    ctx.fillStyle = "hsl(45,85%,58%)";
    ctx.fillText("FIFA WORLD CUP 2026", W / 2, 90);

    // Matches Loop
    const teamMatches = matches.filter(m => m.team1 === teamName || m.team2 === teamName).slice(0, 4);
    
    let y = 115;
    ctx.textAlign = "left";
    teamMatches.forEach((m) => {
        const { dateStr, timeStr, suffix } = formatMatchTime(m.time_utc, currentTimezone, currentLang);
        
        // Match Pill Background
        ctx.fillStyle = "hsla(45,85%,58%,0.1)";
        roundRect(ctx, 40, y, W - 80, 52, 10);
        ctx.fill();
        ctx.strokeStyle = "hsla(45,85%,58%,0.25)";
        ctx.stroke();

        // VS Text
        ctx.font = "bold 18px 'Outfit', sans-serif";
        ctx.fillStyle = "#fff";
        const team1Local = getTeamName(m.team1);
        const team2Local = getTeamName(m.team2);
        const vsText = `${team1Local} vs ${team2Local}`;
        ctx.fillText(vsText, 60, y + 33);
        
        // Date
        ctx.font = "14px 'Inter', sans-serif";
        ctx.fillStyle = "hsla(220,20%,96%,0.65)";
        ctx.textAlign = "center";
        ctx.fillText(dateStr, W / 2 + 30, y + 31);
        
        // Time
        ctx.textAlign = "right";
        ctx.fillStyle = "hsl(45,85%,58%)";
        ctx.font = "bold 18px 'Outfit', sans-serif";
        ctx.fillText(`${timeStr} ${suffix}`, W - 60, y + 33);
        
        ctx.textAlign = "left"; // Reset
        y += 62;
    });

    // Timezone Footnote
    ctx.font = "13px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "hsla(45,85%,58%,0.8)";
    ctx.fillText(`${shareI18n[currentLang].yourTime}: ${currentTimezone.replace(/_/g, " ")}`, W / 2, y + 10);

    // Bottom branding bar
    ctx.fillStyle = "hsla(220,20%,96%,0.06)";
    ctx.fillRect(0, H - 48, W, 48);
    ctx.font = "bold 15px 'Outfit', 'Inter', sans-serif";
    ctx.fillStyle = "hsl(45,85%,58%)";
    ctx.textAlign = "left";
    ctx.fillText("⏱ KICKOFF TIME", 28, H - 17);
    ctx.font = "13px 'Inter', sans-serif";
    ctx.fillStyle = "hsla(220,20%,96%,0.45)";
    ctx.textAlign = "right";
    ctx.fillText("kickofftracker.com", W - 28, H - 17);
}

// ---- Copy Share Deep Link ----
async function copyShareLink() {
    if (currentShareIndex === null && !currentShareTeam) return;
    const baseUrl = window.location.origin + window.location.pathname;
    let url = "";
    if (currentShareIndex !== null) {
        url = `${baseUrl}?shareMatch=${currentShareIndex}`;
    } else if (currentShareTeam) {
        url = `${baseUrl}?shareTeam=${encodeURIComponent(currentShareTeam)}`;
    }
    try {
        await navigator.clipboard.writeText(url);
        showToast("🔗 Share link copied!");
    } catch {
        showToast("Could not copy link.");
    }
}
window.copyShareLink = copyShareLink;

// Update static language content on page
function updateLanguage() {
    const t = i18n[currentLang];
    renderTimezoneOptions();
    
    // Toggle Button Text (Sync dropdown if changed elsewhere)
    const langSel = document.getElementById("langSelect");
    if(langSel) langSel.value = currentLang;
    
    // Hero Texts
    document.getElementById("heroTitle").textContent = t.title;
    document.getElementById("heroSubtitle").textContent = t.subtitle;
    document.getElementById("hostedInLabel").textContent = t.hostedIn;
    document.getElementById("btnDownloadAll").textContent = t.btnDownloadAll;
    document.getElementById("btnTeamCal").textContent = t.btnTeamCal;
    
    // Timezone Selector Header
    document.getElementById("tzLabel").textContent = t.tzLabel;
    document.getElementById("tzHelper").textContent = t.tzHelper;
    
    // Search input
    searchInput.placeholder = t.searchPlaceholder;
    
    // Tabs
    document.querySelector(".tab-btn[data-tab='all']").textContent = t.tabAll;
    document.querySelector(".tab-btn[data-tab='group']").textContent = t.tabGroup;
    document.querySelector(".tab-btn[data-tab='knockout']").textContent = t.tabKnockout;
    
    // FAQs
    document.getElementById("faqTitle").textContent = t.faqTitle;
    document.getElementById("fq1").textContent = t.q1;
    document.getElementById("fa1").textContent = t.a1;
    document.getElementById("fq2").textContent = t.q2;
    document.getElementById("fa2").textContent = t.a2;
    document.getElementById("fq3").textContent = t.q3;
    document.getElementById("fa3").textContent = t.a3;
    document.getElementById("fq4").textContent = t.q4;
    document.getElementById("fa4").textContent = t.a4;
    document.getElementById("fq5").textContent = t.q5;
    document.getElementById("fa5").textContent = t.a5;
    document.getElementById("fq6").textContent = t.q6;
    document.getElementById("fa6").textContent = t.a6;
    document.getElementById("fq7").textContent = t.q7;
    document.getElementById("fa7").textContent = t.a7;
    document.getElementById("fq8").textContent = t.q8;
    document.getElementById("fa8").textContent = t.a8;
    document.getElementById("fq9").textContent = t.q9;
    document.getElementById("fa9").textContent = t.a9;
    document.getElementById("fq10").textContent = t.q10;
    document.getElementById("fa10").textContent = t.a10;

    // Subscribe
    const subTitle = document.getElementById("subscribeTitle");
    if (subTitle) {
        subTitle.textContent = t.subscribeTitle;
        document.getElementById("subscribeDesc").textContent = t.subscribeDesc;
        document.getElementById("subscribeBtn").textContent = t.subscribeBtn;
        
        const emailInput = document.getElementById("emailInput");
        if(emailInput) emailInput.placeholder = t.emailPlaceholder;
    }

    // Share Modal Buttons
    const st = shareI18n[currentLang];
    const btnCopyImage = document.getElementById("btnCopyImg");
    if(btnCopyImage) btnCopyImage.textContent = st.shareCopyImg;
    const btnDownloadImage = document.getElementById("btnDownloadImg");
    if(btnDownloadImage) btnDownloadImage.textContent = st.shareSaveImg;
    const btnShareTwitter = document.getElementById("btnShareTwitter");
    if(btnShareTwitter) btnShareTwitter.textContent = st.shareTwitter;
    const btnCopyLink = document.getElementById("btnCopyLink");
    if(btnCopyLink) btnCopyLink.textContent = st.shareCopyLink;
    const btnCopyTextModal = document.getElementById("btnCopyText");
    if(btnCopyTextModal) btnCopyTextModal.textContent = st.shareCopyText;

    // Tournament Selector Options
    const tournSelect = document.getElementById("tournamentSelect");
    if (tournSelect && tournSelect.options.length > 0) {
        tournSelect.options[0].text = t.optWc;
        if(tournSelect.options.length > 1) tournSelect.options[1].text = t.optPl;
    }

    // Footer
    document.getElementById("disclaimerText").textContent = t.disclaimer;
}

// Initialize Accordion
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach(item => {
    const q = item.querySelector(".faq-question");
    q.addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        faqItems.forEach(i => i.classList.remove("active"));
        if (!isActive) {
            item.classList.add("active");
        }
    });
});

// =============================================
// API: Fetch live match data
// =============================================
async function fetchLiveData() {
    try {
        let data;
        try {
            const res = await fetch(`${API_BASE}/competitions/WC/matches`, {
                headers: { "X-Auth-Token": API_TOKEN }
            });
            if (!res.ok) throw new Error(`API error ${res.status}`);
            data = await res.json();
        } catch (apiErr) {
            console.warn("Live API failed (likely CORS). Falling back to local snapshot wc_out.json...");
            const res2 = await fetch("./wc_out.json");
            data = await res2.json();
        }

        // Build a lookup by utcDate+homeTeam to find our static match index
        data.matches.forEach(apiMatch => {
            const apiHome = apiNameMap[apiMatch.homeTeam.name] || apiMatch.homeTeam.name;
            const apiAway = apiNameMap[apiMatch.awayTeam.name] || apiMatch.awayTeam.name;
            const apiDate = apiMatch.utcDate; // ISO string

            // Find the corresponding static match
            const idx = matches.findIndex(m => {
                const apiTime = new Date(apiDate).getTime();
                const mTime = new Date(m.time_utc).getTime();
                // To avoid mapping Matchday 3 matches to Matchday 1, require date to be within 36 hours
                const within36Hours = Math.abs(mTime - apiTime) < 36 * 60 * 60 * 1000;
                const sameTeams = (m.team1 === apiHome && m.team2 === apiAway) ||
                                  (m.team1 === apiHome || m.team2 === apiAway);
                return within36Hours && sameTeams;
            });

            const target = idx >= 0 ? idx : null;
            if (target !== null) {
                liveMatchData[target] = {
                    status: apiMatch.status,           // SCHEDULED | IN_PLAY | PAUSED | FINISHED
                    homeScore: apiMatch.score?.fullTime?.home,
                    awayScore: apiMatch.score?.fullTime?.away,
                    homeTeam: apiHome,
                    awayTeam: apiAway,
                    minute: apiMatch.minute || null
                };
                // Update static match team names if API resolved them
                if (apiHome && !apiHome.match(/^[W1-4]/)) matches[target].team1 = apiHome;
                if (apiAway && !apiAway.match(/^[W1-4]/)) matches[target].team2 = apiAway;
            }
        });

        apiLoaded = true;
        console.log("✅ Live data loaded from API");
    } catch (err) {
        console.warn("⚠️ API fetch failed, using static data:", err.message);
    } finally {
        renderCountdown();
        renderTodaysBanner();
        renderMatches();
    }
}

// =============================================
// Countdown to next match
// =============================================
function renderCountdown() {
    const banner = document.getElementById("countdownBanner");
    if (!banner) return;
    const now = new Date();
    const upcoming = matches
        .filter(m => new Date(m.time_utc) > now)
        .sort((a, b) => new Date(a.time_utc) - new Date(b.time_utc));
    if (!upcoming.length) { banner.style.display = "none"; return; }
    const next = upcoming[0];
    const diff = new Date(next.time_utc) - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const t = i18n[currentLang];
    banner.innerHTML = `
        <span class="cd-label">⏱ ${t.nextMatch}:</span>
        <span class="cd-time">${h}h ${m}m ${s}s</span>
        <span class="cd-match">${getFlag(next.team1)} ${getTeamName(next.team1)} vs ${getTeamName(next.team2)} ${getFlag(next.team2)}</span>
    `;
    setTimeout(renderCountdown, 1000);
}

// =============================================
// Today's Matches Banner
// =============================================
function renderTodaysBanner() {
    const section = document.getElementById("todaySection");
    if (!section) return;
    const now = new Date();
    const todayUTC = now.toISOString().slice(0, 10);
    const todayMatches = matches.filter(m => m.time_utc && m.time_utc.startsWith(todayUTC));
    if (!todayMatches.length) { section.style.display = "none"; return; }
    const t = i18n[currentLang];
    section.style.display = "block";
    const list = todayMatches.map(m => {
        const idx = matches.indexOf(m);
        const live = liveMatchData[idx];
        const { timeStr, suffix } = formatMatchTime(m.time_utc, currentTimezone, currentLang);
        const isLiveNow = live?.status === "IN_PLAY" || live?.status === "PAUSED";
        const isDone = matchIsFinished(m, live);
        let statusBadge;
        if (isLiveNow) {
            statusBadge = `<span class="badge-live">● ${t.liveNow}</span>`;
        } else if (isDone) {
            let scoreStr = "";
            if (live && live.homeScore !== null && live.homeScore !== undefined) {
                scoreStr = ` ${live.homeScore}-${live.awayScore}`;
            } else {
                const mock = getMockScore(m.team1, m.team2);
                scoreStr = ` ${mock.home}-${mock.away}`;
            }
            statusBadge = `<span class="badge-ft">${t.finished}${scoreStr}</span>`;
        } else {
            statusBadge = `<span class="badge-time">${timeStr} ${suffix}</span>`;
        }
        const t1 = getTeamName(m.team1);
        const t2 = getTeamName(m.team2);
        return `<div class="today-card">${getFlag(m.team1)} <strong>${t1}</strong> vs <strong>${t2}</strong> ${getFlag(m.team2)} ${statusBadge}</div>`;
    }).join("");
    section.innerHTML = `<h3 class="today-title">🗓 ${t.todayTitle}</h3><div class="today-list">${list}</div>`;
}

// =============================================
// Run Initializations
// =============================================
updateLanguage();
renderMatches(); // Render immediately with static data
fetchLiveData(); // Then fetch API data and re-render
console.log("App loaded with local timezone:", currentTimezone);

// =============================================
// Deep Linking
// =============================================
function handleDeepLinking() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("shareMatch")) {
        const idx = parseInt(params.get("shareMatch"));
        if (!isNaN(idx) && matches[idx]) {
            setTimeout(() => openShareModal(idx), 500);
        }
    } else if (params.has("shareTeam")) {
        const t = params.get("shareTeam");
        if (t) {
            // Need to open team cal panel first so it builds
            toggleTeamCalPanel();
            setTimeout(() => openTeamShareModal(t), 500);
        }
    }
}
handleDeepLinking();
