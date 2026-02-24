import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { PivotData, sortAs, getSort, aggregators as defaultAggregators } from './Utilities';
import PivotTable from './PivotTable';
import TableRenderers from './TableRenderers';
import Draggable from 'react-draggable';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── DraggableAttribute ────────────────────────────────────────────────────────

export const DraggableAttribute = React.forwardRef(
  (
    {
      name,
      attrValues,
      valueFilter,
      sorter,
      menuLimit,
      setValuesInFilter,
      addValuesToFilter,
      moveFilterBoxToTop,
      removeValuesFromFilter,
      zIndex,
      dragHandleProps,
      isDragging,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [filterText, setFilterText] = useState('');
    const nodeRef = useRef(null);

    const toggleValue = value => {
      if (value in valueFilter) {
        removeValuesFromFilter(name, [value]);
      } else {
        addValuesToFilter(name, [value]);
      }
    };

    const matchesFilter = x =>
      x.toLowerCase().trim().includes(filterText.toLowerCase().trim());

    const selectOnly = (e, value) => {
      e.stopPropagation();
      setValuesInFilter(
        name,
        Object.keys(attrValues).filter(y => y !== value)
      );
    };

    const getFilterBox = () => {
      const showMenu = Object.keys(attrValues).length < menuLimit;
      const values = Object.keys(attrValues);
      const shown = values.filter(matchesFilter).sort(sorter);

      return (
        <Draggable handle=".pvtDragHandle" nodeRef={nodeRef}>
          <div
            ref={nodeRef}
            className="pvtFilterBox"
            style={{ display: 'block', cursor: 'initial', zIndex }}
            onClick={() => moveFilterBoxToTop(name)}
          >
            <a onClick={() => setOpen(false)} className="pvtCloseX">×</a>
            <span className="pvtDragHandle">☰</span>
            <h4>{name}</h4>

            {showMenu || <p>(too many values to show)</p>}

            {showMenu && (
              <p>
                <input
                  type="text"
                  placeholder="Filter values"
                  className="pvtSearch"
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
                />
                <br />
                <a
                  role="button"
                  className="pvtButton"
                  onClick={() =>
                    removeValuesFromFilter(
                      name,
                      Object.keys(attrValues).filter(matchesFilter)
                    )
                  }
                >
                  Select {values.length === shown.length ? 'All' : shown.length}
                </a>{' '}
                <a
                  role="button"
                  className="pvtButton"
                  onClick={() =>
                    addValuesToFilter(
                      name,
                      Object.keys(attrValues).filter(matchesFilter)
                    )
                  }
                >
                  Deselect {values.length === shown.length ? 'All' : shown.length}
                </a>
              </p>
            )}

            {showMenu && (
              <div className="pvtCheckContainer">
                {shown.map(x => (
                  <p
                    key={x}
                    onClick={() => toggleValue(x)}
                    className={x in valueFilter ? '' : 'selected'}
                  >
                    <a className="pvtOnly" onClick={e => selectOnly(e, x)}>only</a>
                    <a className="pvtOnlySpacer">&nbsp;</a>
                    {x === '' ? <em>null</em> : x}
                  </p>
                ))}
              </div>
            )}
          </div>
        </Draggable>
      );
    };

    const toggleFilterBox = () => {
      setOpen(o => !o);
      moveFilterBoxToTop(name);
    };

    const filtered = Object.keys(valueFilter).length !== 0 ? 'pvtFilteredAttribute' : '';

    return (
      <li
        ref={ref}
        data-id={name}
        style={{ opacity: isDragging ? 0.4 : 1 }}
      >
        <span className={'pvtAttr ' + filtered} {...dragHandleProps}>
          {name}
          <span
            className="pvtTriangle"
            onClick={e => { e.stopPropagation(); toggleFilterBox(); }}
          >
            {' '}▾
          </span>
        </span>
        {open ? getFilterBox() : null}
      </li>
    );
  }
);
DraggableAttribute.displayName = 'DraggableAttribute';

const SortableAttribute = ({ id, ...rest }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <DraggableAttribute
      ref={setNodeRef}
      name={id}
      isDragging={isDragging}
      dragHandleProps={{ ...attributes, ...listeners, style }}
      {...rest}
    />
  );
};

