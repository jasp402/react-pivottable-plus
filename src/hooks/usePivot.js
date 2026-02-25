import { useRef, useSyncExternalStore, useCallback, useEffect } from 'react';
import { PivotEngine } from '../core/PivotEngine';
import { FilterModule } from '../modules/FilterModule';
import { PaginationModule } from '../modules/PaginationModule';
import { SortModule } from '../modules/SortModule';

/**
 * usePivot — Hook de backward compatibility.
 * Internamente delega al nuevo PivotEngine con módulos por defecto.
 * Mantiene la API original: { props, state, actions }
 */
export function usePivot(initialProps) {
  const engineRef = useRef(null);

  if (!engineRef.current) {
    engineRef.current = new PivotEngine({
      ...initialProps,
      modules: [FilterModule, PaginationModule, SortModule],
    });
  }

  // Sincronizar props externas clave
  useEffect(() => {
    const sanitized = {};
    const allKeys = Object.keys(initialProps);
    for (const key of allKeys) {
      if (initialProps[key] !== undefined) {
        sanitized[key] = initialProps[key];
      }
    }
    engineRef.current.stateManager.updateConfig(sanitized);
    engineRef.current._notifyStateChanged();
  }, [
    initialProps.data,
    initialProps.rows,
    initialProps.cols,
    initialProps.rendererName,
    initialProps.aggregatorName,
    initialProps.page,
    initialProps.pageSize,
  ]);

  // Suscribirse a cambios del engine
  const snapshot = useSyncExternalStore(
    useCallback((onStoreChange) => engineRef.current.subscribe(onStoreChange), []),
    useCallback(() => engineRef.current.getSnapshot(), [])
  );

  return {
    props: snapshot.props,
    state: snapshot.state,
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
    // Nuevo: exponer gridApi y columnApi
    gridApi: engineRef.current.gridApi,
    columnApi: engineRef.current.columnApi,
    core: engineRef.current, // Backward compat
  };
}
