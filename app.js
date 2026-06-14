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
    if (code.startsWith("W")) return `Winner Match ${code.slice(1)}`;
    if (code.startsWith("L")) return `3rd Place Match`;
    const pos = code[0];
    const grp = code[1];
    const labels = { "1": "Winner", "2": "Runner-up", "3": "3rd Place", "4": "4th Place" };
    if (grp && grp.match(/[A-L]/)) return `${labels[pos] || pos} · Group ${grp}`;
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
        faqTitle: "Frequently Asked Questions (FAQ)",
        subscribeTitle: "Never miss a major match.",
        subscribeDesc: "Get a quick email before the Champions League Final, Super Bowl, or Olympics starts.",
        subscribeBtn: "Subscribe",
        subSuccess: "Subscribed successfully! We'll keep you updated.",
        tournAlert: "Schedules for this tournament will be available closer to the event!",
        optWc: "🏆 World Cup 2026",
        optUcl: "⚽ UEFA Champions League (Soon)",
        optNba: "🏀 NBA Finals (Soon)",
        optLa: "🏅 LA 2028 Olympics (Soon)",
        q1: "Will the matches automatically adjust to my local time?",
        a1: "Yes! The site detects your browser's local timezone automatically and translates every match kickoff to your exact local time.",
        q2: "Can I manually select a different timezone?",
        a2: "Absolutely. Use the timezone dropdown at the top to select any major city or UTC. Your choice will be saved for your next visit.",
        q3: "How do I add matches to my personal calendar?",
        a3: "Click the 'Add to Cal' button on any match card. It will download a standard .ics calendar file that you can import directly into Google Calendar, Apple Calendar, or Microsoft Outlook.",
        q4: "When does the FIFA World Cup 2026 start?",
        a4: "The opening match kicks off on Thursday, June 11, 2026 at the Estadio Azteca in Mexico City.",
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
        faqTitle: "Preguntas Frecuentes (FAQ)",
        subscribeTitle: "No te pierdas ningún partidazo.",
        subscribeDesc: "Recibe un email rápido antes de que empiece la final de la Champions, la Super Bowl o los Juegos Olímpicos.",
        subscribeBtn: "Suscribirse",
        subSuccess: "¡Suscrito con éxito! Te mantendremos informado.",
        tournAlert: "¡Los horarios para este torneo estarán disponibles más cerca de la fecha!",
        optWc: "🏆 Copa Mundial 2026",
        optUcl: "⚽ UEFA Champions League (Pronto)",
        optNba: "🏀 Finales de la NBA (Pronto)",
        optLa: "🏅 Juegos Olímpicos LA 2028 (Pronto)",
        q1: "¿Se ajustarán automáticamente los partidos a mi hora local?",
        a1: "¡Sí! El sitio detecta automáticamente la zona horaria de tu navegador y traduce cada inicio de partido a tu hora local exacta.",
        q2: "¿Puedo seleccionar manualmente una zona horaria diferente?",
        a2: "Totalmente. Utiliza el selector de zona horaria en la parte superior para seleccionar cualquier ciudad principal o UTC. Tu elección se guardará.",
        q3: "¿Cómo agrego partidos a mi calendario personal?",
        a3: "Haz clic en el botón 'Añadir a Cal' en cualquier tarjeta de partido. Descargará un archivo de calendario estándar .ics que puedes importar directamente en Google Calendar, Apple Calendar u Outlook.",
        q4: "¿Cuándo comienza la Copa Mundial de la FIFA 2026?",
        a4: "El partido inaugural se jugará el jueves 11 de junio de 2026 en el Estadio Azteca en la Ciudad de México.",
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
        faqTitle: "Perguntas Frequentes (FAQ)",
        subscribeTitle: "Nunca perca uma partida importante.",
        subscribeDesc: "Receba um e-mail antes de começar.",
        subscribeBtn: "Inscrever-se",
        subSuccess: "Inscrito com sucesso!",
        tournAlert: "Os horários para este torneio estarão disponíveis em breve!",
        optWc: "🏆 Copa do Mundo 2026",
        optUcl: "⚽ UEFA Champions League",
        optNba: "🏀 Finais da NBA",
        optLa: "🏅 Olimpíadas LA 2028",
        q1: "As partidas se ajustarão automaticamente?",
        a1: "Sim! O site detecta automaticamente seu fuso horário.",
        q2: "Posso selecionar manualmente?",
        a2: "Sim, use o menu suspenso.",
        q3: "Como adiciono ao calendário?",
        a3: "Clique no botão Adicionar ao Cal.",
        q4: "Quando começa a Copa do Mundo 2026?",
        a4: "A partida de abertura será em 11 de junho de 2026.",
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
        faqTitle: "Foire Aux Questions (FAQ)",
        subscribeTitle: "Ne manquez jamais un match important.",
        subscribeDesc: "Recevez un e-mail rapide avant le début.",
        subscribeBtn: "S'abonner",
        subSuccess: "Abonnement réussi !",
        tournAlert: "Bientôt disponible !",
        optWc: "🏆 Coupe du Monde 2026",
        optUcl: "⚽ UEFA Champions League",
        optNba: "🏀 Finales NBA",
        optLa: "🏅 JO LA 2028",
        q1: "Les matchs s'ajustent-ils ?",
        a1: "Oui, automatiquement.",
        q2: "Puis-je changer de fuseau ?",
        a2: "Absolument.",
        q3: "Comment ajouter au calendrier ?",
        a3: "Cliquez sur Ajouter au Cal.",
        q4: "Quand commence la Coupe ?",
        a4: "Le 11 juin 2026.",
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
        faqTitle: "الأسئلة الشائعة",
        subscribeTitle: "لا تفوت أي مباراة.",
        subscribeDesc: "احصل على بريد إلكتروني قبل البدء.",
        subscribeBtn: "اشتراك",
        subSuccess: "تم الاشتراك!",
        tournAlert: "قريباً!",
        optWc: "🏆 كأس العالم 2026",
        optUcl: "⚽ دوري أبطال أوروبا",
        optNba: "🏀 نهائيات الدوري الاميركي للمحترفين",
        optLa: "🏅 أولمبياد لوس أنجلوس 2028",
        q1: "هل تتكيف المباريات تلقائياً؟",
        a1: "نعم!",
        q2: "هل يمكنني اختيار منطقة مختلفة؟",
        a2: "بالتأكيد.",
        q3: "كيف أضيف للتقويم؟",
        a3: "اضغط إضافة للتقويم.",
        q4: "متى يبدأ كأس العالم؟",
        a4: "11 يونيو 2026.",
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
        faqTitle: "常见问题 (FAQ)",
        subscribeTitle: "永远不错过重磅对决。",
        subscribeDesc: "在关键赛事开始前获取一封邮件提醒。",
        subscribeBtn: "订阅",
        subSuccess: "订阅成功！我们会保持联系。",
        tournAlert: "其他赛事的赛程将在临近时公布！",
        optWc: "🏆 2026 世界杯",
        optUcl: "⚽ 欧冠联赛 (即将推出)",
        optNba: "🏀 NBA 总决赛 (即将推出)",
        optLa: "🏅 2028 洛杉矶奥运会 (即将推出)",
        q1: "时间会自动转换为我的本地时间吗？",
        a1: "是的！网站会自动检测您浏览器的时区。",
        q2: "我可以手动切换时区吗？",
        a2: "可以，请使用顶部的下拉菜单。",
        q3: "如何添加到我的日历？",
        a3: "点击卡片上的‘加入日历’按钮即可下载 ICS 文件。",
        q4: "2026世界杯什么时候开始？",
        a4: "揭幕战将于2026年6月11日在墨西哥城阿兹特克体育场打响。",
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
majorTimezones.forEach(tz => {
    const opt = document.createElement("option");
    opt.value = tz;
    opt.textContent = tz.replace(/_/g, " ");
    if (tz === currentTimezone) {
        opt.selected = true;
    }
    tzSelect.appendChild(opt);
});

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
            // Visual feedback
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "...";
            submitBtn.disabled = true;

            try {
                // ==========================================
                // 💡 HOW TO SAVE EMAILS WITH FORMINIT
                // 1. In Forminit, create a new form and copy the "Endpoint URL"
                // 2. Paste that URL exactly between the quotes below:
                // ==========================================
                // ==========================================
                const WEBHOOK_URL = "https://forminit.com/f/6sqwnyffda0";
                
                // If you haven't pasted the URL yet, skip the fetch
                if (WEBHOOK_URL !== "YOUR_FORMINIT_ENDPOINT_URL_HERE") {
                    const formData = new FormData();
                    formData.append("fi-sender-email", email);
                    formData.append("fi-text-timezone", currentTimezone);
                    formData.append("fi-text-source", "KickoffTime Website");

                    const res = await fetch(WEBHOOK_URL, {
                        method: "POST",
                        body: formData,
                        headers: {
                            "Accept": "application/json"
                        }
                    });
                    
                    if (!res.ok) {
                        const errText = await res.text();
                        throw new Error(`Server returned ${res.status}: ${errText}`);
                    }
                } else {
                    // Simulated delay for UI realism before they hook up the real URL
                    await new Promise(r => setTimeout(r, 500));
                }

                showToast(i18n[currentLang].subSuccess);
                subscribeForm.reset();
            } catch (error) {
                console.error("Subscription error:", error);
                showToast("Error saving email. Please try again.");
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
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

    const formatterDate = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-US", dateOptions);
    const formatterTime = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-US", timeOptions);

    let dateStr = formatterDate.format(date);
    let timeStr = formatterTime.format(date);

    // Capitalize first letter of localized date
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    // Extract AM/PM
    let suffix = "";
    if (timeStr.toLowerCase().includes("am")) {
        suffix = "AM";
        timeStr = timeStr.replace(/ am/i, "");
    } else if (timeStr.toLowerCase().includes("pm")) {
        suffix = "PM";
        timeStr = timeStr.replace(/ pm/i, "");
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
    const description = `FIFA World Cup 2026\\n${match.group}\\nVenue: ${match.venue}\\nConverted to your timezone by kickofftime.live`;

    return [
        "BEGIN:VEVENT",
        `UID:match-${index}-2026@kickofftime.live`,
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
        shareBtn.title = "Share Team Matches";
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
        statsText += ` · ${upcomingCount} upcoming · ${finishedCount} finished`;
    } else if (finishedCount > 0) {
        statsText += ` · ${finishedCount} finished`;
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
                statusHTML = `<span class="badge-ft">${t.finished}</span>`;
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
                        ${isFinished ? '<span style="font-size:0.9rem;color:var(--text-muted)">Match ended</span>' : `${timeStr}${suffix ? `<span class="time-suffix">${suffix}</span>` : ''}`}
                    </div>
                    <div class="match-venue">📍 ${match.venue}</div>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.4rem; align-items:flex-end;">
                    <button class="add-calendar-btn" onclick="triggerICS(${originalIndex})">
                        📅 ${t.addToCalendar}
                    </button>
                    <button class="share-btn" onclick="openShareModal(${originalIndex})">
                        🎨 Share
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
    const team1 = live?.homeTeam || parseKnockoutCode(match.team1);
    const team2 = live?.awayTeam || parseKnockoutCode(match.team2);
    const { dateStr, timeStr, suffix } = formatMatchTime(match.time_utc, currentTimezone, currentLang);

    // Update modal title
    document.getElementById("shareModalTitle").textContent = `🎨 Share: ${team1} vs ${team2}`;

    // Update Twitter link
    const tweetText = encodeURIComponent(
        `🏆 ${team1} vs ${team2} — World Cup 2026\n` +
        `⏰ Kickoff: ${timeStr} ${suffix} (${dateStr})\n` +
        `Check your local time → kickofftime.live`
    );
    document.getElementById("btnShareTwitter").href =
        `https://twitter.com/intent/tweet?text=${tweetText}`;

    // Store share text for copy
    document.getElementById("btnCopyText").dataset.text =
        `🏆 ${team1} vs ${team2} — FIFA World Cup 2026\n` +
        `⏰ My local kickoff: ${timeStr} ${suffix} (${dateStr})\n` +
        `📅 ${match.venue}\n` +
        `🌐 See your local time → https://kickofftime.live`;

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
    ctx.fillText(`📍 ${match.venue}`, W / 2, 338);

    // --- Timezone label ---
    ctx.font = "13px 'Inter', sans-serif";
    ctx.fillStyle = "hsla(45,85%,58%,0.8)";
    ctx.fillText(`Your time: ${currentTimezone.replace(/_/g, " ")}`, W / 2, 364);

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
    ctx.fillText("kickofftime.live", W - 28, H - 17);
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
    
    link.click();
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
    
    // Update modal title
    document.getElementById("shareModalTitle").textContent = `🎨 Share: ${teamName} Schedule`;
    
    // Update Twitter link
    const tweetText = encodeURIComponent(
        `🏆 Follow ${teamName} at the World Cup 2026!\n` +
        `Check their full match schedule in your local time → kickofftime.live`
    );
    document.getElementById("btnShareTwitter").href = `https://twitter.com/intent/tweet?text=${tweetText}`;
    
    document.getElementById("btnCopyText").dataset.text = 
        `🏆 ${teamName} — FIFA World Cup 2026 Schedule\n` +
        `🌐 See all matches in your local time → https://kickofftime.live`;
        
    renderTeamShareCanvas(teamName);
    document.getElementById("shareModalOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
}
window.openTeamShareModal = openTeamShareModal;

// ---- Team Share Canvas Renderer ----
function renderTeamShareCanvas(teamName) {
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
    ctx.fillText(`${teamName} Schedule`, W / 2, 60);

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
        const vsText = `${m.team1} vs ${m.team2}`;
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
    ctx.fillText(`Your local time: ${currentTimezone.replace(/_/g, " ")}`, W / 2, y + 10);

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
    ctx.fillText("kickofftime.live", W - 28, H - 17);
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
    
    // Toggle Button Text (Sync dropdown if changed elsewhere)
    const langSel = document.getElementById("langSelect");
    if(langSel) langSel.value = currentLang;
    
    // Hero Texts
    document.getElementById("heroTitle").textContent = t.title;
    document.getElementById("heroSubtitle").textContent = t.subtitle;
    document.getElementById("hostedInLabel").textContent = t.hostedIn;
    
    // Timezone Selector Header
    document.getElementById("tzLabel").textContent = t.tzLabel;
    
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

    // Subscribe
    const subTitle = document.getElementById("subscribeTitle");
    if (subTitle) {
        subTitle.textContent = t.subscribeTitle;
        document.getElementById("subscribeDesc").textContent = t.subscribeDesc;
        document.getElementById("subscribeBtn").textContent = t.subscribeBtn;
    }

    // Tournament Selector Options
    const tournSelect = document.getElementById("tournamentSelect");
    if (tournSelect && tournSelect.options.length > 0) {
        tournSelect.options[0].text = t.optWc;
        tournSelect.options[1].text = t.optUcl;
        tournSelect.options[2].text = t.optNba;
        tournSelect.options[3].text = t.optLa;
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
        <span class="cd-match">${getFlag(next.team1)} ${next.team1} vs ${next.team2} ${getFlag(next.team2)}</span>
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
            const score = (live && live.homeScore !== null && live.homeScore !== undefined)
                ? ` ${live.homeScore}-${live.awayScore}` : "";
            statusBadge = `<span class="badge-ft">${t.finished}${score}</span>`;
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
