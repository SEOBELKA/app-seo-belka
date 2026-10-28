export interface SEODataPoint {
  id: string;
  keyword: string;
  impressions: number;
  clicks: number;
  ctr: number; // percentage (clicks / impressions * 100)
  position?: number; // 1 to 100
  targetKeywordId?: string; // matched to one of the 5 target keywords if any
}

export interface TargetKeyword {
  id: string;
  text: string;
  intent: 'Transaccional' | 'Informativa' | 'Comercial' | 'Navegacional';
  searchVolume: number;
  difficulty: number; // 1 to 100
  currentPosition: number; // 1 to 100
  rankingProbability: number; // 0 to 100 (%)
  confidenceScore: number; // 0 to 100 (%)
  matchedImpressions: number;
  matchedClicks: number;
  matchedCTR: number;
}

export interface DomainProfile {
  domain: string;
  targetKeywords: TargetKeyword[];
}

export type QuadrantType = 'champions' | 'ctr_opportunity' | 'zombie' | 'niche_power';

export interface QuadrantSummary {
  type: QuadrantType;
  title: string;
  description: string;
  count: number;
  totalImpressions: number;
  totalClicks: number;
  avgCTR: number;
  recommendation: string;
  points: SEODataPoint[];
}

export interface SEODiagnosis {
  totalImpressions: number;
  totalClicks: number;
  globalCTR: number;
  benchmarkCTR: number;
  ctrDifference: number; // percentage points
  regressionSlope: number; // clicks per impression
  expectedClicksPer1kImpressions: number;
  quadrants: {
    champions: QuadrantSummary;
    ctr_opportunity: QuadrantSummary;
    zombie: QuadrantSummary;
    niche_power: QuadrantSummary;
  };
  keyInsights: {
    headline: string;
    details: string;
    impact: 'Alta' | 'Media' | 'Baja';
    type: 'positive' | 'warning' | 'opportunity';
  }[];
  actionPlan: {
    title: string;
    category: 'Title & Snippets' | 'Intención & Contenido' | 'Arquitectura & CTR' | 'Canibalización & Enlazado';
    description: string;
    targetItems: string[];
    priority: 'Inmediata' | 'Alta' | 'Media';
  }[];
}

export interface KDEPoint {
  x: number; // Probability / Ranking score (0-100)
  density: number; // Continuous estimated probability density
}

export interface HistogramBin {
  x0: number;
  x1: number;
  count: number;
  density: number;
}

export interface KeywordKDEDensity {
  keywordId: string;
  keywordText: string;
  color: string;
  curve: KDEPoint[];
  peakProbability: number;
  peakDensity: number;
  meanProbability: number;
  recommendedAction: string;
}

export interface KDEResult {
  overallCurve: KDEPoint[];
  histogramBins: HistogramBin[];
  bandwidth: number;
  keywordCurves: KeywordKDEDensity[];
  topProbabilityKeyword: string;
}
