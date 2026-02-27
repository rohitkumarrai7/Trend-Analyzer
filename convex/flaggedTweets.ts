import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// ─── Get all stored flagged tweets for a campaign ─────────────────────────────
export const listForCampaign = query({
  args: { campaignId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query('flaggedTweets')
      .withIndex('by_campaign', q => q.eq('campaignId', args.campaignId))
      .filter(q => q.eq(q.field('userId'), identity.subject))
      .order('desc')
      .take(100);
  },
});

// ─── Store a batch of flagged tweets from a scan ─────────────────────────────
export const storeBatch = mutation({
  args: {
    campaignId: v.string(),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const scannedAt = Date.now();

    // Deduplicate: skip tweets already stored for this campaign
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
          userId: identity.subject,
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

    return { inserted: toInsert.length, skippedDuplicates: args.tweets.length - toInsert.length };
  },
});

// ─── Delete all flagged tweets for a campaign (e.g. on reset) ────────────────
export const clearForCampaign = mutation({
  args: { campaignId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const tweets = await ctx.db
      .query('flaggedTweets')
      .withIndex('by_campaign', q => q.eq('campaignId', args.campaignId))
      .filter(q => q.eq(q.field('userId'), identity.subject))
      .collect();

    await Promise.all(tweets.map(t => ctx.db.delete(t._id)));
    return { deleted: tweets.length };
  },
});
