import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/lib/hate-speech/dictionary';
import { analyzeTweetWithLLM } from '@/lib/hate-speech/llm-analyzer';
import { getLLMConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const config = getLLMConfig();
    const llmAvailable = config.provider !== 'none' && !!config.apiKey;

    // LLM is PRIMARY when configured — emotion-based, context-aware
    if (llmAvailable) {
      const llmResult = await analyzeTweetWithLLM(text);

      if (llmResult) {
        return NextResponse.json({
          score: llmResult.confidence,
          isHateSpeech: llmResult.isHateSpeech,
          categories: llmResult.categories,
          severity: llmResult.severity,
          targetGroup: llmResult.targetGroup,
          emotionalTone: llmResult.emotionalTone,
          intent: llmResult.intent,
          explanation: llmResult.explanation,
          analysisMethod: 'llm_emotion',
          llmProvider: config.provider,
          // Still run dictionary to surface matched patterns for UI display only
          dictionaryMatches: analyzeText(text).matches,
        });
      }

      // LLM call failed — fall through to dictionary with a warning
      console.warn('LLM call failed, falling back to dictionary analysis');
    }

    // FALLBACK: dictionary-based regex analysis (no LLM configured or LLM failed)
    const dictionaryResult = analyzeText(text);

    return NextResponse.json({
      score: dictionaryResult.score,
      isHateSpeech: dictionaryResult.score > 0.3,
      categories: dictionaryResult.categories,
      severity: dictionaryResult.score > 0.7 ? 'high' : dictionaryResult.score > 0.3 ? 'medium' : 'low',
      targetGroup: null,
      emotionalTone: 'neutral',
      intent: null,
      explanation: 'Analyzed using keyword pattern matching (configure LLM_PROVIDER for emotion-based analysis)',
      analysisMethod: 'dictionary_fallback',
      llmProvider: null,
      dictionaryMatches: dictionaryResult.matches,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
