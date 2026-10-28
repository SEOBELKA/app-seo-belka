import { KDEPoint, HistogramBin, SEODataPoint, TargetKeyword, KeywordKDEDensity, KDEResult } from '../types/seo';

/**
 * Standard Normal Gaussian Kernel function K(u) = (1 / sqrt(2 * PI)) * exp(-0.5 * u^2)
 */
export function gaussianKernel(u: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
}

/**
 * Computes sample mean of an array of numbers
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

/**
 * Computes sample standard deviation
 */
export function calculateStandardDeviation(values: number[], mean?: number): number {
  if (values.length <= 1) return 1;
  const m = mean ?? calculateMean(values);
  const variance = values.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (values.length - 1);
  return Math.sqrt(variance) || 1;
}

/**
 * Silverman's Rule of Thumb for Gaussian Kernel Density Estimation bandwidth
 */
export function calculateSilvermanBandwidth(values: number[]): number {
  if (values.length <= 1) return 4.0;
  const sd = calculateStandardDeviation(values);
  // Silverman's rule: 1.06 * sd * n^(-1/5)
  const bandwidth = 1.06 * sd * Math.pow(values.length, -0.2);
  // Safeguard against too small or too large bandwidth
  return Math.max(1.5, Math.min(bandwidth, 15));
}

/**
 * Evaluates 1D Kernel Density Estimation at point x
 */
export function evaluateKDE(x: number, samplePoints: number[], bandwidth: number): number {
  if (samplePoints.length === 0 || bandwidth <= 0) return 0;
  let sum = 0;
  for (let i = 0; i < samplePoints.length; i++) {
    const u = (x - samplePoints[i]) / bandwidth;
    sum += gaussianKernel(u);
  }
  return sum / (samplePoints.length * bandwidth);
}

/**
 * Generates continuous KDE curve points over a given evaluation domain [minX, maxX]
 */
export function generateKDECurve(
  samplePoints: number[],
  minX = 0,
  maxX = 100,
  numSteps = 100,
  bandwidthMultiplier = 1.0
): { curve: KDEPoint[]; bandwidth: number } {
  if (samplePoints.length === 0) {
    const emptyCurve: KDEPoint[] = [];
    const step = (maxX - minX) / numSteps;
    for (let i = 0; i <= numSteps; i++) {
      emptyCurve.push({ x: minX + i * step, density: 0 });
    }
    return { curve: emptyCurve, bandwidth: 4.0 };
  }

  const baseBandwidth = calculateSilvermanBandwidth(samplePoints);
  const bandwidth = Math.max(0.5, baseBandwidth * bandwidthMultiplier);
  const step = (maxX - minX) / numSteps;
  const curve: KDEPoint[] = [];

  for (let i = 0; i <= numSteps; i++) {
    const x = minX + i * step;
    const density = evaluateKDE(x, samplePoints, bandwidth);
    curve.push({ x, density });
  }

  return { curve, bandwidth };
}

/**
 * Computes equal-width histogram bins and normalized density for overlay with KDE
 */
export function computeHistogramBins(
  values: number[],
  minX = 0,
  maxX = 100,
  numBins = 12
): HistogramBin[] {
  if (values.length === 0) return [];
  const binWidth = (maxX - minX) / numBins;
  const bins: HistogramBin[] = [];

  for (let i = 0; i < numBins; i++) {
    bins.push({
      x0: minX + i * binWidth,
      x1: minX + (i + 1) * binWidth,
      count: 0,
      density: 0,
    });
  }

  for (const v of values) {
    if (v < minX) {
      bins[0].count++;
    } else if (v >= maxX) {
      bins[numBins - 1].count++;
    } else {
      const idx = Math.min(numBins - 1, Math.floor((v - minX) / binWidth));
      bins[idx].count++;
    }
  }

  // Normalize counts to probability density (area under histogram equals 1)
  const totalCount = values.length;
  for (const bin of bins) {
    bin.density = totalCount > 0 ? bin.count / (totalCount * binWidth) : 0;
  }

  return bins;
}

