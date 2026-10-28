import React, { useState, useMemo } from 'react';
import { TargetKeyword, KDEResult, SEODataPoint } from '../types/seo';
import { buildKDEAnalysis } from '../utils/math';
import { Activity, Sliders, CheckCircle2, AlertCircle, ArrowUpRight, Award, Zap } from 'lucide-react';

interface KernelDensityChartProps {
  targetKeywords: TargetKeyword[];
  parsedPoints: SEODataPoint[];
}

export const KernelDensityChart: React.FC<KernelDensityChartProps> = ({
  targetKeywords,
  parsedPoints,
}) => {
  const [bandwidthMultiplier, setBandwidthMultiplier] = useState<number>(1.0);
  const [activeDisplayMode, setActiveDisplayMode] = useState<'keywords' | 'combined'>('keywords');
  const [showHistogram, setShowHistogram] = useState<boolean>(true);
  const [hoveredKeywordId, setHoveredKeywordId] = useState<string | null>(null);

  // Compute KDE Analysis
  const kdeResult: KDEResult = useMemo(() => {
    return buildKDEAnalysis(targetKeywords, bandwidthMultiplier);
  }, [targetKeywords, bandwidthMultiplier]);

  // SVG dimensions
  const width = 840;
  const height = 400;
  const padding = { top: 35, right: 35, bottom: 55, left: 65 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Maximum density for Y-axis scale
  const maxDensity = useMemo(() => {
    let max = 0;
    kdeResult.overallCurve.forEach(p => {
      if (p.density > max) max = p.density;
    });
    kdeResult.keywordCurves.forEach(kc => {
      kc.curve.forEach(p => {
        if (p.density > max) max = p.density;
      });
    });
    kdeResult.histogramBins.forEach(b => {
      if (b.density > max) max = b.density;
    });
    return (max || 0.05) * 1.15;
  }, [kdeResult]);

  // Coordinate mappers
  const getX = (probValue: number) => {
    return padding.left + (probValue / 100) * innerWidth;
  };

  const getY = (densityVal: number) => {
    return padding.top + innerHeight - (densityVal / maxDensity) * innerHeight;
  };

  // Convert curve to SVG Path 'd'
  const generatePathD = (curve: { x: number; density: number }[]): string => {
    if (curve.length === 0) return '';
    return curve
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.x).toFixed(1)} ${getY(pt.density).toFixed(1)}`)
      .join(' ');
  };

  const generateAreaD = (curve: { x: number; density: number }[]): string => {
    if (curve.length === 0) return '';
    const lineD = generatePathD(curve);
    const bottomY = padding.top + innerHeight;
    const startX = getX(curve[0].x).toFixed(1);
    const endX = getX(curve[curve.length - 1].x).toFixed(1);
    return `${lineD} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  };

  // X-axis ticks (0% to 100% probability)
  const xTicks = [0, 20, 40, 60, 80, 100];
  const yTicks = [0, maxDensity * 0.25, maxDensity * 0.5, maxDensity * 0.75, maxDensity];

  // Sort keywords by peak probability descending to highlight which keyword has the most chance to rank
  const sortedKeywords = useMemo(() => {
    return [...kdeResult.keywordCurves].sort((a, b) => b.meanProbability - a.meanProbability);
  }, [kdeResult]);

  const championKeyword = sortedKeywords[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Gráfico de Densidad de Kernel (KDE): Función de Probabilidad de Posicionamiento
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Versión suavizada del histograma con núcleo Gaussiano para estimar qué palabra clave target tiene más opciones de posicionarse en primeras posiciones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveDisplayMode('keywords')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeDisplayMode === 'keywords'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              5 Keywords Target
            </button>
            <button
              onClick={() => setActiveDisplayMode('combined')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeDisplayMode === 'combined'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Curva Global Suavizada
            </button>
          </div>

          {/* Histogram Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showHistogram}
              onChange={(e) => setShowHistogram(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Ver Histograma Base</span>
          </label>

          {/* Bandwidth Slider (Smoothing Parameter h) */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 text-[11px]">Suavizado (h):</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={bandwidthMultiplier}
              onChange={(e) => setBandwidthMultiplier(parseFloat(e.target.value))}
              className="w-20 accent-purple-600 cursor-pointer"
            />
            <span className="font-mono text-[11px] font-semibold text-purple-600 dark:text-purple-400 tabular-nums">
              {(kdeResult.bandwidth).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Champion Keyword Banner */}
      {championKeyword && (
        <div className="mt-4 px-4 py-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-purple-900 dark:text-purple-200">
                Palabra Clave con Mayor Probabilidad de Posicionarse:
              </span>{' '}
              <span className="font-semibold text-purple-700 dark:text-purple-300">
                "{championKeyword.keywordText}"
              </span>
              <span className="text-purple-600 dark:text-purple-400 ml-2">
                (Pico de densidad en {championKeyword.peakProbability}%, Probabilidad media: {championKeyword.meanProbability}%)
              </span>
            </div>
          </div>

          <span className="hidden md:inline text-[11px] font-medium text-purple-700 dark:text-purple-300">
            {championKeyword.recommendedAction}
          </span>
        </div>
      )}

      {/* Main SVG Kernel Density Chart */}
      <div className="relative mt-4 bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 p-2 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[700px] select-none"
        >
          <defs>
            {/* Global curve gradient */}
            <linearGradient id="globalKdeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02" />
            </linearGradient>

            {/* Keyword Gradients */}
            {kdeResult.keywordCurves.map((kc, i) => (
              <linearGradient key={`grad-${kc.keywordId}`} id={`grad-${kc.keywordId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={kc.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={kc.color} stopOpacity="0.01" />
              </linearGradient>
            ))}
          </defs>

          {/* Background probability zones: 0-40% Baja, 40-70% Media, 70-100% Alta */}
          <rect
            x={getX(0)}
            y={padding.top}
            width={getX(40) - getX(0)}
            height={innerHeight}
            fill="rgba(244, 63, 94, 0.02)"
          />
          <rect
            x={getX(40)}
            y={padding.top}
            width={getX(70) - getX(40)}
            height={innerHeight}
            fill="rgba(245, 158, 11, 0.02)"
          />
          <rect
            x={getX(70)}
            y={padding.top}
            width={getX(100) - getX(70)}
            height={innerHeight}
            fill="rgba(16, 185, 129, 0.03)"
          />

          <text
            x={getX(20)}
            y={padding.top + 16}
            textAnchor="middle"
            className="text-[10px] font-semibold fill-rose-500/70 dark:fill-rose-400/60"
          >
            Zona Difícil / Alta Competencia (0-40%)
          </text>
          <text
            x={getX(55)}
            y={padding.top + 16}
            textAnchor="middle"
            className="text-[10px] font-semibold fill-amber-600/70 dark:fill-amber-400/60"
          >
            Zona de Crecimiento / Oportunidad (40-70%)
          </text>
          <text
            x={getX(85)}
            y={padding.top + 16}
            textAnchor="middle"
            className="text-[10px] font-semibold fill-emerald-600/70 dark:fill-emerald-400/60"
          >
            Alta Probabilidad de Top 1-3 (70-100%)
          </text>

          {/* Horizontal Grid lines */}
          {yTicks.map((tick, i) => {
            const y = getY(tick);
            return (
              <g key={`kde-y-${i}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="2 3"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400 tabular-nums"
                >
                  {tick.toFixed(3)}
                </text>
              </g>
            );
          })}

          {/* Vertical Grid lines */}
          {xTicks.map((tick) => {
            const x = getX(tick);
            return (
              <g key={`kde-x-${tick}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="2 3"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className="text-[11px] font-mono fill-slate-500 dark:fill-slate-400 tabular-nums font-semibold"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Discrete Histogram Bins (The raw empirical discrete distribution) */}
          {showHistogram &&
            kdeResult.histogramBins.map((bin, i) => {
              const x = getX(bin.x0);
              const barW = Math.max(2, getX(bin.x1) - x - 2);
              const barH = (bin.density / maxDensity) * innerHeight;
              const y = padding.top + innerHeight - barH;

              return (
                <rect
                  key={`hist-bin-${i}`}
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  fill="rgba(148, 163, 184, 0.22)"
                  stroke="rgba(100, 116, 139, 0.4)"
                  strokeWidth="1"
                  rx="2"
                />
              );
            })}

          {/* Combined Overall KDE Curve */}
          {activeDisplayMode === 'combined' && (
            <g>
              <path
                d={generateAreaD(kdeResult.overallCurve)}
                fill="url(#globalKdeGradient)"
              />
              <path
                d={generatePathD(kdeResult.overallCurve)}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Individual 5 Target Keywords KDE Curves */}
          {activeDisplayMode === 'keywords' &&
            kdeResult.keywordCurves.map((kc) => {
              const isHovered = hoveredKeywordId === kc.keywordId;
              const opacity = hoveredKeywordId ? (isHovered ? 1 : 0.25) : 0.85;
              const strokeWidth = isHovered ? 3.5 : 2.2;
              const peakX = getX(kc.peakProbability);
              const peakY = getY(kc.peakDensity);

              return (
                <g key={`curve-group-${kc.keywordId}`} style={{ opacity, transition: 'opacity 0.2s' }}>
                  {/* Fill area */}
                  <path
                    d={generateAreaD(kc.curve)}
                    fill={`url(#grad-${kc.keywordId})`}
                  />

                  {/* Density stroke curve */}
                  <path
                    d={generatePathD(kc.curve)}
                    fill="none"
                    stroke={kc.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  />

                  {/* Peak Mode Marker & Drop Line */}
                  <line
                    x1={peakX}
                    y1={peakY}
                    x2={peakX}
                    y2={height - padding.bottom}
                    stroke={kc.color}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  <circle
                    cx={peakX}
                    cy={peakY}
                    r="4.5"
                    fill={kc.color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />

                  {/* Mode Label */}
                  <text
                    x={peakX}
                    y={peakY - 8}
                    textAnchor="middle"
                    className="text-[10px] font-bold font-mono"
                    fill={kc.color}
                  >
                    {kc.peakProbability}%
                  </text>
                </g>
              );
            })}

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 15}
            textAnchor="middle"
            className="text-xs font-semibold fill-slate-700 dark:fill-slate-300 tracking-wide"
          >
            Función de Probabilidad de Posicionamiento SEO en Google (0% a 100%)
          </text>
          <text
            x={-height / 2}
            y={20}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-xs font-semibold fill-slate-700 dark:fill-slate-300 tracking-wide"
          >
            Densidad de Probabilidad f(x)
          </text>
        </svg>
      </div>

      {/* Target Keywords Probability Ranking Table */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Ranking de Probabilidades por Palabra Clave Target</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Pasa el cursor sobre una fila para resaltar su curva en el gráfico KDE
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Palabra Clave Target</th>
                <th className="py-2.5 px-3">Intención</th>
                <th className="py-2.5 px-3 text-right">Dificultad (KD)</th>
                <th className="py-2.5 px-3 text-right">Pos. Actual</th>
                <th className="py-2.5 px-3 text-center">Probabilidad Media</th>
                <th className="py-2.5 px-3 text-center">Pico Densidad KDE</th>
                <th className="py-2.5 px-4">Acción Recomendada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {sortedKeywords.map((kc, rankIndex) => {
                const isChampion = rankIndex === 0;
                const kwRaw = targetKeywords.find(k => k.id === kc.keywordId);

                return (
                  <tr
                    key={kc.keywordId}
                    onMouseEnter={() => setHoveredKeywordId(kc.keywordId)}
                    onMouseLeave={() => setHoveredKeywordId(null)}
                    className={`transition-colors cursor-pointer ${
                      hoveredKeywordId === kc.keywordId
                        ? 'bg-slate-100 dark:bg-slate-800/90'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: kc.color }}
                      />
                      <span className="truncate max-w-[200px]">{kc.keywordText}</span>
                      {isChampion && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded font-bold">
                          #1 TOP
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans">
                      {kwRaw?.intent || 'Informativa'}
                    </td>

                    <td className="py-2 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {kwRaw?.difficulty || 50}/100
                    </td>

                    <td className="py-2 px-3 text-right tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      #{kwRaw?.currentPosition || 10}
                    </td>

                    <td className="py-2 px-3 text-center tabular-nums font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          kc.meanProbability >= 70
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                            : kc.meanProbability >= 45
                            ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
                            : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                        }`}
                      >
                        {kc.meanProbability}%
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center tabular-nums font-semibold text-purple-600 dark:text-purple-400">
                      {kc.peakProbability}%
                    </td>

                    <td className="py-2 px-4 font-sans text-slate-600 dark:text-slate-300 text-[11px]">
                      {kc.recommendedAction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
