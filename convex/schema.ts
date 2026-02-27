import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ── Campaigns ─────────────────────────────────────────────────────────────
  campaigns: defineTable({
    userId: v.string(),           // Clerk user subject (sub)
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal('active'), v.literal('paused'), v.literal('completed')),
    keywords: v.array(v.string()),
    hashtags: v.array(v.string()),
    monitoredLocations: v.array(v.number()),  // WOEIDs
    totalMatches: v.number(),
    alertThreshold: v.number(),
    alertEnabled: v.boolean(),
    // Scheduled scanning
    scanInterval: v.optional(v.number()),     // hours between scans (12 or 24)
    lastScannedAt: v.optional(v.number()),    // Unix timestamp ms
  }).index('by_user', ['userId']),

  // ── Flagged tweets (persisted so they survive navigation and server restart) ──
  flaggedTweets: defineTable({
    campaignId: v.string(),         // campaigns._id as string
    userId: v.string(),             // owner (for security filtering)
    tweetId: v.string(),
    text: v.string(),
    authorHandle: v.string(),
    authorLocation: v.optional(v.string()),
    authorBio: v.optional(v.string()),
    createdAt: v.string(),          // ISO string from Twitter
    hateSpeechScore: v.number(),    // 0.0 – 1.0
    categories: v.array(v.string()),
    likes: v.number(),
    retweets: v.number(),
    replies: v.number(),
    scannedAt: v.number(),          // Unix ms when this scan ran
    source: v.string(),             // 'twitter_guest' | 'simulation'
  })
    .index('by_campaign', ['campaignId'])
    .index('by_campaign_score', ['campaignId', 'hateSpeechScore']),
});