/**
 * Estimates ranking probability (0 to 100%) for a target keyword based on:
 * - Current SERP position
 * - Keyword Difficulty (KD)
 * - Match to high-CTR data points
 * - Search Intent alignability
 */
export function calculateKeywordRankingProbability(
  keyword: TargetKeyword,
  allDataPoints: SEODataPoint[]
): { probability: number; confidence: number; samples: number[] } {
  // Base probability inversely proportional to current position (pos 1 = 95%, pos 50 = 20%, pos 100 = 5%)
  const posFactor = Math.max(0, 100 - (keyword.currentPosition - 1) * 1.5);
  // Difficulty penalty: higher KD reduces probability
  const difficultyFactor = Math.max(10, 100 - keyword.difficulty * 0.7);

  // Intent multiplier
  const intentMultiplier =
    keyword.intent === 'Transaccional' ? 1.15 :
    keyword.intent === 'Comercial' ? 1.05 :
    keyword.intent === 'Informativa' ? 0.95 : 1.0;

  // GSC CTR performance match
  let ctrBoost = 0;
  if (keyword.matchedCTR > 0) {
    // If CTR > 3.5%, positive momentum
    ctrBoost = Math.min(20, Math.max(-15, (keyword.matchedCTR - 2.5) * 5));
  }

  // Volume factor
  const volLog = Math.log10(Math.max(10, keyword.searchVolume));
  const volumePenalty = volLog > 4.5 ? -8 : (volLog > 3 ? -2 : 5);

  let rawScore = (posFactor * 0.45 + difficultyFactor * 0.35 + ctrBoost + volumePenalty) * (intentMultiplier);
  const probability = Math.round(Math.min(96, Math.max(5, rawScore)));

  // Generate synthetic Monte-Carlo samples around this probability representing
  // SERP distribution fluctuations and positioning probabilities for the KDE model
  const variance = Math.max(4, (keyword.difficulty / 100) * 12);
  const samples: number[] = [];
  const sampleCount = 35;

  for (let i = 0; i < sampleCount; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random() || 0.0001;
    const u2 = Math.random() || 0.0001;
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const sampleVal = Math.min(99, Math.max(1, probability + z0 * variance));
    samples.push(sampleVal);
  }

  const confidence = Math.round(Math.min(95, 55 + (100 - keyword.difficulty) * 0.3 + (keyword.matchedImpressions > 0 ? 15 : 0)));

  return {
    probability,
    confidence,
    samples,
  };
}

/**
 * Builds complete Kernel Density Estimation analysis for all 5 target keywords + overall distribution
 */
export function buildKDEAnalysis(
  keywords: TargetKeyword[],
  bandwidthMultiplier = 1.0
): KDEResult {
  const keywordColors = [
    '#3B82F6', // Blue (Primary)
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EC4899', // Pink
  ];

  const allProbabilitySamples: number[] = [];
  const keywordCurves: KeywordKDEDensity[] = [];

  keywords.forEach((kw, index) => {
    const { probability, samples } = calculateKeywordRankingProbability(kw, []);
    allProbabilitySamples.push(...samples);

    const { curve, bandwidth } = generateKDECurve(samples, 0, 100, 100, bandwidthMultiplier);

    // Find peak probability density
    let peakProb = probability;
    let maxDensity = 0;
    for (const pt of curve) {
      if (pt.density > maxDensity) {
        maxDensity = pt.density;
        peakProb = Math.round(pt.x);
      }
    }

    let action = 'Mantener monitoreo';
    if (probability >= 70) {
      action = 'Prioridad #1: Optimizar On-Page & Enlazado interno para top 3';
    } else if (probability >= 45) {
      action = 'Prioridad #2: Mejorar CTR en SERP & ampliar contenido complementario';
    } else {
      action = 'Prioridad #3: Construir autoridad temática y atacar variantes long-tail';
    }

    keywordCurves.push({
      keywordId: kw.id,
      keywordText: kw.text || `Palabra Clave #${index + 1}`,
      color: keywordColors[index % keywordColors.length],
      curve,
      peakProbability: peakProb,
      peakDensity: maxDensity,
      meanProbability: probability,
      recommendedAction: action,
    });
  });

  // Calculate overall distribution
  const { curve: overallCurve, bandwidth } = generateKDECurve(
    allProbabilitySamples,
    0,
    100,
    100,
    bandwidthMultiplier
  );

  const histogramBins = computeHistogramBins(allProbabilitySamples, 0, 100, 14);

  // Find keyword with highest peak probability
  let bestKw = keywordCurves[0]?.keywordText || 'N/A';
  let bestProb = -1;
  keywordCurves.forEach(kc => {
    if (kc.meanProbability > bestProb) {
      bestProb = kc.meanProbability;
      bestKw = kc.keywordText;
    }
  });

  return {
    overallCurve,
    histogramBins,
    bandwidth,
    keywordCurves,
    topProbabilityKeyword: bestKw,
  };
}

