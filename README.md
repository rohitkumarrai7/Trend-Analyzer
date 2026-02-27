# TrendMap — Social Media Trend & Hate Speech Monitoring Platform

A real-time social media trend visualization and hate speech monitoring platform built with Next.js 16, React 19, Clerk authentication, and Convex database. Designed as a SaaS tool for tracking harmful content campaigns across Twitter/X, with geographic heatmaps, AI-powered content analysis, persistent campaign storage, and automated scheduled scanning.

## What It Does

TrendMap monitors Twitter/X trends across 70+ cities worldwide and provides tools to:

- **Visualize trends geographically** on a dedicated full-screen interactive dark-themed map with color-coded markers showing all categories simultaneously
- **Track hate speech campaigns** using keyword-based + AI-powered detection with real tweet data via Twitter guest token (no API key required)
- **Store campaign results persistently** in Convex database — survives page reloads, navigation, and server restarts
- **Scan automatically on schedule** — Convex cron jobs run every hour on the cloud, independently of your laptop or Vercel
- **Analyze content** with a dual-layer system: fast local keyword matching + OpenRouter LLM classification
- **Export reports** to PDF or Excel with one click from the campaign detail view
- **Generate alerts** when hate speech thresholds are crossed in monitored locations
- **Show real-time analytics** with category distribution, sentiment analysis, and volume charts

## Use Case

Many communities face targeted harassment and racism on social media. TrendMap helps **NGOs, researchers, journalists, and community organizations** to:

