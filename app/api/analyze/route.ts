import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/lib/hate-speech/dictionary';
import { analyzeTweetWithLLM } from '@/lib/hate-speech/llm-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { text, useLLM = false } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Always run dictionary-based analysis (fast, free)
    const dictionaryResult = analyzeText(text);

    // Optionally run LLM analysis (slower, costs money)
    let llmResult = null;
    if (useLLM) {
      llmResult = await analyzeTweetWithLLM(text);
    }

    const combined = {
      score: llmResult ? llmResult.confidence : dictionaryResult.score,
      isHateSpeech: llmResult ? llmResult.isHateSpeech : dictionaryResult.score > 0.3,
      categories: llmResult ? llmResult.categories : dictionaryResult.categories,
      severity: llmResult?.severity || (dictionaryResult.score > 0.7 ? 'high' : dictionaryResult.score > 0.3 ? 'medium' : 'low'),
      dictionaryMatches: dictionaryResult.matches,
      llmAnalysis: llmResult,
    };

    return NextResponse.json(combined);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
