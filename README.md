# 🎙️ NutriVoice AI

KI-basierter Kalorienzähler per Sprache – ersetzt Yazio mit echter AI.

## Features

### 🎙️ Voice-First
- Einfach sprechen: *"Ich hab 2 Caesar Wraps gegessen"* → automatisch eingetragen
- Web Speech API (Browser) + Expo Speech (Mobile)
- Texteingabe als Alternative

### 🤖 KI-Features (Claude Sonnet 4)
- Lebensmittelerkennung per Sprache/Text
- Portionsschätzung mit Confidence-Score (✅ verifiziert / ⚠️ Schätzung)
- KI-Ernährungsberater-Chat mit Tageskontext
- Kontextbezogene Mahlzeitenempfehlungen

### 📊 Wissenschaftliche Berechnungen
- **Grundumsatz**: Mifflin-St-Jeor Formel (1990) — genauer als Harris-Benedict
- **Gesamtumsatz**: PAL-Wert nach ACSM-Richtlinien
- **Zunehmen**: max. 1 kg/Woche, +300–500 kcal Überschuss empfohlen
- **Abnehmen**: max. 750 kcal Defizit, Minimum 1.200/1.500 kcal
- **Protein**: 1,6–2,4g/kg nach Morton et al. (2018) & Helms et al. (2014)

### 📈 Tracking
- Kalorienring mit Tagesfortschritt
- Makro-Tracking (Protein / Kohlenhydrate / Fett)
- Wassertracking
- Gewichtsverlauf mit Grafik
- Ziel-Prognose

## Schnellstart

```bash
# 1. Dependencies installieren
bash setup.sh

# 2. Web-App starten
cd apps/web
npm run dev
# Öffne http://localhost:3000

# 3. Mobile starten (optional)
cd apps/mobile
npx expo start
```

## Anthropic API Key

Du brauchst einen API Key von [console.anthropic.com](https://console.anthropic.com).

Den Key trägst du beim ersten App-Start ein. Er wird nur lokal gespeichert.

**Ohne API Key:** Manuelles Tracking, Kalorienpläne und Berechnungen funktionieren trotzdem.

## Struktur

```
nutrivoice/
├── apps/
│   ├── web/          # Next.js 14 Web-App
│   │   ├── app/
│   │   │   ├── api/parse-food/  # Voice/Text → Nährwerte
│   │   │   ├── api/chat/        # KI-Chat API
│   │   │   └── page.tsx         # Hauptseite
│   │   ├── components/
│   │   │   ├── Dashboard.tsx    # Home-Screen
│   │   │   ├── VoiceInput.tsx   # Spracheingabe
│   │   │   ├── ChatView.tsx     # KI-Chat
│   │   │   ├── PlanView.tsx     # Ernährungsplan
│   │   │   ├── ProfileView.tsx  # Einstellungen
│   │   │   └── Onboarding.tsx   # Ersteinrichtung
│   │   └── lib/
│   │       ├── nutrition.ts     # Alle Berechnungen
│   │       └── store.ts         # Globaler State
│   └── mobile/       # Expo React Native App
├── packages/
│   └── shared/       # Gemeinsame Logik
└── setup.sh          # Setup-Script
```

## Tech Stack

| Layer | Technologie |
|-------|-------------|
| Web | Next.js 14, React, TypeScript |
| Mobile | Expo, React Native |
| Styling | Tailwind CSS, NativeWind |
| State | Zustand (persistent) |
| KI | Anthropic Claude Sonnet 4 |
| Charts | Recharts (Web) |
| Voice | Web Speech API / Expo Speech |

## Wissenschaftliche Quellen

- **BMR**: Mifflin MD et al. (1990). "A new predictive equation for resting energy expenditure in healthy individuals." *Am J Clin Nutr*
- **Protein**: Morton RW et al. (2018). "A systematic review, meta-analysis and meta-regression of protein supplementation." *Br J Sports Med*
- **Protein beim Abnehmen**: Helms ER et al. (2014). "Evidence-based recommendations for natural bodybuilding contest preparation." *J Int Soc Sports Nutr*
- **PAL-Werte**: American College of Sports Medicine Guidelines

## Disclaimer

Diese App ersetzt keine professionelle Ernährungsberatung. Bei gesundheitlichen Fragen wende dich an einen Arzt oder Ernährungsberater.
