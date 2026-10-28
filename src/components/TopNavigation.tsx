import React from 'react';
import { BarChart3, Download, RefreshCw, Sparkles, Sliders } from 'lucide-react';

interface TopNavigationProps {
  domain: string;
  onSelectPreset: (presetKey: 'belkaEcommerce' | 'saasGrowth' | 'contentPortal') => void;
  onExportReport: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  domain,
  onSelectPreset,
  onExportReport,
  activeSection,
  onNavigate,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      {/* Zone 1: Brand wordmark (single line, no clutter) */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('cartesian-section');
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-blue-400 transition-colors flex items-center gap-2"
        >
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <span>SEO Matrix</span>
        </a>
        <span className="text-slate-600 hidden sm:inline" aria-hidden="true">|</span>
        <span className="text-xs font-mono text-slate-400 hidden sm:inline truncate max-w-[160px]">
          {domain || 'dominio.com'}
        </span>
      </div>

      {/* Zone 2: 4 single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => onNavigate('domain-section')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'domain-section' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Estrategia & Keywords
        </button>
        <button
          onClick={() => onNavigate('input-section')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'input-section' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Datos Numéricos GSC
        </button>
        <button
          onClick={() => onNavigate('cartesian-section')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'cartesian-section' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Gráfico Cartesiano
        </button>
        <button
          onClick={() => onNavigate('kde-section')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'kde-section' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Densidad de Kernel (KDE)
        </button>
        <button
          onClick={() => onNavigate('insights-section')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'insights-section' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Insights & CTR
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative group hidden sm:block">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Cargar Preset</span>
          </button>
          <div className="absolute right-0 top-full mt-1.5 w-60 py-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
            <button
              onClick={() => onSelectPreset('belkaEcommerce')}
              className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 hover:text-white transition-colors flex flex-col"
            >
              <span className="font-semibold text-blue-400">Belka Company (E-Commerce)</span>
              <span className="text-[11px] text-slate-400">850K - 2.4M impresiones GSC</span>
            </button>
            <button
              onClick={() => onSelectPreset('saasGrowth')}
              className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 hover:text-white transition-colors flex flex-col border-t border-slate-700/50"
            >
              <span className="font-semibold text-emerald-400">SaaS B2B Tech Growth</span>
              <span className="text-[11px] text-slate-400">Cloud analytics & dashboards</span>
            </button>
            <button
              onClick={() => onSelectPreset('contentPortal')}
              className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 hover:text-white transition-colors flex flex-col border-t border-slate-700/50"
            >
              <span className="font-semibold text-purple-400">Portal Editorial & Media</span>
              <span className="text-[11px] text-slate-400">Alto volumen y alcance editorial</span>
            </button>
          </div>
        </div>

        <button
          onClick={onExportReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Informe</span>
        </button>
      </div>
    </header>
  );
};
