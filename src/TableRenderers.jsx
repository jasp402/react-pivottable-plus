import React from 'react';
import PropTypes from 'prop-types';
import { PivotData } from './Utilities';
import { CellPipeline } from './core/CellPipeline';
import { VirtualScroller } from './core/VirtualScroller';
import { useColumnResize } from './hooks/useColumnResize';

// helper function for setting row/col-span in pivotTableRenderer
const spanSize = function (arr, i, j, no_loop = false) {
  let x;
  if (i !== 0) {
    let asc, end;
    let noDraw = true;
    for (
      x = 0, end = j, asc = end >= 0;
      asc ? x <= end : x >= end;
      asc ? x++ : x--
    ) {
      if (arr[i - 1][x] !== arr[i][x]) {
        noDraw = false;
      }
    }
    if (noDraw) {
      return -1;
    }
  }
  let len = 0;
  while (i + len < arr.length) {
    let asc1, end1;
    let stop = false;
    for (
      x = no_loop ? j : 0, end1 = j, asc1 = end1 >= 0;
      asc1 ? x <= end1 : x >= end1;
      asc1 ? x++ : x--
    ) {
      if (arr[i][x] !== arr[i + len][x]) {
        stop = true;
      }
    }
    if (stop) {
      break;
    }
    len++;
  }
  return len;
};

function redColorScaleGenerator(values) {
  const min = Math.min.apply(Math, values);
  const max = Math.max.apply(Math, values);
  return x => {
    // eslint-disable-next-line no-magic-numbers
    const nonRed = 255 - Math.round((255 * (x - min)) / (max - min));
    return { backgroundColor: `rgb(255,${nonRed},${nonRed})` };
  };
}

const flatKey = arr => arr.join(String.fromCharCode(0));
const has = (set, arr) => arr.every(set.has, set);
const add = (set, arr) => (arr.forEach(set.add, set) || set);
const remove = (set, arr) => (arr.forEach(set.delete, set) || set);
const toggle = (set, arr) => (has(set, arr) ? remove : add)(set, arr);

