import { internalAction, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

// ─── Get all active campaigns due for scanning ────────────────────────────────
export const getCampaignsDueForScan = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const all = await ctx.db.query('campaigns').collect();

    return all.filter(c => {
      if (c.status !== 'active') return false;
      const interval = (c.scanInterval ?? 12) * 60 * 60 * 1000; // hours → ms
      const last = c.lastScannedAt ?? 0;
      return now - last >= interval;
    });
  },
});

// ─── Mark a campaign as scanned and record match count ────────────────────────
export const markScanned = internalMutation({
  args: {
    campaignId: v.id('campaigns'),
    matchCount: v.number(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.campaignId);
    if (!doc) return;
    await ctx.db.patch(args.campaignId, {
      lastScannedAt: Date.now(),
      totalMatches: (doc.totalMatches ?? 0) + args.matchCount,
    });
  },
});

// ─── Store flagged tweets for a campaign ─────────────────────────────────────
export const storeFlaggedTweets = internalMutation({
  args: {
    campaignId: v.string(),
    userId: v.string(),
    tweets: v.array(v.object({
      tweetId: v.string(),
      text: v.string(),
      authorHandle: v.string(),
      authorLocation: v.optional(v.string()),
      authorBio: v.optional(v.string()),
      createdAt: v.string(),
      hateSpeechScore: v.number(),
      categories: v.array(v.string()),
      likes: v.number(),
      retweets: v.number(),
      replies: v.number(),
      source: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const scannedAt = Date.now();

    // Dedup: skip tweets already in DB for this campaign
    const existing = await ctx.db
      .query('flaggedTweets')
      .withIndex('by_campaign', q => q.eq('campaignId', args.campaignId))
      .collect();
    const existingIds = new Set(existing.map(t => t.tweetId));
    const toInsert = args.tweets.filter(t => !existingIds.has(t.tweetId));

    await Promise.all(
      toInsert.map(t =>
        ctx.db.insert('flaggedTweets', {
          campaignId: args.campaignId,
          userId: args.userId,
          tweetId: t.tweetId,
          text: t.text,
          authorHandle: t.authorHandle,
          authorLocation: t.authorLocation,
          authorBio: t.authorBio,
          createdAt: t.createdAt,
          hateSpeechScore: t.hateSpeechScore,
          categories: t.categories,
          likes: t.likes,
          retweets: t.retweets,
          replies: t.replies,
          scannedAt,
          source: t.source,
        })
      )
    );

    return toInsert.length;
  },
});

// ─── Scan a single campaign (called from cron or on-demand) ──────────────────
export const scanCampaign = internalAction({
  args: {
    campaignId: v.id('campaigns'),
    userId: v.string(),
    keywords: v.array(v.string()),
    hashtags: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<{ flagged: number; searched: number; source: string }> => {
    const terms = [
      ...args.keywords.map((k: string) => `"${k}"`),
      ...args.hashtags.map((h: string) => (h.startsWith('#') ? h : `#${h}`)),
    ];
    const query = terms.join(' OR ');
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0];

    // ── Fetch real tweets via Twitter guest token ──────────────────────────
    const PUBLIC_BEARER =
      'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

    const BROWSER_HEADERS = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': 'https://twitter.com',
      'Referer': 'https://twitter.com/',
      'x-twitter-client-language': 'en',
      'x-twitter-active-user': 'yes',
    };

    let rawTweets: any[] = [];
    let source = 'unavailable';

    try {
      // Get guest token
      const tokenRes = await fetch('https://api.twitter.com/1.1/guest/activate.json', {
        method: 'POST',
        headers: {
          ...BROWSER_HEADERS,
          Authorization: `Bearer ${PUBLIC_BEARER}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const guestToken = tokenData.guest_token;

        if (guestToken) {
          const searchUrl = new URL('https://twitter.com/i/api/2/search/adaptive.json');
          searchUrl.searchParams.set('q', `${query} -filter:retweets since:${since}`);
          searchUrl.searchParams.set('count', '20');
          searchUrl.searchParams.set('tweet_mode', 'extended');
          searchUrl.searchParams.set('tweet_search_mode', 'live');

          const searchRes = await fetch(searchUrl.toString(), {
            headers: {
              ...BROWSER_HEADERS,
              Authorization: `Bearer ${PUBLIC_BEARER}`,
              'x-guest-token': guestToken,
            },
            signal: AbortSignal.timeout(12000),
          });

          if (searchRes.ok) {
            const data = await searchRes.json();
            const rawTweetMap: Record<string, any> = data?.globalObjects?.tweets || {};
            const rawUsers: Record<string, any> = data?.globalObjects?.users || {};

            rawTweets = Object.values(rawTweetMap).map((t: any) => {
              const user = rawUsers[t.user_id_str] || {};
              return {
                id: t.id_str,
                text: t.full_text || t.text || '',
                authorHandle: user.screen_name || 'unknown',
                authorBio: user.description || '',
                authorLocation: user.location || '',
                createdAt: t.created_at || new Date().toISOString(),
                metrics: {
                  likes: t.favorite_count || 0,
                  retweets: t.retweet_count || 0,
                  replies: t.reply_count || 0,
                },
              };
            }).filter((t: any) => t.text);

            source = 'twitter_guest';
          }
        }
      }
    } catch (err) {
      console.error('[scanner] Twitter fetch failed:', err);
    }

    if (rawTweets.length === 0) {
      return { flagged: 0, searched: 0, source: 'unavailable' };
    }

    // ── Dictionary-based hate speech analysis (fast, no API needed) ────────
    const HATE_PATTERNS = [
      /\b(kill|murder|destroy|eliminate|wipe out|exterminate)\b.{0,40}\b(them|these people|those people|the [a-z]+s|muslims?|hindus?|indians?|pakistanis?|christians?|jews?)\b/i,
      /\b(terrorists?|cancer|plague|vermin|rats?|cockroaches?|animals?)\b.{0,20}\b(indians?|pakistanis?|muslims?|hindus?|the [a-z]+s)\b/i,
      /\b(hate|despise|loathe)\b.{0,30}\b(all|every|these)\b.{0,20}\b(indians?|pakistanis?|muslims?|hindus?)\b/i,
      /\b(get out|go back|don't belong|invaders?|occupiers?)\b/i,
      /\bthey (are|were) (always|never|all) (like|been|the same|just)\b/i,
      /\b(true face|real face|their kind|you know who|follow the money)\b/i,
    ];

    const NEGATIVE_WORDS = ['attack', 'bomb', 'hate', 'kill', 'destroy', 'terror', 'violence', 'murder', 'war', 'invasion', 'enemy', 'traitor', 'cancer', 'plague', 'evil', 'disgusting', 'filthy', 'savage'];

    const flagged: any[] = [];

    for (const tweet of rawTweets) {
      const text = tweet.text.toLowerCase();
      let score = 0;
      const cats: string[] = [];

      // Pattern-based scoring
      for (const pattern of HATE_PATTERNS) {
        if (pattern.test(tweet.text)) {
          score = Math.max(score, 0.75);
          cats.push('coordinated_hate');
        }
      }

      // Keyword scoring
      const negHits = NEGATIVE_WORDS.filter(w => text.includes(w)).length;
      if (negHits >= 2) score = Math.max(score, 0.3 + negHits * 0.1);
      if (negHits >= 1 && score === 0) score = 0.2;

      // Check for xenophobic patterns
      if (/\b(indians?|pakistanis?|muslims?|hindus?|afghans?)\b/i.test(tweet.text) && negHits >= 1) {
        score = Math.max(score, 0.5);
        if (!cats.includes('xenophobic')) cats.push('xenophobic');
      }

      if (score > 0.15) {
        flagged.push({
          tweetId: tweet.id,
          text: tweet.text,
          authorHandle: tweet.authorHandle,
          authorLocation: tweet.authorLocation || undefined,
          authorBio: tweet.authorBio || undefined,
          createdAt: tweet.createdAt,
          hateSpeechScore: Math.min(1, parseFloat(score.toFixed(3))),
          categories: cats,
          likes: tweet.metrics.likes,
          retweets: tweet.metrics.retweets,
          replies: tweet.metrics.replies,
          source,
        });
      }
    }

    flagged.sort((a: any, b: any) => b.hateSpeechScore - a.hateSpeechScore);

    // Store in Convex DB
    if (flagged.length > 0) {
      await ctx.runMutation(internal.scanner.storeFlaggedTweets, {
        campaignId: args.campaignId as string,
        userId: args.userId,
        tweets: flagged,
      });
    }

    await ctx.runMutation(internal.scanner.markScanned, {
      campaignId: args.campaignId,
      matchCount: flagged.length,
    });

    return { flagged: flagged.length, searched: rawTweets.length, source };
  },
});

// ─── Cron entry point — scans all active campaigns that are due ───────────────
export const runScheduledScans = internalAction({
  args: {},
  handler: async (ctx) => {
    const campaigns: any[] = await ctx.runQuery(internal.scanner.getCampaignsDueForScan, {});

    console.log(`[cron] ${campaigns.length} campaign(s) due for scan`);

    for (const campaign of campaigns) {
      try {
        const result = await ctx.runAction(internal.scanner.scanCampaign, {
          campaignId: campaign._id,
          userId: campaign.userId,
          keywords: campaign.keywords,
          hashtags: campaign.hashtags,
        });
        console.log(`[cron] Campaign "${campaign.name}": ${result.flagged} flagged / ${result.searched} searched (${result.source})`);
      } catch (err) {
        console.error(`[cron] Campaign "${campaign.name}" scan failed:`, err);
      }
    }
  },
});
