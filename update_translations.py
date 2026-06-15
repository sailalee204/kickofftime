import json

translations = {
  'zh': {
    'Mexico': '墨西哥', 'South Africa': '南非', 'South Korea': '韩国', 'Czech Republic': '捷克',
    'Canada': '加拿大', 'Bosnia & Herzegovina': '波黑', 'USA': '美国', 'Paraguay': '巴拉圭',
    'Qatar': '卡塔尔', 'Switzerland': '瑞士', 'Brazil': '巴西', 'Morocco': '摩洛哥',
    'Haiti': '海地', 'Scotland': '苏格兰', 'Australia': '澳大利亚', 'Turkey': '土耳其',
    'Germany': '德国', 'Curaçao': '库拉索', 'Netherlands': '荷兰', 'Japan': '日本',
    'Ivory Coast': '科特迪瓦', 'Ecuador': '厄瓜多尔', 'Sweden': '瑞典', 'Tunisia': '突尼斯',
    'Spain': '西班牙', 'Cape Verde': '佛得角', 'Belgium': '比利时', 'Egypt': '埃及',
    'Saudi Arabia': '沙特阿拉伯', 'Uruguay': '乌拉圭', 'Iran': '伊朗', 'New Zealand': '新西兰',
    'France': '法国', 'Senegal': '塞内加尔', 'Iraq': '伊拉克', 'Norway': '挪威',
    'Argentina': '阿根廷', 'Algeria': '阿尔及利亚', 'Austria': '奥地利', 'Jordan': '约旦',
    'Portugal': '葡萄牙', 'DR Congo': '刚果（金）', 'England': '英格兰', 'Croatia': '克罗地亚',
    'Ghana': '加纳', 'Panama': '巴拿马', 'Uzbekistan': '乌兹别克斯坦', 'Colombia': '哥伦比亚'
  },
  'es': {
    'Mexico': 'México', 'South Africa': 'Sudáfrica', 'South Korea': 'Corea del Sur', 'Czech Republic': 'Chequia',
    'Canada': 'Canadá', 'Bosnia & Herzegovina': 'Bosnia y Herzegovina', 'USA': 'Estados Unidos', 'Paraguay': 'Paraguay',
    'Qatar': 'Catar', 'Switzerland': 'Suiza', 'Brazil': 'Brasil', 'Morocco': 'Marruecos',
    'Haiti': 'Haití', 'Scotland': 'Escocia', 'Australia': 'Australia', 'Turkey': 'Turquía',
    'Germany': 'Alemania', 'Curaçao': 'Curazao', 'Netherlands': 'Países Bajos', 'Japan': 'Japón',
    'Ivory Coast': 'Costa de Marfil', 'Ecuador': 'Ecuador', 'Sweden': 'Suecia', 'Tunisia': 'Túnez',
    'Spain': 'España', 'Cape Verde': 'Cabo Verde', 'Belgium': 'Bélgica', 'Egypt': 'Egipto',
    'Saudi Arabia': 'Arabia Saudí', 'Uruguay': 'Uruguay', 'Iran': 'Irán', 'New Zealand': 'Nueva Zelanda',
    'France': 'Francia', 'Senegal': 'Senegal', 'Iraq': 'Irak', 'Norway': 'Noruega',
    'Argentina': 'Argentina', 'Algeria': 'Argelia', 'Austria': 'Austria', 'Jordan': 'Jordania',
    'Portugal': 'Portugal', 'DR Congo': 'RD Congo', 'England': 'Inglaterra', 'Croatia': 'Croacia',
    'Ghana': 'Ghana', 'Panama': 'Panamá', 'Uzbekistan': 'Uzbekistán', 'Colombia': 'Colombia'
  },
  'pt': {
    'Mexico': 'México', 'South Africa': 'África do Sul', 'South Korea': 'Coreia do Sul', 'Czech Republic': 'Tchéquia',
    'Canada': 'Canadá', 'Bosnia & Herzegovina': 'Bósnia e Herzegovina', 'USA': 'Estados Unidos', 'Paraguay': 'Paraguai',
    'Qatar': 'Catar', 'Switzerland': 'Suíça', 'Brazil': 'Brasil', 'Morocco': 'Marrocos',
    'Haiti': 'Haiti', 'Scotland': 'Escócia', 'Australia': 'Austrália', 'Turkey': 'Turquia',
    'Germany': 'Alemanha', 'Curaçao': 'Curaçao', 'Netherlands': 'Países Baixos', 'Japan': 'Japão',
    'Ivory Coast': 'Costa do Marfim', 'Ecuador': 'Equador', 'Sweden': 'Suécia', 'Tunisia': 'Tunísia',
    'Spain': 'Espanha', 'Cape Verde': 'Cabo Verde', 'Belgium': 'Bélgica', 'Egypt': 'Egito',
    'Saudi Arabia': 'Arábia Saudita', 'Uruguay': 'Uruguai', 'Iran': 'Irã', 'New Zealand': 'Nova Zelândia',
    'France': 'França', 'Senegal': 'Senegal', 'Iraq': 'Iraque', 'Norway': 'Noruega',
    'Argentina': 'Argentina', 'Algeria': 'Argélia', 'Austria': 'Áustria', 'Jordan': 'Jordânia',
    'Portugal': 'Portugal', 'DR Congo': 'RD Congo', 'England': 'Inglaterra', 'Croatia': 'Croácia',
    'Ghana': 'Gana', 'Panama': 'Panamá', 'Uzbekistan': 'Uzbequistão', 'Colombia': 'Colômbia'
  },
  'fr': {
    'Mexico': 'Mexique', 'South Africa': 'Afrique du Sud', 'South Korea': 'Corée du Sud', 'Czech Republic': 'Tchéquie',
    'Canada': 'Canada', 'Bosnia & Herzegovina': 'Bosnie-Herzégovine', 'USA': 'États-Unis', 'Paraguay': 'Paraguay',
    'Qatar': 'Qatar', 'Switzerland': 'Suisse', 'Brazil': 'Brésil', 'Morocco': 'Maroc',
    'Haiti': 'Haïti', 'Scotland': 'Écosse', 'Australia': 'Australie', 'Turkey': 'Turquie',
    'Germany': 'Allemagne', 'Curaçao': 'Curaçao', 'Netherlands': 'Pays-Bas', 'Japan': 'Japon',
    'Ivory Coast': 'Côte d’Ivoire', 'Ecuador': 'Équateur', 'Sweden': 'Suède', 'Tunisia': 'Tunisie',
    'Spain': 'Espagne', 'Cape Verde': 'Cap-Vert', 'Belgium': 'Belgique', 'Egypt': 'Égypte',
    'Saudi Arabia': 'Arabie saoudite', 'Uruguay': 'Uruguay', 'Iran': 'Iran', 'New Zealand': 'Nouvelle-Zélande',
    'France': 'France', 'Senegal': 'Sénégal', 'Iraq': 'Irak', 'Norway': 'Norvège',
    'Argentina': 'Argentine', 'Algeria': 'Algérie', 'Austria': 'Autriche', 'Jordan': 'Jordanie',
    'Portugal': 'Portugal', 'DR Congo': 'RD Congo', 'England': 'Angleterre', 'Croatia': 'Croatie',
    'Ghana': 'Ghana', 'Panama': 'Panamá', 'Uzbekistan': 'Ouzbékistan', 'Colombia': 'Colombie'
  },
  'ar': {
    'Mexico': 'المكسيك', 'South Africa': 'جنوب أفريقيا', 'South Korea': 'كوريا الجنوبية', 'Czech Republic': 'التشيك',
    'Canada': 'كندا', 'Bosnia & Herzegovina': 'البوسنة والهرسك', 'USA': 'الولايات المتحدة', 'Paraguay': 'باراغواي',
    'Qatar': 'قطر', 'Switzerland': 'سويسرا', 'Brazil': 'البرازيل', 'Morocco': 'المغرب',
    'Haiti': 'هايتي', 'Scotland': 'اسكتلندا', 'Australia': 'أستراليا', 'Turkey': 'تركيا',
    'Germany': 'ألمانيا', 'Curaçao': 'كوراساو', 'Netherlands': 'هولندا', 'Japan': 'اليابان',
    'Ivory Coast': 'ساحل العاج', 'Ecuador': 'الإكوادور', 'Sweden': 'السويد', 'Tunisia': 'تونس',
    'Spain': 'إسبانيا', 'Cape Verde': 'الرأس الأخضر', 'Belgium': 'بلجيكا', 'Egypt': 'مصر',
    'Saudi Arabia': 'السعودية', 'Uruguay': 'أورغواي', 'Iran': 'إيران', 'New Zealand': 'نيوزيلندا',
    'France': 'فرنسا', 'Senegal': 'السنغال', 'Iraq': 'العراق', 'Norway': 'النرويج',
    'Argentina': 'الأرجنتين', 'Algeria': 'الجزائر', 'Austria': 'النمسا', 'Jordan': 'الأردن',
    'Portugal': 'البرتغال', 'DR Congo': 'الكونغو', 'England': 'إنجلترا', 'Croatia': 'كرواتيا',
    'Ghana': 'غانا', 'Panama': 'بنما', 'Uzbekistan': 'أوزبكستان', 'Colombia': 'كولومبيا'
  }
}

