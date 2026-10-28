import React from 'react';
import { TargetKeyword } from '../types/seo';
import { Globe, Key, TrendingUp, Compass, Hash, Sparkles } from 'lucide-react';

interface DomainKeywordConfigProps {
  domain: string;
  onDomainChange: (newDomain: string) => void;
  targetKeywords: TargetKeyword[];
  onKeywordChange: (index: number, updated: Partial<TargetKeyword>) => void;
}

const KEYWORD_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
];

export const DomainKeywordConfig: React.FC<DomainKeywordConfigProps> = ({
  domain,
  onDomainChange,
  targetKeywords,
  onKeywordChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Configuración de Estrategia SEO & Palabras Clave Target
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define el dominio bajo auditoría y las 5 palabras clave objetivo prioritarias para el cálculo de densidad de probabilidad.
          </p>
        </div>

        {/* Domain input */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="domain-input" className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Dominio Relacionado:
          </label>
          <div className="relative">
            <input
              id="domain-input"
              type="text"
              value={domain}
              onChange={(e) => onDomainChange(e.target.value)}
              placeholder="ej. belkacompany.com"
              className="px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* 5 Keyword Fields Grid */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-slate-500" />
            <span>5 Palabras Clave Target de la Estrategia</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Los colores corresponden a las curvas del Gráfico de Densidad de Kernel
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {targetKeywords.map((kw, idx) => {
            const color = KEYWORD_COLORS[idx % KEYWORD_COLORS.length];
            return (
              <div
                key={kw.id || `target-kw-${idx}`}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg p-3 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div>
                  {/* Header with color indicator and number */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                        title={`Color para curva KDE: ${kw.text}`}
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Target #{idx + 1}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                      {kw.rankingProbability}% Prob.
                    </span>
                  </div>

                  {/* Main keyword text input */}
                  <div className="mb-2">
                    <input
                      type="text"
                      value={kw.text}
                      onChange={(e) => onKeywordChange(idx, { text: e.target.value })}
                      placeholder={`Palabra Clave #${idx + 1}`}
                      className="w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Search Intent & Position */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Intención</label>
                      <select
                        value={kw.intent}
                        onChange={(e) =>
                          onKeywordChange(idx, {
                            intent: e.target.value as TargetKeyword['intent'],
                          })
                        }
                        className="w-full px-1.5 py-1 text-[11px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="Transaccional">Transaccional</option>
                        <option value="Comercial">Comercial</option>
                        <option value="Informativa">Informativa</option>
                        <option value="Navegacional">Navegacional</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Pos. Actual</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="100"
                        value={kw.currentPosition}
                        onChange={(e) =>
                          onKeywordChange(idx, { currentPosition: parseFloat(e.target.value) || 10 })
                        }
                        className="w-full px-2 py-1 text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 tabular-nums focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* KD & Volume */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Dificultad (KD)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={kw.difficulty}
                          onChange={(e) =>
                            onKeywordChange(idx, { difficulty: parseInt(e.target.value, 10) || 50 })
                          }
                          className="w-full px-2 py-1 text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 tabular-nums focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Volumen Mensual</label>
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={kw.searchVolume}
                        onChange={(e) =>
                          onKeywordChange(idx, { searchVolume: parseInt(e.target.value, 10) || 1000 })
                        }
                        className="w-full px-2 py-1 text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 tabular-nums focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer matched metric in GSC */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>CTR GSC:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    {kw.matchedCTR > 0 ? `${kw.matchedCTR}%` : 'Calculando...'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
