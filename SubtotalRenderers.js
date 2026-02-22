'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Utilities = require('./Utilities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function redColorScaleGenerator(values) {
  var min = Math.min.apply(Math, values);
  var max = Math.max.apply(Math, values);
  return function (x) {
    // eslint-disable-next-line no-magic-numbers
    var nonRed = 255 - Math.round(255 * (x - min) / (max - min));
    return { backgroundColor: 'rgb(255,' + nonRed + ',' + nonRed + ')' };
  };
}

function makeRenderer() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var SubtotalRenderer = function (_React$Component) {
    _inherits(SubtotalRenderer, _React$Component);

    function SubtotalRenderer(props) {
      _classCallCheck(this, SubtotalRenderer);

      var _this = _possibleConstructorReturn(this, (SubtotalRenderer.__proto__ || Object.getPrototypeOf(SubtotalRenderer)).call(this, props));

      _this.state = { collapsedRows: {}, collapsedCols: {} };
      return _this;
    }

    _createClass(SubtotalRenderer, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        if (opts.subtotals && !document.getElementById('react-pivottable-subtotal-styles')) {
          var style = document.createElement('style');
          style.id = 'react-pivottable-subtotal-styles';
          style.innerHTML = '\n          .pvtSubtotal {\n            font-weight: bold;\n            background-color: #f0f0f0;\n          }\n          .pvtSubtotalRow {\n            border-top: 1px solid #ddd;\n          }\n          .pvtSubtotalVal {\n            color: #777;\n            font-style: italic;\n          }\n        ';
          document.head.appendChild(style);
        }
      }
    }, {
      key: 'getBasePivotSettings',
      value: function getBasePivotSettings() {
        var _this2 = this;

        var props = this.props;
        var colAttrs = props.cols;
        var rowAttrs = props.rows;

        var tableOptions = Object.assign({
          rowTotals: true,
          colTotals: true
        }, props.tableOptions);
        var rowTotals = tableOptions.rowTotals || colAttrs.length === 0;
        var colTotals = tableOptions.colTotals || rowAttrs.length === 0;

        var subtotalOptions = Object.assign({
          arrowCollapsed: '\u25B6',
          arrowExpanded: '\u25E2'
        }, props.subtotalOptions);

        var colSubtotalDisplay = Object.assign({
          displayOnTop: false,
          enabled: rowTotals,
          hideOnExpand: false
        }, subtotalOptions.colSubtotalDisplay);

        var rowSubtotalDisplay = Object.assign({
          displayOnTop: true,
          enabled: colTotals,
          hideOnExpand: false
        }, subtotalOptions.rowSubtotalDisplay);

        var pivotData = new _Utilities.PivotData(props, !opts.subtotals ? {} : {
          rowEnabled: rowSubtotalDisplay.enabled,
          colEnabled: colSubtotalDisplay.enabled,
          rowPartialOnTop: rowSubtotalDisplay.displayOnTop,
          colPartialOnTop: colSubtotalDisplay.displayOnTop
        });
        var rowKeys = pivotData.getRowKeys();
        var colKeys = pivotData.getColKeys();

        var cellCallbacks = {};
        var rowTotalCallbacks = {};
        var colTotalCallbacks = {};
        var grandTotalCallback = null;
        if (tableOptions.clickCallback) {
          rowKeys.forEach(function (rowKey) {
            var flatRowKey = (0, _Utilities.flatKey)(rowKey);
            cellCallbacks[flatRowKey] = {};
            colKeys.forEach(function (colKey) {
              var flatColKey = (0, _Utilities.flatKey)(colKey);
              if (!(flatRowKey in cellCallbacks)) {
                cellCallbacks[flatRowKey] = {};
              }
              cellCallbacks[flatRowKey][flatColKey] = _this2.clickHandler(pivotData, rowKey, colKey);
            });
            rowTotalCallbacks[flatRowKey] = _this2.clickHandler(pivotData, rowKey, []);
          });
          colKeys.forEach(function (colKey) {
            var flatColKey = (0, _Utilities.flatKey)(colKey);
            colTotalCallbacks[flatColKey] = _this2.clickHandler(pivotData, [], colKey);
          });
          grandTotalCallback = this.clickHandler(pivotData, [], []);
        }

        return Object.assign({
          pivotData: pivotData,
          colAttrs: colAttrs,
          rowAttrs: rowAttrs,
          colKeys: colKeys,
          rowKeys: rowKeys,
          rowTotals: rowTotals,
          colTotals: colTotals,
          arrowCollapsed: subtotalOptions.arrowCollapsed,
          arrowExpanded: subtotalOptions.arrowExpanded,
          colSubtotalDisplay: colSubtotalDisplay,
          rowSubtotalDisplay: rowSubtotalDisplay,
          cellCallbacks: cellCallbacks,
          rowTotalCallbacks: rowTotalCallbacks,
          colTotalCallbacks: colTotalCallbacks,
          grandTotalCallback: grandTotalCallback
        }, SubtotalRenderer.heatmapMappers(pivotData, props.tableColorScaleGenerator, colTotals, rowTotals));
      }
    }, {
      key: 'clickHandler',
      value: function clickHandler(pivotData, rowValues, colValues) {
        var _this3 = this;

        var colAttrs = this.props.cols;
        var rowAttrs = this.props.rows;
        var value = pivotData.getAggregator(rowValues, colValues).value();
        var filters = {};
        var colLimit = Math.min(colAttrs.length, colValues.length);
        for (var i = 0; i < colLimit; i++) {
          var attr = colAttrs[i];
          if (colValues[i] !== null) {
            filters[attr] = colValues[i];
          }
        }
        var rowLimit = Math.min(rowAttrs.length, rowValues.length);
        for (var _i = 0; _i < rowLimit; _i++) {
          var _attr = rowAttrs[_i];
          if (rowValues[_i] !== null) {
            filters[_attr] = rowValues[_i];
          }
        }
        return function (e) {
          return _this3.props.tableOptions.clickCallback(e, value, filters, pivotData);
        };
      }
    }, {
      key: 'collapseAttr',
      value: function collapseAttr(rowOrCol, attrIdx, allKeys) {
        return function () {
          var flatCollapseKeys = {};
          for (var i = 0; i < allKeys.length; i++) {
            var k = allKeys[i];
            var slicedKey = k.slice(0, attrIdx + 1);
            flatCollapseKeys[(0, _Utilities.flatKey)(slicedKey)] = true;
          }
          this.setState(function (prevState) {
            if (rowOrCol === 'row') {
              return {
                collapsedRows: Object.assign({}, prevState.collapsedRows, flatCollapseKeys)
              };
            } else if (rowOrCol === 'col') {
              return {
                collapsedCols: Object.assign({}, prevState.collapsedCols, flatCollapseKeys)
              };
            }
            return null;
          });
        }.bind(this);
      }
    }, {
      key: 'expandAttr',
      value: function expandAttr(rowOrCol, attrIdx, allKeys) {
        return function () {
          var flatCollapseKeys = {};
          for (var i = 0; i < allKeys.length; i++) {
            var k = allKeys[i];
            var slicedKey = k.slice(0, attrIdx + 1);
            flatCollapseKeys[(0, _Utilities.flatKey)(slicedKey)] = false;
          }
          this.setState(function (prevState) {
            if (rowOrCol === 'row') {
              return {
                collapsedRows: Object.assign({}, prevState.collapsedRows, flatCollapseKeys)
              };
            } else if (rowOrCol === 'col') {
              return {
                collapsedCols: Object.assign({}, prevState.collapsedCols, flatCollapseKeys)
              };
            }
            return null;
          });
        }.bind(this);
      }
    }, {
      key: 'toggleRowKey',
      value: function toggleRowKey(flatRowKey) {
        return function () {
          this.setState(function (prevState) {
            var newCollapsedRows = Object.assign({}, prevState.collapsedRows);
            newCollapsedRows[flatRowKey] = !prevState.collapsedRows[flatRowKey];
            return { collapsedRows: newCollapsedRows };
          });
        }.bind(this);
      }
    }, {
      key: 'toggleColKey',
      value: function toggleColKey(flatColKey) {
        return function () {
          this.setState(function (prevState) {
            var newCollapsedCols = Object.assign({}, prevState.collapsedCols);
            newCollapsedCols[flatColKey] = !prevState.collapsedCols[flatColKey];
            return { collapsedCols: newCollapsedCols };
          });
        }.bind(this);
      }

      // Given an array of attribute values (i.e. each element is another array with
      // the value at every level), compute the spans for every attribute value at
      // each level.

    }, {
      key: 'calcAttrSpans',
      value: function calcAttrSpans(attrArr, numAttrs) {
        var spans = [];
        var li = Array(numAttrs).map(function () {
          return 0;
        });
        var lv = Array(numAttrs).map(function () {
          return null;
        });
        for (var i = 0; i < attrArr.length; i++) {
          var cv = attrArr[i];
          var isSubtotal = cv[cv.length - 1] === '__subtotal__';
          var actualCv = isSubtotal ? cv.slice(0, -1) : cv;

          var ent = [];
          var depth = 0;
          var limit = Math.min(lv.length, actualCv.length);
          while (depth < limit && lv[depth] === actualCv[depth]) {
            ent.push(-1);
            spans[li[depth]][depth]++;
            depth++;
          }
          while (depth < actualCv.length) {
            li[depth] = i;
            ent.push(1);
            depth++;
          }
          spans.push(ent);
          lv = actualCv;
        }
        return spans;
      }
    }, {
      key: 'renderColHeaderRow',
      value: function renderColHeaderRow(attrName, attrIdx, pivotSettings) {
        var rowAttrs = pivotSettings.rowAttrs,
            colAttrs = pivotSettings.colAttrs,
            visibleColKeys = pivotSettings.visibleColKeys,
            colAttrSpans = pivotSettings.colAttrSpans,
            rowTotals = pivotSettings.rowTotals,
            arrowExpanded = pivotSettings.arrowExpanded,
            arrowCollapsed = pivotSettings.arrowCollapsed,
            colSubtotalDisplay = pivotSettings.colSubtotalDisplay;


        var spaceCell = attrIdx === 0 && rowAttrs.length !== 0 ? _react2.default.createElement('th', {
          key: 'padding',
          colSpan: rowAttrs.length,
          rowSpan: colAttrs.length
        }) : null;

        var needToggle = opts.subtotals && colSubtotalDisplay.enabled && attrIdx !== colAttrs.length - 1;
        var attrNameCell = _react2.default.createElement(
          'th',
          { key: 'label', className: 'pvtAxisLabel' },
          attrName
        );

        var attrValueCells = [];
        var rowIncrSpan = rowAttrs.length !== 0 ? 1 : 0;
        var i = 0;
        while (i < visibleColKeys.length) {
          var colKey = visibleColKeys[i];
          var isSubtotalCol = colKey[colKey.length - 1] === '__subtotal__';
          var actualColKey = isSubtotalCol ? colKey.slice(0, -1) : colKey;

          var colSpan = attrIdx < actualColKey.length ? colAttrSpans[i][attrIdx] : 1;
          if (attrIdx < actualColKey.length) {
            var rowSpan = 1 + (attrIdx === colAttrs.length - 1 ? rowIncrSpan : 0);
            var flatColKey = (0, _Utilities.flatKey)(actualColKey.slice(0, attrIdx + 1));
            var onClick = needToggle ? this.toggleColKey(flatColKey) : null;

            var headerText = actualColKey[attrIdx];
            var headerClass = 'pvtColLabel';

            var isCollapsedParent = this.state.collapsedCols[flatColKey] && actualColKey.length < colAttrs.length;

            if (isSubtotalCol) {
              headerText = headerText + ' (Subtotal)';
              headerClass += ' pvtSubtotal';
            } else if (isCollapsedParent) {
              headerClass += ' pvtSubtotal';
            }

            attrValueCells.push(_react2.default.createElement(
              'th',
              {
                className: headerClass,
                key: 'colKey-' + flatColKey + (isSubtotalCol ? '-subtotal' : ''),
                colSpan: colSpan,
                rowSpan: rowSpan,
                onClick: onClick,
                style: { cursor: needToggle ? 'pointer' : 'default' }
              },
              needToggle ? (this.state.collapsedCols[flatColKey] ? arrowCollapsed : arrowExpanded) + ' ' : null,
              headerText
            ));
          } else if (attrIdx === actualColKey.length) {
            var _rowSpan = colAttrs.length - actualColKey.length + rowIncrSpan;
            var _flatColKey = (0, _Utilities.flatKey)(actualColKey);
            var _isCollapsedParent = this.state.collapsedCols[_flatColKey] && actualColKey.length < colAttrs.length;

            attrValueCells.push(_react2.default.createElement('th', {
              className: 'pvtColLabel ' + (isSubtotalCol || _isCollapsedParent ? 'pvtSubtotal' : ''),
              key: 'colKeyBuffer-' + (0, _Utilities.flatKey)(actualColKey) + (isSubtotalCol ? '-subtotal' : ''),
              colSpan: colSpan,
              rowSpan: _rowSpan
            }));
          }
          i = i + colSpan;
        }

        var totalCell = attrIdx === 0 && rowTotals ? _react2.default.createElement(
          'th',
          {
            key: 'total',
            className: 'pvtTotalLabel',
            rowSpan: colAttrs.length + Math.min(rowAttrs.length, 1)
          },
          'Totals'
        ) : null;

        var cells = [spaceCell, attrNameCell].concat(attrValueCells, [totalCell]);
        return cells;
      }
    }, {
      key: 'renderRowHeaderRow',
      value: function renderRowHeaderRow(pivotSettings) {
        var colAttrs = pivotSettings.colAttrs,
            rowAttrs = pivotSettings.rowAttrs;

        var cells = [];
        if (rowAttrs.length !== 0) {
          rowAttrs.map(function (r, i) {
            cells.push(_react2.default.createElement(
              'th',
              { className: 'pvtAxisLabel', key: 'rowAttr' + i },
              r
            ));
          });
          cells.push(_react2.default.createElement(
            'th',
            { className: 'pvtTotalLabel', key: 'total' },
            colAttrs.length === 0 ? 'Totals' : null
          ));
        }
        return cells;
      }
    }, {
      key: 'renderTableRow',
      value: function renderTableRow(rowKey, rowIdx, pivotSettings) {
        var _this4 = this;

        var colKeys = pivotSettings.colKeys,
            rowAttrs = pivotSettings.rowAttrs,
            colAttrs = pivotSettings.colAttrs,
            rowTotals = pivotSettings.rowTotals,
            pivotData = pivotSettings.pivotData,
            rowMapper = pivotSettings.rowMapper,
            colMapper = pivotSettings.colMapper,
            cellCallbacks = pivotSettings.cellCallbacks,
            rowTotalCallbacks = pivotSettings.rowTotalCallbacks;


        var visibleColKeys = this.visibleKeys(colKeys, this.state.collapsedCols);

        var cells = [];
        var isSubtotalRow = rowKey[rowKey.length - 1] === '__subtotal__';
        var actualRowKey = isSubtotalRow ? rowKey.slice(0, -1) : rowKey;

        visibleColKeys.forEach(function (colKey, i) {
          try {
            if (!actualRowKey || !colKey) {
              cells.push(_react2.default.createElement('td', { className: 'pvtVal', key: 'pvtVal-' + i }));
              return;
            }

            var aggregator = void 0,
                className = void 0,
                valCss = {};

            var isSubtotalCol = colKey[colKey.length - 1] === '__subtotal__';
            var actualColKey = isSubtotalCol ? colKey.slice(0, -1) : colKey;

            var needsSubtotalValue = isSubtotalRow || isSubtotalCol || actualColKey.length < colAttrs.length && _this4.state.collapsedCols[(0, _Utilities.flatKey)(actualColKey)] || actualRowKey.length < rowAttrs.length && _this4.state.collapsedRows[(0, _Utilities.flatKey)(actualRowKey)];

            if (needsSubtotalValue) {
              var _value = _this4.calculateSubtotal(pivotData, actualRowKey, actualColKey, pivotSettings);
              className = 'pvtSubtotal';

              var tempAggregator = _this4.safeGetAggregator(pivotData, [], []);
              aggregator = {
                value: function value() {
                  return _value;
                },
                format: tempAggregator ? tempAggregator.format : function (x) {
                  return x;
                }
              };

              if (opts.heatmapMode && colMapper.bgColorFromSubtotalValue) {
                var cellColor = void 0;
                if (opts.heatmapMode === 'full') {
                  cellColor = colMapper.bgColorFromSubtotalValue(_value);
                } else if (opts.heatmapMode === 'row') {
                  cellColor = colMapper.bgColorFromSubtotalValue(_value, actualRowKey);
                } else if (opts.heatmapMode === 'col') {
                  cellColor = colMapper.bgColorFromSubtotalValue(_value, actualRowKey, actualColKey);
                }

                if (cellColor) {
                  valCss = cellColor;
                }
              }
            } else {
              aggregator = _this4.safeGetAggregator(pivotData, actualRowKey, actualColKey);
              className = 'pvtVal';

              if (opts.heatmapMode && colMapper.bgColorFromRowColKey) {
                var _cellColor = colMapper.bgColorFromRowColKey(actualRowKey, actualColKey);
                if (_cellColor) {
                  valCss = _cellColor;
                }
              }
            }

            if (!aggregator || aggregator.value() === null) {
              cells.push(_react2.default.createElement('td', { className: className, key: 'pvtVal-' + i, style: valCss }));
              return;
            }

            var val = aggregator.value();

            var formattedVal = void 0;
            if (val === null) {
              formattedVal = '';
            } else if (className === 'pvtSubtotal' && val === 0) {
              formattedVal = '';
            } else {
              formattedVal = aggregator.format(val);
            }

            var cellKey = (0, _Utilities.flatKey)(actualRowKey);
            var colCellKey = (0, _Utilities.flatKey)(actualColKey);

            cells.push(_react2.default.createElement(
              'td',
              {
                className: className,
                key: 'pvtVal-' + i,
                style: valCss,
                onClick: cellCallbacks[cellKey] && colCellKey in cellCallbacks[cellKey] ? cellCallbacks[cellKey][colCellKey] : null
              },
              formattedVal
            ));
          } catch (error) {
            cells.push(_react2.default.createElement('td', { className: 'pvtVal', key: 'pvtVal-' + i }));
          }
        });

        if (rowTotals) {
          try {
            var className = isSubtotalRow ? 'pvtTotal pvtSubtotal' : 'pvtTotal';
            var valCss = {};

            var totalVal = 0;
            var formattedTotal = '';

            if (isSubtotalRow) {
              totalVal = this.calculateSubtotal(pivotData, actualRowKey, [], pivotSettings);

              if (opts.heatmapMode && colMapper.bgColorFromSubtotalValue) {
                var cellColor = void 0;
                if (opts.heatmapMode === 'full') {
                  cellColor = colMapper.bgColorFromSubtotalValue(totalVal);
                } else if (opts.heatmapMode === 'row') {
                  cellColor = colMapper.bgColorFromSubtotalValue(totalVal, actualRowKey);
                } else if (opts.heatmapMode === 'col') {
                  cellColor = colMapper.bgColorFromSubtotalValue(totalVal, actualRowKey, []);
                }

                if (cellColor) {
                  valCss = cellColor;
                }
              }
            } else if (actualRowKey.length < rowAttrs.length && this.state.collapsedRows[(0, _Utilities.flatKey)(actualRowKey)]) {
              totalVal = this.calculateSubtotal(pivotData, actualRowKey, [], pivotSettings);

              if (opts.heatmapMode && colMapper.bgColorFromSubtotalValue) {
                var _cellColor2 = void 0;
                if (opts.heatmapMode === 'full') {
                  _cellColor2 = colMapper.bgColorFromSubtotalValue(totalVal);
                } else if (opts.heatmapMode === 'row') {
                  _cellColor2 = colMapper.bgColorFromSubtotalValue(totalVal, actualRowKey);
                } else if (opts.heatmapMode === 'col') {
                  _cellColor2 = colMapper.bgColorFromSubtotalValue(totalVal, actualRowKey, []);
                }

                if (_cellColor2) {
                  valCss = _cellColor2;
                }
              }
            } else {
              pivotData.getColKeys().forEach(function (colKey) {
                var agg = _this4.safeGetAggregator(pivotData, actualRowKey, colKey);
                if (agg) {
                  var val = agg.value();
                  if (val !== null && !isNaN(val)) {
                    totalVal += val;
                  }
                }
              });

              if (opts.heatmapMode && totalVal !== 0) {
                if (opts.heatmapMode === 'row' && colMapper.bgColorFromSubtotalValue) {
                  var _cellColor3 = colMapper.bgColorFromSubtotalValue(totalVal, actualRowKey);
                  if (_cellColor3) {
                    valCss = _cellColor3;
                  }
                } else if (rowMapper.totalColor) {
                  var _cellColor4 = rowMapper.totalColor(actualRowKey[0]);
                  if (_cellColor4) {
                    valCss = _cellColor4;
                  }
                }
              }
            }

            if (totalVal !== 0 || isSubtotalRow) {
              var tempAggregator = this.safeGetAggregator(pivotData, [], []);
              var formatFunc = tempAggregator && tempAggregator.format ? tempAggregator.format : function (x) {
                return x;
              };
              if (className.includes('pvtSubtotal') && totalVal === 0) {
                formattedTotal = '';
              } else {
                formattedTotal = totalVal === null || totalVal === 0 ? '' : formatFunc(totalVal);
              }
            }

            var cellKey = (0, _Utilities.flatKey)(actualRowKey);

            cells.push(_react2.default.createElement(
              'td',
              {
                className: className,
                key: 'total',
                style: valCss,
                onClick: rowTotalCallbacks[cellKey]
              },
              formattedTotal
            ));
          } catch (error) {
            cells.push(_react2.default.createElement('td', { className: 'pvtTotal', key: 'total' }));
          }
        }

        return cells;
      }
    }, {
      key: 'renderTotalsRow',
      value: function renderTotalsRow(pivotSettings) {
        var _this5 = this;

        var colKeys = pivotSettings.colKeys,
            colAttrs = pivotSettings.colAttrs,
            rowAttrs = pivotSettings.rowAttrs,
            colTotals = pivotSettings.colTotals,
            pivotData = pivotSettings.pivotData,
            colMapper = pivotSettings.colMapper,
            grandTotalCallback = pivotSettings.grandTotalCallback,
            colTotalCallbacks = pivotSettings.colTotalCallbacks;


        var visibleColKeys = this.visibleKeys(colKeys, this.state.collapsedCols);

        var cells = [];
        cells.push(_react2.default.createElement(
          'th',
          {
            key: 'labelTotal',
            className: 'pvtTotalLabel',
            colSpan: rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)
          },
          'Totals'
        ));

        visibleColKeys.forEach(function (colKey, i) {
          try {
            var isSubtotalCol = colKey[colKey.length - 1] === '__subtotal__';
            var actualColKey = isSubtotalCol ? colKey.slice(0, -1) : colKey;

            if (!actualColKey) {
              cells.push(_react2.default.createElement('td', { className: 'pvtTotal', key: 'total-' + i }));
              return;
            }

            var colTotal = 0;

            var flatColKey = (0, _Utilities.flatKey)(actualColKey);
            var isCollapsedParent = _this5.state.collapsedCols[flatColKey] && actualColKey.length < colAttrs.length;

            if (isSubtotalCol || isCollapsedParent) {
              colTotal = _this5.calculateSubtotal(pivotData, [], actualColKey, pivotSettings);
            } else {
              pivotData.getRowKeys().forEach(function (rowKey) {
                var agg = _this5.safeGetAggregator(pivotData, rowKey, actualColKey);
                if (agg) {
                  var val = agg.value();
                  if (val !== null && !isNaN(val)) {
                    colTotal += val;
                  }
                }
              });
            }

            var valCss = {};
            if (isSubtotalCol || isCollapsedParent) {
              if (opts.heatmapMode && colMapper.bgColorFromSubtotalValue) {
                var cellColor = void 0;
                if (opts.heatmapMode === 'full') {
                  cellColor = colMapper.bgColorFromSubtotalValue(colTotal);
                } else if (opts.heatmapMode === 'row') {
                  cellColor = colMapper.bgColorFromSubtotalValue(colTotal, []);
                } else if (opts.heatmapMode === 'col') {
                  cellColor = colMapper.bgColorFromSubtotalValue(colTotal, [], actualColKey);
                }

                if (cellColor) {
                  valCss = cellColor;
                }
              }
            } else {
              if (opts.heatmapMode && colTotal !== 0) {
                if (opts.heatmapMode === 'col' && colMapper.bgColorFromSubtotalValue) {
                  var _cellColor5 = colMapper.bgColorFromSubtotalValue(colTotal, [], actualColKey);
                  if (_cellColor5) {
                    valCss = _cellColor5;
                  }
                } else if (colMapper.totalColor) {
                  var _cellColor6 = colMapper.totalColor(actualColKey[0]);
                  if (_cellColor6) {
                    valCss = _cellColor6;
                  }
                }
              }
            }

            var tempAggregator = _this5.safeGetAggregator(pivotData, [], []);
            var format = tempAggregator && tempAggregator.format ? tempAggregator.format : function (x) {
              return x;
            };

            var displayValue = void 0;
            if (colTotal === null || colTotal === 0) {
              displayValue = '';
            } else {
              displayValue = format ? format(colTotal) : colTotal;
            }

            cells.push(_react2.default.createElement(
              'td',
              {
                className: 'pvtTotal ' + (isSubtotalCol || isCollapsedParent ? 'pvtSubtotal' : ''),
                key: 'total-' + i,
                style: valCss,
                onClick: colTotalCallbacks[(0, _Utilities.flatKey)(actualColKey)]
              },
              displayValue
            ));
          } catch (error) {
            cells.push(_react2.default.createElement('td', { className: 'pvtTotal', key: 'total-' + i }));
          }
        });

        if (colTotals) {
          try {
            var grandTotal = 0;
            var validValuesFound = false;

            try {
              var grandTotalAggregator = pivotData.getAggregator([], []);
              if (grandTotalAggregator) {
                var val = grandTotalAggregator.value();
                if (val !== null && !isNaN(val)) {
                  grandTotal = val;
                  validValuesFound = true;
                }
              }
            } catch (e) {
              // Error getting grand total directly, will calculate manually
            }

            if (!validValuesFound) {
              pivotData.getRowKeys().forEach(function (rowKey) {
                pivotData.getColKeys().forEach(function (colKey) {
                  try {
                    var agg = _this5.safeGetAggregator(pivotData, rowKey, colKey);
                    if (agg) {
                      var _val = agg.value();
                      if (_val !== null && !isNaN(_val)) {
                        grandTotal += _val;
                        validValuesFound = true;
                      }
                    }
                  } catch (e) {
                    // Ignore errors for missing combinations
                  }
                });
              });
            }

            var tempAggregator = this.safeGetAggregator(pivotData, [], []);
            var format = tempAggregator && tempAggregator.format ? tempAggregator.format : function (x) {
              return x;
            };

            cells.push(_react2.default.createElement(
              'td',
              {
                className: 'pvtGrandTotal',
                key: 'grandTotal',
                style: opts.heatmapMode && colMapper.grandTotalColor ? colMapper.grandTotalColor : {},
                onClick: grandTotalCallback
              },
              validValuesFound && grandTotal !== 0 ? format ? format(grandTotal) : grandTotal : ''
            ));
          } catch (error) {
            cells.push(_react2.default.createElement('td', { className: 'pvtGrandTotal', key: 'grandTotal' }));
          }
        }

        return cells;
      }
    }, {
      key: 'visibleKeys',
      value: function visibleKeys(keys, collapsed) {
        if (!opts.subtotals) {
          return keys;
        }

        var sortedKeys = keys.slice().sort(function (a, b) {
          var minLength = Math.min(a.length, b.length);
          for (var i = 0; i < minLength; i++) {
            var aStr = String(a[i]);
            var bStr = String(b[i]);
            var cmp = aStr.localeCompare(bStr);
            if (cmp !== 0) {
              return cmp;
            }
          }
          return a.length - b.length;
        });

        var result = [];
        var processedKeys = new Set();

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = sortedKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            var parentCollapsed = false;
            var deepestCollapsedParent = null;

            for (var _i3 = 0; _i3 < key.length; _i3++) {
              var _parentKey2 = key.slice(0, _i3 + 1);
              var flatParentKey = (0, _Utilities.flatKey)(_parentKey2);
              if (collapsed[flatParentKey]) {
                parentCollapsed = true;
                deepestCollapsedParent = _parentKey2;
                break;
              }
            }

            if (parentCollapsed) {
              var _flatParentKey = (0, _Utilities.flatKey)(deepestCollapsedParent);
              if (!processedKeys.has(_flatParentKey)) {
                result.push(deepestCollapsedParent);
                processedKeys.add(_flatParentKey);
              }
            } else {
              var flatKey_ = (0, _Utilities.flatKey)(key);
              if (!processedKeys.has(flatKey_)) {
                result.push(key);
                processedKeys.add(flatKey_);
              }
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var finalResult = [];
        var addedSubtotals = new Set();

        var parentGroups = new Map();
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = result[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _key = _step2.value;

            for (var _level2 = 1; _level2 < _key.length; _level2++) {
              var _parentKey3 = _key.slice(0, _level2);
              var _parentKeyStr2 = (0, _Utilities.flatKey)(_parentKey3);

              if (!parentGroups.has(_parentKeyStr2)) {
                parentGroups.set(_parentKeyStr2, {
                  key: _parentKey3,
                  level: _level2,
                  lastChildIndex: -1
                });
              }
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        for (var i = 0; i < result.length; i++) {
          var _key2 = result[i];
          for (var level = 1; level < _key2.length; level++) {
            var parentKey = _key2.slice(0, level);
            var parentKeyStr = (0, _Utilities.flatKey)(parentKey);
            var parentGroup = parentGroups.get(parentKeyStr);

            if (parentGroup) {
              parentGroup.lastChildIndex = Math.max(parentGroup.lastChildIndex, i);
            }
          }
        }

        for (var _i2 = 0; _i2 < result.length; _i2++) {
          var _key3 = result[_i2];
          finalResult.push(_key3);

          var subtotalsToAdd = [];

          for (var _level = _key3.length - 1; _level >= 1; _level--) {
            var _parentKey = _key3.slice(0, _level);
            var _parentKeyStr = (0, _Utilities.flatKey)(_parentKey);
            var _parentGroup = parentGroups.get(_parentKeyStr);

            if (collapsed[_parentKeyStr]) {
              continue;
            }

            if (_parentGroup && _parentGroup.lastChildIndex === _i2) {
              var subtotalKey = [].concat(_toConsumableArray(_parentKey), ['__subtotal__']);
              var subtotalKeyStr = (0, _Utilities.flatKey)(subtotalKey);

              if (!addedSubtotals.has(subtotalKeyStr)) {
                subtotalsToAdd.push(subtotalKey);
                addedSubtotals.add(subtotalKeyStr);
              }
            }
          }

          finalResult.push.apply(finalResult, subtotalsToAdd);
        }

        return finalResult;
      }
    }, {
      key: 'getSubtotal',
      value: function getSubtotal(rowKey, colKey, pivotSettings) {
        var pivotData = pivotSettings.pivotData;

        return pivotData.getAggregator(rowKey, colKey).value();
      }
    }, {
      key: 'hasSubtotals',
      value: function hasSubtotals(rowOrCol, key, pivotSettings) {
        var rowAttrs = pivotSettings.rowAttrs,
            colAttrs = pivotSettings.colAttrs;

        var attrs = rowOrCol === 'row' ? rowAttrs : colAttrs;

        return key.length < attrs.length;
      }
    }, {
      key: 'safeGetAggregator',
      value: function safeGetAggregator(pivotData, rowKey, colKey) {
        try {
          return pivotData.getAggregator(rowKey, colKey);
        } catch (error) {
          return null;
        }
      }
    }, {
      key: 'calculateSubtotal',
      value: function calculateSubtotal(pivotData, rowKey, colKey, pivotSettings) {
        var _this6 = this;

        var rowAttrs = pivotSettings.rowAttrs,
            colAttrs = pivotSettings.colAttrs;


        if (rowKey.length === rowAttrs.length && colKey.length === colAttrs.length) {
          var agg = this.safeGetAggregator(pivotData, rowKey, colKey);
          return agg ? agg.value() : 0;
        }

        var total = 0;
        var hasValidValues = false;

        var childRowKeys = [];
        if (rowKey.length < rowAttrs.length) {
          pivotData.getRowKeys().forEach(function (fullRowKey) {
            var isChild = true;
            for (var i = 0; i < rowKey.length; i++) {
              if (fullRowKey[i] !== rowKey[i]) {
                isChild = false;
                break;
              }
            }

            if (isChild) {
              childRowKeys.push(fullRowKey);
            }
          });
        } else {
          childRowKeys.push(rowKey);
        }

        var childColKeys = [];
        if (colKey.length < colAttrs.length) {
          pivotData.getColKeys().forEach(function (fullColKey) {
            var isChild = true;
            for (var i = 0; i < colKey.length; i++) {
              if (fullColKey[i] !== colKey[i]) {
                isChild = false;
                break;
              }
            }

            if (isChild) {
              childColKeys.push(fullColKey);
            }
          });
        } else {
          childColKeys.push(colKey);
        }

        if (childRowKeys.length === 0 || childColKeys.length === 0) {
          var _agg = this.safeGetAggregator(pivotData, rowKey, colKey);
          return _agg ? _agg.value() || 0 : 0;
        }

        childRowKeys.forEach(function (childRowKey) {
          childColKeys.forEach(function (childColKey) {
            var agg = _this6.safeGetAggregator(pivotData, childRowKey, childColKey);
            if (agg) {
              var val = agg.value();
              if (val !== null && !isNaN(val)) {
                total += val;
                hasValidValues = true;
              }
            }
          });
        });

        return hasValidValues ? total : 0;
      }
    }, {
      key: 'render',
      value: function render() {
        var _this7 = this;

        var pivotSettings = this.getBasePivotSettings();
        var colAttrs = pivotSettings.colAttrs,
            rowAttrs = pivotSettings.rowAttrs,
            rowKeys = pivotSettings.rowKeys,
            colKeys = pivotSettings.colKeys,
            rowTotals = pivotSettings.rowTotals;


        var renderedLabels = {};

        var visibleRowKeys = opts.subtotals ? this.visibleKeys(rowKeys, this.state.collapsedRows) : rowKeys;
        var visibleColKeys = opts.subtotals ? this.visibleKeys(colKeys, this.state.collapsedCols) : colKeys;

        var finalPivotSettings = Object.assign({
          visibleRowKeys: visibleRowKeys,
          maxRowVisible: Math.max.apply(Math, _toConsumableArray(visibleRowKeys.map(function (k) {
            return k.length;
          }))),
          visibleColKeys: visibleColKeys,
          maxColVisible: Math.max.apply(Math, _toConsumableArray(visibleColKeys.map(function (k) {
            return k.length;
          }))),
          rowAttrSpans: this.calcAttrSpans(visibleRowKeys, rowAttrs.length),
          colAttrSpans: this.calcAttrSpans(visibleColKeys, colAttrs.length)
        }, pivotSettings);

        var rowspans = {};
        visibleRowKeys.forEach(function (rowKey, rowIdx) {
          var isSubtotalRow = rowKey[rowKey.length - 1] === '__subtotal__';
          var actualRowKey = isSubtotalRow ? rowKey.slice(0, -1) : rowKey;

          for (var level = 0; level < actualRowKey.length; level++) {
            var cellKey = rowIdx + '-' + level;

            var span = 1;
            var j = rowIdx + 1;
            while (j < visibleRowKeys.length) {
              var nextKey = visibleRowKeys[j];
              var isNextSubtotal = nextKey[nextKey.length - 1] === '__subtotal__';
              var actualNextKey = isNextSubtotal ? nextKey.slice(0, -1) : nextKey;

              if (level >= actualNextKey.length) {
                break;
              }

              var matches = true;
              for (var l = 0; l <= level; l++) {
                if (l >= actualNextKey.length || actualNextKey[l] !== actualRowKey[l]) {
                  matches = false;
                  break;
                }
              }

              if (!matches) {
                break;
              }
              span++;
              j++;
            }

            rowspans[cellKey] = span;
          }
        });

        var renderedRows = visibleRowKeys.map(function (rowKey, i) {
          var rowCells = [];

          var isSubtotalRow = rowKey[rowKey.length - 1] === '__subtotal__';
          var actualRowKey = isSubtotalRow ? rowKey.slice(0, -1) : rowKey;

          if (isSubtotalRow) {
            rowCells.push(_react2.default.createElement('th', {
              key: 'subtotalLabel',
              className: 'pvtRowLabel pvtSubtotal',
              colSpan: rowAttrs.length - actualRowKey.length + 1
            }));
          } else {
            for (var level = 0; level < actualRowKey.length; level++) {
              var labelKey = '' + actualRowKey.slice(0, level + 1).join('|');

              if (!renderedLabels[labelKey]) {
                renderedLabels[labelKey] = true;

                var cellKey = i + '-' + level;
                var rowspan = rowspans[cellKey] || 1;

                var flatRowKey = (0, _Utilities.flatKey)(actualRowKey.slice(0, level + 1));
                var isCollapsed = _this7.state.collapsedRows[flatRowKey];

                var className = 'pvtRowLabel';

                var icon = null;

                if (level + 1 < rowAttrs.length) {
                  if (isCollapsed) {
                    className += ' collapsed';
                    icon = pivotSettings.arrowCollapsed;
                  } else {
                    className += ' expanded';
                    icon = pivotSettings.arrowExpanded;
                  }
                  rowCells.push(_react2.default.createElement(
                    'th',
                    {
                      key: 'rowLabel-' + level,
                      className: className,
                      rowSpan: rowspan,
                      onClick: _this7.toggleRowKey(flatRowKey),
                      style: { cursor: 'pointer' }
                    },
                    icon && _react2.default.createElement(
                      'span',
                      { className: 'pvtAttr', style: { marginRight: '6px' } },
                      icon
                    ),
                    _react2.default.createElement(
                      'span',
                      null,
                      actualRowKey[level]
                    )
                  ));
                  continue;
                }

                var isLeafLevel = level === actualRowKey.length - 1 && actualRowKey.length === rowAttrs.length;
                var leafColspan = isLeafLevel ? 2 : 1;

                rowCells.push(_react2.default.createElement(
                  'th',
                  {
                    key: 'rowLabel-' + level,
                    className: className,
                    rowSpan: rowspan,
                    colSpan: leafColspan,
                    onClick: _this7.toggleRowKey(flatRowKey)
                  },
                  icon && _react2.default.createElement(
                    'span',
                    { className: 'pvtAttr' },
                    icon
                  ),
                  _react2.default.createElement(
                    'span',
                    null,
                    actualRowKey[level]
                  )
                ));
              }
            }

            if (actualRowKey.length < rowAttrs.length) {
              rowCells.push(_react2.default.createElement('th', {
                key: 'padding',
                className: 'pvtRowLabel',
                colSpan: rowAttrs.length - actualRowKey.length + 1
              }));
            }
          }

          var dataCells = _this7.renderTableRow(rowKey, i, finalPivotSettings);

          return _react2.default.createElement(
            'tr',
            {
              key: 'row-' + i,
              className: isSubtotalRow && opts.subtotals ? 'pvtSubtotalRow' : ''
            },
            rowCells,
            dataCells
          );
        });

        var colAttrsHeaders = colAttrs.map(function (attrName, i) {
          return _react2.default.createElement(
            'tr',
            { key: 'colAttr-' + i },
            _this7.renderColHeaderRow(attrName, i, finalPivotSettings)
          );
        });

        var rowAttrsHeader = null;
        if (rowAttrs.length > 0) {
          rowAttrsHeader = _react2.default.createElement(
            'tr',
            { key: 'rowAttr-0' },
            this.renderRowHeaderRow(finalPivotSettings)
          );
        }

        var totalHeader = null;
        if (rowTotals) {
          totalHeader = _react2.default.createElement(
            'tr',
            { key: 'total' },
            this.renderTotalsRow(finalPivotSettings)
          );
        }

        return _react2.default.createElement(
          'table',
          { className: 'pvtTable' },
          _react2.default.createElement(
            'thead',
            null,
            colAttrsHeaders,
            rowAttrsHeader
          ),
          _react2.default.createElement(
            'tbody',
            null,
            renderedRows,
            totalHeader
          )
        );
      }
    }], [{
      key: 'heatmapMappers',
      value: function heatmapMappers(pivotData, colorScaleGenerator, colTotals, rowTotals) {
        var colMapper = {};
        var rowMapper = {};

        if (colorScaleGenerator && opts.heatmapMode) {
          var valueCellColors = {};
          var rowTotalColors = {};
          var colTotalColors = {};
          var grandTotalColor = null;

          var allValues = [];
          var rowValues = {};
          var colValues = {};

          pivotData.forEachCell(function (val, rowKey, colKey) {
            if (val !== null && !isNaN(val)) {
              allValues.push(val);

              var flatRow = (0, _Utilities.flatKey)(rowKey);
              if (!rowValues[flatRow]) {
                rowValues[flatRow] = [];
              }
              rowValues[flatRow].push(val);

              var flatCol = (0, _Utilities.flatKey)(colKey);
              if (!colValues[flatCol]) {
                colValues[flatCol] = [];
              }
              colValues[flatCol].push(val);
            }
          });

          if (opts.heatmapMode === 'row' && colTotals) {
            pivotData.getRowKeys().forEach(function (rowKey) {
              var rowTotal = 0;
              var hasValidValues = false;
              pivotData.getColKeys().forEach(function (colKey) {
                var agg = pivotData.getAggregator(rowKey, colKey);
                if (agg) {
                  var val = agg.value();
                  if (val !== null && !isNaN(val)) {
                    rowTotal += val;
                    hasValidValues = true;
                  }
                }
              });

              if (hasValidValues && rowTotal !== 0) {
                var flatRow = (0, _Utilities.flatKey)(rowKey);
                if (!rowValues[flatRow]) {
                  rowValues[flatRow] = [];
                }
                rowValues[flatRow].push(rowTotal);
              }
            });
          }

          if (opts.heatmapMode === 'col' && rowTotals) {
            pivotData.getColKeys().forEach(function (colKey) {
              var colTotal = 0;
              var hasValidValues = false;
              pivotData.getRowKeys().forEach(function (rowKey) {
                var agg = pivotData.getAggregator(rowKey, colKey);
                if (agg) {
                  var val = agg.value();
                  if (val !== null && !isNaN(val)) {
                    colTotal += val;
                    hasValidValues = true;
                  }
                }
              });

              if (hasValidValues && colTotal !== 0) {
                var flatCol = (0, _Utilities.flatKey)(colKey);
                if (!colValues[flatCol]) {
                  colValues[flatCol] = [];
                }
                colValues[flatCol].push(colTotal);
              }
            });
          }

          if (colTotals) {
            var rowTotalValues = [];
            pivotData.forEachTotal(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                  valKey = _ref2[0],
                  _x = _ref2[1];

              var val = pivotData.getAggregator([valKey], []).value();
              if (val !== null && !isNaN(val)) {
                rowTotalValues.push(val);
                if (opts.heatmapMode === 'full') {
                  allValues.push(val);
                }
              }
            });

            var rowTotalColorScale = opts.heatmapMode === 'full' ? colorScaleGenerator(allValues) : colorScaleGenerator(rowTotalValues);

            pivotData.forEachTotal(function (_ref3) {
              var _ref4 = _slicedToArray(_ref3, 2),
                  valKey = _ref4[0],
                  _x = _ref4[1];

              var val = pivotData.getAggregator([valKey], []).value();
              if (val !== null && !isNaN(val)) {
                rowTotalColors[(0, _Utilities.flatKey)([valKey])] = rowTotalColorScale(val);
              }
            });
          }

          if (rowTotals) {
            var colTotalValues = [];
            pivotData.forEachTotal(function (_ref5) {
              var _ref6 = _slicedToArray(_ref5, 2),
                  _x = _ref6[0],
                  valKey = _ref6[1];

              var val = pivotData.getAggregator([], [valKey]).value();
              if (val !== null && !isNaN(val)) {
                colTotalValues.push(val);
                if (opts.heatmapMode === 'full') {
                  allValues.push(val);
                }
              }
            });

            var colTotalColorScale = opts.heatmapMode === 'full' ? colorScaleGenerator(allValues) : colorScaleGenerator(colTotalValues);

            pivotData.forEachTotal(function (_ref7) {
              var _ref8 = _slicedToArray(_ref7, 2),
                  _x = _ref8[0],
                  valKey = _ref8[1];

              var val = pivotData.getAggregator([], [valKey]).value();
              if (val !== null && !isNaN(val)) {
                colTotalColors[(0, _Utilities.flatKey)([valKey])] = colTotalColorScale(val);
              }
            });
          }

          if (colTotals && rowTotals) {
            var grandTotalVal = pivotData.getAggregator([], []).value();
            if (grandTotalVal !== null && !isNaN(grandTotalVal)) {
              if (opts.heatmapMode === 'full') {
                allValues.push(grandTotalVal);
                var grandTotalColorScale = colorScaleGenerator(allValues);
                grandTotalColor = grandTotalColorScale(grandTotalVal);
              }
            }
          }

          if (rowTotals) {
            colMapper.totalColor = function (key) {
              return colTotalColors[(0, _Utilities.flatKey)([key])];
            };
          }
          if (colTotals) {
            rowMapper.totalColor = function (key) {
              return rowTotalColors[(0, _Utilities.flatKey)([key])];
            };
          }
          if (grandTotalColor) {
            colMapper.grandTotalColor = grandTotalColor;
          }

          if (opts.heatmapMode === 'full') {
            // Full heatmap: Compare values across the entire table
            // Note: allValues already contains all cell values from earlier collection
            var colorScale = colorScaleGenerator(allValues);
            pivotData.forEachCell(function (val, rowKey, colKey) {
              if (val !== null && !isNaN(val)) {
                valueCellColors[(0, _Utilities.flatKey)(rowKey) + '_' + (0, _Utilities.flatKey)(colKey)] = colorScale(val);
              }
            });

            colMapper.bgColorFromRowColKey = function (rowKey, colKey) {
              return valueCellColors[(0, _Utilities.flatKey)(rowKey) + '_' + (0, _Utilities.flatKey)(colKey)];
            };

            colMapper.bgColorFromSubtotalValue = function (value) {
              if (value !== null && !isNaN(value)) {
                return colorScale(value);
              }
              return null;
            };
          } else if (opts.heatmapMode === 'row') {
            // Row heatmap: Compare values within each row
            // Note: rowValues already populated from earlier collection
            var rowColorScales = {};
            Object.entries(rowValues).forEach(function (_ref9) {
              var _ref10 = _slicedToArray(_ref9, 2),
                  flatRow = _ref10[0],
                  values = _ref10[1];

              if (values.length > 0) {
                rowColorScales[flatRow] = colorScaleGenerator(values);
              }
            });

            pivotData.forEachCell(function (val, rowKey, colKey) {
              var flatRow = (0, _Utilities.flatKey)(rowKey);
              if (val !== null && !isNaN(val) && rowColorScales[flatRow]) {
                valueCellColors[flatRow + '_' + (0, _Utilities.flatKey)(colKey)] = rowColorScales[flatRow](val);
              }
            });

            colMapper.bgColorFromRowColKey = function (rowKey, colKey) {
              return valueCellColors[(0, _Utilities.flatKey)(rowKey) + '_' + (0, _Utilities.flatKey)(colKey)];
            };

            colMapper.bgColorFromSubtotalValue = function (value, rowKey) {
              if (value !== null && !isNaN(value)) {
                var flatRow = (0, _Utilities.flatKey)(rowKey);
                if (rowColorScales[flatRow]) {
                  return rowColorScales[flatRow](value);
                }
              }
              return null;
            };
          } else if (opts.heatmapMode === 'col') {
            // Column heatmap: Compare values within each column
            // Note: colValues already populated from earlier collection
            var colColorScales = {};
            Object.entries(colValues).forEach(function (_ref11) {
              var _ref12 = _slicedToArray(_ref11, 2),
                  flatCol = _ref12[0],
                  values = _ref12[1];

              if (values.length > 0) {
                colColorScales[flatCol] = colorScaleGenerator(values);
              }
            });

            pivotData.forEachCell(function (val, rowKey, colKey) {
              var flatCol = (0, _Utilities.flatKey)(colKey);
              if (val !== null && !isNaN(val) && colColorScales[flatCol]) {
                valueCellColors[(0, _Utilities.flatKey)(rowKey) + '_' + flatCol] = colColorScales[flatCol](val);
              }
            });

            colMapper.bgColorFromRowColKey = function (rowKey, colKey) {
              return valueCellColors[(0, _Utilities.flatKey)(rowKey) + '_' + (0, _Utilities.flatKey)(colKey)];
            };

            colMapper.bgColorFromSubtotalValue = function (value, rowKey, colKey) {
              if (value !== null && !isNaN(value)) {
                var flatCol = (0, _Utilities.flatKey)(colKey);
                if (colColorScales[flatCol]) {
                  return colColorScales[flatCol](value);
                }
              }
              return null;
            };
          }
        }
        return { colMapper: colMapper, rowMapper: rowMapper };
      }
    }]);

    return SubtotalRenderer;
  }(_react2.default.Component);

  SubtotalRenderer.defaultProps = Object.assign({}, _Utilities.PivotData.defaultProps, {
    tableColorScaleGenerator: redColorScaleGenerator,
    tableOptions: {}
  });
  SubtotalRenderer.propTypes = Object.assign({}, _Utilities.PivotData.propTypes, {
    tableColorScaleGenerator: _propTypes2.default.func,
    tableOptions: _propTypes2.default.object
  });
  return SubtotalRenderer;
}

