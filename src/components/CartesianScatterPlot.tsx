import React, { useState, useMemo } from 'react';
import { SEODataPoint, TargetKeyword, SEODiagnosis } from '../types/seo';
import { formatWideNumber, calculateLinearRegression } from '../utils/math';
import { Cartesian3DPlot } from './Cartesian3DPlot';
import {
  TrendingUp,
  Maximize2,
  Layers,
  Sparkles,
  Info,
  HelpCircle,
  BarChart2,
  SlidersHorizontal,
} from 'lucide-react';

interface CartesianScatterPlotProps {
  points: SEODataPoint[];
  targetKeywords: TargetKeyword[];
  diagnosis: SEODiagnosis;
}

export const CartesianScatterPlot: React.FC<CartesianScatterPlotProps> = ({
  points,
  targetKeywords,
  diagnosis,
}) => {
  const [scaleType, setScaleType] = useState<'linear' | 'log'>('linear');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [hoveredPoint, setHoveredPoint] = useState<SEODataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeFilter, setActiveFilter] = useState<'all' | 'targets' | 'q_opp' | 'q_champ'>('all');

  // Chart dimensions in SVG viewBox
  const width = 840;
  const height = 480;
  const padding = { top: 40, right: 40, bottom: 65, left: 75 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Compute maximums
  const { maxImp, maxClicks, minImp, minClicks, medianImp, medianClicks } = useMemo(() => {
    if (points.length === 0) {
      return { maxImp: 1000000, maxClicks: 25000, minImp: 0, minClicks: 0, medianImp: 500000, medianClicks: 12000 };
    }
    const imps = points.map(p => p.impressions);
    const clks = points.map(p => p.clicks);
    const maxI = Math.max(...imps) * 1.1;
    const maxC = Math.max(...clks) * 1.15;
    const minI = Math.min(...imps);
    const minC = Math.min(...clks);
    const medI = imps.reduce((a, b) => a + b, 0) / imps.length;
    const medC = clks.reduce((a, b) => a + b, 0) / clks.length;

    return {
      maxImp: maxI,
      maxClicks: maxC,
      minImp: Math.max(1, minI),
      minClicks: Math.max(0, minC),
      medianImp: medI,
      medianClicks: medC,
    };
  }, [points]);

  // Scale mapping functions
  const getX = (val: number): number => {
    if (scaleType === 'log') {
      const minLog = Math.log10(Math.max(10, minImp * 0.8));
      const maxLog = Math.log10(maxImp);
      const curLog = Math.log10(Math.max(10, val));
      const ratio = (curLog - minLog) / (maxLog - minLog || 1);
      return padding.left + Math.max(0, Math.min(1, ratio)) * innerWidth;
    }
    const ratio = val / (maxImp || 1);
    return padding.left + Math.max(0, Math.min(1, ratio)) * innerWidth;
  };

  const getY = (val: number): number => {
    if (scaleType === 'log') {
      const minLog = Math.log10(Math.max(1, minClicks * 0.8));
      const maxLog = Math.log10(maxClicks);
      const curLog = Math.log10(Math.max(1, val));
      const ratio = (curLog - minLog) / (maxLog - minLog || 1);
      return padding.top + innerHeight - Math.max(0, Math.min(1, ratio)) * innerHeight;
    }
    const ratio = val / (maxClicks || 1);
    return padding.top + innerHeight - Math.max(0, Math.min(1, ratio)) * innerHeight;
  };

  // Median quadrant divider lines
  const splitX = getX(medianImp);
  const splitY = getY(medianClicks);

  // Linear Regression Trendline
  const regression = useMemo(() => {
    return calculateLinearRegression(points.map(p => ({ x: p.impressions, y: p.clicks })));
  }, [points]);

  const trendStart = { x: getX(0), y: getY(regression.intercept) };
  const trendEnd = { x: getX(maxImp), y: getY(regression.slope * maxImp + regression.intercept) };

  // Filter points
  const displayPoints = useMemo(() => {
    if (activeFilter === 'targets') {
      return points.filter(p => Boolean(p.targetKeywordId));
    }
    if (activeFilter === 'q_opp') {
      return points.filter(p => p.impressions >= medianImp && p.clicks < medianClicks);
    }
    if (activeFilter === 'q_champ') {
      return points.filter(p => p.impressions >= medianImp && p.clicks >= medianClicks);
    }
    return points;
  }, [points, activeFilter, medianImp, medianClicks]);

  // Tick generator
  const xTicks = useMemo(() => {
    const ticksCount = 5;
    const ticks: number[] = [];
    for (let i = 0; i <= ticksCount; i++) {
      ticks.push((maxImp / ticksCount) * i);
    }
    return ticks;
  }, [maxImp]);

  const yTicks = useMemo(() => {
    const ticksCount = 5;
    const ticks: number[] = [];
    for (let i = 0; i <= ticksCount; i++) {
      ticks.push((maxClicks / ticksCount) * i);
    }
    return ticks;
  }, [maxClicks]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Gráfico Cartesiano: Rendimiento SEO (Impresiones vs Clics Orgánicos)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Eje X (Impresiones de Google Search Console) vs Eje Y (Clics Orgánicos). La dimensión Z y el tamaño reflejan el CTR%.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 2D vs 3D View Switch */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === '2d'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              2D Cuadrantes
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === '3d'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              3D Espacio Cartesiano
            </button>
          </div>

          {/* Linear vs Log Scale (for wide extension numbers) */}
          {viewMode === '2d' && (
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setScaleType('linear')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  scaleType === 'linear'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Escala Lineal"
              >
                Lineal
              </button>
              <button
                onClick={() => setScaleType('log')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  scaleType === 'log'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Escala Logarítmica (recomendada para datos con variaciones de miles a millones)"
              >
                Logarítmica (Amplia)
              </button>
            </div>
          )}

          {/* Quick Filter */}
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as any)}
            className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">Ver todos los puntos ({points.length})</option>
            <option value="targets">Solo 5 Keywords Target</option>
            <option value="q_opp">Oportunidades de CTR (Bajo CTR)</option>
            <option value="q_champ">Términos Estrella (Champions)</option>
          </select>
        </div>
      </div>

      {/* Render 3D if selected */}
      {viewMode === '3d' ? (
        <div className="mt-4">
          <Cartesian3DPlot points={points} targetKeywords={targetKeywords} />
        </div>
      ) : (
        /* Render 2D SVG Cartesian Chart */
        <div className="relative mt-4 bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 p-2 overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[700px] select-none"
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* 4 Quadrants Background Shading */}
            {/* Top Right: Q1 Champions */}
            <rect
              x={splitX}
              y={padding.top}
              width={innerWidth - (splitX - padding.left)}
              height={splitY - padding.top}
              fill="rgba(16, 185, 129, 0.04)"
            />
            {/* Bottom Right: Q2 CTR Opportunity */}
            <rect
              x={splitX}
              y={splitY}
              width={innerWidth - (splitX - padding.left)}
              height={innerHeight - (splitY - padding.top)}
              fill="rgba(245, 158, 11, 0.04)"
            />
            {/* Bottom Left: Q3 Zombie */}
            <rect
              x={padding.left}
              y={splitY}
              width={splitX - padding.left}
              height={innerHeight - (splitY - padding.top)}
              fill="rgba(148, 163, 184, 0.03)"
            />
            {/* Top Left: Q4 Niche Power */}
            <rect
              x={padding.left}
              y={padding.top}
              width={splitX - padding.left}
              height={splitY - padding.top}
              fill="rgba(59, 130, 246, 0.04)"
            />

            {/* Quadrant Labels (Quiet typography, no ugly pill boxes) */}
            <text
              x={width - padding.right - 10}
              y={padding.top + 20}
              textAnchor="end"
              className="text-[11px] font-semibold fill-emerald-600 dark:fill-emerald-400"
            >
              Q1: Términos Estrella (Champions)
            </text>
            <text
              x={width - padding.right - 10}
              y={height - padding.bottom - 12}
              textAnchor="end"
              className="text-[11px] font-semibold fill-amber-600 dark:fill-amber-400"
            >
              Q2: Oportunidad Crítica de CTR
            </text>
            <text
              x={padding.left + 10}
              y={height - padding.bottom - 12}
              textAnchor="start"
              className="text-[11px] font-semibold fill-slate-500 dark:fill-slate-400"
            >
              Q3: Contenido Latente / Zombie
            </text>
            <text
              x={padding.left + 10}
              y={padding.top + 20}
              textAnchor="start"
              className="text-[11px] font-semibold fill-blue-600 dark:fill-blue-400"
            >
              Q4: Joyas de Nicho (Alto CTR)
            </text>

            {/* Grid & Axis Lines */}
            {/* Horizontal Grid lines */}
            {yTicks.map((tick, i) => {
              const y = getY(tick);
              return (
                <g key={`y-grid-${i}`}>
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
                    {formatWideNumber(tick, true)}
                  </text>
                </g>
              );
            })}

            {/* Vertical Grid lines */}
            {xTicks.map((tick, i) => {
              const x = getX(tick);
              return (
                <g key={`x-grid-${i}`}>
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
                    className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400 tabular-nums"
                  >
                    {formatWideNumber(tick, true)}
                  </text>
                </g>
              );
            })}

            {/* Median Divider Lines (Dash) */}
            <line
              x1={splitX}
              y1={padding.top}
              x2={splitX}
              y2={height - padding.bottom}
              stroke="#64748B"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <line
              x1={padding.left}
              y1={splitY}
              x2={width - padding.right}
              y2={splitY}
              stroke="#64748B"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.6"
            />

            {/* Trendline (Linear Regression of CTR) */}
            <line
              x1={trendStart.x}
              y1={trendStart.y}
              x2={trendEnd.x}
              y2={trendEnd.y}
              stroke="url(#trendGradient)"
              strokeWidth="2"
              strokeDasharray="5 5"
              opacity="0.75"
            />

            {/* Axis Titles */}
            <text
              x={width / 2}
              y={height - 18}
              textAnchor="middle"
              className="text-xs font-semibold fill-slate-700 dark:fill-slate-300 tracking-wide"
            >
              Variable 1: Impresiones en Google Search Console (GSC)
            </text>
            <text
              x={-height / 2}
              y={22}
              transform="rotate(-90)"
              textAnchor="middle"
              className="text-xs font-semibold fill-slate-700 dark:fill-slate-300 tracking-wide"
            >
              Variable 2: Clics Orgánicos
            </text>

            {/* Render Data Points (Circles) */}
            {displayPoints.map((pt) => {
              const cx = getX(pt.impressions);
              const cy = getY(pt.clicks);
              const isTarget = Boolean(pt.targetKeywordId);
              const radius = isTarget ? 8 : Math.max(4, Math.min(10, pt.ctr * 1.4 + 3));

              // Color based on CTR and target
              let fillColor = '#3B82F6';
              if (isTarget) {
                fillColor = '#2563EB';
              } else if (pt.ctr >= 4.0) {
                fillColor = '#10B981';
              } else if (pt.ctr <= 1.5) {
                fillColor = '#F59E0B';
              }

              return (
                <g
                  key={pt.id}
                  className="cursor-pointer transition-transform duration-150"
                  onMouseEnter={(e) => {
                    setHoveredPoint(pt);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({ x: rect.left, y: rect.top });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Target keyword pulsing outer ring */}
                  {isTarget && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius + 4}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      opacity="0.7"
                    />
                  )}

                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={fillColor}
                    stroke="#FFFFFF"
                    strokeWidth={isTarget ? 2 : 1.5}
                    className="hover:scale-125 transition-transform"
                    opacity={isTarget ? 1 : 0.85}
                  />

                  {/* Target keyword label on chart */}
                  {isTarget && (
                    <text
                      x={cx}
                      y={cy - radius - 5}
                      textAnchor="middle"
                      className="text-[10px] font-semibold fill-slate-900 dark:fill-slate-100 font-mono"
                    >
                      {pt.keyword.length > 20 ? `${pt.keyword.slice(0, 18)}...` : pt.keyword}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Hover Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 rounded-lg p-3 text-xs shadow-xl max-w-xs z-30 pointer-events-none">
              <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5 mb-2">
                <span className="font-semibold text-blue-400 truncate max-w-[190px]">
                  {hoveredPoint.keyword}
                </span>
                {hoveredPoint.targetKeywordId && (
                  <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                    TARGET
                  </span>
                )}
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Impresiones GSC:</span>
                  <span className="font-semibold tabular-nums">{formatWideNumber(hoveredPoint.impressions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Clics Orgánicos:</span>
                  <span className="font-semibold text-emerald-400 tabular-nums">{formatWideNumber(hoveredPoint.clicks)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CTR Calculado:</span>
                  <span className="font-bold text-blue-400 tabular-nums">{hoveredPoint.ctr}%</span>
                </div>
                {hoveredPoint.position && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Posición Media:</span>
                    <span className="font-semibold tabular-nums">#{hoveredPoint.position}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-300">
                {hoveredPoint.impressions >= medianImp && hoveredPoint.clicks >= medianClicks ? (
                  <span className="text-emerald-400 font-medium">Cuadrante Estrella: Alta conversión y visibilidad.</span>
                ) : hoveredPoint.impressions >= medianImp && hoveredPoint.clicks < medianClicks ? (
                  <span className="text-amber-400 font-medium">Oportunidad de CTR: Alta exposición, necesita mejor Title/Snippet.</span>
                ) : hoveredPoint.impressions < medianImp && hoveredPoint.clicks >= medianClicks ? (
                  <span className="text-blue-400 font-medium">Joya de Nicho: Tráfico cualificado con excelente CTR.</span>
                ) : (
                  <span className="text-slate-400">Contenido Zombie: Revisar intención o podar contenido.</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart Footer with Tabular Metrics */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-4 font-mono">
        <div className="flex items-center gap-4">
          <span>
            Mediana Imp: <strong className="text-slate-900 dark:text-slate-100 tabular-nums">{formatWideNumber(medianImp)}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Mediana Clics: <strong className="text-slate-900 dark:text-slate-100 tabular-nums">{formatWideNumber(medianClicks)}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Pendiente Regresión (CTR Esperado): <strong className="text-blue-600 dark:text-blue-400 tabular-nums">{(regression.slope * 100).toFixed(2)}%</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>CTR Alto (&gt;4%)</span>
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-2" />
          <span>CTR Medio (2-4%)</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2" />
          <span>CTR Bajo (&lt;2%)</span>
        </div>
      </div>
    </div>
  );
};
