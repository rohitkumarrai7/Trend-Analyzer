import { getLLMConfig } from '@/lib/config';

export interface LLMAnalysisResult {
  isHateSpeech: boolean;
  confidence: number;
  categories: string[];
  explanation: string;
  severity: 'none' | 'low' | 'medium' | 'high';
}

export async function analyzeTweetWithLLM(tweetText: string): Promise<LLMAnalysisResult | null> {
  const config = getLLMConfig();

  if (config.provider === 'none' || !config.apiKey) {
    return null;
  }

  const prompt = `Analyze the following social media post for hate speech, racism, bigotry, or discrimination. Rate the severity and classify the type.

Post: "${tweetText}"

You MUST respond with ONLY valid JSON, no other text:
{
  "isHateSpeech": boolean,
  "confidence": number (0-1),
  "categories": string[] (from: racial, religious, gender, sexual_orientation, disability, xenophobic, other),
  "explanation": "brief explanation",
  "severity": "none" | "low" | "medium" | "high"
}`;

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
  // Extract JSON from response — models sometimes wrap it in markdown code blocks
  let jsonStr = text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  // Also try to find raw JSON object
  const objMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objMatch) {
    jsonStr = objMatch[0];
  }
  return JSON.parse(jsonStr);
}

async function callOpenRouter(config: any, prompt: string): Promise<LLMAnalysisResult> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://trend-analyzer.app',
      'X-Title': 'Trend Analyzer - Hate Speech Detection',
    },
    body: JSON.stringify({
      model: config.model || 'arcee-ai/trinity-large-preview:free',
      messages: [
        {
          role: 'system',
          content: 'You are a hate speech detection system. You analyze social media posts and respond ONLY with valid JSON. No explanations outside the JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 500,
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
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });
  const data = await res.json();
  return parseJSONResponse(data.choices[0].message.content);
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
      model: config.model || 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return parseJSONResponse(data.content[0].text);
}
