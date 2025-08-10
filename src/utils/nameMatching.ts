export function normalizeCharacterName(originalName: string): string {
  if (!originalName) return '';
  let name = originalName.replace(/\s*\([^)]*\)/g, '');
  name = name.replace(/["'][^"']*["']/g, ' ');
  name = name.trim().replace(/\s+/g, ' ');
  if (name.includes('/')) {
    name = name.split('/')[0].trim();
  }
  name = name.replace(/^the\s+/i, '');
  const titleTokens = [
    'mr',
    'mrs',
    'ms',
    'miss',
    'dr',
    'doctor',
    'prof',
    'professor',
    'sir',
    'dame',
    'lady',
    'lord',
    'capt',
    'captain',
    'col',
    'colonel',
    'lt',
    'lieutenant',
    'maj',
    'major',
    'sgt',
    'sergeant',
    'cpl',
    'corporal',
    'pvt',
    'private',
    'cmdr',
    'commander',
    'gen',
    'general',
    'chief',
    'officer',
    'agent',
    'detective',
  ];
  const titlesRegex = new RegExp(`(^|\\b)(${titleTokens.join('|')})\\.?\\s+`, 'gi');
  name = name.replace(titlesRegex, '$1');
  name = name.replace(/[.,]+/g, ' ').replace(/\s+/g, ' ').trim();
  return name;
}

export function levenshteinDistance(a: string, b: string): number {
  const s = a.toLowerCase();
  const t = b.toLowerCase();
  const m = s.length;
  const n = t.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function areNamesClose(a: string, b: string): boolean {
  const tokenize = (x: string) =>
    x
      .toLowerCase()
      .replace(/["'][^"']*["']/g, ' ')
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

  const TITLE_TOKENS = new Set([
    'mr',
    'mrs',
    'ms',
    'miss',
    'dr',
    'doctor',
    'prof',
    'professor',
    'sir',
    'dame',
    'lady',
    'lord',
    'capt',
    'captain',
    'col',
    'colonel',
    'lt',
    'lieutenant',
    'maj',
    'major',
    'sgt',
    'sergeant',
    'cpl',
    'corporal',
    'pvt',
    'private',
    'cmdr',
    'commander',
    'gen',
    'general',
    'chief',
    'officer',
    'agent',
    'detective',
  ]);
  const STOP_TOKENS = new Set(['jr', 'sr', 'ii', 'iii', 'iv']);

  const filterTokens = (tokens: string[]) => tokens.filter(t => !TITLE_TOKENS.has(t) && !STOP_TOKENS.has(t));

  const ta = filterTokens(tokenize(a));
  const tb = filterTokens(tokenize(b));

  if (ta.length === 0 || tb.length === 0) return false;

  const setA = new Set(ta);
  const setB = new Set(tb);

  const isSubset = (small: Set<string>, big: Set<string>) => [...small].every(t => big.has(t));
  if (isSubset(setA, setB) || isSubset(setB, setA)) return true;

  const intersectionSize = [...setA].filter(t => setB.has(t)).length;
  const unionSize = new Set([...setA, ...setB]).size;
  if (unionSize > 0 && intersectionSize / unionSize >= 0.6) return true;

  const concat = (tokens: string[]) => tokens.join('');
  const aa = concat(ta);
  const bb = concat(tb);
  if (aa === bb) return true;
  if (aa.includes(bb) || bb.includes(aa)) {
    const shorter = Math.min(aa.length, bb.length);
    const longer = Math.max(aa.length, bb.length);
    if (shorter / longer >= 0.7) return true;
  }
  const dist = levenshteinDistance(aa, bb);
  const maxLen = Math.max(aa.length, bb.length);
  return dist <= Math.max(1, Math.floor(maxLen * 0.25));
}

export function findCloseCanonicalKey(target: string, existingKeys: Iterable<string>): string | null {
  for (const key of existingKeys) {
    if (areNamesClose(target, key)) return key;
  }
  return null;
}


