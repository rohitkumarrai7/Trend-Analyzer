import { NextRequest, NextResponse } from 'next/server';
import { getTwitterConfig } from '@/lib/config';

export async function GET(request: NextRequest) {
  const config = getTwitterConfig();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const maxResults = Math.min(parseInt(searchParams.get('max') || '10'), 100);

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  if (!config.capabilities.canSearchTweets || !config.bearerToken) {
    return NextResponse.json({
      error: 'Tweet search requires Basic tier ($100/mo) or higher',
      upgrade_url: 'https://developer.twitter.com/en/portal/products',
      tier: config.tier,
    }, { status: 403 });
  }

  try {
    const url = new URL('https://api.twitter.com/2/tweets/search/recent');
    url.searchParams.set('query', `${query} -is:retweet`);
    url.searchParams.set('max_results', String(maxResults));
    url.searchParams.set('tweet.fields', 'public_metrics,created_at,author_id,entities,lang');
    url.searchParams.set('expansions', 'author_id');
    url.searchParams.set('user.fields', 'description,location,public_metrics,created_at');

    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${config.bearerToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: 'Twitter API error', details: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error', details: String(error) }, { status: 500 });
  }
}
