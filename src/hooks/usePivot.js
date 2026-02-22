import { useState, useMemo, useCallback, useEffect } from 'react';
import { PivotData } from '../Utilities';

export function usePivot(initialProps) {
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
    ...initialProps
  });

  const [state, setState] = useState({
    attrValues: {},
    materializedInput: [],
    unusedOrder: []
  });

  // Materializar la entrada (similar a materializeInput en el original)
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
        const newProps = { ...prev, [key]: value };
        
        // Lógica de evitar duplicados entre filas y columnas
        if (key === 'rows') {
            newProps.cols = prev.cols.filter(c => !value.includes(c));
        } else if (key === 'cols') {
            newProps.rows = prev.rows.filter(r => !value.includes(r));
        }

        if (initialProps.onChange) {
            initialProps.onChange(newProps);
        }
        return newProps;
    });
  }, [initialProps.onChange]);

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
        if (initialProps.onChange) initialProps.onChange(newProps);
        return newProps;
    });
  }, [initialProps.onChange]);

  const setValuesInFilter = useCallback((attribute, values) => {
      setProps(prev => {
          const newFilter = values.reduce((r, v) => {
              r[v] = true;
              return r;
          }, {});
          const newProps = { ...prev, valueFilter: { ...prev.valueFilter, [attribute]: newFilter } };
          if (initialProps.onChange) initialProps.onChange(newProps);
          return newProps;
      });
  }, [initialProps.onChange]);

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
