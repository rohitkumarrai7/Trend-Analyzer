// Server-side only — do NOT import from client components

export type ApiTier = 'free' | 'basic' | 'pro' | 'enterprise';

export function getTwitterConfig() {
  const tier = (process.env.TWITTER_API_TIER || 'free') as ApiTier;
  return {
    bearerToken: process.env.TWITTER_BEARER_TOKEN || null,
    tier,
    capabilities: getTierCapabilities(tier),
  };
}

export function getTierCapabilities(tier: ApiTier) {
  return {
    canSearchTweets: tier !== 'free',
    canGetTrends: tier === 'pro' || tier === 'enterprise',
    canLookupUsers: tier !== 'free',
    canStreamTweets: tier === 'pro' || tier === 'enterprise',
    monthlyTweetCap: tier === 'free' ? 0 : tier === 'basic' ? 10000 : tier === 'pro' ? 1000000 : Infinity,
    searchRateLimit: tier === 'free' ? 0 : tier === 'basic' ? 60 : tier === 'pro' ? 300 : 600,
  };
}

export function getLLMConfig() {
  const provider = process.env.LLM_PROVIDER || 'none';
  return {
    provider,
    apiKey: process.env.LLM_API_KEY || null,
    model: process.env.LLM_MODEL || (provider === 'openrouter' ? 'arcee-ai/trinity-large-preview:free' : null),
  };
}
