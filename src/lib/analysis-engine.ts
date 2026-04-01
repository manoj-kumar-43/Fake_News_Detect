// Heuristic-based fake news detection engine
// In production, replace with a real ML model API (TF-IDF + Logistic Regression)

export type Verdict = "real" | "fake" | "uncertain";

export interface AnalysisResult {
  verdict: Verdict;
  confidence: number; // 0-100
  factors: AnalysisFactor[];
  summary: string;
}

export interface AnalysisFactor {
  name: string;
  score: number; // -1 to 1 (negative = fake signal, positive = real signal)
  description: string;
}

const CLICKBAIT_PATTERNS = [
  /you won't believe/i, /shocking/i, /mind.?blowing/i, /this is why/i,
  /exposed/i, /what they don't want you to know/i, /secret/i,
  /breaking.*:/i, /urgent/i, /alert/i, /conspiracy/i,
  /they don't want you to see/i, /mainstream media/i, /wake up/i,
  /share before.*deleted/i, /100% proof/i, /exposed/i,
];

const EMOTIONAL_WORDS = [
  "outrageous", "disgusting", "terrifying", "horrifying", "unbelievable",
  "catastrophic", "devastating", "bombshell", "explosive", "sinister",
  "evil", "corrupt", "traitor", "destroy", "ruined", "hoax", "scam",
];

const CREDIBILITY_INDICATORS = [
  /according to/i, /study (shows|finds|suggests)/i, /researchers/i,
  /university/i, /published in/i, /data (shows|suggests)/i,
  /percent/i, /statistics/i, /report(ed|s)/i, /official/i,
  /spokesperson/i, /evidence/i,
];

function analyzeClickbait(text: string): AnalysisFactor {
  const matches = CLICKBAIT_PATTERNS.filter(p => p.test(text)).length;
  const score = Math.max(-1, -matches * 0.3);
  return {
    name: "Clickbait Detection",
    score,
    description: matches > 0
      ? `Found ${matches} clickbait pattern${matches > 1 ? "s" : ""} commonly associated with misleading content.`
      : "No clickbait patterns detected.",
  };
}

function analyzeEmotionalLanguage(text: string): AnalysisFactor {
  const words = text.toLowerCase().split(/\s+/);
  const emotionalCount = words.filter(w => EMOTIONAL_WORDS.includes(w)).length;
  const ratio = emotionalCount / Math.max(words.length, 1);
  const score = Math.max(-1, -ratio * 20);
  return {
    name: "Emotional Language",
    score,
    description: emotionalCount > 0
      ? `Detected ${emotionalCount} emotionally charged word${emotionalCount > 1 ? "s" : ""}. High emotional language can indicate bias.`
      : "Language appears neutral and factual.",
  };
}

function analyzeCredibilityMarkers(text: string): AnalysisFactor {
  const matches = CREDIBILITY_INDICATORS.filter(p => p.test(text)).length;
  const score = Math.min(1, matches * 0.2);
  return {
    name: "Source Attribution",
    score,
    description: matches > 0
      ? `Found ${matches} credibility indicator${matches > 1 ? "s" : ""} (citations, data references, source attribution).`
      : "No source citations or data references found.",
  };
}

function analyzeTextQuality(text: string): AnalysisFactor {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);
  const capsRatio = (text.match(/[A-Z]/g)?.length || 0) / Math.max(text.length, 1);
  const excessivePunctuation = (text.match(/[!?]{2,}/g)?.length || 0);

  let score = 0;
  const issues: string[] = [];

  if (capsRatio > 0.4) { score -= 0.4; issues.push("excessive capitalization"); }
  if (excessivePunctuation > 2) { score -= 0.3; issues.push("excessive punctuation"); }
  if (avgSentenceLength < 5 && sentences.length > 1) { score -= 0.2; issues.push("very short sentences"); }
  if (avgSentenceLength > 10 && avgSentenceLength < 30) { score += 0.3; }
  if (words.length > 100) { score += 0.2; }

  return {
    name: "Writing Quality",
    score: Math.max(-1, Math.min(1, score)),
    description: issues.length > 0
      ? `Issues detected: ${issues.join(", ")}. These patterns are common in misinformation.`
      : "Writing quality appears consistent with professional journalism.",
  };
}

function analyzeLength(text: string): AnalysisFactor {
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  let score = 0;
  let desc = "";

  if (words < 20) {
    score = -0.3;
    desc = "Very short text. Reliable news articles typically contain more detail.";
  } else if (words < 50) {
    score = 0;
    desc = "Moderate length. More context would improve analysis accuracy.";
  } else {
    score = 0.2;
    desc = "Sufficient text length for meaningful analysis.";
  }

  return { name: "Content Depth", score, description: desc };
}

export function analyzeNews(text: string): AnalysisResult {
  const cleanText = text.trim();
  if (cleanText.length < 10) {
    return {
      verdict: "uncertain",
      confidence: 0,
      factors: [],
      summary: "Please provide more text for analysis.",
    };
  }

  const factors = [
    analyzeClickbait(cleanText),
    analyzeEmotionalLanguage(cleanText),
    analyzeCredibilityMarkers(cleanText),
    analyzeTextQuality(cleanText),
    analyzeLength(cleanText),
  ];

  const avgScore = factors.reduce((sum, f) => sum + f.score, 0) / factors.length;
  const normalizedConfidence = Math.min(95, Math.abs(avgScore) * 100 + 30);

  let verdict: Verdict;
  let summary: string;

  if (avgScore > 0.1) {
    verdict = "real";
    summary = "This content shows characteristics consistent with credible news reporting, including source attribution and professional writing quality.";
  } else if (avgScore < -0.15) {
    verdict = "fake";
    summary = "This content exhibits patterns commonly associated with misinformation, including sensationalist language and lack of credible sources.";
  } else {
    verdict = "uncertain";
    summary = "The analysis is inconclusive. The content shows mixed signals. Consider verifying with trusted sources.";
  }

  return { verdict, confidence: Math.round(normalizedConfidence), factors, summary };
}

// History management
export interface AnalysisRecord {
  id: string;
  text: string;
  result: AnalysisResult;
  timestamp: number;
  source: "text" | "url";
}

const STORAGE_KEY = "fakenews_history";

export function saveAnalysis(record: AnalysisRecord) {
  const history = getHistory();
  history.unshift(record);
  if (history.length > 50) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistory(): AnalysisRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getStats() {
  const history = getHistory();
  const total = history.length;
  const real = history.filter(r => r.result.verdict === "real").length;
  const fake = history.filter(r => r.result.verdict === "fake").length;
  const uncertain = history.filter(r => r.result.verdict === "uncertain").length;
  return { total, real, fake, uncertain };
}
