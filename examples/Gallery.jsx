import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { TailwindUI } from '../src/renderers/TailwindUI';
import { RadixUI } from '../src/renderers/RadixUI';
import { ShadcnDashboardUI } from '../src/renderers/ShadcnDashboardUI';
import tips from './tips';
import TableRenderers from '../src/TableRenderers';
import PlotlyRenderers from '../src/PlotlyRenderers';
import SubtotalRenderers from '../src/SubtotalRenderers';
import { aggregators } from '../src/Utilities';
import createPlotlyComponent from 'react-plotly.js/factory';
import { Layout, Box, Palette, Zap } from 'lucide-react';
import './tailwind-base.css';
import '../src/pivottable.css';
import '../src/grouping.css';

// Initialize Plotly (assuming window.Plotly is available or use a fallback)
const Plot = createPlotlyComponent(window.Plotly || {});

const UI_VERSIONS = [
  {
    id: 'tailwind',
    name: 'Tailwind Pure',
    description: 'Minimalista & Utility-First',
    icon: <Palette size={20} />,
    color: 'bg-sky-500'
  },
  {
    id: 'radix',
    name: 'Radix UI + Tailwind',
    description: 'Accesible & Premium Components',
    icon: <Box size={20} />,
    color: 'bg-indigo-500'
  },
  {
    id: 'shadcn',
    name: 'Shadcn Dashboard',
    description: 'Enterprise Data Explorer',
    icon: <Layout size={20} />,
    color: 'bg-slate-900'
  }
];

const Gallery = () => {
  const [activeUI, setActiveUI] = useState('tailwind');

  // Memoized renderers and aggregators to avoid re-calculation
  const allRenderers = useMemo(() => Object.assign(
    {},
    TableRenderers,
    PlotlyRenderers(Plot),
    SubtotalRenderers
  ), []);

  const [pivotState, setPivotState] = useState({
    data: tips,
    rows: ['Day of Week'],
    cols: ['Meal'],
    vals: ['Total Bill'],
    aggregatorName: 'Sum',
    rendererName: 'Table',
    pagination: true,
    pageSize: 10,
    page: 1,
    renderers: allRenderers,
    aggregators: aggregators,
    plotlyOptions: { width: 900, height: 500 },
    plotlyConfig: {},
    size: 'lg'
  });

  const renderActiveUI = () => {
    const commonProps = {
      ...pivotState,
      onChange: setPivotState
    };

    switch (activeUI) {
      case 'tailwind': return <TailwindUI {...commonProps} />;
      case 'radix': return <RadixUI {...commonProps} />;
      case 'shadcn': return <ShadcnDashboardUI {...commonProps} />;
      default: return <TailwindUI {...commonProps} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Gallery Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-2xl z-50">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-amber-500 fill-amber-500" size={24} />
            <h1 className="text-xl font-black tracking-tighter text-slate-900">PIVOT UI LAB</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sistemas de Diseño v2.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {UI_VERSIONS.map((ui) => (
            <button
              key={ui.id}
              onClick={() => setActiveUI(ui.id)}
              className={`w-full flex items-start gap-4 p-4 rounded-2xl transition-all border-2 text-left group ${activeUI === ui.id
                  ? 'bg-white border-blue-500 shadow-lg scale-[1.02]'
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-500'
                }`}
            >
              <div className={`p-2 rounded-xl text-white shadow-md transition-transform group-hover:rotate-6 ${ui.color}`}>
                {ui.icon}
              </div>
              <div className="flex flex-col">
                <span className={`font-bold text-sm ${activeUI === ui.id ? 'text-slate-900' : 'text-slate-600'}`}>
                  {ui.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                  {ui.description}
                </span>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
          Selecciona una versión para probar
        </div>
      </aside>

      {/* Workspace Canvas */}
      <main className="flex-1 relative overflow-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="absolute inset-0 p-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Ambiente de Pruebas</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {UI_VERSIONS.find(v => v.id === activeUI).name}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xl mr-2" title="Configurar Tamaño de Tabla">⚙️</span>
              <select
                value={pivotState.size}
                onChange={e => setPivotState({ ...pivotState, size: e.target.value })}
                className="p-2 rounded-lg border border-slate-200 text-slate-700 bg-white text-sm outline-none shadow-sm font-medium"
              >
                <option value="lg">Tamaño: Large (100%)</option>
                <option value="md">Tamaño: Medium (85%)</option>
                <option value="sm">Tamaño: Small (70%)</option>
              </select>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {renderActiveUI()}
          </div>
        </div>
      </main>
    </div>
  );
};

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<Gallery />);
