import { NextRequest, NextResponse } from 'next/server';
import { searchTweets } from '@/lib/twitter-guest';
import { getLLMConfig } from '@/lib/config';
import { analyzeText } from '@/lib/hate-speech/dictionary';
import { analyzeTweetWithLLM } from '@/lib/hate-speech/llm-analyzer';
import { FlaggedTweet } from '@/lib/types/campaign';

// POST /api/campaigns/scan
// Body: { keywords: string[], hashtags?: string[] }
// Returns: { flaggedTweets: FlaggedTweet[], totalSearched: number, source: string }
export async function POST(request: NextRequest) {
  try {
    const { keywords = [], hashtags = [] } = await request.json();

    if (!keywords.length && !hashtags.length) {
      return NextResponse.json({ error: 'keywords or hashtags required' }, { status: 400 });
    }

    // Build OR-joined query
    const terms = [
      ...keywords.map((k: string) => `"${k}"`),
      ...hashtags.map((h: string) => (h.startsWith('#') ? h : `#${h}`)),
    ];
    const query = terms.join(' OR ');

    const llm = getLLMConfig();

    // ── Fetch real tweets via guest token ──────────────────────────────────
    let rawTweets: Awaited<ReturnType<typeof searchTweets>> = [];
    let source = 'none';

    try {
      rawTweets = await searchTweets(query, 20);
      source = 'twitter_guest';
    } catch (err) {
      console.error('[scan] Guest search failed:', (err as Error).message);
    }

    if (!rawTweets.length) {
      return NextResponse.json({
        flaggedTweets: [],
        totalSearched: 0,
        source: 'unavailable',
        hint: 'Twitter guest API is temporarily rate-limited. Try again in a few seconds.',
      });
    }

    // ── Analyse each tweet ────────────────────────────────────────────────
    const useLLM = llm.provider !== 'none' && !!llm.apiKey;
    const flagged: FlaggedTweet[] = [];

    for (const tweet of rawTweets) {
      let score = 0;
      let categories: string[] = [];

      if (useLLM) {
        const result = await analyzeTweetWithLLM(tweet.text);
        if (result) {
          score      = result.confidence;
          categories = result.categories;
        }
      } else {
        const dict = analyzeText(tweet.text);
        score      = dict.score;
        categories = dict.categories as string[];
      }

      if (score > 0.15 || categories.length > 0) {
        flagged.push({
          id: tweet.id,
          text: tweet.text,
          authorId: tweet.authorHandle,
          authorBio: tweet.authorBio || undefined,
          authorLocation: tweet.authorLocation || undefined,
          createdAt: tweet.createdAt,
          metrics: tweet.metrics,
          hateSpeechScore: parseFloat(score.toFixed(3)),
          categories,
        });
      }
    }

    flagged.sort((a, b) => b.hateSpeechScore - a.hateSpeechScore);

    return NextResponse.json({
      flaggedTweets: flagged,
      totalSearched: rawTweets.length,
      source,
      analysisMethod: useLLM ? 'llm_emotion' : 'dictionary_fallback',
    });

  } catch (err) {
    console.error('[scan] Error:', err);
    return NextResponse.json({ error: 'Scan failed', details: String(err) }, { status: 500 });
  }
}
