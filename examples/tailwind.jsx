import React from 'react';
import { createRoot } from 'react-dom/client';
import { TailwindUI } from '../src/renderers/TailwindUI';
import tips from './tips';
import TableRenderers from '../src/TableRenderers';
import { PivotData } from '../src/Utilities';
import '../src/pivottable.css';
import '../src/grouping.css';

// Import Tailwind via CSS if needed, but with v4 we use the vite plugin
import './tailwind-base.css';

const App = () => {
  const [pivotState, setPivotState] = React.useState({
    data: tips,
    rows: ['Payer Gender'],
    cols: ['Payer Smoker'],
    vals: ['Total Bill'],
    aggregatorName: 'Sum',
    rendererName: 'Table',
    renderers: TableRenderers,
    aggregators: {
      Sum: (vals) => (data, rowKey, colKey) => {
        return {
          count: 0,
          push(record) { this.count += parseFloat(record[vals[0]] || 0); },
          value() { return this.count; },
          format: x => x.toFixed(2)
        };
      },
      Count: (vals) => (data, rowKey, colKey) => {
        return {
          count: 0,
          push() { this.count++; },
          value() { return this.count; },
          format: x => x
        };
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">PivotTable Modern UI</h1>
        <p className="text-slate-600 mt-2">Versión impulsada por Tailwind CSS v4 & usePivot Hook</p>
      </header>
      
      <main className="max-w-7xl mx-auto">
        <TailwindUI {...pivotState} onChange={s => setPivotState(s)} />
      </main>
    </div>
  );
};

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
