import { NextRequest, NextResponse } from 'next/server';
import { searchTweets } from '@/lib/twitter-guest';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const max   = Math.min(parseInt(searchParams.get('max') || '20'), 50);

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const tweets = await searchTweets(query, max);
    return NextResponse.json({ tweets, source: 'twitter_guest', count: tweets.length });
  } catch (err) {
    console.error('[search] Guest token search failed:', (err as Error).message);
    return NextResponse.json({
      error: 'Twitter search unavailable',
      detail: (err as Error).message,
      tweets: [],
      source: 'error',
    }, { status: 503 });
  }
}

// ─── Shared tweet shape ───────────────────────────────────────────────────────
export interface NormalizedTweet {
  id: string;
  text: string;
  authorHandle: string;
  authorBio: string;
  authorLocation: string;
  createdAt: string;
  metrics: { likes: number; retweets: number; replies: number };
}
