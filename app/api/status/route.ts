import { NextResponse } from 'next/server';
import { getTwitterConfig, getLLMConfig } from '@/lib/config';

export async function GET() {
  const twitter = getTwitterConfig();
  const llm = getLLMConfig();

  return NextResponse.json({
    twitter: {
      configured: !!twitter.bearerToken,
      tier: twitter.tier,
      capabilities: twitter.capabilities,
    },
    llm: {
      configured: llm.provider !== 'none' && !!llm.apiKey,
      provider: llm.provider,
    },
    timestamp: new Date().toISOString(),
  });
}
