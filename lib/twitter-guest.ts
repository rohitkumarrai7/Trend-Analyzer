/**
 * Twitter Guest Token client — zero setup, completely free.
 *
 * Uses Twitter's own public bearer token (the one their web client uses for
 * unauthenticated browsing). Fetching a guest token requires no account and
 * no API key. Twitter cannot block this without breaking their own embeds and
 * unauthenticated web browsing on twitter.com.
 *
 * Endpoints used:
 *   POST https://api.twitter.com/1.1/guest/activate.json   → get guest token
 *   GET  https://twitter.com/i/api/2/search/adaptive.json  → search tweets
 *   GET  https://api.twitter.com/1.1/trends/place.json     → trending topics
 */

// Twitter's own public web-client bearer token (well-known, used by Nitter etc.)
const PUBLIC_BEARER =
  'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

// Module-level token cache (shared per Next.js server process)
let _guestToken: string | null = null;
let _tokenExpiry = 0;

// Standard browser headers to blend in with normal traffic
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://twitter.com',
  'Referer': 'https://twitter.com/',
  'x-twitter-client-language': 'en',
  'x-twitter-active-user': 'yes',
};

// ─── Guest token ──────────────────────────────────────────────────────────────

export async function getGuestToken(): Promise<string> {
  if (_guestToken && Date.now() < _tokenExpiry) return _guestToken;

  const res = await fetch('https://api.twitter.com/1.1/guest/activate.json', {
    method: 'POST',
    headers: {
      ...BROWSER_HEADERS,
      Authorization: `Bearer ${PUBLIC_BEARER}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Guest token: HTTP ${res.status}`);

  const data = await res.json();
  if (!data.guest_token) throw new Error('No guest_token in response');

  _guestToken = data.guest_token;
  _tokenExpiry = Date.now() + 3 * 60 * 60 * 1000; // 3 hours
  return _guestToken!;
}

// ─── Tweet search ─────────────────────────────────────────────────────────────

export interface GuestTweet {
  id: string;
  text: string;
  authorHandle: string;
  authorBio: string;
  authorLocation: string;
  createdAt: string;
  metrics: { likes: number; retweets: number; replies: number };
}

export async function searchTweets(query: string, count = 20): Promise<GuestTweet[]> {
  const token = await getGuestToken();

  // Limit to the last 48 hours so we never surface 2019 posts
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0]; // YYYY-MM-DD

  const url = new URL('https://twitter.com/i/api/2/search/adaptive.json');
  url.searchParams.set('q', `${query} -filter:retweets since:${since}`);
  url.searchParams.set('count', String(Math.min(count, 20)));
  url.searchParams.set('tweet_mode', 'extended');
  url.searchParams.set('tweet_search_mode', 'live');
  url.searchParams.set('include_quote_count', 'true');

  const res = await fetch(url.toString(), {
    headers: {
      ...BROWSER_HEADERS,
      Authorization: `Bearer ${PUBLIC_BEARER}`,
      'x-guest-token': token,
    },
    signal: AbortSignal.timeout(12000),
  });

  if (res.status === 429) {
    // Rate limited — drop cached token so next request gets a fresh one
    _guestToken = null;
    throw new Error('Rate limited by Twitter — will auto-retry');
  }

  if (!res.ok) throw new Error(`Search: HTTP ${res.status}`);

  const data = await res.json();
  return parseAdaptiveResponse(data);
}

// ─── Trending topics ──────────────────────────────────────────────────────────

export interface GuestTrend {
  hashtag: string;
  volume: number;
  url: string;
}

export async function getTrends(woeid: number): Promise<GuestTrend[]> {
  const token = await getGuestToken();

  const res = await fetch(
    `https://api.twitter.com/1.1/trends/place.json?id=${woeid}`,
    {
      headers: {
        ...BROWSER_HEADERS,
        Authorization: `Bearer ${PUBLIC_BEARER}`,
        'x-guest-token': token,
      },
      signal: AbortSignal.timeout(8000),
    },
  );

  if (!res.ok) throw new Error(`Trends: HTTP ${res.status}`);

  const data = await res.json();
  const trends: any[] = data?.[0]?.trends || [];

  return trends.map((t: any) => ({
    hashtag: t.name || '#Trend',
    volume: t.tweet_volume || 0,
    url: t.url || `https://twitter.com/search?q=${encodeURIComponent(t.name)}`,
  }));
}

// ─── Response parser ──────────────────────────────────────────────────────────

function parseAdaptiveResponse(data: any): GuestTweet[] {
  const tweets: GuestTweet[] = [];
  const rawTweets: Record<string, any> = data?.globalObjects?.tweets || {};
  const rawUsers: Record<string, any> = data?.globalObjects?.users || {};

  for (const id of Object.keys(rawTweets)) {
    const t = rawTweets[id];
    const user = rawUsers[t.user_id_str] || {};
    const text = t.full_text || t.text;
    if (!text) continue;

    tweets.push({
      id: t.id_str || id,
      text,
      authorHandle: user.screen_name || 'unknown',
      authorBio: user.description || '',
      authorLocation: user.location || '',
      createdAt: t.created_at || new Date().toISOString(),
      metrics: {
        likes: t.favorite_count || 0,
        retweets: t.retweet_count || 0,
        replies: t.reply_count || 0,
      },
    });
  }

  return tweets;
}
