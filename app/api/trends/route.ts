import { NextRequest, NextResponse } from 'next/server';
import { getTrends } from '@/lib/twitter-guest';
import { generateServerTrends } from '@/lib/simulation';
import { LOCATIONS } from '@/lib/locations';

// ── Server-side trend cache (15-minute TTL per WOEID) ──────────────────────────
// Prevents hammering Twitter's trends endpoint on every 30-second client refresh.
const CACHE_TTL_MS = 15 * 60 * 1000;
type CacheEntry = { data: any[]; expiresAt: number };
const trendCache = new Map<number, CacheEntry>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const woeid    = parseInt(searchParams.get('id') || '1');
  const location = LOCATIONS.find(loc => loc.woeid === woeid);

  // ── Priority 1: Serve from cache if still fresh ──────────────────────────────
  const cached = trendCache.get(woeid);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json({
      data: cached.data,
      meta: { source: 'twitter_guest', tier: 'free', woeid, cached: true },
    });
  }

  // ── Priority 2: Twitter guest token (free, zero setup) ──────────────────────
  try {
    const rawTrends = await getTrends(woeid);
    if (rawTrends.length > 0) {
      const data = normalizeTrends(rawTrends, location, woeid);
      trendCache.set(woeid, { data, expiresAt: Date.now() + CACHE_TTL_MS });
      return NextResponse.json({
        data,
        meta: { source: 'twitter_guest', tier: 'free', woeid, cached: false },
      });
    }
  } catch (err) {
    console.error('[trends] Guest token failed:', (err as Error).message);
  }

  // ── Priority 2: Seeded simulation (always available) ────────────────────────
  return NextResponse.json({
    data: generateServerTrends(woeid, location || null),
    meta: { source: 'simulation', tier: 'free', woeid },
  });
}

function normalizeTrends(rawTrends: { hashtag: string; volume: number; url: string }[], location: any, woeid: number) {
  const baseLat = location?.lat || 20;
  const baseLng = location?.lng || 0;

  return rawTrends
    .filter(t => t.hashtag)
    .slice(0, 20)
    .map((t, i) => {
      const volume = t.volume || Math.round(5000 + Math.random() * 95000);
      return {
        id: `guest-${i}-${woeid}-${Date.now()}`,
        hashtag: t.hashtag,
        title: t.hashtag.replace(/^#/, '').replace(/([A-Z])/g, ' $1').trim(),
        tweetVolume: volume,
        category: categorize(t.hashtag),
        description: `Trending on Twitter/X with ${volume.toLocaleString()} tweets`,
        url: t.url,
        lat: baseLat + (Math.random() - 0.5) * 0.15,
        lng: baseLng + (Math.random() - 0.5) * 0.15,
        weight: Math.log10(Math.max(volume, 100)) / 6,
        timestamp: new Date().toISOString(),
        change: Math.round((Math.random() - 0.3) * 40),
        sentiment: inferSentiment(t.hashtag),
      };
    });
}

function categorize(hashtag: string): string {
  const t = hashtag.toLowerCase();
  if (t.match(/(emergency|accident|fire|alert|police|crime|breaking|safety)/)) return 'emergency';
  if (t.match(/(pollution|climate|weather|aqi|environment|green|eco|air)/))    return 'environment';
  if (t.match(/(election|government|parliament|policy|budget|minister|politics|reform)/)) return 'politics';
  if (t.match(/(movie|film|music|entertainment|bollywood|hollywood|streaming|release)/))  return 'entertainment';
  if (t.match(/(cricket|ipl|sport|game|match|football|nba|championship|finals)/))        return 'sports';
  if (t.match(/(tech|digital|startup|ai|mobile|innovation|software|app)/))               return 'technology';
  if (t.match(/(hate|racist|racism|bigot|discrimination|slur|supremac)/))                return 'hate_speech';
  return 'other';
}

// Keyword-based sentiment — replaces Math.random() so the value reflects the topic
function inferSentiment(hashtag: string): 'positive' | 'negative' | 'neutral' {
  const t = hashtag.toLowerCase();
  if (t.match(/(accident|fire|crime|breaking|alert|attack|bomb|blast|riot|protest|flood|drought|death|kill|war|terror|hate|racist|discrimination|emergency|unsafe|danger|threat|corrupt|fraud|scam|abuse|violence|murder|disaster|crisis|fail|collapse)/)) {
    return 'negative';
  }
  if (t.match(/(victory|win|success|award|celebrate|launch|progress|growth|good|great|best|top|record|achieve|discover|breakthrough|peace|help|save|clean|safe|love|happy|proud|joy|festival|free|open|new|rise|gain|boom|milestone|hero)/)) {
    return 'positive';
  }
  return 'neutral';
}
