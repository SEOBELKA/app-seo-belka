import React, { useState } from 'react';
import { SEODataPoint, TargetKeyword } from '../types/seo';
import { formatWideNumber } from '../utils/math';
import { Database, Plus, Trash2, HelpCircle, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface NumericDataInputSectionProps {
  rawText: string;
  onRawTextChange: (text: string) => void;
  parsedPoints: SEODataPoint[];
  parseErrors: string[];
  targetKeywords: TargetKeyword[];
  onAddSingleRow: (point: Omit<SEODataPoint, 'id' | 'ctr'>) => void;
  onClearData: () => void;
  onLoadPreset: (presetKey: 'belkaEcommerce' | 'saasGrowth' | 'contentPortal') => void;
}

export const NumericDataInputSection: React.FC<NumericDataInputSectionProps> = ({
  rawText,
  onRawTextChange,
  parsedPoints,
  parseErrors,
  targetKeywords,
  onAddSingleRow,
  onClearData,
  onLoadPreset,
}) => {
  const [showHelper, setShowHelper] = useState(false);
  const [singleKw, setSingleKw] = useState('');
  const [singleImp, setSingleImp] = useState('');
  const [singleClicks, setSingleClicks] = useState('');
  const [singlePos, setSinglePos] = useState('5.0');
  const [singleError, setSingleError] = useState('');

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError('');

    const cleanNum = (val: string): number => {
      let s = val.trim().toLowerCase().replace(/[%$€\s]/g, '');
      let mult = 1;
      if (s.endsWith('m')) {
        mult = 1_000_000;
        s = s.replace(/m$/, '');
      } else if (s.endsWith('k')) {
        mult = 1_000;
        s = s.replace(/k$/, '');
      }
      s = s.replace(/\./g, '').replace(',', '.');
      return (parseFloat(s) || 0) * mult;
    };

    const imp = cleanNum(singleImp);
    const clk = cleanNum(singleClicks);
    const pos = parseFloat(singlePos) || 8.0;

    if (imp <= 0) {
      setSingleError('Ingresa un número de impresiones válido mayor a 0');
      return;
    }

    onAddSingleRow({
      keyword: singleKw.trim() || `Query Personalizada #${parsedPoints.length + 1}`,
      impressions: Math.round(imp),
      clicks: Math.round(clk),
      position: pos,
    });

    setSingleKw('');
    setSingleImp('');
    setSingleClicks('');
  };

  const totalImp = parsedPoints.reduce((acc, p) => acc + p.impressions, 0);
  const totalClicks = parsedPoints.reduce((acc, p) => acc + p.clicks, 0);
  const minImp = parsedPoints.length > 0 ? Math.min(...parsedPoints.map(p => p.impressions)) : 0;
  const maxImp = parsedPoints.length > 0 ? Math.max(...parsedPoints.map(p => p.impressions)) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Fuente de Información: Entrada de Datos Numéricos de Gran Extensión
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pega directamente grandes volúmenes de datos numéricos (Google Search Console o tablas). El gráfico cartesiano y las densidades se construyen al instante.
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Registros:</span>
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{parsedPoints.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Total Impresiones:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{formatWideNumber(totalImp, true)}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Total Clics:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatWideNumber(totalClicks, true)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Left column: Textarea bulk input */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label htmlFor="numeric-bulk-input" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Pega tus datos (Impresiones, Clics, [Query, Posición]):
              </label>
              <button
                type="button"
                onClick={() => setShowHelper(!showHelper)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Ver formato admitido"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClearData}
                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          {showHelper && (
            <div className="mb-2 p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-lg text-xs text-blue-900 dark:text-blue-200">
              <p className="font-semibold mb-1">Formatos admitidos de números de amplia extensión:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-800 dark:text-blue-300">
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">1250000, 34000</code> (Impresiones, Clics)</li>
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">1.250.000; 34.000; "mi keyword"; 4.2</code> (con o sin comillas)</li>
                <li><code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">1.5M, 42K</code> (acepta sufijos K y M)</li>
                <li>Pegado directo de CSV o TSV exportado desde Google Search Console.</li>
              </ul>
            </div>
          )}

          <div className="relative flex-1">
            <textarea
              id="numeric-bulk-input"
              rows={8}
              value={rawText}
              onChange={(e) => onRawTextChange(e.target.value)}
              placeholder={`Pega aquí tus filas de números de extensión amplia, ejemplo:
1250000, 28500, agencia marketing digital ecommerce, 4.2
890000, 14200, auditoria seo tecnica gsc, 8.6
2400000, 41000, optimizacion ctr search console, 3.1
450000, 3900, consultor seo internacional, 14.5
620000, 31000, estrategia palabras clave transaccionales, 2.9`}
              className="w-full h-full min-h-[190px] p-3 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed tabular-nums"
            />
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">Presets rápidos de prueba:</span>
            <button
              type="button"
              onClick={() => onLoadPreset('belkaEcommerce')}
              className="px-2 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
            >
              Belka Company
            </button>
            <button
              type="button"
              onClick={() => onLoadPreset('saasGrowth')}
              className="px-2 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
            >
              SaaS B2B Tech
            </button>
            <button
              type="button"
              onClick={() => onLoadPreset('contentPortal')}
              className="px-2 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
            >
              Portal Medios
            </button>
          </div>
        </div>

        {/* Right column: Single quick-add row and mini preview */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          {/* Quick Single Row Form */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 mb-3">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-500" />
              <span>Añadir Fila Numérica Rápida</span>
            </div>

            <form onSubmit={handleAddSingle} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                    1. Impresiones GSC
                  </label>
                  <input
                    type="text"
                    value={singleImp}
                    onChange={(e) => setSingleImp(e.target.value)}
                    placeholder="ej. 850.000 o 1.2M"
                    className="w-full px-2.5 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                    2. Clics Orgánicos
                  </label>
                  <input
                    type="text"
                    value={singleClicks}
                    onChange={(e) => setSingleClicks(e.target.value)}
                    placeholder="ej. 24.500"
                    className="w-full px-2.5 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                    Palabra Clave / Query
                  </label>
                  <input
                    type="text"
                    value={singleKw}
                    onChange={(e) => setSingleKw(e.target.value)}
                    placeholder="ej. consultoria seo"
                    className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                    Pos. SERP
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={singlePos}
                    onChange={(e) => setSinglePos(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {singleError && (
                <div className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{singleError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar Punto al Gráfico</span>
              </button>
            </form>
          </div>

          {/* Parsed summary preview */}
          <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Muestra de Puntos Analizados:</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {parsedPoints.length} filas
              </span>
            </div>

            <div className="max-h-[105px] overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
              {parsedPoints.slice(0, 5).map((pt, i) => (
                <div
                  key={pt.id || i}
                  className="flex items-center justify-between py-0.5 px-1.5 bg-white dark:bg-slate-800/80 rounded border border-slate-200/60 dark:border-slate-700/60"
                >
                  <span className="truncate max-w-[150px] text-slate-700 dark:text-slate-300">
                    {pt.keyword}
                  </span>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>{formatWideNumber(pt.impressions, true)} imp</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatWideNumber(pt.clicks, true)} clk</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{pt.ctr}%</span>
                  </div>
                </div>
              ))}

              {parsedPoints.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  No hay datos. Pega números arriba o carga un preset.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