1. **Create monitoring campaigns** — define keywords (e.g., "hate", "attack") and hashtags to track
2. **Detect hate speech** — regex + AI classifies flagged content by category (racial, religious, gender, xenophobic) with severity scores
3. **Schedule automatic scans** — set 12-hour or 24-hour scan intervals; Convex runs scans even when no user is online
4. **Identify hotspots** — see which cities/regions have the highest concentration of harmful content
5. **Export evidence** — download campaign results as formatted PDF reports or Excel spreadsheets
6. **Get alerts** — automated alerts when hate speech volume crosses configurable thresholds

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16.1.3 (App Router, Turbopack) | Full-stack React framework with server-side API routes |
| **Frontend** | React 19.2.3, TypeScript 5.9 | UI with strict type safety |
| **Auth** | Clerk (`@clerk/nextjs` v6) | User authentication — sign-in, sign-up, session management |
| **Database** | Convex (v1.32) | Real-time persistent database + cloud functions + cron jobs |
| **Styling** | Tailwind CSS 3.3, Framer Motion 12 | Dark-themed UI with smooth animations |
| **Maps** | Leaflet 1.9 + React Leaflet 5.0 | Interactive geographic visualization with CartoDB Dark Matter tiles |
| **Charts** | Recharts 3.6 | Pie charts, bar charts, area charts for analytics |
| **State** | Zustand 4.5 | Lightweight global state management |
| **UI Components** | Radix UI, Lucide React, CVA | Accessible components, icons, variant styling |
| **LLM** | OpenRouter API (arcee-ai/trinity-large-preview:free) | Free AI-powered hate speech classification |
| **Twitter Data** | Twitter guest token (zero setup) | Real tweet fetching — no API key required |
| **PDF Export** | jsPDF + jspdf-autotable | Campaign report PDF generation |
| **Excel Export** | SheetJS (xlsx) | Campaign data Excel export |

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Clerk Auth Layer                      │
│         Sign-in / Sign-up / Session Management           │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│                    Frontend (React)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ TrendMap  │ │Analytics │ │Campaigns │ │   Map Page  │  │
│  │ (Leaflet) │ │(Recharts)│ │ (Convex) │ │ (Full-screen│  │
│  └─────┬────┘ └────┬─────┘ └────┬─────┘ └──────┬──────┘  │
│        │           │            │               │          │
│  ┌─────┴───────────┴────────────┴───────────────┴────────┐ │
│  │                    Zustand Store                       │ │
│  │   trends, stats, selectedLocation, category filter    │ │
│  └──────────────────────┬─────────────────────────────── ┘ │
└─────────────────────────┼─────────────────────────────────┘
                          │ fetch() / Convex hooks
┌─────────────────────────┼─────────────────────────────────┐
│                  API Routes + Convex Backend               │
│  ┌──────────────┐ ┌───────────────┐ ┌──────────────────┐  │
│  │ /api/trends  │ │ /api/analyze  │ │  Convex Database │  │
│  │ (15-min cache│ │ (dict + LLM)  │ │ campaigns table  │  │
│  │  per WOEID)  │ │               │ │ flaggedTweets    │  │
│  └──────┬───────┘ └───────────────┘ │ cron: hourly     │  │
│         │                           └──────────────────┘  │
│  ┌──────▼───────────────────────────────────────────────┐  │
│  │            Twitter Guest Token (zero setup)           │  │
│  │   Fetches real tweets, ~40-50% success rate           │  │
│  │   since:${48h ago} filter for fresh content           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                  Convex Cloud (Always On)                   │
│   Hourly cron → scanCampaign → storeFlaggedTweets          │
│   Runs independently of Vercel / your laptop               │
└────────────────────────────────────────────────────────────┘
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── trends/route.ts          # Twitter guest token trends + 15-min server cache
│   │   ├── status/route.ts          # API health check (guest token, LLM config)
│   │   ├── search/route.ts          # Tweet search proxy
│   │   ├── campaigns/
│   │   │   └── scan/route.ts        # On-demand campaign scan endpoint
│   │   └── analyze/route.ts         # Hate speech analysis (dictionary + LLM)
│   ├── dashboard/
│   │   ├── layout.tsx               # Dashboard shell (sidebar + header)
│   │   ├── page.tsx                 # Main dashboard (stats + map + trends)
│   │   ├── map/page.tsx             # Full-screen interactive map (all categories)
│   │   ├── analytics/page.tsx       # Category, sentiment, volume charts
│   │   ├── campaigns/page.tsx       # Campaign management (Convex-backed, persistent)
│   │   ├── audience/page.tsx        # Sentiment + engagement insights
│   │   ├── alerts/page.tsx          # Dynamic alerts from campaigns + system
│   │   └── settings/page.tsx        # API config, LLM status, tier display
│   ├── sign-in/[[...sign-in]]/page.tsx  # Clerk sign-in page
│   ├── sign-up/[[...sign-up]]/page.tsx  # Clerk sign-up page
│   ├── layout.tsx                   # Root layout (ClerkProvider + ConvexClientProvider)
│   ├── page.tsx                     # Landing page (hero + features)
│   └── globals.css                  # Tailwind base + custom styles
├── components/
│   ├── ConvexClientProvider.tsx      # ConvexProviderWithClerk — passes Clerk JWT to Convex
│   ├── dashboard/
│   │   ├── AnalyticsView.tsx        # Charts: category, sentiment, volume, hate speech
│   │   ├── ApiKeyDialog.tsx         # API key input modal
│   │   ├── CampaignCreateDialog.tsx # Campaign creation form with scan interval selector
│   │   ├── CampaignDetailView.tsx   # Campaign drill-down: charts + flagged tweets + PDF/Excel export
│   │   ├── HateSpeechMetrics.tsx    # Reusable hate speech score/category display
│   │   ├── Header.tsx               # Top bar with search + API status
│   │   ├── LocationInitializer.tsx  # Browser geolocation auto-detection
│   │   ├── Sidebar.tsx              # Navigation sidebar (includes Map page link)
│   │   ├── StatsCards.tsx           # 5-card metrics grid
│   │   └── TrendList.tsx            # Scrollable trend list (fast filter, no stagger delay)
│   ├── landing/
│   │   ├── Hero.tsx                 # Landing page hero with map preview
│   │   ├── Features.tsx             # Feature cards section
│   │   └── Footer.tsx               # Landing page footer
│   ├── map/
│   │   ├── TrendMap.tsx             # Leaflet map — shows ALL trends, no category filter
│   │   └── LocationSearch.tsx       # City search + quick selector
│   └── ui/
│       ├── badge.tsx                # Badge with category variants (incl. hate_speech)
│       ├── button.tsx               # Button component (CVA variants)
│       ├── card.tsx                 # Card with glass/glow variants
│       └── input.tsx                # Input component
├── convex/
│   ├── auth.config.ts               # Clerk JWT provider config for Convex
│   ├── schema.ts                    # DB schema: campaigns + flaggedTweets tables
│   ├── campaigns.ts                 # Campaign CRUD mutations + queries (auth-gated)
│   ├── flaggedTweets.ts             # Flagged tweet storage + retrieval
│   ├── scanner.ts                   # Tweet scanning logic (internal actions)
│   └── crons.ts                     # Hourly cron: scans all active campaigns
├── lib/
│   ├── api.ts                       # Trend fetching, categories, stats calculation
│   ├── config.ts                    # Server-side env config (LLM)
│   ├── store.ts                     # Zustand store (trends, campaigns, location)
│   ├── locations.ts                 # 70+ cities with WOEID, coordinates, population
│   ├── simulation.ts                # Deterministic trend simulation fallback
│   ├── twitter-guest.ts             # Twitter guest token + search (since:48h filter)
│   ├── utils.ts                     # cn() utility for className merging
│   ├── types/
│   │   └── campaign.ts              # Campaign, FlaggedTweet type definitions
│   └── hate-speech/
│       ├── dictionary.ts            # Keyword-based hate speech detection
│       └── llm-analyzer.ts          # OpenRouter/OpenAI/Anthropic LLM integration
├── .env.example                     # Template for env vars (never commit .env.local)
├── next.config.js                   # Next.js configuration
├── tailwind.config.ts               # Tailwind theme + custom utilities
├── tsconfig.json                    # TypeScript strict mode config
└── package.json                     # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/rohitkumarrai7/Trend-Analyzer.git
cd Trend-Analyzer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys (see below)
```

### Convex Setup (Database + Cron)

```bash
# Install Convex CLI
npm install -g convex

# Initialize and deploy Convex backend
npx convex dev
# This will:
# - Create your Convex deployment
# - Add CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL to .env.local
# - Watch for schema/function changes
```

### Clerk Setup (Authentication)

1. Create a free account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your keys to `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
4. In Clerk Dashboard → **JWT Templates** → **New template** → select **"Convex"** preset → Save
   > This step is required — without it, Convex cannot verify Clerk user sessions

### Environment Variables

Edit `.env.local`:

```env
# Clerk Auth (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Convex Database (auto-filled by `npx convex dev`)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment

# LLM for AI hate speech analysis (optional — falls back to dictionary)
# Get free key from https://openrouter.ai/keys
LLM_PROVIDER=openrouter
LLM_API_KEY=sk-or-v1-...
LLM_MODEL=arcee-ai/trinity-large-preview:free
```

### Run Development Server

```bash
# Terminal 1: Start Convex (watches and syncs your schema/functions)
npx convex dev

# Terminal 2: Start Next.js
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Features in Detail

### Interactive Trend Map (`/dashboard/map`)

- **Dedicated full-screen map page** showing all trend categories simultaneously
- Dark-themed CartoDB map tiles with category-colored pulsing markers
- Marker size scales logarithmically with tweet volume
- Click markers for detailed popup: hashtag, volume, sentiment, category, external link
- Auto-flies to selected location with smooth easing animation
- No category filter applied on the map — always shows the complete picture
- 30-second auto-refresh cycle

### Campaign Monitoring (Convex-Backed)

- Create campaigns with custom keywords, hashtags, and scan interval (12h or 24h)
- **Persistent storage** — all campaigns and flagged tweets stored in Convex database
- **Scheduled scanning** — Convex cron runs every hour on the cloud; campaigns that are due get scanned automatically even when no user is online and the laptop is off
- View campaign detail: hate speech category breakdown, location hotspots, flagged tweet list with severity badges
- **Export to PDF** — formatted report with campaign summary + flagged tweets table (via jsPDF)
- **Export to Excel** — full data spreadsheet (via SheetJS)
- Pause/resume/delete campaigns
- Configurable alert thresholds

### Twitter Data (Zero Setup)

TrendMap uses Twitter's guest token endpoint to fetch real tweets without any API key:

```
POST https://api.twitter.com/1.1/guest/activate.json
→ get guest_token
→ GET https://twitter.com/i/api/2/search/adaptive.json?q=...&since:YYYY-MM-DD
→ parse tweets from globalObjects
```

- **No API key required** — uses Twitter's public guest token
- **48-hour recency filter** — `since:${date}` ensures fresh content only
- **~40-50% success rate** — Twitter rate-limits guest tokens; scanner gracefully handles failures
- **Automatic fallback** — if guest token fails, cron marks the scan as `unavailable` and retries next hour

### Hate Speech Detection (Dual-Layer)

| Layer | How It Works | Cost |
|-------|-------------|------|
| **Dictionary** | Regex pattern matching against categorized keyword database (racial, religious, gender, xenophobic) | Free, instant |
| **LLM** | OpenRouter API sends text to arcee-ai/trinity-large-preview model for nuanced classification with confidence scores | Free (preview model) |

The `/api/analyze` endpoint runs both layers and returns a combined result:
```json
{
  "score": 0.87,
  "isHateSpeech": true,
  "categories": ["xenophobic", "coordinated_hate"],
  "severity": "high",
  "dictionaryMatches": ["get out", "invaders"],
  "llmAnalysis": {
    "confidence": 0.87,
    "explanation": "Contains xenophobic language targeting a specific ethnic group..."
  }
}
```

### Trends with Server-Side Caching

The `/api/trends` route caches Twitter trend results per location:

- **15-minute TTL cache** per WOEID — prevents hitting Twitter rate limits on repeated refreshes
- Keyword-based sentiment inference (`inferSentiment()`) replaces random sentiment assignment
- Graceful fallback to simulation data when guest token is unavailable

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

## Convex Database Schema

### `campaigns` table

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Clerk user subject ID (owner) |
| `name` | string | Campaign display name |
| `keywords` | string[] | Keywords to search for |
| `hashtags` | string[] | Hashtags to search for |
| `status` | active/paused/completed | Current campaign state |
| `scanInterval` | number (hours) | How often to auto-scan (12 or 24) |
| `lastScannedAt` | number (ms) | Timestamp of last successful scan |
| `totalMatches` | number | Cumulative flagged tweet count |
| `alertThreshold` | number | Matches before alert triggers |

### `flaggedTweets` table

| Field | Type | Description |
|-------|------|-------------|
| `campaignId` | string | Parent campaign reference |
| `tweetId` | string | Twitter tweet ID (deduplicated) |
| `text` | string | Full tweet text |
| `authorHandle` | string | Twitter screen name |
| `hateSpeechScore` | number (0–1) | Severity score |
| `categories` | string[] | Hate speech categories detected |
| `likes/retweets/replies` | number | Engagement metrics |
| `source` | string | `twitter_guest` or `simulation` |
| `scannedAt` | number (ms) | When this tweet was stored |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trends?id={woeid}` | GET | Fetch trends for a location (cached, real or simulated) |
| `/api/status` | GET | API health: guest token status, LLM config |
| `/api/search?q={query}` | GET | Search tweets via guest token |
| `/api/campaigns/scan` | POST | Trigger on-demand campaign scan |
| `/api/analyze` | POST | Analyze text for hate speech `{ text, useLLM }` |

## Dashboard Pages

| Page | Route | What It Shows |
|------|-------|---------------|
| Dashboard | `/dashboard` | Stats cards + embedded map + trend list |
| Map | `/dashboard/map` | Full-screen map with all trend categories |
| Analytics | `/dashboard/analytics` | Category distribution, sentiment, volume, hate speech charts |
| Campaigns | `/dashboard/campaigns` | Persistent campaign list + create/detail/scan/export |
| Audience | `/dashboard/audience` | Reach, engagement, sentiment insights |
| Alerts | `/dashboard/alerts` | Dynamic alerts from campaigns, API tier, volume |
| Settings | `/dashboard/settings` | API status, LLM config, capabilities |

## Scheduled Scanning — How It Works

```
Every hour (Convex cron, on Convex cloud):
  1. Query all campaigns where status = 'active'
  2. Filter campaigns where (now - lastScannedAt) >= scanInterval
  3. For each due campaign:
     a. Fetch Twitter guest token
     b. Search tweets with campaign keywords + hashtags (last 48h)
     c. Run dictionary-based hate speech analysis on each tweet
     d. Store flagged tweets in Convex (deduplicated by tweetId)
     e. Update lastScannedAt + totalMatches on the campaign
  4. Log results to Convex console
```

This runs **entirely on Convex's cloud** — no Vercel server, no laptop required.

## Roadmap

- [x] Convex database integration for persistent campaign storage
- [x] Clerk authentication and multi-tenancy
- [x] Scheduled campaign scanning (Convex hourly cron)
- [x] Export reports (PDF via jsPDF, Excel via SheetJS)
- [x] Twitter guest token (zero API key setup)
- [x] Tweet recency filter (last 48 hours)
- [x] Trend server-side caching (15 min per WOEID)
- [x] Dedicated full-screen map page
- [ ] Email/Slack alert notifications
- [ ] Multi-language hate speech detection
- [ ] WebSocket real-time updates
- [ ] Billing integration (Stripe) for SaaS pricing
- [ ] Report scheduling (auto-email PDF on scan completion)

## License

Private project — All rights reserved
