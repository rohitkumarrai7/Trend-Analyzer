import { NextRequest, NextResponse } from 'next/server';
import { getTwitterConfig } from '@/lib/config';
import { generateServerTrends } from '@/lib/simulation';
import { LOCATIONS } from '@/lib/locations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const woeid = parseInt(searchParams.get('id') || '1');
  const config = getTwitterConfig();
  const location = LOCATIONS.find(loc => loc.woeid === woeid);

  // If Basic+ tier with bearer token: use Twitter v2 search to approximate trends
  if (config.capabilities.canSearchTweets && config.bearerToken) {
    try {
      const trendData = await fetchTrendsViaSearch(config.bearerToken, location, woeid);
      return NextResponse.json({
        data: trendData,
        meta: { source: 'twitter_v2', tier: config.tier, woeid },
      });
    } catch (error) {
      console.error('Twitter API failed, falling back to simulation:', error);
    }
  }

  // Fallback: server-side simulation
  const trends = generateServerTrends(woeid, location || null);
  return NextResponse.json({
    data: trends,
    meta: { source: 'simulation', tier: config.tier, woeid },
  });
}

async function fetchTrendsViaSearch(bearerToken: string, location: any, woeid: number) {
  const query = location
    ? `(${location.name} OR #${location.name.replace(/\s+/g, '')}) -is:retweet lang:en has:hashtags`
    : '-is:retweet lang:en has:hashtags';

  const url = new URL('https://api.twitter.com/2/tweets/search/recent');
  url.searchParams.set('query', query);
  url.searchParams.set('max_results', '100');
  url.searchParams.set('tweet.fields', 'public_metrics,created_at,author_id,entities');
  url.searchParams.set('expansions', 'author_id');
  url.searchParams.set('user.fields', 'description,location,public_metrics,created_at');

  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${bearerToken}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(`Twitter API ${res.status}: ${JSON.stringify(errorBody)}`);
  }

  const data = await res.json();
  return aggregateHashtags(data, location, woeid);
}

function aggregateHashtags(data: any, location: any, woeid: number) {
  const hashtagCounts: Record<string, { count: number; totalMetrics: number }> = {};

  const tweets = data.data || [];
  for (const tweet of tweets) {
    const hashtags = tweet.entities?.hashtags || [];
    const metrics = tweet.public_metrics || {};
    const engagement = (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0);

    for (const ht of hashtags) {
      const tag = `#${ht.tag}`;
      if (!hashtagCounts[tag]) {
        hashtagCounts[tag] = { count: 0, totalMetrics: 0 };
      }
      hashtagCounts[tag].count++;
      hashtagCounts[tag].totalMetrics += engagement;
    }
  }

  const baseLat = location?.lat || 20;
  const baseLng = location?.lng || 0;

  return Object.entries(hashtagCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15)
    .map(([hashtag, info], i) => {
      const estimatedVolume = info.count * 500 + info.totalMetrics * 10;
      return {
        id: `live-${i}-${Date.now()}`,
        hashtag,
        title: hashtag.replace('#', '').replace(/([A-Z])/g, ' $1').trim(),
        tweetVolume: estimatedVolume,
        category: categorizeHashtag(hashtag),
        description: `Trending with ~${estimatedVolume.toLocaleString()} estimated volume`,
        url: `https://twitter.com/search?q=${encodeURIComponent(hashtag)}`,
        lat: baseLat + (Math.random() - 0.5) * 0.15,
        lng: baseLng + (Math.random() - 0.5) * 0.15,
        weight: Math.log10(Math.max(estimatedVolume, 100)) / 6,
        timestamp: new Date().toISOString(),
        change: Math.round((Math.random() - 0.3) * 50),
        sentiment: (['positive', 'negative', 'neutral'] as const)[Math.floor(Math.random() * 3)],
      };
    });
}

function categorizeHashtag(hashtag: string): string {
  const tag = hashtag.toLowerCase();
  if (tag.match(/(emergency|accident|fire|alert|police|crime|breaking|safety)/)) return 'emergency';
  if (tag.match(/(pollution|climate|weather|aqi|environment|green|eco|air)/)) return 'environment';
  if (tag.match(/(election|government|parliament|policy|budget|minister|politics|reform)/)) return 'politics';
  if (tag.match(/(movie|film|music|entertainment|bollywood|hollywood|streaming|release)/)) return 'entertainment';
  if (tag.match(/(cricket|ipl|sport|game|match|football|nba|championship|finals)/)) return 'sports';
  if (tag.match(/(tech|digital|startup|ai|mobile|innovation|software|app)/)) return 'technology';
  if (tag.match(/(hate|racist|racism|bigot|discrimination|slur|supremac)/)) return 'hate_speech';
  return 'other';
}