function makeRenderer(opts = {}) {
  // ─── Inner class (toda la lógica de render) ──────────────────────
  class TableRendererInner extends React.PureComponent {
    render() {
      const pivotData = new PivotData(this.props);
      const id = pivotData.props.id;
      const colAttrs = pivotData.props.cols;
      const rowAttrs = pivotData.props.rows;
      let rowKeys = pivotData.getRowKeys(true);
      let colKeys = pivotData.getColKeys(true);
      const grandTotalAggregator = pivotData.getAggregator([], []);

      // ─── Cell Pipeline ────────────────────────────────────────────────
      const pipeline = this.props.cellPipeline
        ? new CellPipeline(this.props.cellPipeline)
        : CellPipeline.default();

      // ─── Virtualización ───────────────────────────────────────────────
      const virtConfig = this.props.virtualization || {};
      const scroller = new VirtualScroller({
        enabled: virtConfig.enabled !== undefined ? virtConfig.enabled : false,
        rowHeight: virtConfig.rowHeight || 32,
        colWidth: virtConfig.colWidth || 100,
        overscanRows: virtConfig.overscanRows || 5,
        overscanCols: virtConfig.overscanCols || 3,
        containerHeight: virtConfig.containerHeight || 400,
        containerWidth: virtConfig.containerWidth || 800,
        threshold: virtConfig.threshold || 100,
      });

      const grouping = pivotData.props.grouping;
      const compactRows = grouping && this.props.compactRows;
      // speacial case for spanSize counting (no_loop)
      const specialCase = grouping && !this.props.rowGroupBefore;
      const folded = (this.state || {}).folded || new Set();
      const isFolded = keys => has(folded, keys.map(flatKey));
      const fold = keys => this.setState({ folded: toggle(new Set(folded), keys.map(flatKey)) });

      if (grouping) {
        for (const key of folded) {
          colKeys = colKeys.filter(colKey => !flatKey(colKey).startsWith(key + String.fromCharCode(0)));
          rowKeys = rowKeys.filter(rowKey => !flatKey(rowKey).startsWith(key + String.fromCharCode(0)));
        }
      }

      // Guardar todos los colKeys para totales (SIEMPRE calcula sobre todo)
      const allColKeys = colKeys;
      const allRowKeys = rowKeys;

      const totalRows = rowKeys.length;
      let startOffset = 0;
      if (this.props.pagination) {
        const start = (this.props.page - 1) * this.props.pageSize;
        startOffset = start;
        const end = start + this.props.pageSize;
        rowKeys = rowKeys.slice(start, end);
      }

      // Aplicar virtualización bidireccional
      const shouldVirt = scroller.shouldVirtualize(rowKeys.length, colKeys.length);
      const scrollTop = (this.state || {}).scrollTop || 0;
      const scrollLeft = (this.state || {}).scrollLeft || 0;

      let visibleRowKeys = rowKeys;
      let rowTopPad = 0;
      let rowBottomPad = 0;
      let virtualRowStartOffset = 0;

      if (shouldVirt.rows) {
        const rowRange = scroller.getVisibleRowRange(scrollTop, rowKeys.length);
        visibleRowKeys = rowKeys.slice(rowRange.startIndex, rowRange.endIndex + 1);
        rowTopPad = rowRange.topPadding;
        rowBottomPad = rowRange.bottomPadding;
        virtualRowStartOffset = rowRange.startIndex;
      }

      let visibleColKeys = colKeys;
      let colLeftPad = 0;
      let colRightPad = 0;

      if (shouldVirt.cols) {
        const colRange = scroller.getVisibleColRange(scrollLeft, colKeys.length);
        visibleColKeys = colKeys.slice(colRange.startIndex, colRange.endIndex + 1);
        colLeftPad = colRange.leftPadding;
        colRightPad = colRange.rightPadding;
      }

      const showRowNumbers = this.props.showRowNumbers !== false;
      const isVirtualized = shouldVirt.rows || shouldVirt.cols;

      let valueCellColors = () => { };
      let rowTotalColors = () => { };
      let colTotalColors = () => { };
      if (opts.heatmapMode) {
        const colorScaleGenerator = this.props.tableColorScaleGenerator;
        const rowTotalValues = colKeys.map(x =>
          pivotData.getAggregator([], x).value()
        );
        rowTotalColors = colorScaleGenerator(rowTotalValues);
        const colTotalValues = rowKeys.map(x =>
          pivotData.getAggregator(x, []).value()
        );
        colTotalColors = colorScaleGenerator(colTotalValues);

        if (opts.heatmapMode === 'full') {
          const allValues = [];
          rowKeys.map(r =>
            colKeys.map(c =>
              allValues.push(pivotData.getAggregator(r, c).value())
            )
          );
          const colorScale = colorScaleGenerator(allValues);
          valueCellColors = (r, c, v) => colorScale(v);
        } else if (opts.heatmapMode === 'row') {
          const rowColorScales = {};
          rowKeys.map(r => {
            const rowValues = colKeys.map(x =>
              pivotData.getAggregator(r, x).value()
            );
            rowColorScales[r] = colorScaleGenerator(rowValues);
          });
          valueCellColors = (r, c, v) => rowColorScales[r](v);
        } else if (opts.heatmapMode === 'col') {
          const colColorScales = {};
          colKeys.map(c => {
            const colValues = rowKeys.map(x =>
              pivotData.getAggregator(x, c).value()
            );
            colColorScales[c] = colorScaleGenerator(colValues);
          });
          valueCellColors = (r, c, v) => colColorScales[c](v);
        }
      }

      const getClickHandler =
        this.props.tableOptions && this.props.tableOptions.clickCallback
          ? (value, rowValues, colValues) => {
            const filters = {};
            for (const i of Object.keys(colAttrs || {})) {
              const attr = colAttrs[i];
              if (colValues[i] !== null) {
                filters[attr] = colValues[i];
              }
            }
            for (const i of Object.keys(rowAttrs || {})) {
              const attr = rowAttrs[i];
              if (rowValues[i] !== null) {
                filters[attr] = rowValues[i];
              }
            }
            return e =>
              this.props.tableOptions.clickCallback(
                e,
                value,
                filters,
                pivotData
              );
          }
          : null;

      const rbClass = grouping ? this.props.rowGroupBefore ? "rowGroupBefore" : "rowGroupAfter" : "";
      const cbClass = grouping ? this.props.colGroupBefore ? "colGroupBefore" : "colGroupAfter" : "";
      const clickClass = (pred, closed) => pred ? " pvtClickable" + (closed ? " closed" : "") : "";
      // ─── Render de la tabla ────────────────────────────────────────────
      const handleScroll = isVirtualized ? (e) => {
        this.setState({
          scrollTop: e.currentTarget.scrollTop,
          scrollLeft: e.currentTarget.scrollLeft,
        });
      } : null;

      // ─── Column widths (resize) ────────────────────────────────
      const resizeWidths = this.props._resizeWidths || {};
      const onStartResize = this.props._onStartResize || null;

      // Construir colgroup con anchos de todas las columnas de datos
      const buildColgroup = () => {
        const cols = [];
        // Col para row numbers
        if (showRowNumbers) cols.push(<col key="col-rownum" style={{ width: '40px', minWidth: '40px' }} />);
        // Cols para rowAttrs
        rowAttrs.forEach((_, i) => cols.push(<col key={`col-rowattr-${i}`} />));
        // Col padding virtual izquierdo
        if (shouldVirt.cols && colLeftPad > 0) cols.push(<col key="col-virt-left" style={{ width: colLeftPad }} />);
        // Cols para cada columna de datos
        visibleColKeys.forEach((colKey) => {
          const label = colKey.join('\u0000');
          const w = resizeWidths[label];
          cols.push(<col key={`col-data-${label}`} style={w ? { width: w, minWidth: w } : undefined} />);
        });
        // Col padding virtual derecho
        if (shouldVirt.cols && colRightPad > 0) cols.push(<col key="col-virt-right" style={{ width: colRightPad }} />);
        // Col para totales
        cols.push(<col key="col-totals" />);
        return <colgroup>{cols}</colgroup>;
      };

      const tableContent = (
        <table id={id} className={`pvtTable ${rbClass} ${cbClass}${onStartResize ? ' pvtResizable' : ''}`}>
          {buildColgroup()}
          <thead>
            {colAttrs.map(function (c, j) {
              const clickable = grouping && colAttrs.length > j + 1;
              const levelKeys = allColKeys.filter(x => x.length === j + 1);
              return (
                <tr key={`colAttr${j}`}>
                  {showRowNumbers && j === 0 && (
                    <th className="pvtRowNumber pvtAxisLabel" rowSpan={colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)}>#</th>
                  )}
                  {j === 0 && rowAttrs.length !== 0 && (
                    <th colSpan={rowAttrs.length} rowSpan={colAttrs.length} />
                  )}
                  <th className={"pvtAxisLabel" + clickClass(clickable, isFolded(levelKeys))}
                    onClick={clickable ? _ => fold(levelKeys) : null}
                  >{c}</th>
                  {shouldVirt.cols && colLeftPad > 0 && j === 0 && (
                    <th key="col-pad-left" style={{ minWidth: colLeftPad }} />
                  )}
                  {visibleColKeys.map(function (colKey, i) {
                    const x = spanSize(visibleColKeys, i, j);
                    if (x === -1) {
                      return null;
                    }
                    // Usar el colKey completo como clave de resize solo en la última fila de headers
                    const isLastHeaderRow = j === colAttrs.length - 1;
                    const colLabel = colKey.join('\u0000');
                    return (
                      <th
                        className={"pvtColLabel" + clickClass(clickable && colKey[j], isFolded([colKey.slice(0, j + 1)]))}
                        key={`colKey-${i}-${j}-${colKey[j]}`}
                        colSpan={x}
                        rowSpan={
                          isLastHeaderRow && rowAttrs.length !== 0
                            ? 2
                            : 1
                        }
                        onClick={clickable && colKey[j] ? _ => fold([colKey.slice(0, j + 1)]) : null}
                      >
                        {colKey[j]}
                        {onStartResize && isLastHeaderRow && (
                          <span
                            className="pvtResizeHandle"
                            onPointerDown={e => onStartResize(colLabel, e)}
                          />
                        )}
                      </th>
                    );
                  })}
                  {shouldVirt.cols && colRightPad > 0 && j === 0 && (
                    <th key="col-pad-right" style={{ minWidth: colRightPad }} />
                  )}

                  {j === 0 && (
                    <th
                      className="pvtTotalLabel"
                      rowSpan={
                        colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)
                      }
                    >
                      Totals
                    </th>
                  )}
                </tr>
              );
            })}

            {rowAttrs.length !== 0 && (
              <tr>
                {showRowNumbers && colAttrs.length === 0 && (
                  <th className="pvtRowNumber pvtAxisLabel" rowSpan="1">#</th>
                )}
                {rowAttrs.map(function (r, i) {
                  const clickable = grouping && rowAttrs.length > i + 1;
                  const levelKeys = allRowKeys.filter(x => x.length === i + 1);
                  return (
                    <th className={"pvtAxisLabel" + clickClass(clickable, isFolded(levelKeys))}
                      onClick={clickable ? _ => fold(levelKeys) : null}
                      key={`rowAttr${i}`}>
                      {r}
                    </th>
                  );
                })}
                <th className="pvtTotalLabel">
                  {colAttrs.length === 0 ? 'Totals' : null}
                </th>
              </tr>
            )}
          </thead>

          <tbody>
            {/* Spacer top para virtualización de filas */}
            {shouldVirt.rows && rowTopPad > 0 && (
              <tr key="virt-top-spacer" style={{ height: rowTopPad }}>
                <td colSpan={999} />
              </tr>
            )}

            {visibleRowKeys.map(function (rowKey, localI) {
              const globalI = shouldVirt.rows ? virtualRowStartOffset + localI : localI;
              const totalAggregator = pivotData.getAggregator(rowKey, []);
              const rowGap = rowAttrs.length - rowKey.length;
              const rowTotalResult = pipeline.processTotal({ aggregator: totalAggregator, rowKey, type: 'row' });
              return (
                <tr key={`rowKeyRow${globalI}`}
                  className={(rowGap ? "pvtLevel" + rowGap : "pvtData") + " pvtRow-data"}
                  style={shouldVirt.rows ? { height: scroller.rowHeight } : undefined}>
                  {showRowNumbers && (
                    <th className="pvtRowNumber">{startOffset + globalI + 1}</th>
                  )}
                  {rowKey.map(function (txt, j) {
                    if (compactRows && j < rowKey.length - 1) {
                      return null;
                    }
                    const clickable = grouping && rowAttrs.length > j + 1;
                    const x = compactRows ? 1 : spanSize(visibleRowKeys, localI, j, specialCase);
                    if (x === -1) {
                      return null;
                    }
                    return (
                      <th
                        key={`rowKeyLabel-${globalI}-${j}-${txt}`}
                        className={"pvtRowLabel" + clickClass(clickable && rowKey[j], isFolded([rowKey.slice(0, j + 1)]))}
                        rowSpan={x}
                        colSpan={
                          compactRows ?
                            rowAttrs.length + 1 :
                            j === rowAttrs.length - 1 && colAttrs.length !== 0
                              ? 2
                              : 1
                        }
                        style={{ paddingLeft: compactRows ? `calc(var(--pvt-row-padding, 5px) + ${j} * var(--pvt-row-indent, 20px))` : null }}
                        onClick={clickable && rowKey[j] ? _ => fold([rowKey.slice(0, j + 1)]) : null}
                      >
                        {txt}
                      </th>
                    );
                  })}
                  {!compactRows && rowGap
                    ? <th className="pvtRowLabel" colSpan={rowGap + 1}>{"Total (" + rowKey[rowKey.length - 1] + ")"}</th>
                    : null
                  }
                  {/* Spacer left para virtualización de columnas */}
                  {shouldVirt.cols && colLeftPad > 0 && (
                    <td key="col-pad-left" style={{ minWidth: colLeftPad }} />
                  )}
                  {visibleColKeys.map(function (colKey, j) {
                    const aggregator = pivotData.getAggregator(rowKey, colKey);
                    const colGap = colAttrs.length - colKey.length;
                    const cellResult = pipeline.process({ aggregator, rowKey, colKey, pivotData });
                    const isNumeric = typeof cellResult.value === 'number';
                    const mergedStyle = {
                      ...valueCellColors(rowKey, colKey, cellResult.value),
                      ...(cellResult.style || {}),
                    };
                    return (
                      <td
                        className={"pvtVal" + (colGap ? " pvtLevel" + colGap : "") + (isNumeric ? " pvtVal-numeric" : "") + (cellResult.className ? " " + cellResult.className : "")}
                        key={`pvtVal${globalI}-${j}`}
                        onClick={
                          getClickHandler &&
                          getClickHandler(cellResult.value, rowKey, colKey)
                        }
                        style={Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined}
                      >
                        {cellResult.rendered}
                      </td>
                    );
                  })}
                  {/* Spacer right para virtualización de columnas */}
                  {shouldVirt.cols && colRightPad > 0 && (
                    <td key="col-pad-right" style={{ minWidth: colRightPad }} />
                  )}
                  <td
                    className={"pvtTotal" + (typeof rowTotalResult.value === 'number' ? " pvtVal-numeric" : "")}
                    onClick={
                      getClickHandler &&
                      getClickHandler(rowTotalResult.value, rowKey, [null])
                    }
                    style={colTotalColors(rowTotalResult.value) || rowTotalResult.style}
                  >
                    {rowTotalResult.rendered}
                  </td>
                </tr>
              );
            })}

            {/* Spacer bottom para virtualización de filas */}
            {shouldVirt.rows && rowBottomPad > 0 && (
              <tr key="virt-bottom-spacer" style={{ height: rowBottomPad }}>
                <td colSpan={999} />
              </tr>
            )}

            {showRowNumbers && this.props.pagination && visibleRowKeys.length < this.props.pageSize && !shouldVirt.rows && (
              Array.from({ length: this.props.pageSize - visibleRowKeys.length }).map((_, padIdx) => (
                <tr key={`padRow${padIdx}`} className="pvtRow-data pvtEmptyRow">
                  <th className="pvtRowNumber">{startOffset + visibleRowKeys.length + padIdx + 1}</th>
                  <th className="pvtRowLabel" colSpan={rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)}></th>
                  {visibleColKeys.map((colKey, j) => <td key={`padVal${padIdx}-${j}`} className="pvtVal pvtEmptyCell"></td>)}
                  <td className="pvtTotal pvtEmptyCell"></td>
                </tr>
              ))
            )}

            {/* Totals row — siempre calcula sobre TODOS los datos */}
            <tr className="pvtTotalRow">
              {showRowNumbers && <th className="pvtTotalLabel"></th>}
              <th
                className="pvtTotalLabel"
                colSpan={rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)}
              >
                Totals
              </th>

              {shouldVirt.cols && colLeftPad > 0 && (
                <td key="total-col-pad-left" style={{ minWidth: colLeftPad }} />
              )}
              {visibleColKeys.map(function (colKey, i) {
                const totalAggregator = pivotData.getAggregator([], colKey);
                const colGap = colAttrs.length - colKey.length;
                const totalVal = totalAggregator.value();
                const isNumeric = typeof totalVal === 'number';
                return (
                  <td
                    className={"pvtTotal" + (colGap ? " pvtLevel" + colGap : "") + (isNumeric ? " pvtVal-numeric" : "")}
                    key={`total${i}`}
                    onClick={
                      getClickHandler &&
                      getClickHandler(totalVal, [null], colKey)
                    }
                    style={rowTotalColors(totalVal)}
                  >
                    {totalAggregator.format(totalVal)}
                  </td>
                );
              })}
              {shouldVirt.cols && colRightPad > 0 && (
                <td key="total-col-pad-right" style={{ minWidth: colRightPad }} />
              )}

              <td
                onClick={
                  getClickHandler &&
                  getClickHandler(grandTotalAggregator.value(), [null], [null])
                }
                className={"pvtGrandTotal" + (typeof grandTotalAggregator.value() === 'number' ? " pvtVal-numeric" : "")}
              >
                {grandTotalAggregator.format(grandTotalAggregator.value())}
              </td>
            </tr>
          </tbody>
        </table>
      );

      // Wrappear en container con scroll si virtualización está activa
      if (isVirtualized) {
        return (
          <div
            className="pvtVirtualContainer"
            style={{
              maxHeight: scroller.containerHeight,
              maxWidth: scroller.containerWidth,
              overflow: 'auto',
              position: 'relative',
            }}
            onScroll={handleScroll}
          >
            {tableContent}
          </div>
        );
      }

      return tableContent;
    }
  }

  TableRendererInner.defaultProps = PivotData.defaultProps;
  TableRendererInner.propTypes = PivotData.propTypes;
  TableRendererInner.defaultProps.tableColorScaleGenerator = redColorScaleGenerator;
  TableRendererInner.defaultProps.tableOptions = {};
  TableRendererInner.propTypes.tableColorScaleGenerator = PropTypes.func;
  TableRendererInner.propTypes.tableOptions = PropTypes.object;
  TableRendererInner.defaultProps.compactRows = true;
  TableRendererInner.propTypes.compactRows = PropTypes.bool;
  TableRendererInner.defaultProps.showRowNumbers = true;
  TableRendererInner.propTypes.showRowNumbers = PropTypes.bool;
  // Resize props (pasadas internamente desde el wrapper)
  TableRendererInner.propTypes._resizeWidths = PropTypes.object;
  TableRendererInner.propTypes._onStartResize = PropTypes.func;

  // ─── Wrapper funcional para poder usar hooks ─────────────────────
  function TableRenderer(props) {
    const resizing = props.columnResizing === true;
    const { widths, startResize } = useColumnResize({
      initialWidths: props.columnWidths || {},
      minWidth: 50,
      onWidthChange: props.onColumnWidthChange,
    });
    return (
      <TableRendererInner
        {...props}
        _resizeWidths={resizing ? widths : {}}
        _onStartResize={resizing ? startResize : null}
      />
    );
  }

  TableRenderer.defaultProps = { ...TableRendererInner.defaultProps, columnResizing: false, columnWidths: {} };
  TableRenderer.propTypes = {
    ...TableRendererInner.propTypes,
    columnResizing: PropTypes.bool,
    columnWidths: PropTypes.object,
    onColumnWidthChange: PropTypes.func,
  };

  return TableRenderer;
}

