import React, { useState } from 'react';
import { SEODiagnosis, TargetKeyword } from '../types/seo';
import { formatWideNumber } from '../utils/math';
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Copy,
  Check,
  FileCheck,
  Target,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface InsightsAndRecommendationsProps {
  diagnosis: SEODiagnosis;
  domain: string;
  targetKeywords: TargetKeyword[];
}

export const InsightsAndRecommendations: React.FC<InsightsAndRecommendationsProps> = ({
  diagnosis,
  domain,
  targetKeywords,
}) => {
  const [copied, setCopied] = useState(false);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const toggleAction = (idx: number) => {
    setCompletedActions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copySummaryToClipboard = () => {
    const summaryText = `--- INFORME DE RENDIMIENTO SEO & DIAGNÓSTICO CTR ---
Dominio: ${domain || 'No especificado'}
Total Impresiones GSC: ${formatWideNumber(diagnosis.totalImpressions)}
Total Clics Orgánicos: ${formatWideNumber(diagnosis.totalClicks)}
CTR Global: ${diagnosis.globalCTR}% (Benchmark: ${diagnosis.benchmarkCTR}%)
Diferencia CTR: ${diagnosis.ctrDifference > 0 ? '+' : ''}${diagnosis.ctrDifference} pp
Pendiente de Regresión: ${diagnosis.expectedClicksPer1kImpressions} clics por cada 1.000 impresiones

RESUMEN POR CUADRANTES CARTESIANOS:
1. Términos Estrella: ${diagnosis.quadrants.champions.count} páginas (${diagnosis.quadrants.champions.avgCTR}% CTR)
2. Oportunidades Críticas de CTR: ${diagnosis.quadrants.ctr_opportunity.count} páginas (${diagnosis.quadrants.ctr_opportunity.avgCTR}% CTR)
3. Contenido Zombie / Latente: ${diagnosis.quadrants.zombie.count} páginas (${diagnosis.quadrants.zombie.avgCTR}% CTR)
4. Joyas de Nicho: ${diagnosis.quadrants.niche_power.count} páginas (${diagnosis.quadrants.niche_power.avgCTR}% CTR)

ACCIONES RECOMENDADAS:
${diagnosis.actionPlan.map((a, i) => `${i + 1}. [${a.priority}] ${a.title} - ${a.description}`).join('\n')}
---------------------------------------------------`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const potentialLostClicks = Math.round(
    ((diagnosis.benchmarkCTR - diagnosis.globalCTR) / 100) * diagnosis.totalImpressions
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Resumen de Insights sobre CTR, Rendimiento y Recomendaciones SEO
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Diagnóstico analítico basado en el cruce de impresiones y clics en Search Console para {domain || 'tu dominio'}.
          </p>
        </div>

        <button
          onClick={copySummaryToClipboard}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>¡Copiado al Portapapeles!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copiar Resumen Ejecutivo</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Diagnosis Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {/* Global CTR card */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg font-mono">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block mb-1">
            CTR Global Orgánico
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {diagnosis.globalCTR}%
            </span>
            <span
              className={`text-xs font-semibold tabular-nums ${
                diagnosis.ctrDifference >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {diagnosis.ctrDifference >= 0 ? '+' : ''}{diagnosis.ctrDifference} pp vs ref.
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans block mt-1">
            Benchmark sector: {diagnosis.benchmarkCTR}%
          </span>
        </div>

        {/* Expected clicks per 1k impressions */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg font-mono">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block mb-1">
            Eficiencia de Conversión (Regresión)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {diagnosis.expectedClicksPer1kImpressions}
            </span>
            <span className="text-xs text-slate-500 font-sans">
              clics / 1.000 imp
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans block mt-1">
            Pendiente de la nube cartesiana
          </span>
        </div>

        {/* Clicks Opportunity */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg font-mono">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block mb-1">
            Potencial Captura de Clics
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {potentialLostClicks > 0 ? `+${formatWideNumber(potentialLostClicks, true)}` : 'Óptimo'}
            </span>
            <span className="text-xs text-slate-500 font-sans">
              clics/mes
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans block mt-1">
            Elevando CTR al benchmark
          </span>
        </div>

        {/* Leak Quadrant Pages */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg font-mono">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block mb-1">
            Páginas con Fuga de Clics (Q2)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {diagnosis.quadrants.ctr_opportunity.count}
            </span>
            <span className="text-xs text-slate-500 font-sans">
              URLs en riesgo
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans block mt-1">
            CTR promedio: {diagnosis.quadrants.ctr_opportunity.avgCTR}%
          </span>
        </div>
      </div>

      {/* Strategic Insights Cards */}
      <div className="mt-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          <span>Diagnóstico Estratégico Detectado</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {diagnosis.keyInsights.map((insight, idx) => (
            <div
              key={`insight-${idx}`}
              className={`p-3.5 rounded-lg border text-xs ${
                insight.type === 'positive'
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                  : insight.type === 'warning'
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                  : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {insight.type === 'positive' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : insight.type === 'warning' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
                <span>{insight.headline}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {insight.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SEO Action Recommendations Playbook */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Plan de Acción SEO Recomendado para Mejorar el CTR y Posiciones</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Marca las tareas implementadas en {domain || 'el sitio'}
          </span>
        </div>

        <div className="space-y-2.5">
          {diagnosis.actionPlan.map((action, idx) => {
            const isDone = Boolean(completedActions[idx]);

            return (
              <div
                key={`action-${idx}`}
                onClick={() => toggleAction(idx)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none ${
                  isDone
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 line-through'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}} // handled by parent div
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {action.title}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            action.priority === 'Inmediata'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {action.priority}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {action.category}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                        {action.description}
                      </p>

                      {/* Target items pills */}
                      {action.targetItems.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          <span className="font-sans font-medium text-slate-400">Enfocar en:</span>
                          {action.targetItems.map((item, itemIdx) => (
                            <span
                              key={`target-item-${itemIdx}`}
                              className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 truncate max-w-[260px]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
