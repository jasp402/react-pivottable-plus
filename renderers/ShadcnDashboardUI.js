"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShadcnDashboardUI = ShadcnDashboardUI;
var _react = _interopRequireWildcard(require("react"));
var _usePivot2 = require("../hooks/usePivot");
var _sortablejs = _interopRequireDefault(require("sortablejs"));
var _PivotTable = _interopRequireDefault(require("../PivotTable"));
var _Utilities = require("../Utilities");
var _lucideReact = require("lucide-react");
var _clsx = _interopRequireDefault(require("clsx"));
var _tailwindMerge = require("tailwind-merge");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function cn() {
  for (var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++) {
    inputs[_key] = arguments[_key];
  }
  return (0, _tailwindMerge.twMerge)((0, _clsx["default"])(inputs));
}
var DnDContainer = function DnDContainer(_ref) {
  var list = _ref.list,
    setList = _ref.setList,
    className = _ref.className,
    children = _ref.children;
  var el = (0, _react.useRef)(null);
  var setListRef = (0, _react.useRef)(setList);
  var listRef = (0, _react.useRef)(list);
  (0, _react.useEffect)(function () {
    setListRef.current = setList;
  }, [setList]);
  (0, _react.useEffect)(function () {
    listRef.current = list;
    if (el.current && el.current.sortable) {
      el.current.sortable._currentList = list;
    }
  }, [list]);
  (0, _react.useEffect)(function () {
    var sortable = _sortablejs["default"].create(el.current, {
      group: 'shared',
      ghostClass: 'opacity-50',
      animation: 150,
      onEnd: function onEnd(evt) {
        var from = evt.from,
          to = evt.to,
          oldIndex = evt.oldIndex,
          newIndex = evt.newIndex,
          item = evt.item;
        var itemId = item.getAttribute('data-id');

        // ── REVERSIÓN SÍNCRONA DEL DOM ──
        // Muy importante: eliminamos el item de su posición actual (to)
        // y lo devolvemos a la original (from) para que React lo encuentre.
        if (from !== to || oldIndex !== newIndex) {
          item.remove();
          var nextEl = from.children[oldIndex];
          if (nextEl) {
            from.insertBefore(item, nextEl);
          } else {
            from.appendChild(item);
          }
        }
        if (from === to) {
          // ── Reordenamiento interno ──
          var newOrder = _toConsumableArray(listRef.current);
          newOrder.splice(oldIndex, 1);
          newOrder.splice(newIndex, 0, itemId);
          if (setListRef.current) {
            setListRef.current(newOrder);
          }
        } else {
          // ── Movimiento entre listas ──
          var fromSortable = from.sortable;
          var toSortable = to.sortable;
          if (fromSortable !== null && fromSortable !== void 0 && fromSortable._setList && toSortable !== null && toSortable !== void 0 && toSortable._setList) {
            var sourceItems = fromSortable._currentList.filter(function (id) {
              return id !== itemId;
            });
            var targetItems = _toConsumableArray(toSortable._currentList);
            targetItems.splice(newIndex, 0, itemId);
            fromSortable._setList(sourceItems);
            toSortable._setList(targetItems);
          }
        }
      }
    });
    el.current.sortable = sortable;
    sortable._setList = function (newOrder) {
      if (setListRef.current) {
        setListRef.current(newOrder);
      }
    };
    sortable._currentList = listRef.current;
    return function () {
      return sortable.destroy();
    };
  }, []);
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: className
  }, /*#__PURE__*/_react["default"].createElement("ul", {
    ref: el,
    style: {
      listStyleType: 'none',
      padding: 0,
      margin: 0,
      minHeight: '1.5rem',
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    }
  }, _react["default"].Children.map(children, function (child) {
    return /*#__PURE__*/_react["default"].createElement("li", {
      key: child.key,
      "data-id": child.props['data-id']
    }, child);
  })));
};
function ShadcnDashboardUI(props) {
  var _usePivot = (0, _usePivot2.usePivot)(props),
    pivotProps = _usePivot.props,
    pivotState = _usePivot.state,
    actions = _usePivot.actions;
  var _useState = (0, _react.useState)(null),
    _useState2 = _slicedToArray(_useState, 2),
    openDropdown = _useState2[0],
    setOpenDropdown = _useState2[1];
  var aggregatorName = pivotProps.aggregatorName;
  var rendererName = pivotProps.rendererName;
  var pivotData = new _Utilities.PivotData(_objectSpread(_objectSpread({}, pivotProps), {}, {
    data: pivotState.materializedInput
  }));
  var totalPivotRows = pivotData.getRowKeys().length;
  var totalRecords = pivotState.materializedInput.length;
  var totalPages = Math.ceil(totalPivotRows / (pivotProps.pageSize || 20));
  var unusedList = Object.keys(pivotState.attrValues).filter(function (e) {
    return e && e.trim() !== '' && !pivotProps.rows.includes(e) && !pivotProps.cols.includes(e);
  }).sort((0, _Utilities.sortAs)(pivotState.unusedOrder || []));
  var colList = pivotProps.cols.filter(function (e) {
    return e && e.trim() !== '';
  });
  var rowList = pivotProps.rows.filter(function (e) {
    return e && e.trim() !== '';
  });
  var AttributeItem = function AttributeItem(_ref2) {
    var attr = _ref2.attr,
      pivotState = _ref2.pivotState,
      pivotProps = _ref2.pivotProps,
      actions = _ref2.actions,
      openDropdown = _ref2.openDropdown,
      setOpenDropdown = _ref2.setOpenDropdown;
    var values = Object.keys(pivotState.attrValues[attr] || {});
    var valueFilter = pivotProps.valueFilter[attr] || {};
    var _useState3 = (0, _react.useState)(''),
      _useState4 = _slicedToArray(_useState3, 2),
      filterText = _useState4[0],
      setFilterText = _useState4[1];
    var filteredValues = values.filter(function (v) {
      return v.toString().toLowerCase().includes(filterText.toLowerCase());
    }).sort();
    return /*#__PURE__*/_react["default"].createElement("div", {
      className: "relative inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[13px] font-semibold text-slate-700 shadow-sm cursor-grab hover:bg-slate-50 transition-colors group",
      "data-id": attr
    }, /*#__PURE__*/_react["default"].createElement(_lucideReact.GripVertical, {
      size: 14,
      className: "text-slate-300 group-hover:text-slate-400 transition-colors"
    }), /*#__PURE__*/_react["default"].createElement("span", null, attr), /*#__PURE__*/_react["default"].createElement("button", {
      onClick: function onClick(e) {
        e.stopPropagation();
        // Si el elemento se está moviendo (clase de sortable activa), no abrir
        if (e.currentTarget.closest('.sortable-chosen')) return;
        setOpenDropdown(openDropdown === attr ? null : attr);
      },
      className: cn("text-slate-400 hover:text-slate-600 focus:outline-none ml-1 flex items-center justify-center p-0.5 rounded-sm transition-colors", Object.keys(valueFilter).length > 0 && "text-blue-600")
    }, /*#__PURE__*/_react["default"].createElement(_lucideReact.Filter, {
      size: 14
    })), openDropdown === attr && /*#__PURE__*/_react["default"].createElement("div", {
      className: "absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[1000] p-4 cursor-default",
      onClick: function onClick(e) {
        return e.stopPropagation();
      }
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center justify-between mb-3"
    }, /*#__PURE__*/_react["default"].createElement("h4", {
      className: "text-[11px] font-black text-slate-400 uppercase tracking-widest"
    }, "Filtrar: ", attr), /*#__PURE__*/_react["default"].createElement("button", {
      onClick: function onClick() {
        return setOpenDropdown(null);
      },
      className: "text-slate-400 hover:text-slate-600 font-bold text-lg"
    }, "\xD7")), /*#__PURE__*/_react["default"].createElement("input", {
      type: "text",
      placeholder: "Buscar valores...",
      className: "w-full px-3 py-2 text-xs border border-slate-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
      value: filterText,
      onChange: function onChange(e) {
        return setFilterText(e.target.value);
      }
    }), /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex gap-2 mb-3"
    }, /*#__PURE__*/_react["default"].createElement("button", {
      onClick: function onClick() {
        return actions.setValuesInFilter(attr, []);
      },
      className: "text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase"
    }, "Seleccionar Todo"), /*#__PURE__*/_react["default"].createElement("button", {
      onClick: function onClick() {
        return actions.setValuesInFilter(attr, values);
      },
      className: "text-[10px] font-bold text-slate-400 hover:text-slate-500 uppercase"
    }, "Limpiar")), /*#__PURE__*/_react["default"].createElement("div", {
      className: "max-h-48 overflow-y-auto custom-scrollbar space-y-1"
    }, filteredValues.map(function (v) {
      return /*#__PURE__*/_react["default"].createElement("label", {
        key: v,
        className: "flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
      }, /*#__PURE__*/_react["default"].createElement("input", {
        type: "checkbox",
        checked: !(v in valueFilter),
        onChange: function onChange() {
          return actions.toggleFilter(attr, v);
        },
        className: "w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
      }), /*#__PURE__*/_react["default"].createElement("span", {
        className: "text-xs text-slate-600 font-medium truncate"
      }, v === 'null' ? /*#__PURE__*/_react["default"].createElement("em", {
        className: "text-slate-400"
      }, "null") : v));
    }))));
  };
  var renderAttribute = function renderAttribute(attr) {
    return /*#__PURE__*/_react["default"].createElement(AttributeItem, {
      key: attr,
      attr: attr,
      "data-id": attr,
      pivotState: pivotState,
      pivotProps: pivotProps,
      actions: actions,
      openDropdown: openDropdown,
      setOpenDropdown: setOpenDropdown
    });
  };
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden font-sans text-slate-800 text-sm shadow-sm"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex w-full border-b border-slate-200 min-h-[4rem]"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "w-[300px] p-4 border-r border-slate-200 bg-white flex flex-col justify-start flex-shrink-0"
  }, /*#__PURE__*/_react["default"].createElement("select", {
    className: "w-full text-xs font-medium border border-slate-300 rounded px-3 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none hover:border-slate-400 bg-white text-slate-700",
    value: rendererName,
    onChange: function onChange(e) {
      return actions.updateProp('rendererName', e.target.value);
    }
  }, Object.keys(pivotProps.renderers).map(function (r) {
    return /*#__PURE__*/_react["default"].createElement("option", {
      key: r,
      value: r
    }, r);
  }))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex-1 p-4 bg-slate-50/80"
  }, /*#__PURE__*/_react["default"].createElement(DnDContainer, {
    list: unusedList,
    setList: function setList(newOrder) {
      actions.setUnusedOrder(newOrder);
    },
    className: "flex flex-wrap gap-2 w-full min-h-[1.5rem]"
  }, unusedList.map(renderAttribute)))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex w-full border-b border-slate-200 min-h-[4rem]"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "w-[300px] p-4 border-r border-slate-200 bg-slate-50/30 flex-shrink-0 flex items-start"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex flex-col gap-2 w-full"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/_react["default"].createElement("select", {
    className: "flex-1 text-xs font-medium border border-slate-300 rounded px-3 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none hover:border-slate-400 bg-white text-slate-700",
    value: aggregatorName,
    onChange: function onChange(e) {
      return actions.updateProp('aggregatorName', e.target.value);
    }
  }, Object.keys(pivotProps.aggregators).map(function (r) {
    return /*#__PURE__*/_react["default"].createElement("option", {
      key: r,
      value: r
    }, r);
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center text-slate-600 gap-1.5 text-base leading-none"
  }, /*#__PURE__*/_react["default"].createElement("span", {
    className: "cursor-pointer hover:text-slate-900 transition-colors"
  }, "\u2195"), /*#__PURE__*/_react["default"].createElement("span", {
    className: "cursor-pointer hover:text-slate-900 transition-colors"
  }, "\u2194"))), pivotProps.aggregators[pivotProps.aggregatorName]([])().numInputs > 0 && /*#__PURE__*/_react["default"].createElement("select", {
    className: "w-full text-xs font-medium border border-slate-300 rounded px-3 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none hover:border-slate-400 bg-white text-slate-700",
    value: pivotProps.vals[0] || '',
    onChange: function onChange(e) {
      return actions.updateProp('vals', [e.target.value]);
    }
  }, Object.keys(pivotState.attrValues).map(function (r) {
    return /*#__PURE__*/_react["default"].createElement("option", {
      key: r,
      value: r
    }, r);
  })))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex-1 p-4 bg-white"
  }, /*#__PURE__*/_react["default"].createElement(DnDContainer, {
    list: colList,
    setList: function setList(newOrder) {
      actions.updateProp('cols', newOrder);
    },
    className: "flex flex-wrap gap-2 w-full min-h-[1.5rem]"
  }, colList.map(renderAttribute)))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex w-full min-h-[400px]"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "w-[300px] p-4 border-r border-slate-200 bg-white flex-shrink-0"
  }, /*#__PURE__*/_react["default"].createElement(DnDContainer, {
    list: rowList,
    setList: function setList(newOrder) {
      actions.updateProp('rows', newOrder);
    },
    className: "flex flex-col gap-2 w-full min-h-[1.5rem]"
  }, rowList.map(renderAttribute))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex-1 w-full p-4 bg-slate-50/30 overflow-auto"
  }, /*#__PURE__*/_react["default"].createElement(_PivotTable["default"], _extends({}, pivotProps, {
    data: pivotState.materializedInput
  })))), pivotProps.pagination && /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white text-slate-600"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "text-[13px] font-medium"
  }, "Registros: ", /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-slate-900"
  }, totalRecords), " | Filas: ", /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-slate-900"
  }, totalPivotRows)), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-6"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/_react["default"].createElement("button", {
    className: "p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
    disabled: pivotProps.page <= 1,
    onClick: function onClick() {
      return actions.updateProp('page', 1);
    }
  }, /*#__PURE__*/_react["default"].createElement(_lucideReact.ChevronsLeft, {
    size: 18
  })), /*#__PURE__*/_react["default"].createElement("button", {
    className: "p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
    disabled: pivotProps.page <= 1,
    onClick: function onClick() {
      return actions.updateProp('page', pivotProps.page - 1);
    }
  }, /*#__PURE__*/_react["default"].createElement(_lucideReact.ChevronLeft, {
    size: 18
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-2 mx-1"
  }, /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-[13px] font-medium"
  }, "P\xE1gina"), /*#__PURE__*/_react["default"].createElement("input", {
    type: "number",
    className: "w-12 h-8 text-center border border-slate-300 rounded-md text-[13px] font-semibold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none",
    value: pivotProps.page,
    min: 1,
    max: totalPages,
    onChange: function onChange(e) {
      var val = parseInt(e.target.value, 10);
      if (val > 0 && val <= totalPages) {
        actions.updateProp('page', val);
      }
    }
  }), /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-[13px] font-medium text-slate-400"
  }, "de ", totalPages)), /*#__PURE__*/_react["default"].createElement("button", {
    className: "p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
    disabled: pivotProps.page >= totalPages,
    onClick: function onClick() {
      return actions.updateProp('page', pivotProps.page + 1);
    }
  }, /*#__PURE__*/_react["default"].createElement(_lucideReact.ChevronRight, {
    size: 18
  })), /*#__PURE__*/_react["default"].createElement("button", {
    className: "p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
    disabled: pivotProps.page >= totalPages,
    onClick: function onClick() {
      return actions.updateProp('page', totalPages);
    }
  }, /*#__PURE__*/_react["default"].createElement(_lucideReact.ChevronsRight, {
    size: 18
  }))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-2 border-l border-slate-200 pl-6"
  }, /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-[13px] font-medium text-slate-400"
  }, "Mostrar"), /*#__PURE__*/_react["default"].createElement("select", {
    className: "text-[13px] font-semibold border border-slate-300 rounded-md px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none hover:border-slate-400 bg-white text-slate-900",
    value: pivotProps.pageSize,
    onChange: function onChange(e) {
      actions.updateProp('pageSize', parseInt(e.target.value, 10));
      actions.updateProp('page', 1);
    }
  }, [10, 20, 50, 100].map(function (n) {
    return /*#__PURE__*/_react["default"].createElement("option", {
      key: n,
      value: n
    }, n);
  }))))));
}
//# sourceMappingURL=ShadcnDashboardUI.js.map