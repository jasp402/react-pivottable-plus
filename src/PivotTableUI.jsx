import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { PivotData, sortAs, getSort, aggregators as defaultAggregators } from './Utilities';
import PivotTable from './PivotTable';
import TableRenderers from './TableRenderers';
import { usePivot } from './hooks/usePivot';
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
  // ─── Headless Core: toda la lógica de datos y props fluye a través del Core ───
  const { props: pivotProps, state: pivotState, actions } = usePivot(props);

  // ─── Estado local solo para UI (no pertenece al Core) ─────────────────────────
  const [uiState, setUiState] = useState({
    zIndices: {},
    maxZIndex: 1000,
    openDropdown: false,
  });
  const [activeId, setActiveId] = useState(null);

  // ─── Helpers de UI local ──────────────────────────────────────────────────────
  const moveFilterBoxToTop = useCallback(attribute => {
    setUiState(s => ({
      ...s,
      maxZIndex: s.maxZIndex + 1,
      zIndices: { ...s.zIndices, [attribute]: s.maxZIndex + 1 },
    }));
  }, []);

  // ─── Derivados desde el Core ──────────────────────────────────────────────────
  const {
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
    size = 'lg',
  } = pivotProps;

  const unusedAttrs = Object.keys(pivotState.attrValues)
    .filter(e => e && e.trim() !== '' && !rows.includes(e) && !cols.includes(e) && !hiddenAttributes.includes(e) && !hiddenFromDragDrop.includes(e))
    .sort(sortAs(pivotState.unusedOrder || []));

  const unusedLength = unusedAttrs.reduce((r, e) => r + e.length, 0);
  const horizUnused = unusedLength < unusedOrientationCutoff;

  const colAttrs = cols.filter(e => e && e.trim() !== '' && !hiddenAttributes.includes(e) && !hiddenFromDragDrop.includes(e));
  const rowAttrs = rows.filter(e => e && e.trim() !== '' && !hiddenAttributes.includes(e) && !hiddenFromDragDrop.includes(e));

  // ─── DnD Zones ────────────────────────────────────────────────────────────────
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
    if (zone === 'rows') return value => actions.updateProp('rows', value);
    if (zone === 'cols') return value => actions.updateProp('cols', value);
    if (zone === 'unused') return order => actions.setUnusedOrder(order);
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

  // ─── Dropdowns y controles ────────────────────────────────────────────────────
  const isOpen = dropdown => uiState.openDropdown === dropdown;
  const numValsAllowed = (aggregators[aggregatorName]?.([])?.()?.numInputs) || 0;
  const actualRendererName = (rendererName in renderers) ? rendererName : Object.keys(renderers)[0];

  const sortIcons = {
    key_a_to_z: { rowSymbol: '↕', colSymbol: '↔', next: 'value_a_to_z' },
    value_a_to_z: { rowSymbol: '↓', colSymbol: '→', next: 'value_z_to_a' },
    value_z_to_a: { rowSymbol: '↑', colSymbol: '←', next: 'key_a_to_z' },
  };

  // Estado combinado para DnDCell (necesita zIndices del UI local + attrValues del Core)
  const combinedState = {
    attrValues: pivotState.attrValues,
    zIndices: uiState.zIndices,
    maxZIndex: uiState.maxZIndex,
  };

  const sharedCellProps = {
    state: combinedState,
    valueFilter,
    sorters,
    menuLimit,
    setValuesInFilter: actions.setValuesInFilter,
    addValuesToFilter: actions.addValuesToFilter,
    moveFilterBoxToTop,
    removeValuesFromFilter: actions.removeValuesFromFilter,
  };

  const componentProps = {
    data: pivotState.materializedInput,
    rows,
    cols,
    vals,
    aggregatorName,
    aggregators,
    rendererName,
    renderers,
    valueFilter,
    sorters,
    menuLimit,
    unusedOrientationCutoff,
    hiddenAttributes,
    hiddenFromAggregators,
    hiddenFromDragDrop,
    pagination,
    page,
    pageSize,
    rowOrder,
    colOrder,
    derivedAttributes: pivotProps.derivedAttributes,
    cellPipeline: pivotProps.cellPipeline,
    virtualization: pivotProps.virtualization,
  };

  const renderFooter = () => {
    const pivotData = new PivotData(componentProps);
    const totalPivotRows = pivotData.getRowKeys().length;
    const totalRecords = pivotState.materializedInput.length;
    const totalPages = Math.ceil(totalPivotRows / pageSize);
    return (
      <div className="pvtFooter">
        <div className="pvtFooterInfo">Total registros: {totalRecords} | Filas: {totalPivotRows}</div>
        <div className="pvtFooterPagination">
          <button className="pvtButton" disabled={page <= 1} onClick={() => actions.updateProp('page', 1)}>«</button>
          <button className="pvtButton" disabled={page <= 1} onClick={() => actions.updateProp('page', page - 1)}>‹</button>
          <span>Página <input type="number" className="pvtPageInput" value={page} min={1} max={totalPages} onChange={e => {
            const val = parseInt(e.target.value, 10);
            if (val > 0 && val <= totalPages) actions.updateProp('page', val);
          }} /> de {totalPages}</span>
          <button className="pvtButton" disabled={page >= totalPages} onClick={() => actions.updateProp('page', page + 1)}>›</button>
          <button className="pvtButton" disabled={page >= totalPages} onClick={() => actions.updateProp('page', totalPages)}>»</button>
          <select className="pvtPageSize" value={pageSize} onChange={e => {
            actions.updateProp('pageSize', parseInt(e.target.value, 10));
            actions.updateProp('page', 1);
          }}>{[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / pág</option>)}</select>
        </div>
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <table className={`pvtUi pvt-theme-${props.theme || 'default'} pvt-size-${size || 'lg'}`}>
        <tbody onClick={() => setUiState(s => ({ ...s, openDropdown: false }))}>
          {horizUnused ? (
            <>
              <tr>
                <td className="pvtRenderers">
                  <Dropdown current={actualRendererName} values={Object.keys(renderers)} open={isOpen('renderer')} zIndex={isOpen('renderer') ? uiState.maxZIndex + 1 : 1} toggle={() => setUiState(s => ({ ...s, openDropdown: isOpen('renderer') ? false : 'renderer' }))} setValue={v => actions.updateProp('rendererName', v)} />
                </td>
                <DnDCell id="unused" items={unusedAttrs} classes={`pvtAxisContainer pvtUnused pvtHorizList`} isHorizontal={true} {...sharedCellProps} />
              </tr>
              <tr>
                <td className="pvtVals">
                  <Dropdown current={aggregatorName} values={Object.keys(aggregators)} open={isOpen('aggregators')} zIndex={isOpen('aggregators') ? uiState.maxZIndex + 1 : 1} toggle={() => setUiState(s => ({ ...s, openDropdown: isOpen('aggregators') ? false : 'aggregators' }))} setValue={v => actions.updateProp('aggregatorName', v)} />
                  <a role="button" className="pvtRowOrder" onClick={() => actions.updateProp('rowOrder', sortIcons[rowOrder].next)}>{sortIcons[rowOrder].rowSymbol}</a>
                  <a role="button" className="pvtColOrder" onClick={() => actions.updateProp('colOrder', sortIcons[colOrder].next)}>{sortIcons[colOrder].colSymbol}</a>
                  {numValsAllowed > 0 && <br />}
                  {new Array(numValsAllowed).fill(null).map((_, i) => [
                    <Dropdown key={i} current={vals[i]} values={Object.keys(pivotState.attrValues).filter(e => !hiddenAttributes.includes(e) && !hiddenFromAggregators.includes(e))} open={isOpen(`val${i}`)} zIndex={isOpen(`val${i}`) ? uiState.maxZIndex + 1 : 1} toggle={() => setUiState(s => ({ ...s, openDropdown: isOpen(`val${i}`) ? false : `val${i}` }))} setValue={value => { const newVals = [...vals]; newVals[i] = value; actions.updateProp('vals', newVals); }} />,
                    i + 1 !== numValsAllowed ? <br key={`br${i}`} /> : null,
                  ])}
                </td>
                <DnDCell id="cols" items={colAttrs} classes="pvtAxisContainer pvtHorizList pvtCols" isHorizontal={true} {...sharedCellProps} />
              </tr>
              <tr>
                <DnDCell id="rows" items={rowAttrs} classes="pvtAxisContainer pvtVertList pvtRows" isHorizontal={false} {...sharedCellProps} />
                <td className="pvtOutput">
                  <PivotTable {...componentProps} />
                  {pagination && renderFooter()}
                </td>
              </tr>
            </>
          ) : (
            <>
              <tr>
                <td className="pvtRenderers">
                  <Dropdown current={actualRendererName} values={Object.keys(renderers)} open={isOpen('renderer')} zIndex={isOpen('renderer') ? uiState.maxZIndex + 1 : 1} toggle={() => setUiState(s => ({ ...s, openDropdown: isOpen('renderer') ? false : 'renderer' }))} setValue={v => actions.updateProp('rendererName', v)} />
                </td>
                <td className="pvtVals">
                  <Dropdown current={aggregatorName} values={Object.keys(aggregators)} open={isOpen('aggregators')} zIndex={isOpen('aggregators') ? uiState.maxZIndex + 1 : 1} toggle={() => setUiState(s => ({ ...s, openDropdown: isOpen('aggregators') ? false : 'aggregators' }))} setValue={v => actions.updateProp('aggregatorName', v)} />
                  <a role="button" className="pvtRowOrder" onClick={() => actions.updateProp('rowOrder', sortIcons[rowOrder].next)}>{sortIcons[rowOrder].rowSymbol}</a>
                  <a role="button" className="pvtColOrder" onClick={() => actions.updateProp('colOrder', sortIcons[colOrder].next)}>{sortIcons[colOrder].colSymbol}</a>
                  {numValsAllowed > 0 && <br />}
                  {new Array(numValsAllowed).fill(null).map((_, i) => [
                    <Dropdown key={i} current={vals[i]} values={Object.keys(pivotState.attrValues).filter(e => !hiddenAttributes.includes(e) && !hiddenFromAggregators.includes(e))} open={isOpen(`val${i}`)} zIndex={isOpen(`val${i}`) ? uiState.maxZIndex + 1 : 1} toggle={() => setUiState(s => ({ ...s, openDropdown: isOpen(`val${i}`) ? false : `val${i}` }))} setValue={value => { const newVals = [...vals]; newVals[i] = value; actions.updateProp('vals', newVals); }} />,
                    i + 1 !== numValsAllowed ? <br key={`br${i}`} /> : null,
                  ])}
                </td>
                <DnDCell id="cols" items={colAttrs} classes="pvtAxisContainer pvtHorizList pvtCols" isHorizontal={true} {...sharedCellProps} />
              </tr>
              <tr>
                <DnDCell id="unused" items={unusedAttrs} classes={`pvtAxisContainer pvtUnused pvtVertList`} isHorizontal={false} {...sharedCellProps} />
                <DnDCell id="rows" items={rowAttrs} classes="pvtAxisContainer pvtVertList pvtRows" isHorizontal={false} {...sharedCellProps} />
                <td className="pvtOutput">
                  <PivotTable {...componentProps} />
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
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
});

PivotTableUI.defaultProps = Object.assign({}, PivotData.defaultProps, {
  onChange: () => { },
  hiddenAttributes: [],
  hiddenFromAggregators: [],
  hiddenFromDragDrop: [],
  unusedOrientationCutoff: 85,
  menuLimit: 500,
  rendererName: 'Table',
  renderers: TableRenderers,
});

export default PivotTableUI;
