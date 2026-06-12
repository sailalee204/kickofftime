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

const langToggle = document.getElementById("langToggle");
langToggle.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "es" : "en";
    localStorage.setItem("wc_lang", currentLang);
    updateLanguage();
    renderMatches();
});

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

// Generate and Download ICS File
function downloadICS(match, index) {
    const startDate = new Date(match.time_utc);
    if (isNaN(startDate.getTime())) return;
    
    // Duration: 2 hours (typical match duration)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const startStr = formatICSDate(startDate);
    const endStr = formatICSDate(endDate);
    const summary = `${getFlag(match.team1)} ${match.team1} vs ${match.team2} ${getFlag(match.team2)} - World Cup 2026`;
    const description = `FIFA World Cup 2026\\n${match.group}\\nVenue: ${match.venue}\\nConverted automatically to your timezone by WC2026Time.com`;
    const location = match.venue;

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//WC2026Time//NONSGML Calendar Converter//EN",
        "BEGIN:VEVENT",
        `UID:match-${index}-2026@worldcup2026time.com`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `match-${index+1}_${match.team1.replace(/\s+/g, '_')}_vs_${match.team2.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

    // Update stats count
    const statsLabel = document.getElementById("statsLabel");
    statsLabel.textContent = t.statsLabel.replace("{count}", filtered.length).replace("{total}", matches.length);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚽</div>
                <p>${t.emptyState}</p>
            </div>
        `;
        return;
    }

    filtered.forEach((match, idx) => {
        const originalIndex = matches.indexOf(match);
        const live = liveMatchData[originalIndex];
        const { dateStr, timeStr, suffix } = formatMatchTime(match.time_utc, currentTimezone, currentLang);
        
        const isKnockout = match.group.includes("Round") || match.group.includes("Quarter") || match.group.includes("Semi") || match.group.includes("Final") || match.group.includes("Third");
        const isHostNation = ["USA","Mexico","Canada"].includes(match.team1) || ["USA","Mexico","Canada"].includes(match.team2);
        const isLive = live?.status === "IN_PLAY" || live?.status === "PAUSED";
        const isFinished = live?.status === "FINISHED";
        const isImportant = isKnockout || isHostNation || isLive;

        let displayGroup = match.group;
        if (currentLang === "es") {
            displayGroup = displayGroup
                .replace("Group", "Grupo")
                .replace("Round of 32", "Dieciseisavos de Final")
                .replace("Round of 16", "Octavos de Final")
                .replace("Quarter-finals", "Cuartos de Final")
                .replace("Semi-finals", "Semifinales")
                .replace("Third-place play-off", "Tercer Puesto")
                .replace("Final", "Gran Final");
        }

        // Resolve team names: use API data, then knockout code parser, then raw
        const team1Display = live?.homeTeam || parseKnockoutCode(match.team1);
        const team2Display = live?.awayTeam || parseKnockoutCode(match.team2);
        const isTeam1Placeholder = /^[1-4][A-L]|^W\d|^L\d|Winner|Runner|3rd/.test(team1Display);
        const isTeam2Placeholder = /^[1-4][A-L]|^W\d|^L\d|Winner|Runner|3rd/.test(team2Display);

        // Score / Status badge
        let statusHTML = "";
        if (isLive) {
            statusHTML = `<span class="badge-live">● ${t.liveNow}</span>`;
        } else if (isFinished && live.homeScore !== null && live.homeScore !== undefined) {
            statusHTML = `<span class="badge-ft">${t.finished} &nbsp; ${live.homeScore} – ${live.awayScore}</span>`;
        }

        const card = document.createElement("div");
        card.className = `match-card ${isImportant ? 'important' : ''} ${isLive ? 'is-live' : ''} ${isFinished ? 'is-finished' : ''}`;

        // Create pre-filled share text for Twitter/X
        const shareText = encodeURIComponent(`I just converted the ${team1Display} vs ${team2Display} match to my local time (${timeStr}). Check your local World Cup kickoff time here:`);
        const shareUrl = encodeURIComponent("https://kickofftime.live/");
        const twitterLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;

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
                    <span class="team-flag">${getFlag(team1Display)}</span>
                    <span class="team-name ${isTeam1Placeholder ? 'placeholder' : ''}">${team1Display}</span>
                </div>
                <div class="team-row">
                    <span class="team-flag">${getFlag(team2Display)}</span>
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
                    <a href="${twitterLink}" target="_blank" class="share-btn">
                        🔗 Share
                    </a>
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

// Update static language content on page
function updateLanguage() {
    const t = i18n[currentLang];
    
    // Toggle Button Text
    langToggle.innerHTML = `🌐 ${currentLang === "en" ? "Español" : "English"}`;
    
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
        const statusBadge = live?.status === "IN_PLAY" || live?.status === "PAUSED"
            ? `<span class="badge-live">● ${t.liveNow}</span>`
            : live?.status === "FINISHED"
            ? `<span class="badge-ft">${t.finished} ${live.homeScore}-${live.awayScore}</span>`
            : `<span class="badge-time">${timeStr} ${suffix}</span>`;
        return `<div class="today-card">${getFlag(m.team1)} <strong>${m.team1}</strong> vs <strong>${m.team2}</strong> ${getFlag(m.team2)} ${statusBadge}</div>`;
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
