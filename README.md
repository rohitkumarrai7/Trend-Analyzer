# TrendMap — Social Media Trend & Hate Speech Monitoring Platform

A real-time social media trend visualization and hate speech monitoring platform built with Next.js 16, React 19, and Leaflet. Designed as a SaaS tool for tracking harmful content campaigns across Twitter/X, with geographic heatmaps, AI-powered content analysis, and demographic insights.

## What It Does

TrendMap monitors Twitter/X trends across 70+ cities worldwide and provides tools to:

- **Visualize trends geographically** on an interactive dark-themed map with color-coded markers
- **Track hate speech campaigns** using keyword-based + AI-powered detection
- **Analyze content** with a dual-layer system: fast local keyword matching + OpenRouter LLM classification
- **Estimate audience demographics** (age brackets) from public Twitter profile bios
- **Generate alerts** when hate speech thresholds are crossed in monitored locations
- **Show real-time analytics** with category distribution, sentiment analysis, and volume charts

## Use Case

Many communities face targeted harassment and racism on social media. TrendMap helps **NGOs, researchers, journalists, and community organizations** to:

1. **Create monitoring campaigns** — define keywords (e.g., "racist", "hate", slurs) and locations to watch
2. **Detect hate speech** — AI classifies flagged content by category (racial, religious, gender, xenophobic) with severity scores
3. **Identify hotspots** — see which cities/regions have the highest concentration of harmful content
4. **Understand demographics** — estimate the age distribution of users participating in harmful trends
5. **Get alerts** — automated alerts when hate speech volume crosses configurable thresholds

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16.1.3 (App Router, Turbopack) | Full-stack React framework with server-side API routes |
| **Frontend** | React 19.2.3, TypeScript 5.9 | UI with strict type safety |
| **Styling** | Tailwind CSS 3.3, Framer Motion 12 | Dark-themed UI with smooth animations |
| **Maps** | Leaflet 1.9 + React Leaflet 5.0 | Interactive geographic visualization with CartoDB Dark Matter tiles |
| **Charts** | Recharts 3.6 | Pie charts, bar charts, area charts for analytics |
| **State** | Zustand 4.5 | Lightweight global state management |
| **UI Components** | Radix UI, Lucide React, CVA | Accessible components, icons, variant styling |
| **LLM** | OpenRouter API (arcee-ai/trinity-large-preview:free) | Free AI-powered hate speech classification |
| **Twitter API** | Twitter/X API v2 | Real-time trend data (requires Basic tier+) |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│
│  │ TrendMap  │ │Analytics │ │Campaigns │ │Audience ││
│  │ (Leaflet) │ │(Recharts)│ │  (CRUD)  │ │(Demographics)│
│  └─────┬────┘ └────┬─────┘ └────┬─────┘ └────┬────┘│
│        │           │            │              │     │
│  ┌─────┴───────────┴────────────┴──────────────┴───┐│
│  │              Zustand Store                       ││
│  │  trends, stats, campaigns, hateSpeechStats,      ││
│  │  dataMode, apiTier, selectedLocation             ││
│  └──────────────────────┬──────────────────────────┘│
└─────────────────────────┼───────────────────────────┘
                          │ fetch()
