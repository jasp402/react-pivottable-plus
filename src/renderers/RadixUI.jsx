import React, { useState } from 'react';
import { usePivot } from '../hooks/usePivot';
import * as Select from '@radix-ui/react-select';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, Filter, GripVertical, Check, Settings2 } from 'lucide-react';
import Sortable from 'react-sortablejs';
import PivotTable from '../PivotTable';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const RadixSelect = ({ label, value, values, onChange }) => (
    <div className="flex flex-col gap-1.5 min-w-[180px]">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <Select.Root value={value} onValueChange={onChange}>
            <Select.Trigger className="flex items-center justify-between w-full px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl hover:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm">
                <Select.Value />
                <Select.Icon><ChevronDown size={14} className="text-slate-400" /></Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className="overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-100 z-[1000] animate-in fade-in zoom-in-95 duration-100">
                    <Select.Viewport className="p-2">
                        {values.map(v => (
                            <Select.Item key={v} value={v} className="flex items-center gap-2 px-8 py-2.5 text-sm text-slate-700 rounded-lg cursor-default select-none hover:bg-blue-50 focus:bg-blue-50 outline-none relative transition-colors">
                                <Select.ItemText>{v}</Select.ItemText>
                                <Select.ItemIndicator className="absolute left-2 flex items-center justify-center"><Check size={14} className="text-blue-600" /></Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    </div>
);

export function RadixUI(props) {
    const { props: pivotProps, state: pivotState, actions } = usePivot(props);

    const renderAttribute = (attr) => (
        <div
            key={attr}
            className="flex items-center gap-3 bg-white hover:border-blue-300 border border-slate-200 rounded-xl px-4 py-2.5 text-sm shadow-sm transition-all cursor-grab group"
            data-id={attr}
        >
            <GripVertical size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
            <span className="font-bold text-slate-700">{attr}</span>

            <Popover.Root>
                <Popover.Trigger asChild>
                    <button className={cn("ml-auto p-1.5 rounded-lg transition-colors hover:bg-slate-100", pivotProps.valueFilter[attr] && "bg-blue-50 text-blue-600")}>
                        <Filter size={14} />
                    </button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content className="w-72 p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[1000] outline-none">
                        <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-4">Filtrar: {attr}</h4>
                        <div className="max-h-60 overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
                            {Object.keys(pivotState.attrValues[attr] || {}).map(v => (
                                <div key={v} className="flex items-center gap-3 text-sm py-1.5 px-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                                    <input type="checkbox" checked={!(v in (pivotProps.valueFilter[attr] || {}))} onChange={() => actions.toggleFilter(attr, v)} className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                    <span className="text-slate-600 font-medium">{v === 'null' ? <em>null</em> : v}</span>
                                </div>
                            ))}
                        </div>
                        <Popover.Arrow className="fill-white" />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );

    return (
        <div className="flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden font-sans text-slate-800 text-sm shadow-sm">
            {/* Row 1: Renderer Dropdown & Unused Attributes */}
            <div className="flex w-full border-b border-slate-200 min-h-[4rem]">
                {/* Renderer */}
                <div className="w-[300px] p-4 border-r border-slate-200 bg-white flex flex-col justify-start flex-shrink-0">
                    <RadixSelect
                        value={pivotProps.rendererName}
                        values={Object.keys(pivotProps.renderers)}
                        onChange={(v) => actions.updateProp('rendererName', v)}
                    />
                </div>

                {/* Unused Attrs */}
                <div className="flex-1 p-4 bg-slate-50/80">
                    <Sortable
                        options={{ group: 'shared', ghostClass: 'opacity-50', animation: 150 }}
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
                            <div className="flex-1">
                                <RadixSelect
                                    value={pivotProps.aggregatorName}
                                    values={Object.keys(pivotProps.aggregators)}
                                    onChange={(v) => actions.updateProp('aggregatorName', v)}
                                />
                            </div>

                            <div className="flex items-center text-slate-600 gap-1.5 text-base leading-none">
                                <span className="cursor-pointer hover:text-slate-900 transition-colors">↕</span>
                                <span className="cursor-pointer hover:text-slate-900 transition-colors">↔</span>
                            </div>
                        </div>

                        {pivotProps.aggregators[pivotProps.aggregatorName]([])().numInputs > 0 && (
                            <RadixSelect
                                value={pivotProps.vals[0] || ''}
                                values={Object.keys(pivotState.attrValues)}
                                onChange={(v) => actions.updateProp('vals', [v])}
                            />
                        )}
                    </div>
                </div>

                {/* Col Attrs */}
                <div className="flex-1 p-4 bg-white">
                    <Sortable
                        options={{ group: 'shared', ghostClass: 'opacity-50', animation: 150 }}
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
                        options={{ group: 'shared', ghostClass: 'opacity-50', animation: 150 }}
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
