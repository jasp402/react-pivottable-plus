import { useRef, useSyncExternalStore, useCallback, useEffect } from 'react';
import { PivotEngine } from '../core/PivotEngine';
import { FilterModule } from '../modules/FilterModule';
import { PaginationModule } from '../modules/PaginationModule';
import { SortModule } from '../modules/SortModule';

/**
 * usePivotGrid — Hook principal para conectar PivotEngine con React.
 *
 * Uso:
 *   const { gridApi, columnApi, props, state } = usePivotGrid({
 *     data: [...],
 *     rows: ['Country'],
 *     cols: ['Year'],
 *     modules: [FilterModule, SortModule],
 *   });
 *
 * Si no se pasan modules, se incluyen FilterModule, PaginationModule, SortModule por defecto.
 */
export function usePivotGrid(config) {
    const engineRef = useRef(null);

    if (!engineRef.current) {
        const {
            modules = [FilterModule, PaginationModule, SortModule],
            ...restConfig
        } = config;

        engineRef.current = new PivotEngine({
            ...restConfig,
            modules,
        });
    }

    // Sincronizar props externas cuando cambian
    useEffect(() => {
        const sanitized = {};
        const keysToSync = ['data', 'rows', 'cols', 'rendererName', 'aggregatorName', 'page', 'pageSize', 'vals'];
        for (const key of keysToSync) {
            if (config[key] !== undefined) {
                sanitized[key] = config[key];
            }
        }

        // Pasar también renderers, aggregators, sorters si vienen
        if (config.renderers) sanitized.renderers = config.renderers;
        if (config.aggregators) sanitized.aggregators = config.aggregators;
        if (config.sorters) sanitized.sorters = config.sorters;
        if (config.onChange) sanitized.onChange = config.onChange;
        if (config.pagination !== undefined) sanitized.pagination = config.pagination;
        if (config.size) sanitized.size = config.size;
        if (config.derivedAttributes) sanitized.derivedAttributes = config.derivedAttributes;
        if (config.hiddenAttributes) sanitized.hiddenAttributes = config.hiddenAttributes;
        if (config.hiddenFromAggregators) sanitized.hiddenFromAggregators = config.hiddenFromAggregators;
        if (config.hiddenFromDragDrop) sanitized.hiddenFromDragDrop = config.hiddenFromDragDrop;

        engineRef.current.stateManager.updateConfig(sanitized);
        engineRef.current._notifyStateChanged();
    }, [
        config.data,
        config.rows,
        config.cols,
        config.rendererName,
        config.aggregatorName,
        config.page,
        config.pageSize,
    ]);

    // Suscribirse a cambios del engine via useSyncExternalStore
    const snapshot = useSyncExternalStore(
        useCallback((onStoreChange) => engineRef.current.subscribe(onStoreChange), []),
        useCallback(() => engineRef.current.getSnapshot(), [])
    );

    return {
        gridApi: engineRef.current.gridApi,
        columnApi: engineRef.current.columnApi,
        engine: engineRef.current,
        // Backward-compatible shape:
        props: snapshot.props,
        state: snapshot.state,
        // Convenience actions (delegates to gridApi, mantiene compatibilidad con usePivot)
        actions: {
            setProps: (newProps) => engineRef.current.gridApi.updateConfig(newProps),
            updateProp: (key, value) => {
                if (key === 'rows') {
                    engineRef.current.gridApi.setRows(value);
                } else if (key === 'cols') {
                    engineRef.current.gridApi.setCols(value);
                } else {
                    engineRef.current.gridApi.updateConfig({ [key]: value });
                }
            },
            toggleFilter: (attr, value) => engineRef.current.gridApi.toggleFilter(attr, value),
            setValuesInFilter: (attr, values) => engineRef.current.gridApi.setFilter(attr, values),
            addValuesToFilter: (attr, values) => engineRef.current.gridApi.addValuesToFilter(attr, values),
            removeValuesFromFilter: (attr, values) => engineRef.current.gridApi.removeValuesFromFilter(attr, values),
            setUnusedOrder: (order) => engineRef.current.gridApi.setUnusedOrder(order),
        },
    };
}