var TSVExportRenderer = function (_React$PureComponent) {
  _inherits(TSVExportRenderer, _React$PureComponent);

  function TSVExportRenderer() {
    _classCallCheck(this, TSVExportRenderer);

    return _possibleConstructorReturn(this, (TSVExportRenderer.__proto__ || Object.getPrototypeOf(TSVExportRenderer)).apply(this, arguments));
  }

  _createClass(TSVExportRenderer, [{
    key: 'render',
    value: function render() {
      var pivotData = new _Utilities.PivotData(this.props);
      var rowKeys = pivotData.getRowKeys();
      var colKeys = pivotData.getColKeys();
      if (rowKeys.length === 0) {
        rowKeys.push([]);
      }
      if (colKeys.length === 0) {
        colKeys.push([]);
      }

      var headerRow = pivotData.props.rows.map(function (r) {
        return r;
      });
      if (colKeys.length === 1 && colKeys[0].length === 0) {
        headerRow.push(this.props.aggregatorName);
      } else {
        colKeys.map(function (c) {
          return headerRow.push(c.join('-'));
        });
      }

      var result = rowKeys.map(function (r) {
        var row = r.map(function (x) {
          return x;
        });
        colKeys.map(function (c) {
          var aggregator = pivotData.getAggregator(r, c);
          row.push(aggregator.value());
        });
        return row;
      });

      result.unshift(headerRow);

      return _react2.default.createElement('textarea', {
        value: result.map(function (r) {
          return r.join('\t');
        }).join('\n'),
        style: { width: window.innerWidth / 2, height: window.innerHeight / 2 },
        readOnly: true
      });
    }
  }]);

  return TSVExportRenderer;
}(_react2.default.PureComponent);

TSVExportRenderer.defaultProps = _Utilities.PivotData.defaultProps;
TSVExportRenderer.propTypes = _Utilities.PivotData.propTypes;

exports.default = {
  'Table With Subtotal': makeRenderer({ subtotals: true }),
  'Heatmap With Subtotal': makeRenderer({
    heatmapMode: 'full',
    subtotals: true
  }),
  'Col Heatmap With Subtotal': makeRenderer({
    heatmapMode: 'col',
    subtotals: true
  }),
  'Row Heatmap With Subtotal': makeRenderer({
    heatmapMode: 'row',
    subtotals: true
  }),
  'Exportable TSV': TSVExportRenderer
};
module.exports = exports['default'];
//# sourceMappingURL=SubtotalRenderers.js.map