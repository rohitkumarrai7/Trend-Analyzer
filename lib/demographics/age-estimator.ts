export interface AgeEstimate {
  bracket: '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  signals: string[];
}

export function estimateAgeFromBio(bio: string, accountCreatedAt?: string): AgeEstimate {
  if (!bio || bio.trim().length === 0) {
    return { bracket: 'unknown', confidence: 'low', signals: ['empty bio'] };
  }

  const signals: string[] = [];
  const lowerBio = bio.toLowerCase();

  // Direct age mentions: "19 y/o", "age 25", "21 years old"
  const directAge = lowerBio.match(/(\d{1,2})\s*(?:y\.?o\.?|years?\s*old|year\s*old)/);
  if (directAge) {
    const age = parseInt(directAge[1]);
    signals.push(`direct age: ${age}`);
    return { bracket: ageToBracket(age), confidence: 'high', signals };
  }

  // Birth year: "born in 2001", "class of 2023", "c/o 2024"
  const bornYear = lowerBio.match(/(?:born\s*(?:in\s*)?|class\s*of\s*|c\/o\s*)(\d{4})/);
  if (bornYear) {
    const age = new Date().getFullYear() - parseInt(bornYear[1]);
    signals.push(`birth year: ${bornYear[1]}`);
    return { bracket: ageToBracket(age), confidence: 'high', signals };
  }

  // Generational markers
  if (/\b(gen\s*z|zoomer|no\s*cap|fr\s*fr|bussin|slay|bestie|atp)\b/i.test(lowerBio)) {
    signals.push('gen-z language');
  }
  if (/\b(millennial|adulting|90s\s*kid)\b/i.test(lowerBio)) {
    signals.push('millennial marker');
  }
  if (/\b(baby\s*boomer|boomer|retired|grandpa|grandma|grandfather|grandmother)\b/i.test(lowerBio)) {
    signals.push('boomer marker');
  }

  // Education/career stage
  if (/\b(student|uni|university|college|freshman|sophomore|junior|senior|grad\s*student|phd\s*candidate|class\s*of\s*20[2-3])/i.test(lowerBio)) {
    signals.push('student indicator');
  }
  if (/\b(entry\s*level|junior\s*dev|aspiring|learning|intern|new\s*grad)\b/i.test(lowerBio)) {
    signals.push('early career');
  }
  if (/\b(senior\s*|lead\s*|manager|director|10\+?\s*years|experienced)\b/i.test(lowerBio)) {
    signals.push('mid career');
  }
  if (/\b(mom|dad|father|mother|parent|mama|papa|wife|husband)\s*(?:of|to)/i.test(lowerBio)) {
    signals.push('parent reference');
  }

  // Score-based estimation
  let estimatedAge = 28;
  if (signals.includes('gen-z language')) estimatedAge -= 8;
  if (signals.includes('student indicator')) estimatedAge -= 6;
  if (signals.includes('early career')) estimatedAge -= 3;
  if (signals.includes('millennial marker')) estimatedAge += 2;
  if (signals.includes('mid career')) estimatedAge += 8;
  if (signals.includes('parent reference')) estimatedAge += 5;
  if (signals.includes('boomer marker')) estimatedAge += 25;

  // Account age as weak signal
  if (accountCreatedAt) {
    const accountAge = new Date().getFullYear() - new Date(accountCreatedAt).getFullYear();
    if (accountAge > 12) { signals.push(`old account: ${accountAge}yr`); estimatedAge += 3; }
    if (accountAge < 2) { signals.push('new account'); }
  }

  if (signals.length === 0) {
    return { bracket: 'unknown', confidence: 'low', signals: ['no signals found'] };
  }

  const confidence = signals.length >= 2 ? 'medium' : 'low';
  return { bracket: ageToBracket(estimatedAge), confidence, signals };
}

function ageToBracket(age: number): AgeEstimate['bracket'] {
  if (age < 18) return '13-17';
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  return '55+';
}

export function aggregateDemographics(
  users: Array<{ bio: string; createdAt?: string }>
): Record<AgeEstimate['bracket'], number> {
  const counts: Record<string, number> = {
    '13-17': 0, '18-24': 0, '25-34': 0,
    '35-44': 0, '45-54': 0, '55+': 0, 'unknown': 0,
  };

  for (const user of users) {
    const estimate = estimateAgeFromBio(user.bio, user.createdAt);
    counts[estimate.bracket]++;
  }

  return counts as Record<AgeEstimate['bracket'], number>;
}
