import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { PivotData } from '../Utilities';

export function usePivot(initialProps) {
  // Mantener una referencia a las props iniciales para evitar cierres de ámbito (closures) obsoletos
  const initialPropsRef = useRef(initialProps);
  useEffect(() => {
    initialPropsRef.current = initialProps;
  }, [initialProps]);

  const [props, setProps] = useState({
    data: [],
    rows: [],
    cols: [],
    vals: [],
    rowOrder: 'key_a_to_z',
    colOrder: 'key_a_to_z',
    aggregatorName: 'Count',
    rendererName: 'Table',
    valueFilter: {},
    sorters: {},
    derivedAttributes: {},
    hiddenAttributes: [],
    hiddenFromAggregators: [],
    hiddenFromDragDrop: [],
    pagination: false,
    pageSize: 20,
    page: 1,
    ...initialProps
  });

  const [state, setState] = useState({
    attrValues: {},
    materializedInput: [],
    unusedOrder: []
  });

  // Sincronizar props internas cuando cambian las externas, pero sin disparar onChange de vuelta
  useEffect(() => {
    setProps(prev => ({ ...prev, ...initialProps }));
  }, [initialProps.data, initialProps.rows, initialProps.cols, initialProps.rendererName, initialProps.aggregatorName, initialProps.page, initialProps.pageSize]);

  // Materializar la entrada
  useEffect(() => {
    const materializedInput = [];
    const attrValues = {};
    let recordsProcessed = 0;

    PivotData.forEachRecord(
      props.data,
      props.derivedAttributes,
      function(record) {
        materializedInput.push(record);
        for (const attr of Object.keys(record)) {
          if (!(attr in attrValues)) {
            attrValues[attr] = {};
            if (recordsProcessed > 0) {
              attrValues[attr].null = recordsProcessed;
            }
          }
        }
        for (const attr in attrValues) {
          const value = attr in record ? record[attr] : 'null';
          if (!(value in attrValues[attr])) {
            attrValues[attr][value] = 0;
          }
          attrValues[attr][value]++;
        }
        recordsProcessed++;
      }
    );

    setState(s => ({ ...s, attrValues, materializedInput }));
  }, [props.data, props.derivedAttributes]);

  const updateProp = useCallback((key, value) => {
    setProps(prev => {
        let finalValue = value;
        if (Array.isArray(value) && (key === 'rows' || key === 'cols' || key === 'vals')) {
            finalValue = value.filter(v => v && v.trim() !== '');
        }

        const newProps = { ...prev, [key]: finalValue };
        
        if (key === 'rows') {
            newProps.cols = prev.cols.filter(c => !finalValue.includes(c));
        } else if (key === 'cols') {
            newProps.rows = prev.rows.filter(r => !finalValue.includes(r));
        }

        // Programar el onChange en un microtask o después del renderizado para evitar el warning de Gallery
        setTimeout(() => {
            if (initialPropsRef.current.onChange) {
                initialPropsRef.current.onChange(newProps);
            }
        }, 0);

        return newProps;
    });
  }, []);

  const toggleFilter = useCallback((attribute, value) => {
    setProps(prev => {
        const filter = { ...prev.valueFilter[attribute] };
        if (value in filter) {
            delete filter[value];
        } else {
            filter[value] = true;
        }
        const newValueFilter = { ...prev.valueFilter, [attribute]: filter };
        const newProps = { ...prev, valueFilter: newValueFilter };
        
        setTimeout(() => {
            if (initialPropsRef.current.onChange) initialPropsRef.current.onChange(newProps);
        }, 0);

        return newProps;
    });
  }, []);

  const setValuesInFilter = useCallback((attribute, values) => {
      setProps(prev => {
          const newFilter = values.reduce((r, v) => {
              r[v] = true;
              return r;
          }, {});
          const newProps = { ...prev, valueFilter: { ...prev.valueFilter, [attribute]: newFilter } };
          
          setTimeout(() => {
            if (initialPropsRef.current.onChange) initialPropsRef.current.onChange(newProps);
          }, 0);

          return newProps;
      });
  }, []);

  return {
    props,
    state,
    actions: {
        setProps,
        updateProp,
        toggleFilter,
        setValuesInFilter,
        setUnusedOrder: (order) => setState(s => ({ ...s, unusedOrder: order }))
    }
  };
}
