import { getLLMConfig } from '@/lib/config';

export interface LLMAnalysisResult {
  isHateSpeech: boolean;
  confidence: number;
  targetGroup: string | null;
  emotionalTone: 'hateful' | 'hostile' | 'neutral' | 'supportive' | 'condemning';
  intent: string;
  categories: string[];
  explanation: string;
  severity: 'none' | 'low' | 'medium' | 'high';
}

// Emotion-focused system prompt — no keyword/regex logic
// The model must judge INTENT and TONE, not word presence
const SYSTEM_PROMPT = `You are an expert hate speech analyst trained in psychology, linguistics, and social media behavior.

Your job is to detect hate speech by analyzing EMOTIONAL INTENT and TONE — NOT by matching keywords.

CRITICAL RULES:
1. A post that MENTIONS words like "racism", "hate", "slur" may actually be CONDEMNING hate — read the intent
2. Sarcasm, irony, and counter-speech must be recognized — "Oh sure, discriminate more, great idea" is NOT hate speech
3. Focus on: Who is the emotional TARGET? What does the author INTEND toward that group?
4. Dehumanization, calls to harm, threats, and contempt toward a group = hate speech
5. News reporting, academic discussion, or condemning hate = NOT hate speech even if it describes hate acts
6. Venting frustration at an individual ≠ hate speech unless it targets a protected group identity

WHAT TO DETECT:
- Dehumanizing language toward a group (race, religion, gender, sexuality, disability, nationality)
- Calls for violence, exclusion, or discrimination
- Emotional contempt or disgust expressed AT a group (not about a topic)
- Coded language and dog-whistles that signal hate without using explicit slurs
- Posts that normalize hatred even without explicit slurs

WHAT TO IGNORE (false positives to avoid):
- Anti-hate activism and reporting ("We must stop racism")
- Quoting hate speech to document or condemn it
- Political criticism of policies (not people's identity)
- Profanity or anger not directed at a protected group

You must respond with ONLY valid JSON. No explanation outside the JSON.`;

const buildPrompt = (text: string): string => `Analyze this social media post for hate speech using emotional and contextual understanding — not keyword matching.

POST: "${text}"

Respond with ONLY this JSON structure:
{
  "isHateSpeech": boolean,
  "confidence": number between 0.0 and 1.0,
  "targetGroup": "the specific group being targeted, or null if no group is targeted",
  "emotionalTone": one of ["hateful", "hostile", "neutral", "supportive", "condemning"],
  "intent": "one sentence describing what the author is trying to express or achieve",
  "categories": array from ["racial", "religious", "gender", "sexual_orientation", "disability", "xenophobic", "other"] — empty array if not hate speech,
  "explanation": "2-3 sentences explaining the emotional reasoning behind your decision — what tone signals you detected",
  "severity": one of ["none", "low", "medium", "high"]
}`;

export async function analyzeTweetWithLLM(tweetText: string): Promise<LLMAnalysisResult | null> {
  const config = getLLMConfig();

  if (config.provider === 'none' || !config.apiKey) {
    return null;
  }

  const prompt = buildPrompt(tweetText);

  try {
    if (config.provider === 'openrouter') {
      return await callOpenRouter(config, prompt);
    } else if (config.provider === 'openai') {
      return await callOpenAI(config, prompt);
    } else if (config.provider === 'anthropic') {
      return await callAnthropic(config, prompt);
    }
  } catch (error) {
    console.error('LLM analysis failed:', error);
    return null;
  }

  return null;
}

function parseJSONResponse(text: string): LLMAnalysisResult {
  let jsonStr = text.trim();

  // Strip markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  // Extract raw JSON object if surrounded by other text
  const objMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objMatch) {
    jsonStr = objMatch[0];
  }

  const parsed = JSON.parse(jsonStr);

  // Normalize and validate fields
  return {
    isHateSpeech: Boolean(parsed.isHateSpeech),
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
    targetGroup: parsed.targetGroup || null,
    emotionalTone: parsed.emotionalTone || 'neutral',
    intent: parsed.intent || '',
    categories: Array.isArray(parsed.categories) ? parsed.categories : [],
    explanation: parsed.explanation || '',
    severity: parsed.severity || 'none',
  };
}

async function callOpenRouter(config: any, prompt: string): Promise<LLMAnalysisResult> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://trend-analyzer.app',
      'X-Title': 'TrendMap - Emotion-Based Hate Speech Detection',
    },
    body: JSON.stringify({
      model: config.model || 'arcee-ai/trinity-large-preview:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenRouter');
  return parseJSONResponse(content);
}

async function callOpenAI(config: any, prompt: string): Promise<LLMAnalysisResult> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');
  return parseJSONResponse(content);
}

async function callAnthropic(config: any, prompt: string): Promise<LLMAnalysisResult> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-sonnet-4-6',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error('Empty response from Anthropic');
  return parseJSONResponse(content);
}
