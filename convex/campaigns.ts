import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// ─── List all campaigns for the current user ──────────────────────────────────
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query('campaigns')
      .withIndex('by_user', q => q.eq('userId', identity.subject))
      .collect();
  },
});

// ─── Create a new campaign ────────────────────────────────────────────────────
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    keywords: v.array(v.string()),
    hashtags: v.array(v.string()),
    monitoredLocations: v.array(v.number()),
    alertThreshold: v.optional(v.number()),
    scanInterval: v.optional(v.number()),   // hours: 12 or 24
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db.insert('campaigns', {
      userId: identity.subject,
      name: args.name,
      description: args.description,
      status: 'active',
      keywords: args.keywords,
      hashtags: args.hashtags,
      monitoredLocations: args.monitoredLocations,
      totalMatches: 0,
      alertThreshold: args.alertThreshold ?? 10,
      alertEnabled: true,
      scanInterval: args.scanInterval ?? 12,
      lastScannedAt: undefined,
    });
  },
});

// ─── Toggle active / paused ───────────────────────────────────────────────────
export const updateStatus = mutation({
  args: {
    id: v.id('campaigns'),
    status: v.union(v.literal('active'), v.literal('paused'), v.literal('completed')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) throw new Error('Not found');

    await ctx.db.patch(args.id, { status: args.status });
  },
});

// ─── Update scan interval ─────────────────────────────────────────────────────
export const updateScanInterval = mutation({
  args: {
    id: v.id('campaigns'),
    scanInterval: v.number(),  // hours
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) throw new Error('Not found');

    await ctx.db.patch(args.id, { scanInterval: args.scanInterval });
  },
});

// ─── Record scan completion ───────────────────────────────────────────────────
export const recordScan = mutation({
  args: {
    id: v.id('campaigns'),
    matchCount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) throw new Error('Not found');

    await ctx.db.patch(args.id, {
      totalMatches: (doc.totalMatches || 0) + args.matchCount,
      lastScannedAt: Date.now(),
    });
  },
});

// ─── Increment total matches (legacy, kept for compat) ───────────────────────
export const addMatches = mutation({
  args: {
    id: v.id('campaigns'),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) throw new Error('Not found');

    await ctx.db.patch(args.id, {
      totalMatches: (doc.totalMatches || 0) + args.count,
      lastScannedAt: Date.now(),
    });
  },
});

// ─── Delete ───────────────────────────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id('campaigns') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) throw new Error('Not found');

    // Delete associated flagged tweets first
    const tweets = await ctx.db
      .query('flaggedTweets')
      .withIndex('by_campaign', q => q.eq('campaignId', args.id as string))
      .collect();
    await Promise.all(tweets.map(t => ctx.db.delete(t._id)));

    await ctx.db.delete(args.id);
  },
});