export const Dropdown = ({ zIndex = 1, open = false, toggle, current, values = [], setValue }) => (
  <div className="pvtDropdown" style={{ zIndex }}>
    <div
      onClick={e => { e.stopPropagation(); toggle(); }}
      className={'pvtDropdownValue pvtDropdownCurrent ' + (open ? 'pvtDropdownCurrentOpen' : '')}
      role="button"
    >
      <div className="pvtDropdownIcon">{open ? '×' : '▾'}</div>
      {current || <span>&nbsp;</span>}
    </div>
    {open && (
      <div className="pvtDropdownMenu">
        {values.map(r => (
          <div
            key={r}
            role="button"
            onClick={e => {
              e.stopPropagation();
              if (current === r) toggle();
              else { setValue(r); toggle(); }
            }}
            className={'pvtDropdownValue ' + (r === current ? 'pvtDropdownActiveValue' : '')}
          >
            {r}
          </div>
        ))}
      </div>
    )}
  </div>
);

const DnDCell = ({
  id,
  items,
  classes,
  state,
  valueFilter,
  sorters,
  menuLimit,
  setValuesInFilter,
  addValuesToFilter,
  moveFilterBoxToTop,
  removeValuesFromFilter,
  isHorizontal,
}) => {
  const strategy = isHorizontal
    ? horizontalListSortingStrategy
    : verticalListSortingStrategy;

  return (
    <td className={classes}>
      <SortableContext id={id} items={items} strategy={strategy}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map(x => (
            <SortableAttribute
              key={x}
              id={x}
              attrValues={state.attrValues[x] || {}}
              valueFilter={valueFilter[x] || {}}
              sorter={getSort(sorters, x)}
              menuLimit={menuLimit}
              setValuesInFilter={setValuesInFilter}
              addValuesToFilter={addValuesToFilter}
              moveFilterBoxToTop={moveFilterBoxToTop}
              removeValuesFromFilter={removeValuesFromFilter}
              zIndex={state.zIndices[x] || state.maxZIndex}
            />
          ))}
        </ul>
      </SortableContext>
    </td>
  );
};