with open('app.js', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Inject teamTranslations
inject = 'const teamTranslations = ' + json.dumps(translations, indent=2, ensure_ascii=False) + ';\n'
inject += """function getTeamName(englishName) {
    if (currentLang === "en") return englishName;
    if (teamTranslations[currentLang] && teamTranslations[currentLang][englishName]) {
        return teamTranslations[currentLang][englishName];
    }
    return englishName;
}\n"""

if 'const teamTranslations' not in c:
    c = c.replace('// Translations Data\nconst i18n = {', inject + '\n// Translations Data\nconst i18n = {')

# 2. Fix empty badge for finished matches without score
old_badge = """        } else if (isFinished && live && live.homeScore !== null && live.homeScore !== undefined) {
            statusHTML = `<span class="badge-ft">${t.finished} &nbsp; ${live.homeScore} – ${live.awayScore}</span>`;
        }"""
new_badge = """        } else if (isFinished) {
            if (live && live.homeScore !== null && live.homeScore !== undefined) {
                statusHTML = `<span class="badge-ft">${t.finished} &nbsp; ${live.homeScore} – ${live.awayScore}</span>`;
            } else {
                statusHTML = `<span class="badge-ft">${t.finished}</span>`;
            }
        }"""
if old_badge in c:
    c = c.replace(old_badge, new_badge)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Injections successful.")