/**
 * Computes linear regression (Ordinary Least Squares) y = mx + b for Impressions vs Clicks
 */
export function calculateLinearRegression(points: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = points.length;
  if (n <= 1) return { slope: 0, intercept: 0, r2: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const x = points[i].x;
    const y = points[i].y;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Correlation coefficient squared (R^2)
  const numR = n * sumXY - sumX * sumY;
  const denR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = denR !== 0 ? numR / denR : 0;
  const r2 = Math.min(1, Math.max(0, r * r));

  return { slope, intercept, r2 };
}

/**
 * Parses numeric inputs of wide extensions:
 * Supports:
 * - Multi-row pairs: "125000, 3200" or "125000\t3200" or "125000 3200"
 * - Large numbers with formatting: "1.250.000", "1,250,000", "1.5M", "45k"
 * - CSV/TSV table paste with headers or without
 * - Raw sequence of numbers
 */
export function parseWideNumericInput(
  rawText: string,
  targetKeywords: TargetKeyword[] = []
): { points: SEODataPoint[]; errors: string[] } {
  const lines = rawText.trim().split(/\r?\n/);
  const points: SEODataPoint[] = [];
  const errors: string[] = [];

  const cleanNum = (val: string): number => {
    let s = val.trim().toLowerCase();
    let multiplier = 1;
    if (s.endsWith('m') || s.endsWith('m.')) {
      multiplier = 1_000_000;
      s = s.replace(/m\.?$/, '');
    } else if (s.endsWith('k') || s.endsWith('k.')) {
      multiplier = 1_000;
      s = s.replace(/k\.?$/, '');
    }
    // Remove space, currency, percent
    s = s.replace(/[%$€\s]/g, '');

    // Determine thousand vs decimal separator
    // e.g. "1.250.000" or "1,250,000" or "1250000.5"
    if (s.includes('.') && s.includes(',')) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
        // European: 1.250.000,50
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        // US: 1,250,000.50
        s = s.replace(/,/g, '');
      }
    } else if (s.includes('.')) {
      // Check if it's thousands like 1.250.000 (multiple dots or 3 digits after)
      const parts = s.split('.');
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3 && parts[0].length >= 1)) {
        s = s.replace(/\./g, '');
      }
    } else if (s.includes(',')) {
      const parts = s.split(',');
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3 && parts[0].length >= 1)) {
        s = s.replace(/,/g, '');
      } else {
        s = s.replace(',', '.');
      }
    }

    const n = parseFloat(s);
    return isNaN(n) ? 0 : n * multiplier;
  };

  let rowCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Skip potential header rows
    if (
      i === 0 &&
      (rawLine.toLowerCase().includes('impresion') ||
        rawLine.toLowerCase().includes('clic') ||
        rawLine.toLowerCase().includes('query') ||
        rawLine.toLowerCase().includes('keyword'))
    ) {
      continue;
    }

    // Split by tab, semicolon, comma or multiple spaces
    let tokens: string[] = [];
    if (rawLine.includes('\t')) {
      tokens = rawLine.split('\t');
    } else if (rawLine.includes(';')) {
      tokens = rawLine.split(';');
    } else if (rawLine.includes(',')) {
      // If there are quotes or commas
      tokens = rawLine.split(',');
    } else {
      tokens = rawLine.split(/\s{2,}|\s+/);
    }

    tokens = tokens.map(t => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);

    if (tokens.length === 0) continue;

    let keyword = `Query #${rowCounter}`;
    let impressions = 0;
    let clicks = 0;
    let position = 10;

    // Pattern matching based on tokens length:
    // If 1 token: could be wide single number or error
    if (tokens.length === 1) {
      impressions = cleanNum(tokens[0]);
      clicks = Math.max(0, Math.round(impressions * 0.024)); // fallback realistic CTR
    } else if (tokens.length === 2) {
      // Could be: [Impressions, Clicks] OR [Keyword, Impressions]
      const n1 = cleanNum(tokens[0]);
      const n2 = cleanNum(tokens[1]);

      if (n1 > 0 && n2 >= 0) {
        // Both are numbers. Convention: If n1 >= n2, n1 is impressions, n2 is clicks
        if (n1 >= n2) {
          impressions = n1;
          clicks = n2;
        } else {
          impressions = n2;
          clicks = n1;
        }
      } else {
        keyword = tokens[0];
        impressions = n2;
        clicks = Math.max(0, Math.round(n2 * 0.025));
      }
    } else if (tokens.length === 3) {
      // e.g. [Keyword, Impressions, Clicks] or [Impressions, Clicks, Position]
      const n0 = cleanNum(tokens[0]);
      const n1 = cleanNum(tokens[1]);
      const n2 = cleanNum(tokens[2]);

      if (isNaN(n0) || n0 === 0) {
        keyword = tokens[0];
        impressions = n1;
        clicks = n2;
      } else {
        impressions = n0;
        clicks = n1;
        position = n2;
      }
    } else if (tokens.length >= 4) {
      // GSC export format: [Query, Clicks, Impressions, CTR, Position]
      keyword = tokens[0];
      const t1 = cleanNum(tokens[1]);
      const t2 = cleanNum(tokens[2]);
      const t3 = cleanNum(tokens[3]);
      const t4 = cleanNum(tokens[4] || '12');

      // In GSC default export: Column 1 is Query, Column 2 is Clicks, Column 3 is Impressions
      if (t2 > t1) {
        clicks = t1;
        impressions = t2;
      } else {
        impressions = t1;
        clicks = t2;
      }
      position = t4 > 0 ? t4 : (t3 > 0 && t3 < 100 ? t3 : 12);
    }

    if (impressions > 0) {
      // Auto-assign to target keyword if matched
      let matchedTargetId: string | undefined = undefined;
      const lowerKw = keyword.toLowerCase();
      targetKeywords.forEach(tk => {
        if (tk.text && lowerKw.includes(tk.text.toLowerCase().trim())) {
          matchedTargetId = tk.id;
        }
      });

      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

      points.push({
        id: `dp-${rowCounter}-${Date.now()}`,
        keyword,
        impressions: Math.round(impressions),
        clicks: Math.round(clicks),
        ctr: Number(ctr.toFixed(2)),
        position: Number((position || 10).toFixed(1)),
        targetKeywordId: matchedTargetId,
      });

      rowCounter++;
    } else {
      errors.push(`Línea ${i + 1}: No se detectaron números válidos ("${rawLine}")`);
    }
  }

  return { points, errors };
}

/**
 * Format numbers cleanly with standard separators (e.g., 1,450,200 or 1.45M)
 */
export function formatWideNumber(num: number, compact = false): string {
  if (compact) {
    if (Math.abs(num) >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (Math.abs(num) >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
  }
  return new Intl.NumberFormat('es-ES').format(Math.round(num));
}
