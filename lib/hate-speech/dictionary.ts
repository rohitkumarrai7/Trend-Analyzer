export interface HateSpeechMatch {
  word: string;
  category: HateCategory;
  severity: 'low' | 'medium' | 'high';
  context: string;
}

export type HateCategory =
  | 'racial'
  | 'religious'
  | 'gender'
  | 'sexual_orientation'
  | 'disability'
  | 'xenophobic'
  | 'other';

interface DictionaryEntry {
  patterns: RegExp[];
  category: HateCategory;
  severity: 'low' | 'medium' | 'high';
}

// Hate speech keyword dictionary — intentionally uses detectable patterns
// In production, expand with a comprehensive lexicon (e.g., Hatebase.org)
const DICTIONARY: DictionaryEntry[] = [
  {
    patterns: [/\bracis[tm]\b/i, /\bwhite\s*suprem/i, /\bethnic\s*cleansing/i, /\brace\s*war/i],
    category: 'racial',
    severity: 'high',
  },
  {
    patterns: [/\bracial\s*slur/i, /\bskin\s*color/i, /\bcoloris[tm]/i],
    category: 'racial',
    severity: 'medium',
  },
  {
    patterns: [/\bxenophob/i, /\bgo\s*back\s*to\s*your/i, /\billegal\s*alien/i, /\bforeigner/i],
    category: 'xenophobic',
    severity: 'medium',
  },
  {
    patterns: [/\banti[\s-]*semit/i, /\bislamophob/i, /\breligious\s*hate/i],
    category: 'religious',
    severity: 'high',
  },
  {
    patterns: [/\bsexis[tm]\b/i, /\bmisogyn/i, /\bmisandr/i],
    category: 'gender',
    severity: 'medium',
  },
  {
    patterns: [/\bhomophob/i, /\btransphob/i, /\banti[\s-]*lgbtq?/i],
    category: 'sexual_orientation',
    severity: 'high',
  },
  {
    patterns: [/\bableism\b/i, /\bableist\b/i],
    category: 'disability',
    severity: 'medium',
  },
  {
    patterns: [/\bhate\s*speech/i, /\bbigot/i, /\bdiscriminat/i, /\bprejudic/i],
    category: 'other',
    severity: 'medium',
  },
  {
    patterns: [/\bsupremac/i, /\bgenocid/i, /\bethnocid/i],
    category: 'racial',
    severity: 'high',
  },
];

export function analyzeText(text: string): {
  score: number;
  matches: HateSpeechMatch[];
  categories: HateCategory[];
} {
  const matches: HateSpeechMatch[] = [];

  for (const entry of DICTIONARY) {
    for (const pattern of entry.patterns) {
      const match = text.match(pattern);
      if (match) {
        const index = match.index || 0;
        const contextStart = Math.max(0, index - 30);
        const contextEnd = Math.min(text.length, index + match[0].length + 30);

        matches.push({
          word: match[0],
          category: entry.category,
          severity: entry.severity,
          context: text.substring(contextStart, contextEnd),
        });
      }
    }
  }

  const categories = Array.from(new Set(matches.map(m => m.category)));

  const severityWeights = { low: 0.2, medium: 0.5, high: 1.0 };
  const rawScore = matches.reduce((sum, m) => sum + severityWeights[m.severity], 0);
  const score = Math.min(1, rawScore / 3);

  return { score, matches, categories };
}
