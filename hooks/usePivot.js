"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePivot = usePivot;
var _react = require("react");
var _Utilities = require("../Utilities");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function usePivot(initialProps) {
  // Mantener una referencia a las props iniciales para evitar cierres de ámbito (closures) obsoletos
  var initialPropsRef = (0, _react.useRef)(initialProps);
  (0, _react.useEffect)(function () {
    initialPropsRef.current = initialProps;
  }, [initialProps]);
  var _useState = (0, _react.useState)(_objectSpread({
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
      page: 1
    }, initialProps)),
    _useState2 = _slicedToArray(_useState, 2),
    props = _useState2[0],
    setProps = _useState2[1];
  var _useState3 = (0, _react.useState)({
      attrValues: {},
      materializedInput: [],
      unusedOrder: []
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    state = _useState4[0],
    setState = _useState4[1];

  // Sincronizar props internas cuando cambian las externas, pero sin disparar onChange de vuelta
  (0, _react.useEffect)(function () {
    setProps(function (prev) {
      return _objectSpread(_objectSpread({}, prev), initialProps);
    });
  }, [initialProps.data, initialProps.rows, initialProps.cols, initialProps.rendererName, initialProps.aggregatorName, initialProps.page, initialProps.pageSize]);

  // Materializar la entrada
  (0, _react.useEffect)(function () {
    var materializedInput = [];
    var attrValues = {};
    var recordsProcessed = 0;
    _Utilities.PivotData.forEachRecord(props.data, props.derivedAttributes, function (record) {
      materializedInput.push(record);
      for (var _i = 0, _Object$keys = Object.keys(record); _i < _Object$keys.length; _i++) {
        var attr = _Object$keys[_i];
        if (!(attr in attrValues)) {
          attrValues[attr] = {};
          if (recordsProcessed > 0) {
            attrValues[attr]["null"] = recordsProcessed;
          }
        }
      }
      for (var _attr in attrValues) {
        var value = _attr in record ? record[_attr] : 'null';
        if (!(value in attrValues[_attr])) {
          attrValues[_attr][value] = 0;
        }
        attrValues[_attr][value]++;
      }
      recordsProcessed++;
    });
    setState(function (s) {
      return _objectSpread(_objectSpread({}, s), {}, {
        attrValues: attrValues,
        materializedInput: materializedInput
      });
    });
  }, [props.data, props.derivedAttributes]);
  var updateProp = (0, _react.useCallback)(function (key, value) {
    setProps(function (prev) {
      var finalValue = value;
      if (Array.isArray(value) && (key === 'rows' || key === 'cols' || key === 'vals')) {
        finalValue = value.filter(function (v) {
          return v && v.trim() !== '';
        });
      }
      var newProps = _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, key, finalValue));
      if (key === 'rows') {
        newProps.cols = prev.cols.filter(function (c) {
          return !finalValue.includes(c);
        });
      } else if (key === 'cols') {
        newProps.rows = prev.rows.filter(function (r) {
          return !finalValue.includes(r);
        });
      }

      // Programar el onChange en un microtask o después del renderizado para evitar el warning de Gallery
      setTimeout(function () {
        if (initialPropsRef.current.onChange) {
          initialPropsRef.current.onChange(newProps);
        }
      }, 0);
      return newProps;
    });
  }, []);
  var toggleFilter = (0, _react.useCallback)(function (attribute, value) {
    setProps(function (prev) {
      var filter = _objectSpread({}, prev.valueFilter[attribute]);
      if (value in filter) {
        delete filter[value];
      } else {
        filter[value] = true;
      }
      var newValueFilter = _objectSpread(_objectSpread({}, prev.valueFilter), {}, _defineProperty({}, attribute, filter));
      var newProps = _objectSpread(_objectSpread({}, prev), {}, {
        valueFilter: newValueFilter
      });
      setTimeout(function () {
        if (initialPropsRef.current.onChange) initialPropsRef.current.onChange(newProps);
      }, 0);
      return newProps;
    });
  }, []);
  var setValuesInFilter = (0, _react.useCallback)(function (attribute, values) {
    setProps(function (prev) {
      var newFilter = values.reduce(function (r, v) {
        r[v] = true;
        return r;
      }, {});
      var newProps = _objectSpread(_objectSpread({}, prev), {}, {
        valueFilter: _objectSpread(_objectSpread({}, prev.valueFilter), {}, _defineProperty({}, attribute, newFilter))
      });
      setTimeout(function () {
        if (initialPropsRef.current.onChange) initialPropsRef.current.onChange(newProps);
      }, 0);
      return newProps;
    });
  }, []);
  return {
    props: props,
    state: state,
    actions: {
      setProps: setProps,
      updateProp: updateProp,
      toggleFilter: toggleFilter,
      setValuesInFilter: setValuesInFilter,
      setUnusedOrder: function setUnusedOrder(order) {
        return setState(function (s) {
          return _objectSpread(_objectSpread({}, s), {}, {
            unusedOrder: order
          });
        });
      }
    }
  };
}
//# sourceMappingURL=usePivot.js.map