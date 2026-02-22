import React from 'react';
import { createRoot } from 'react-dom/client';
import { RadixUI } from '../src/renderers/RadixUI';
import tips from './tips';
import TableRenderers from '../src/TableRenderers';
import './tailwind-base.css';

const App = () => {
  const [pivotState, setPivotState] = React.useState({
    data: tips,
    rows: ['Day of Week'],
    cols: ['Meal'],
    vals: ['Total Bill'],
    aggregatorName: 'Sum',
    rendererName: 'Table',
    pagination: true,
    pageSize: 10,
    page: 1,
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
    <div className="min-h-screen bg-slate-200 p-12">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black text-slate-800 tracking-tighter uppercase">Radix Analytics</h1>
        <p className="text-slate-500 mt-2 font-medium">Accesible, Premium & Headless Pivot Table</p>
      </header>
      
      <main>
        <RadixUI {...pivotState} onChange={s => setPivotState(s)} />
      </main>
    </div>
  );
};

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
