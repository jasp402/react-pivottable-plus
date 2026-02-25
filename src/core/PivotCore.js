import { PivotData } from '../Utilities';

export class PivotCore {
    constructor(initialProps = {}) {
        this.listeners = new Set();

        const sanitizedInitialProps = Object.keys(initialProps).reduce((acc, key) => {
            if (initialProps[key] !== undefined) {
                acc[key] = initialProps[key];
            }
            return acc;
        }, {});

        this.props = {
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
            ...sanitizedInitialProps,
        };

        this.state = {
            attrValues: {},
            materializedInput: [],
            unusedOrder: []
        };

        // Calculate metadata on init
        this.calculateData();

        // Cache to keep React references stable 
        this._snapshot = this.generateSnapshot();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    notify() {
        this._snapshot = this.generateSnapshot();
        for (const listener of this.listeners) {
            listener(this._snapshot);
        }
    }

    generateSnapshot() {
        return {
            props: this.props,
            state: this.state,
        };
    }

    getSnapshot() {
        return this._snapshot;
    }

    calculateData() {
        const materializedInput = [];
        const attrValues = {};
        let recordsProcessed = 0;

        PivotData.forEachRecord(
            this.props.data,
            this.props.derivedAttributes,
            (record) => {
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

        this.state = {
            ...this.state,
            attrValues,
            materializedInput,
        };
    }

    updateProps(newProps) {
        let shouldRecalculateData = false;

        // Check if data dependencies changed
        if (newProps.data !== undefined && newProps.data !== this.props.data) {
            shouldRecalculateData = true;
        }
        if (newProps.derivedAttributes !== undefined && newProps.derivedAttributes !== this.props.derivedAttributes) {
            shouldRecalculateData = true;
        }

        this.props = { ...this.props, ...newProps };

        if (shouldRecalculateData) {
            this.calculateData();
        }

        // Trigger onChange hook if provided in initial properties, keeping backward compatibility
        if (this.props.onChange) {
            this.props.onChange(this.props);
        }

        this.notify();
    }

    updateProp(key, value) {
        let finalValue = value;
        if (Array.isArray(value) && (key === 'rows' || key === 'cols' || key === 'vals')) {
            finalValue = value.filter(v => v && v.trim() !== '');
        }

        const newProps = { [key]: finalValue };

        if (key === 'rows') {
            newProps.cols = this.props.cols.filter(c => !finalValue.includes(c));
        } else if (key === 'cols') {
            newProps.rows = this.props.rows.filter(r => !finalValue.includes(r));
        }

        this.updateProps(newProps);
    }

    toggleFilter(attribute, value) {
        const filter = { ...(this.props.valueFilter[attribute] || {}) };
        if (value in filter) {
            delete filter[value];
        } else {
            filter[value] = true;
        }
        const newValueFilter = { ...this.props.valueFilter, [attribute]: filter };
        this.updateProps({ valueFilter: newValueFilter });
    }

    setValuesInFilter(attribute, values) {
        const newFilter = values.reduce((r, v) => {
            r[v] = true;
            return r;
        }, {});
        const newValueFilter = { ...this.props.valueFilter, [attribute]: newFilter };
        this.updateProps({ valueFilter: newValueFilter });
    }

    addValuesToFilter(attribute, values) {
        const filter = { ...(this.props.valueFilter[attribute] || {}) };
        for (const v of values) {
            filter[v] = true;
        }
        const newValueFilter = { ...this.props.valueFilter, [attribute]: filter };
        this.updateProps({ valueFilter: newValueFilter });
    }

    removeValuesFromFilter(attribute, values) {
        const filter = { ...(this.props.valueFilter[attribute] || {}) };
        for (const v of values) {
            delete filter[v];
        }
        const newValueFilter = { ...this.props.valueFilter, [attribute]: filter };
        this.updateProps({ valueFilter: newValueFilter });
    }

    setUnusedOrder(order) {
        this.state = { ...this.state, unusedOrder: order };
        this.notify();
    }
}