┌─────────────────────────┼───────────────────────────┐
│                   API Routes (Server)                │
│  ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────────┐ │
│  │/api/trends│ │/api/   │ │/api/   │ │/api/analyze│ │
│  │          │ │campaigns│ │search  │ │(dictionary │ │
│  │ Twitter  │ │ (CRUD) │ │(tweet  │ │  + LLM)    │ │
│  │ v2 API   │ │        │ │ proxy) │ │            │ │
│  └────┬─────┘ └───┬────┘ └───┬────┘ └─────┬──────┘ │
│       │           │          │             │        │
│  ┌────┴───┐  ┌────┴────┐ ┌──┴───┐  ┌──────┴──────┐ │
│  │Twitter │  │Campaign │ │Twitter│  │ OpenRouter  │ │
│  │API v2  │  │  Store  │ │API v2 │  │ (Free LLM) │ │
│  └────────┘  └─────────┘ └──────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── trends/route.ts        # Twitter v2 trends proxy + simulation fallback
│   │   ├── status/route.ts        # API health check (tier, capabilities, LLM)
│   │   ├── search/route.ts        # Tweet search proxy for campaigns
│   │   ├── campaigns/route.ts     # Campaign CRUD endpoints
│   │   └── analyze/route.ts       # Hate speech analysis (dictionary + LLM)
│   ├── dashboard/
│   │   ├── layout.tsx             # Dashboard shell (sidebar + header)
│   │   ├── page.tsx               # Main dashboard (stats + map + trends)
│   │   ├── analytics/page.tsx     # Category, sentiment, volume charts
│   │   ├── campaigns/page.tsx     # Campaign management + detail view
│   │   ├── audience/page.tsx      # Demographics + sentiment insights
│   │   ├── alerts/page.tsx        # Dynamic alerts from campaigns + system
│   │   └── settings/page.tsx      # API config, LLM status, tier display
│   ├── layout.tsx                 # Root layout (dark mode, fonts, meta)
│   ├── page.tsx                   # Landing page (hero + features)
│   └── globals.css                # Tailwind base + custom styles
├── components/
│   ├── dashboard/
│   │   ├── AnalyticsView.tsx      # Charts: category, sentiment, volume, hate speech
│   │   ├── ApiKeyDialog.tsx       # Twitter API key input modal
│   │   ├── CampaignCreateDialog.tsx # Campaign creation form
│   │   ├── CampaignDetailView.tsx # Campaign drill-down with charts + flagged tweets
│   │   ├── HateSpeechMetrics.tsx  # Reusable hate speech score/category display
│   │   ├── Header.tsx             # Top bar with search + API status
│   │   ├── LocationInitializer.tsx # Browser geolocation auto-detection
│   │   ├── Sidebar.tsx            # Navigation sidebar with 7 menu items
│   │   ├── StatsCards.tsx         # 5-card metrics grid
│   │   └── TrendList.tsx          # Scrollable trend list with filters
│   ├── landing/
│   │   ├── Hero.tsx               # Landing page hero with map preview
│   │   ├── Features.tsx           # Feature cards section
│   │   └── Footer.tsx             # Landing page footer
│   ├── map/
│   │   ├── TrendMap.tsx           # Leaflet map with category markers + data badge
│   │   └── LocationSearch.tsx     # City search + quick selector
│   └── ui/
│       ├── badge.tsx              # Badge with category variants (incl. hate_speech)
│       ├── button.tsx             # Button component (CVA variants)
│       ├── card.tsx               # Card with glass/glow variants
│       └── input.tsx              # Input component
├── lib/
│   ├── api.ts                     # Trend fetching, categories, stats calculation
│   ├── config.ts                  # Server-side env config (Twitter tier, LLM)
│   ├── store.ts                   # Zustand store (trends, campaigns, hate speech)
│   ├── locations.ts               # 70+ cities with WOEID, coordinates, population
│   ├── simulation.ts              # Deterministic trend + campaign data simulation
│   ├── campaign-store.ts          # In-memory campaign CRUD store
│   ├── utils.ts                   # cn() utility for className merging
│   ├── types/
│   │   └── campaign.ts            # Campaign, FlaggedTweet, CampaignSnapshot types
│   ├── hate-speech/
│   │   ├── dictionary.ts          # Keyword-based hate speech detection
│   │   └── llm-analyzer.ts        # OpenRouter/OpenAI/Anthropic LLM integration
│   └── demographics/
│       └── age-estimator.ts       # Bio-based age bracket estimation
├── .env.local                     # Real API keys (gitignored, never committed)
├── .env.example                   # Template for env vars
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind theme + custom utilities
├── tsconfig.json                  # TypeScript strict mode config
└── package.json                   # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd trend-anlyzer-feature-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys
```

### Environment Variables

Edit `.env.local` with your keys:

```env
# Twitter/X API (get from https://developer.twitter.com/en/portal/dashboard)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_API_TIER=free              # free | basic | pro

# LLM for AI hate speech analysis (get from https://openrouter.ai/keys)
LLM_PROVIDER=openrouter            # none | openrouter | openai | anthropic
LLM_API_KEY=your_openrouter_api_key
LLM_MODEL=arcee-ai/trinity-large-preview:free
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Features in Detail

### Interactive Trend Map

- Dark-themed CartoDB map tiles with category-colored pulsing markers
- Marker size scales logarithmically with tweet volume
- Click markers for detailed popup: hashtag, volume, sentiment, category, external link
- Auto-flies to selected location with smooth easing animation
- **SIMULATION / LIVE DATA** badge shows current data source
- 30-second auto-refresh cycle

### Campaign Monitoring

- Create campaigns with custom keywords, hashtags, and monitored locations
- View campaign detail: hate speech category breakdown, location hotspots, age demographics
- Flagged tweets list with severity badges and engagement metrics
- Pause/resume/delete campaigns
- Configurable alert thresholds (matches per hour)

### Hate Speech Detection (Dual-Layer)