class TSVExportRenderer extends React.PureComponent {
  render() {
    const pivotData = new PivotData(this.props);
    const rowKeys = pivotData.getRowKeys();
    const colKeys = pivotData.getColKeys();
    if (rowKeys.length === 0) {
      rowKeys.push([]);
    }
    if (colKeys.length === 0) {
      colKeys.push([]);
    }

    const headerRow = pivotData.props.rows.map(r => r);
    if (colKeys.length === 1 && colKeys[0].length === 0) {
      headerRow.push(this.props.aggregatorName);
    } else {
      colKeys.map(c => headerRow.push(c.join('-')));
    }

    const result = rowKeys.map(r => {
      const row = r.map(x => x);
      colKeys.map(c => {
        const v = pivotData.getAggregator(r, c).value();
        row.push(v ? v : '');
      });
      return row;
    });

    result.unshift(headerRow);

    return (
      <textarea
        value={result.map(r => r.join('\t')).join('\n')}
        style={{ width: window.innerWidth / 2, height: window.innerHeight / 2 }}
        readOnly={true}
      />
    );
  }
}

TSVExportRenderer.defaultProps = PivotData.defaultProps;
TSVExportRenderer.propTypes = PivotData.propTypes;

export default {
  Table: makeRenderer(),
  'Table Heatmap': makeRenderer({ heatmapMode: 'full' }),
  'Table Col Heatmap': makeRenderer({ heatmapMode: 'col' }),
  'Table Row Heatmap': makeRenderer({ heatmapMode: 'row' }),
  'Exportable TSV': TSVExportRenderer,
};
