import React, { useState } from 'react';
import { usePivot } from '../hooks/usePivot';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import Sortable from 'react-sortablejs';
import PivotTable from '../PivotTable';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function TailwindUI(props) {
  const { props: pivotProps, state: pivotState, actions } = usePivot(props);
  const [openDropdown, setOpenDropdown] = useState(null);

  const aggregatorName = pivotProps.aggregatorName;
  const rendererName = pivotProps.rendererName;

  const renderAttribute = (attr) => (
    <div
      key={attr}
      className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 text-indigo-600 rounded px-2.5 py-1 text-xs font-medium cursor-grab hover:bg-indigo-50 shadow-sm transition-colors"
      data-id={attr}
    >
      <span>{attr}</span>
      <button
        onClick={() => setOpenDropdown(openDropdown === attr ? null : attr)}
        className={cn(
          "text-indigo-400 hover:text-indigo-600 focus:outline-none ml-1 flex items-center justify-center p-0.5 rounded-sm",
          pivotProps.valueFilter && pivotProps.valueFilter[attr] && "bg-indigo-100 text-indigo-700"
        )}
      >
        <span className="text-[10px] leading-none">▾</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden font-sans text-slate-800 text-sm shadow-sm">
      {/* Row 1: Renderer Dropdown & Unused Attributes */}
      <div className="flex w-full border-b border-slate-200 min-h-[4rem]">
        {/* Renderer */}
        <div className="w-[300px] p-4 border-r border-slate-200 bg-white flex flex-col justify-start flex-shrink-0">
          <select
            className="w-full text-xs font-medium border border-slate-300 rounded px-3 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none hover:border-slate-400 bg-white text-slate-700"
            value={rendererName}
            onChange={(e) => actions.updateProp('rendererName', e.target.value)}
          >
            {Object.keys(pivotProps.renderers).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Unused Attrs */}
        <div className="flex-1 p-4 bg-slate-50/80">
          <Sortable
            options={{ group: 'shared', ghostClass: 'opacity-50' }}
            className="flex flex-wrap gap-2 w-full min-h-[1.5rem]"
            onChange={(order) => actions.setUnusedOrder(order)}
          >
            {Object.keys(pivotState.attrValues)
              .filter(e => !pivotProps.rows.includes(e) && !pivotProps.cols.includes(e))
              .map(renderAttribute)}
          </Sortable>
        </div>
      </div>

      {/* Row 2: Aggregators & Column Attributes */}
      <div className="flex w-full border-b border-slate-200 min-h-[4rem]">
        {/* Aggregators */}
        <div className="w-[300px] p-4 border-r border-slate-200 bg-slate-50/30 flex-shrink-0 flex items-start">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <select
                className="flex-1 text-xs font-medium border border-slate-300 rounded px-3 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none hover:border-slate-400 bg-white text-slate-700"
                value={aggregatorName}
                onChange={(e) => actions.updateProp('aggregatorName', e.target.value)}
              >
                {Object.keys(pivotProps.aggregators).map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              <div className="flex items-center text-slate-600 gap-1.5 text-base leading-none">
                <span className="cursor-pointer hover:text-slate-900 transition-colors">↕</span>
                <span className="cursor-pointer hover:text-slate-900 transition-colors">↔</span>
              </div>
            </div>

            {pivotProps.aggregators[pivotProps.aggregatorName]([])().numInputs > 0 && (
              <select
                className="w-full text-xs font-medium border border-slate-300 rounded px-3 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none hover:border-slate-400 bg-white text-slate-700"
                value={pivotProps.vals[0] || ''}
                onChange={(e) => actions.updateProp('vals', [e.target.value])}
              >
                {Object.keys(pivotState.attrValues).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Col Attrs */}
        <div className="flex-1 p-4 bg-white">
          <Sortable
            options={{ group: 'shared', ghostClass: 'opacity-50' }}
            className="flex flex-wrap gap-2 w-full min-h-[1.5rem]"
            onChange={(order) => actions.updateProp('cols', order)}
          >
            {pivotProps.cols.map(renderAttribute)}
          </Sortable>
        </div>
      </div>

      {/* Row 3: Row Attributes & Table Data */}
      <div className="flex w-full min-h-[400px]">
        {/* Row Attrs */}
        <div className="w-[300px] p-4 border-r border-slate-200 bg-white flex-shrink-0">
          <Sortable
            options={{ group: 'shared', ghostClass: 'opacity-50' }}
            className="flex flex-col gap-2 w-full min-h-[1.5rem]"
            onChange={(order) => actions.updateProp('rows', order)}
          >
            {pivotProps.rows.map(renderAttribute)}
          </Sortable>
        </div>

        {/* Table Output */}
        <div className="flex-1 w-full p-4 bg-slate-50/30 overflow-auto">
          <PivotTable {...pivotProps} data={pivotState.materializedInput} />
        </div>
      </div>
    </div>
  );
}