| Layer | How It Works | Cost |
|-------|-------------|------|
| **Dictionary** | Regex pattern matching against categorized keyword database (racial, religious, gender, xenophobic, disability) | Free, instant |
| **LLM** | OpenRouter API sends text to arcee-ai/trinity-large-preview model for nuanced classification with confidence scores | Free (preview model) |

The `/api/analyze` endpoint runs both layers and returns a combined result:
```json
{
  "score": 0.95,
  "isHateSpeech": true,
  "categories": ["xenophobic"],
  "severity": "high",
  "dictionaryMatches": [...],
  "llmAnalysis": {
    "confidence": 0.95,
    "explanation": "Contains xenophobic language..."
  }
}
```

### Age Demographics Estimation

Since Twitter doesn't expose user age, the system estimates age brackets from public profile bios by detecting:

- Direct age mentions ("19 y/o", "born in 2001")
- Generational markers (gen-z slang, millennial references)
- Career stage signals (student, junior dev, senior manager, retired)
- Parent references ("mom of 2", "dad to 3 kids")

Results are aggregated into brackets: 13-17, 18-24, 25-34, 35-44, 45-54, 55+

### Trend Categories

| Category | Color | Detection Pattern |
|----------|-------|-------------------|
| Emergency | Red | emergency, accident, fire, alert, police, crime |
| Politics | Amber | election, government, parliament, policy, budget |
| Environment | Green | pollution, climate, weather, aqi, sustainability |
| Entertainment | Purple | movie, film, music, bollywood, streaming |
| Sports | Cyan | cricket, ipl, football, championship, finals |
| Technology | Blue | tech, startup, ai, digital, innovation |
| Hate Speech | Orange | hate, racist, racism, bigot, discrimination |
| Other | Gray | everything else |

### Supported Locations

70+ cities across 6 continents with Twitter WOEID mapping:

- **India**: Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow, Surat
- **USA**: New York, Los Angeles, Chicago, Houston, San Francisco, Seattle, Miami, Boston, Washington DC
- **Europe**: London, Manchester, Paris, Berlin, Madrid, Rome, Amsterdam
- **Asia-Pacific**: Tokyo, Osaka, Singapore, Hong Kong, Seoul, Sydney, Melbourne, Dubai
- **South America**: Sao Paulo, Rio de Janeiro, Buenos Aires, Mexico City
- **Africa**: Johannesburg, Cairo, Lagos, Nairobi

## Twitter API Tiers

| Feature | Free ($0) | Basic ($100/mo) | Pro ($5,000/mo) |
|---------|-----------|-----------------|-----------------|
| Trend data | Simulation | Search-based approximation | Full trends endpoint |
| Tweet search | No | Yes (10K/mo) | Yes (1M/mo) |
| User lookup | No | Yes | Yes |
| Real-time stream | No | No | Yes |
| Campaign monitoring | Simulated | Real data | Full real-time |

The app gracefully degrades — Free tier gets full-featured simulation mode, and everything unlocks automatically when you upgrade your Twitter API tier.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trends?id={woeid}` | GET | Fetch trends for a location (real or simulated) |
| `/api/status` | GET | API health: Twitter tier, LLM config, capabilities |
| `/api/search?q={query}` | GET | Search tweets (Basic tier+ required) |
| `/api/campaigns` | GET/POST/PUT/DELETE | Campaign CRUD operations |
| `/api/analyze` | POST | Analyze text for hate speech `{ text, useLLM }` |

## Dashboard Pages

| Page | Route | What It Shows |
|------|-------|---------------|
| Dashboard | `/dashboard` | Stats cards + map + trend list |
| Analytics | `/dashboard/analytics` | Category distribution, sentiment, volume, hate speech charts |
| Campaigns | `/dashboard/campaigns` | Campaign list + create/detail/manage |
| Audience | `/dashboard/audience` | Reach, engagement, age demographics, sentiment |
| Alerts | `/dashboard/alerts` | Dynamic alerts from campaigns, API tier, volume |
| Settings | `/dashboard/settings` | API tier display, LLM status, capabilities |

## Roadmap

- [ ] Database integration (Supabase/PostgreSQL) for persistent campaigns
- [ ] User authentication and multi-tenancy
- [ ] Scheduled campaign scanning (cron jobs)
- [ ] Email/Slack alert notifications
- [ ] Export reports (PDF/CSV)
- [ ] Multi-language hate speech detection
- [ ] WebSocket real-time updates
- [ ] Billing integration (Stripe) for SaaS pricing

## License

Private project — All rights reserved