const PivotTableUI = props => {
  const {
    data = [],
    onChange = () => {},
    rows = [],
    cols = [],
    vals = [],
    aggregatorName = 'Count',
    aggregators = defaultAggregators,
    rendererName = 'Table',
    renderers = TableRenderers,
    valueFilter = {},
    sorters = {},
    menuLimit = 500,
    unusedOrientationCutoff = 85,
    hiddenAttributes = [],
    hiddenFromAggregators = [],
    hiddenFromDragDrop = [],
    pagination = false,
    page = 1,
    pageSize = 20,
    rowOrder = 'key_a_to_z',
    colOrder = 'key_a_to_z',
    derivedAttributes = {},
  } = props;

  const [state, setState] = useState({
    unusedOrder: [],
    zIndices: {},
    maxZIndex: 1000,
    openDropdown: false,
    attrValues: {},
    materializedInput: [],
    data: null,
  });

  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (state.data === data) return;
    const newState = { data, attrValues: {}, materializedInput: [] };
    let recordsProcessed = 0;
    PivotData.forEachRecord(data, derivedAttributes, record => {
      newState.materializedInput.push(record);
      for (const attr of Object.keys(record)) {
        if (!(attr in newState.attrValues)) {
          newState.attrValues[attr] = {};
          if (recordsProcessed > 0) newState.attrValues[attr].null = recordsProcessed;
        }
      }
      for (const attr in newState.attrValues) {
        const value = attr in record ? record[attr] : 'null';
        if (!(value in newState.attrValues[attr])) newState.attrValues[attr][value] = 0;
        newState.attrValues[attr][value]++;
      }
      recordsProcessed++;
    });
    setState(s => ({ ...s, ...newState }));
  }, [data, derivedAttributes, state.data]);

  const sendPropUpdate = useCallback(command => {
    const newProps = update(props, command);
    if (onChange) onChange(newProps);
  }, [props, onChange]);

  const handleDuplicates = (newAttrs, existingAttrs) => {
    if (!newAttrs || !existingAttrs) return existingAttrs || [];
    const dups = newAttrs.filter(item => existingAttrs.includes(item));
    return dups.length > 0 ? existingAttrs.filter(item => !dups.includes(item)) : existingAttrs;
  };

  const propUpdater = useCallback(key => value => {
    const updateObj = { [key]: { $set: value } };
    if (key === 'rows') {
      const updatedCols = handleDuplicates(value, cols);
      if (updatedCols.length !== cols.length) updateObj.cols = { $set: updatedCols };
    } else if (key === 'cols') {
      const updatedRows = handleDuplicates(value, rows);
      if (updatedRows.length !== rows.length) updateObj.rows = { $set: updatedRows };
    }
    sendPropUpdate(updateObj);
  }, [cols, rows, sendPropUpdate]);

  const setValuesInFilter = useCallback((attribute, values) => {
    sendPropUpdate({
      valueFilter: {
        [attribute]: { $set: values.reduce((r, v) => { r[v] = true; return r; }, {}) },
      },
    });
  }, [sendPropUpdate]);

  const addValuesToFilter = useCallback((attribute, values) => {
    if (attribute in valueFilter) {
      sendPropUpdate({
        valueFilter: {
          [attribute]: values.reduce((r, v) => { r[v] = { $set: true }; return r; }, {}),
        },
      });
    } else {
      setValuesInFilter(attribute, values);
    }
  }, [sendPropUpdate, valueFilter, setValuesInFilter]);

  const removeValuesFromFilter = useCallback((attribute, values) => {
    sendPropUpdate({ valueFilter: { [attribute]: { $unset: values } } });
  }, [sendPropUpdate]);

  const moveFilterBoxToTop = useCallback(attribute => {
    setState(s => ({
      ...s,
      maxZIndex: s.maxZIndex + 1,
      zIndices: { ...s.zIndices, [attribute]: s.maxZIndex + 1 },
    }));
  }, []);

  const unusedAttrs = Object.keys(state.attrValues)
    .filter(e => e && e.trim() !== '' && !rows.includes(e) && !cols.includes(e) && !hiddenAttributes.includes(e) && !hiddenFromDragDrop.includes(e))
    .sort(sortAs(state.unusedOrder));

  const unusedLength = unusedAttrs.reduce((r, e) => r + e.length, 0);
  const horizUnused = unusedLength < unusedOrientationCutoff;

  const colAttrs = cols.filter(e => e && e.trim() !== '' && !hiddenAttributes.includes(e) && !hiddenFromDragDrop.includes(e));
  const rowAttrs = rows.filter(e => e && e.trim() !== '' && !hiddenAttributes.includes(e) && !hiddenFromDragDrop.includes(e));

  const getZoneOfItem = id => {
    if (rowAttrs.includes(id)) return 'rows';
    if (colAttrs.includes(id)) return 'cols';
    if (unusedAttrs.includes(id)) return 'unused';
    return null;
  };

  const getListByZone = zone => {
    if (zone === 'rows') return rowAttrs;
    if (zone === 'cols') return colAttrs;
    if (zone === 'unused') return unusedAttrs;
    return [];
  };

  const getUpdaterByZone = zone => {
    if (zone === 'rows') return propUpdater('rows');
    if (zone === 'cols') return propUpdater('cols');
    if (zone === 'unused') return order => setState(s => ({ ...s, unusedOrder: order }));
    return () => { };
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const activeZone = getZoneOfItem(active.id);
    const overZone = over.data?.current?.sortable?.containerId ?? getZoneOfItem(over.id);
    if (!activeZone || !overZone || activeZone === overZone) return;
    const activeList = [...getListByZone(activeZone)];
    const overList = [...getListByZone(overZone)];
    const activeIndex = activeList.indexOf(active.id);
    const overIndex = overList.indexOf(over.id);
    if (activeIndex === -1) return;
    if (overList.includes(active.id)) return;
    activeList.splice(activeIndex, 1);
    const insertAt = overIndex >= 0 ? overIndex : overList.length;
    overList.splice(insertAt, 0, active.id);
    getUpdaterByZone(activeZone)(activeList);
    getUpdaterByZone(overZone)(overList);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const activeZone = getZoneOfItem(active.id);
    const overZone = over.data?.current?.sortable?.containerId ?? getZoneOfItem(over.id);
    if (!activeZone || !overZone) return;
    if (activeZone === overZone) {
      const list = getListByZone(activeZone);
      const oldIndex = list.indexOf(active.id);
      const newIndex = list.indexOf(over.id);
      if (oldIndex !== newIndex) getUpdaterByZone(activeZone)(arrayMove(list, oldIndex, newIndex));
    }
  };

  const isOpen = dropdown => state.openDropdown === dropdown;
  const numValsAllowed = (aggregators[aggregatorName]?.([])?.()?.numInputs) || 0;
  const actualRendererName = (rendererName in renderers) ? rendererName : Object.keys(renderers)[0];

  const sortIcons = {
    key_a_to_z: { rowSymbol: '↕', colSymbol: '↔', next: 'value_a_to_z' },
    value_a_to_z: { rowSymbol: '↓', colSymbol: '→', next: 'value_z_to_a' },
    value_z_to_a: { rowSymbol: '↑', colSymbol: '←', next: 'key_a_to_z' },
  };

  const sharedCellProps = {
    state, valueFilter, sorters, menuLimit, setValuesInFilter, addValuesToFilter, moveFilterBoxToTop, removeValuesFromFilter,
  };

  const renderFooter = () => {
    const pivotData = new PivotData({ ...props, data: state.materializedInput });
    const totalPivotRows = pivotData.getRowKeys().length;
    const totalRecords = state.materializedInput.length;
    const totalPages = Math.ceil(totalPivotRows / pageSize);
    return (
      <div className="pvtFooter">
        <div className="pvtFooterInfo">Total registros: {totalRecords} | Filas: {totalPivotRows}</div>
        <div className="pvtFooterPagination">
          <button className="pvtButton" disabled={page <= 1} onClick={() => propUpdater('page')(1)}>«</button>
          <button className="pvtButton" disabled={page <= 1} onClick={() => propUpdater('page')(page - 1)}>‹</button>
          <span>Página <input type="number" className="pvtPageInput" value={page} min={1} max={totalPages} onChange={e => {
            const val = parseInt(e.target.value, 10);
            if (val > 0 && val <= totalPages) propUpdater('page')(val);
          }} /> de {totalPages}</span>
          <button className="pvtButton" disabled={page >= totalPages} onClick={() => propUpdater('page')(page + 1)}>›</button>
          <button className="pvtButton" disabled={page >= totalPages} onClick={() => propUpdater('page')(totalPages)}>»</button>
          <select className="pvtPageSize" value={pageSize} onChange={e => {
            sendPropUpdate({ pageSize: { $set: parseInt(e.target.value, 10) }, page: { $set: 1 } });
          }}>{[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / pág</option>)}</select>
        </div>
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <table className="pvtUi">
        <tbody onClick={() => setState(s => ({ ...s, openDropdown: false }))}>
          {horizUnused ? (
            <>
              <tr>
                <td className="pvtRenderers">
                  <Dropdown current={actualRendererName} values={Object.keys(renderers)} open={isOpen('renderer')} zIndex={isOpen('renderer') ? state.maxZIndex + 1 : 1} toggle={() => setState(s => ({ ...s, openDropdown: isOpen('renderer') ? false : 'renderer' }))} setValue={propUpdater('rendererName')} />
                </td>
                <DnDCell id="unused" items={unusedAttrs} classes={`pvtAxisContainer pvtUnused pvtHorizList`} isHorizontal={true} {...sharedCellProps} />
              </tr>
              <tr>
                <td className="pvtVals">
                  <Dropdown current={aggregatorName} values={Object.keys(aggregators)} open={isOpen('aggregators')} zIndex={isOpen('aggregators') ? state.maxZIndex + 1 : 1} toggle={() => setState(s => ({ ...s, openDropdown: isOpen('aggregators') ? false : 'aggregators' }))} setValue={propUpdater('aggregatorName')} />
                  <a role="button" className="pvtRowOrder" onClick={() => propUpdater('rowOrder')(sortIcons[rowOrder].next)}>{sortIcons[rowOrder].rowSymbol}</a>
                  <a role="button" className="pvtColOrder" onClick={() => propUpdater('colOrder')(sortIcons[colOrder].next)}>{sortIcons[colOrder].colSymbol}</a>
                  {numValsAllowed > 0 && <br />}
                  {new Array(numValsAllowed).fill(null).map((_, i) => [
                    <Dropdown key={i} current={vals[i]} values={Object.keys(state.attrValues).filter(e => !hiddenAttributes.includes(e) && !hiddenFromAggregators.includes(e))} open={isOpen(`val${i}`)} zIndex={isOpen(`val${i}`) ? state.maxZIndex + 1 : 1} toggle={() => setState(s => ({ ...s, openDropdown: isOpen(`val${i}`) ? false : `val${i}` }))} setValue={value => sendPropUpdate({ vals: { $splice: [[i, 1, value]] } })} />,
                    i + 1 !== numValsAllowed ? <br key={`br${i}`} /> : null,
                  ])}
                </td>
                <DnDCell id="cols" items={colAttrs} classes="pvtAxisContainer pvtHorizList pvtCols" isHorizontal={true} {...sharedCellProps} />
              </tr>
              <tr>
                <DnDCell id="rows" items={rowAttrs} classes="pvtAxisContainer pvtVertList pvtRows" isHorizontal={false} {...sharedCellProps} />
                <td className="pvtOutput">
                  <PivotTable {...update(props, { data: { $set: state.materializedInput } })} />
                  {pagination && renderFooter()}
                </td>
              </tr>
            </>
          ) : (
            <>
              <tr>
                <td className="pvtRenderers">
                  <Dropdown current={actualRendererName} values={Object.keys(renderers)} open={isOpen('renderer')} zIndex={isOpen('renderer') ? state.maxZIndex + 1 : 1} toggle={() => setState(s => ({ ...s, openDropdown: isOpen('renderer') ? false : 'renderer' }))} setValue={propUpdater('rendererName')} />
                </td>
                <td className="pvtVals">
                  <Dropdown current={aggregatorName} values={Object.keys(aggregators)} open={isOpen('aggregators')} zIndex={isOpen('aggregators') ? state.maxZIndex + 1 : 1} toggle={() => setState(s => ({ ...s, openDropdown: isOpen('aggregators') ? false : 'aggregators' }))} setValue={propUpdater('aggregatorName')} />
                  <a role="button" className="pvtRowOrder" onClick={() => propUpdater('rowOrder')(sortIcons[rowOrder].next)}>{sortIcons[rowOrder].rowSymbol}</a>
                  <a role="button" className="pvtColOrder" onClick={() => propUpdater('colOrder')(sortIcons[colOrder].next)}>{sortIcons[colOrder].colSymbol}</a>
                  {numValsAllowed > 0 && <br />}
                  {new Array(numValsAllowed).fill(null).map((_, i) => [
                    <Dropdown key={i} current={vals[i]} values={Object.keys(state.attrValues).filter(e => !hiddenAttributes.includes(e) && !hiddenFromAggregators.includes(e))} open={isOpen(`val${i}`)} zIndex={isOpen(`val${i}`) ? state.maxZIndex + 1 : 1} toggle={() => setState(s => ({ ...s, openDropdown: isOpen(`val${i}`) ? false : `val${i}` }))} setValue={value => sendPropUpdate({ vals: { $splice: [[i, 1, value]] } })} />,
                    i + 1 !== numValsAllowed ? <br key={`br${i}`} /> : null,
                  ])}
                </td>
                <DnDCell id="cols" items={colAttrs} classes="pvtAxisContainer pvtHorizList pvtCols" isHorizontal={true} {...sharedCellProps} />
              </tr>
              <tr>
                <DnDCell id="unused" items={unusedAttrs} classes={`pvtAxisContainer pvtUnused pvtVertList`} isHorizontal={false} {...sharedCellProps} />
                <DnDCell id="rows" items={rowAttrs} classes="pvtAxisContainer pvtVertList pvtRows" isHorizontal={false} {...sharedCellProps} />
                <td className="pvtOutput">
                  <PivotTable {...update(props, { data: { $set: state.materializedInput } })} />
                  {pagination && renderFooter()}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      <DragOverlay>{activeId ? <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}><li><span className="pvtAttr">{activeId}</span></li></ul> : null}</DragOverlay>
    </DndContext>
  );
};

PivotTableUI.propTypes = Object.assign({}, PivotData.propTypes, {
  onChange: PropTypes.func.isRequired,
  hiddenAttributes: PropTypes.arrayOf(PropTypes.string),
  hiddenFromAggregators: PropTypes.arrayOf(PropTypes.string),
  hiddenFromDragDrop: PropTypes.arrayOf(PropTypes.string),
  unusedOrientationCutoff: PropTypes.number,
  menuLimit: PropTypes.number,
  rendererName: PropTypes.string,
  renderers: PropTypes.objectOf(PropTypes.func),
});

PivotTableUI.defaultProps = Object.assign({}, PivotData.defaultProps, {
  onChange: () => {},
  hiddenAttributes: [],
  hiddenFromAggregators: [],
  hiddenFromDragDrop: [],
  unusedOrientationCutoff: 85,
  menuLimit: 500,
  rendererName: 'Table',
  renderers: TableRenderers,
});

export default PivotTableUI;
