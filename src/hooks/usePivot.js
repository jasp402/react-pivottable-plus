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
  // Guard: evita que el useEffect re-sincronice props cuando el cambio
  // se originó internamente (ej: drag & drop), previniendo el bucle infinito.
  const _internalUpdateRef = useRef(false);

  if (!engineRef.current) {
    engineRef.current = new PivotEngine({
      ...initialProps,
      modules: [FilterModule, PaginationModule, SortModule],
    });
  }

  // Sincronizar props externas clave.
  // El guard _internalUpdateRef evita el bucle: cuando el drag & drop actualiza
  // rows/cols internamente y el usuario llama onChange → las props cambian →
  // este effect no debe re-sincronizar porque el engine ya tiene el estado correcto.
  useEffect(() => {
    if (_internalUpdateRef.current) {
      _internalUpdateRef.current = false;
      return;
    }
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
    useCallback(() => engineRef.current.getSnapshot(), []), // getSnapshot
    useCallback(() => engineRef.current.getSnapshot(), [])  // getServerSnapshot
  );

  return {
    props: snapshot.props,
    state: snapshot.state,
    actions: {
      setProps: (newProps) => engineRef.current.gridApi.updateConfig(newProps),
      updateProp: (key, value) => {
        _internalUpdateRef.current = true;
        if (key === 'rows') {
          engineRef.current.gridApi.setRows(value);
        } else if (key === 'cols') {
          engineRef.current.gridApi.setCols(value);
        } else {
          engineRef.current.gridApi.updateConfig({ [key]: value });
        }
      },
      // batchUpdate: actualiza rows, cols y/o unusedOrder en una única notificación
      // para evitar bucles de re-render durante el drag & drop entre zonas.
      batchUpdate: (patch) => {
        _internalUpdateRef.current = true;
        engineRef.current.gridApi.batchUpdate(patch);
      },
      toggleFilter: (attr, value) => engineRef.current.gridApi.toggleFilter(attr, value),
      setValuesInFilter: (attr, values) => engineRef.current.gridApi.setFilter(attr, values),
      addValuesToFilter: (attr, values) => engineRef.current.gridApi.addValuesToFilter(attr, values),
      removeValuesFromFilter: (attr, values) => engineRef.current.gridApi.removeValuesFromFilter(attr, values),
      setUnusedOrder: (order) => {
        _internalUpdateRef.current = true;
        engineRef.current.gridApi.setUnusedOrder(order);
      },
    },
    // Nuevo: exponer gridApi y columnApi
    gridApi: engineRef.current.gridApi,
    columnApi: engineRef.current.columnApi,
    core: engineRef.current, // Backward compat
  };
}
