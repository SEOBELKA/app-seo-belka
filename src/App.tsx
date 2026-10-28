import React, { useState, useEffect, useMemo } from 'react';
import { SEODataPoint, TargetKeyword, SEODiagnosis } from './types/seo';
import {
  DEFAULT_DOMAIN,
  DEFAULT_TARGET_KEYWORDS,
  PRESET_DATASETS,
  calculateSEODiagnosis,
} from './utils/seoAnalytics';
import { parseWideNumericInput, formatWideNumber } from './utils/math';
import { TopNavigation } from './components/TopNavigation';
import { DomainKeywordConfig } from './components/DomainKeywordConfig';
import { NumericDataInputSection } from './components/NumericDataInputSection';
import { CartesianScatterPlot } from './components/CartesianScatterPlot';
import { KernelDensityChart } from './components/KernelDensityChart';
import { InsightsAndRecommendations } from './components/InsightsAndRecommendations';
import { FileDown, CheckCircle, BarChart3, TrendingUp, Sparkles, Printer } from 'lucide-react';

export default function App() {
  const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);
  const [targetKeywords, setTargetKeywords] = useState<TargetKeyword[]>(DEFAULT_TARGET_KEYWORDS);
  const [rawText, setRawText] = useState<string>(PRESET_DATASETS.belkaEcommerce.rawText);
  const [activeSection, setActiveSection] = useState<string>('cartesian-section');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Parse numeric data instantaneously as user types or pastes
  const { points: parsedPoints, errors: parseErrors } = useMemo(() => {
    return parseWideNumericInput(rawText, targetKeywords);
  }, [rawText, targetKeywords]);

  // Update matched impressions & clicks for each target keyword based on parsed points
  const enrichedTargetKeywords = useMemo(() => {
    return targetKeywords.map((tk) => {
      let matchedImp = 0;
      let matchedClicks = 0;

      parsedPoints.forEach((pt) => {
        if (
          pt.targetKeywordId === tk.id ||
          (tk.text && pt.keyword.toLowerCase().includes(tk.text.toLowerCase().trim()))
        ) {
          matchedImp += pt.impressions;
          matchedClicks += pt.clicks;
        }
      });

      const matchedCTR = matchedImp > 0 ? Number(((matchedClicks / matchedImp) * 100).toFixed(2)) : 0;

      return {
        ...tk,
        matchedImpressions: matchedImp,
        matchedClicks: matchedClicks,
        matchedCTR: matchedCTR || tk.matchedCTR,
      };
    });
  }, [targetKeywords, parsedPoints]);

  // Recalculate SEO Diagnosis & Quadrants
  const diagnosis: SEODiagnosis = useMemo(() => {
    return calculateSEODiagnosis(parsedPoints, domain, enrichedTargetKeywords);
  }, [parsedPoints, domain, enrichedTargetKeywords]);

  // Handlers
  const handleKeywordChange = (index: number, updated: Partial<TargetKeyword>) => {
    setTargetKeywords((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], ...updated };
      return clone;
    });
  };

  const handleSelectPreset = (presetKey: 'belkaEcommerce' | 'saasGrowth' | 'contentPortal') => {
    const preset = PRESET_DATASETS[presetKey];
    if (!preset) return;

    setDomain(preset.domain);
    setRawText(preset.rawText);

    // Update target keywords texts
    setTargetKeywords((prev) =>
      prev.map((kw, idx) => ({
        ...kw,
        text: preset.keywords[idx] || kw.text,
      }))
    );
  };

  const handleAddSingleRow = (newPoint: Omit<SEODataPoint, 'id' | 'ctr'>) => {
    const newLine = `${newPoint.impressions}, ${newPoint.clicks}, ${newPoint.keyword}, ${newPoint.position || 5.0}`;
    setRawText((prev) => (prev ? `${prev}\n${newLine}` : newLine));
  };

  const handleClearData = () => {
    setRawText('');
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col">
      {/* Top Navigation conforming strictly to the 3-Zone Contract */}
      <TopNavigation
        domain={domain}
        onSelectPreset={handleSelectPreset}
        onExportReport={() => setShowExportModal(true)}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Editorial Page Lead */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Estrategia SEO Orgánica</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{domain}</span>
                <span aria-hidden="true">·</span>
                <span>Análisis Cartesiano & Densidad de Probabilidad KDE</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
                Matriz Cartesiana de Rendimiento SEO & Densidad de Kernel
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Cruza de forma bidimensional las impresiones de Google Search Console frente a los clics orgánicos generados. Modela el potencial de posicionamiento de tus 5 palabras clave target mediante una función de densidad continua de Kernel (KDE).
              </p>
            </div>

            {/* Quick KPI Strip */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/80 font-mono text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Impresiones GSC</span>
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatWideNumber(diagnosis.totalImpressions, true)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/80 font-mono text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Clics Totales</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatWideNumber(diagnosis.totalClicks, true)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/80 font-mono text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">CTR Global</span>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  {diagnosis.globalCTR}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Configuration: Domain & 5 Target Keywords */}
        <section id="domain-section">
          <DomainKeywordConfig
            domain={domain}
            onDomainChange={setDomain}
            targetKeywords={enrichedTargetKeywords}
            onKeywordChange={handleKeywordChange}
          />
        </section>

        {/* 2. Numeric Input Section (Wide Numbers Input Source) */}
        <section id="input-section">
          <NumericDataInputSection
            rawText={rawText}
            onRawTextChange={setRawText}
            parsedPoints={parsedPoints}
            parseErrors={parseErrors}
            targetKeywords={enrichedTargetKeywords}
            onAddSingleRow={handleAddSingleRow}
            onClearData={handleClearData}
            onLoadPreset={handleSelectPreset}
          />
        </section>

        {/* 3. Cartesian Scatter Plot (X: Impresiones GSC, Y: Clics Orgánicos, Z: CTR%) */}
        <section id="cartesian-section">
          <CartesianScatterPlot
            points={parsedPoints}
            targetKeywords={enrichedTargetKeywords}
            diagnosis={diagnosis}
          />
        </section>

        {/* 4. Insights & Recommendations Playbook */}
        <section id="insights-section">
          <InsightsAndRecommendations
            diagnosis={diagnosis}
            domain={domain}
            targetKeywords={enrichedTargetKeywords}
          />
        </section>

        {/* 5. Kernel Density Estimation (KDE) Smoothed Histogram */}
        <section id="kde-section">
          <KernelDensityChart
            targetKeywords={enrichedTargetKeywords}
            parsedPoints={parsedPoints}
          />
        </section>
      </main>

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Informe Ejecutivo de Rendimiento SEO & KDE
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 max-h-80 overflow-y-auto">
              <p className="font-bold text-blue-600 dark:text-blue-400">
                AUDITORÍA SEO: {domain}
              </p>
              <p>Fecha: {new Date().toLocaleDateString('es-ES')}</p>
              <hr className="border-slate-200 dark:border-slate-800" />
              <p>Total Impresiones GSC: {formatWideNumber(diagnosis.totalImpressions)}</p>
              <p>Total Clics Orgánicos: {formatWideNumber(diagnosis.totalClicks)}</p>
              <p>CTR Global: {diagnosis.globalCTR}% (Benchmark Sector: {diagnosis.benchmarkCTR}%)</p>
              <p>Pendiente Regresión: {diagnosis.expectedClicksPer1kImpressions} clics/1K imp</p>
              <hr className="border-slate-200 dark:border-slate-800" />
              <p className="font-bold">PALABRAS CLAVE TARGET & PROBABILIDAD DE POSICIONAMIENTO:</p>
              {enrichedTargetKeywords.map((kw, i) => (
                <p key={kw.id}>
                  #{i + 1} {kw.text}: {kw.rankingProbability}% prob (Posición Actual: #{kw.currentPosition})
                </p>
              ))}
              <hr className="border-slate-200 dark:border-slate-800" />
              <p className="font-bold">ACCIONES PRIORITARIAS:</p>
              {diagnosis.actionPlan.map((a, i) => (
                <p key={i}>• [{a.priority}] {a.title}</p>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Guardar como PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer conforming to quiet, unbloated guidelines */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 font-sans">SEO Matrix</span>
            <span aria-hidden="true">·</span>
            <span>Google Search Console Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Kernel Density Estimation</span>
          </div>

          <div className="text-[11px] text-slate-400">
            {domain} — Análisis en tiempo real
          </div>
        </div>
      </footer>
    </div>
  );
}
