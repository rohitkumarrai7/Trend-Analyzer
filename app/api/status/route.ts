import { NextResponse } from 'next/server';
import { getGuestToken } from '@/lib/twitter-guest';
import { getLLMConfig } from '@/lib/config';

export async function GET() {
  const llm = getLLMConfig();

  // Check if Twitter guest token is reachable
  let twitterWorking = false;
  let twitterError: string | null = null;

  try {
    await getGuestToken();
    twitterWorking = true;
  } catch (err) {
    twitterError = (err as Error).message;
  }

  return NextResponse.json({
    twitter: {
      method: 'guest_token',
      working: twitterWorking,
      note: twitterWorking
        ? 'Real tweets active — zero setup, completely free'
        : `Guest token unavailable: ${twitterError}`,
      setupRequired: false,
    },
    llm: {
      configured: llm.provider !== 'none' && !!llm.apiKey,
      provider: llm.provider,
      model: llm.model,
    },
    activeSource: twitterWorking ? 'twitter_guest' : 'simulation',
    timestamp: new Date().toISOString(),
  });
}
