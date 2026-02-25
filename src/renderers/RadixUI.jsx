import React, { useState, useRef, useEffect } from 'react';
import { usePivot } from '../hooks/usePivot';
import * as Select from '@radix-ui/react-select';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, Filter, GripVertical, Check, Settings2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Sortable from 'sortablejs';
import PivotTable from '../PivotTable';
import { PivotData, sortAs } from '../Utilities';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const DnDContainer = ({ list, setList, className, children }) => {
    const el = useRef(null);
    const setListRef = useRef(setList);
    const listRef = useRef(list);

    useEffect(() => {
        setListRef.current = setList;
    }, [setList]);

    useEffect(() => {
        listRef.current = list;
        if (el.current && el.current.sortable) {
            el.current.sortable._currentList = list;
        }
    }, [list]);

    useEffect(() => {
        const sortable = Sortable.create(el.current, {
            group: 'shared',
            ghostClass: 'opacity-50',
            animation: 150,
            onEnd: (evt) => {
                const { from, to, oldIndex, newIndex, item } = evt;
                const itemId = item.getAttribute('data-id');

                // ── REVERSIÓN SÍNCRONA DEL DOM ──
                if (from !== to || oldIndex !== newIndex) {
                    item.remove();
                    const nextEl = from.children[oldIndex];
                    if (nextEl) {
                        from.insertBefore(item, nextEl);
                    } else {
                        from.appendChild(item);
                    }
                }

                if (from === to) {
                    // ── Reordenamiento interno ──
                    const newOrder = [...listRef.current];
                    newOrder.splice(oldIndex, 1);
                    newOrder.splice(newIndex, 0, itemId);

                    if (setListRef.current) {
                        setListRef.current(newOrder);
                    }
                } else {
                    // ── Movimiento entre listas ──
                    const fromSortable = from.sortable;
                    const toSortable = to.sortable;

                    if (fromSortable?._setList && toSortable?._setList) {
                        const sourceItems = fromSortable._currentList.filter(id => id !== itemId);
                        const targetItems = [...toSortable._currentList];
                        targetItems.splice(newIndex, 0, itemId);

                        fromSortable._setList(sourceItems);
                        toSortable._setList(targetItems);
                    }
                }
            },
        });

        el.current.sortable = sortable;
        sortable._setList = (newOrder) => {
            if (setListRef.current) {
                setListRef.current(newOrder);
            }
        };
        sortable._currentList = listRef.current;

        return () => sortable.destroy();
    }, []);

    return (
        <div className={className}>
            <ul
                ref={el}
                style={{
                    listStyleType: 'none',
                    padding: 0,
                    margin: 0,
                    minHeight: '1.5rem',
                    width: '100%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}
            >
                {React.Children.map(children, child => (
                    <li key={child.key} data-id={child.props['data-id']}>
                        {child}
                    </li>
                ))}
            </ul>
        </div>
    );
};

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

    const aggregatorName = pivotProps.aggregatorName;
    const rendererName = pivotProps.rendererName;

    const pivotData = new PivotData({
        ...pivotProps,
        data: pivotState.materializedInput,
    });
    const totalPivotRows = pivotData.getRowKeys().length;
    const totalRecords = pivotState.materializedInput.length;
    const totalPages = Math.ceil(totalPivotRows / (pivotProps.pageSize || 20));

    const unusedList = Object.keys(pivotState.attrValues)
        .filter(e => e && e.trim() !== '' && !pivotProps.rows.includes(e) && !pivotProps.cols.includes(e))
        .sort(sortAs(pivotState.unusedOrder || []));

    const colList = pivotProps.cols.filter(e => e && e.trim() !== '');
    const rowList = pivotProps.rows.filter(e => e && e.trim() !== '');

    const renderAttribute = (attr) => (
        <div
            key={attr}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[13px] font-semibold text-slate-700 shadow-sm cursor-grab hover:bg-slate-50 transition-colors group"
            data-id={attr}
        >
            <GripVertical size={14} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
            <span>{attr}</span>

            <Popover.Root>
                <Popover.Trigger asChild>
                    <button className={cn("text-slate-400 hover:text-slate-600 focus:outline-none ml-1 flex items-center justify-center p-0.5 rounded-sm transition-colors", pivotProps.valueFilter[attr] && "text-blue-600")}>
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
                        label="Visualización"
                        value={rendererName}
                        values={Object.keys(pivotProps.renderers)}
                        onChange={(v) => actions.updateProp('rendererName', v)}
                    />
                </div>

                {/* Unused Attrs */}
                <div className="flex-1 p-4 bg-slate-50/80">
                    <DnDContainer
                        list={unusedList}
                        setList={(newOrder) => {
                            actions.setUnusedOrder(newOrder);
                        }}
                        className="flex flex-wrap gap-2 w-full min-h-[1.5rem]"
                    >
                        {unusedList.map(renderAttribute)}
                    </DnDContainer>
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
                                    label="Agregador"
                                    value={aggregatorName}
                                    values={Object.keys(pivotProps.aggregators)}
                                    onChange={(v) => actions.updateProp('aggregatorName', v)}
                                />
                            </div>

                            <div className="flex items-center text-slate-600 gap-1.5 text-base leading-none">
                                <span className="cursor-pointer hover:text-slate-900 transition-colors">↕</span>
                                <span className="cursor-pointer hover:text-slate-900 transition-colors">↔</span>
                            </div>
                        </div>

                        {pivotProps.aggregators[aggregatorName]([])().numInputs > 0 && (
                            <RadixSelect
                                label="Atributo de Valor"
                                value={pivotProps.vals[0] || ''}
                                values={Object.keys(pivotState.attrValues)}
                                onChange={(v) => actions.updateProp('vals', [v])}
                            />
                        )}
                    </div>
                </div>

                {/* Col Attrs */}
                <div className="flex-1 p-4 bg-white">
                    <DnDContainer
                        list={colList}
                        setList={(newOrder) => {
                            actions.updateProp('cols', newOrder);
                        }}
                        className="flex flex-wrap gap-2 w-full min-h-[1.5rem]"
                    >
                        {colList.map(renderAttribute)}
                    </DnDContainer>
                </div>
            </div>

            {/* Row 3: Row Attributes & Table Data */}
            <div className="flex w-full min-h-[400px]">
                {/* Row Attrs */}
                <div className="w-[300px] p-4 border-r border-slate-200 bg-white flex-shrink-0">
                    <DnDContainer
                        list={rowList}
                        setList={(newOrder) => {
                            actions.updateProp('rows', newOrder);
                        }}
                        className="flex flex-col gap-2 w-full min-h-[1.5rem]"
                    >
                        {rowList.map(renderAttribute)}
                    </DnDContainer>
                </div>

                {/* Table Output */}
                <div className={`pvtUi pvtSize-${pivotProps.size || 'lg'} flex-1 w-full p-4 bg-slate-50/30 overflow-auto`}>
                    <PivotTable {...pivotProps} data={pivotState.materializedInput} />
                </div>
            </div>

            {/* Footer: Totals and Pagination */}
            {pivotProps.pagination && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white text-slate-600">
                    <div className="text-[13px] font-medium">
                        Registros: <span className="text-slate-900">{totalRecords}</span> | Filas: <span className="text-slate-900">{totalPivotRows}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5">
                            <button
                                className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                disabled={pivotProps.page <= 1}
                                onClick={() => actions.updateProp('page', 1)}
                            >
                                <ChevronsLeft size={18} />
                            </button>
                            <button
                                className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                disabled={pivotProps.page <= 1}
                                onClick={() => actions.updateProp('page', pivotProps.page - 1)}
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex items-center gap-2 mx-1">
                                <span className="text-[13px] font-medium">Página</span>
                                <input
                                    type="number"
                                    className="w-12 h-8 text-center border border-slate-300 rounded-md text-[13px] font-semibold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={pivotProps.page}
                                    min={1}
                                    max={totalPages}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        if (val > 0 && val <= totalPages) {
                                            actions.updateProp('page', val);
                                        }
                                    }}
                                />
                                <span className="text-[13px] font-medium text-slate-400">de {totalPages}</span>
                            </div>

                            <button
                                className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                disabled={pivotProps.page >= totalPages}
                                onClick={() => actions.updateProp('page', pivotProps.page + 1)}
                            >
                                <ChevronRight size={18} />
                            </button>
                            <button
                                className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                disabled={pivotProps.page >= totalPages}
                                onClick={() => actions.updateProp('page', totalPages)}
                            >
                                <ChevronsRight size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                            <span className="text-[13px] font-medium text-slate-400">Mostrar</span>
                            <select
                                className="text-[13px] font-semibold border border-slate-300 rounded-md px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none hover:border-slate-400 bg-white text-slate-900"
                                value={pivotProps.pageSize}
                                onChange={(e) => {
                                    actions.updateProp('pageSize', parseInt(e.target.value, 10));
                                    actions.updateProp('page', 1);
                                }}
                            >
                                {[10, 20, 50, 100].map(n => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
