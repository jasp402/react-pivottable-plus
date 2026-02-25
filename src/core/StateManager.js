import { PivotData } from '../Utilities';

/**
 * StateManager — Gestor de estado estructurado.
 * Separa config (props del usuario) de computed (datos derivados).
 */
export class StateManager {
    constructor(initialConfig = {}) {
        const sanitized = Object.keys(initialConfig).reduce((acc, key) => {
            if (initialConfig[key] !== undefined) acc[key] = initialConfig[key];
            return acc;
        }, {});

        this.config = {
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
            size: 'lg',
            ...sanitized,
        };

        this.computed = {
            attrValues: {},
            materializedInput: [],
            unusedOrder: [],
        };

        this._snapshotVersion = 0;
        this._snapshot = null;
        this.materializeData();
    }

    /**
     * Materializar datos: procesar los registros crudos y extraer attrValues.
     */
    materializeData() {
        const materializedInput = [];
        const attrValues = {};
        let recordsProcessed = 0;

        PivotData.forEachRecord(
            this.config.data,
            this.config.derivedAttributes,
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

        this.computed.attrValues = attrValues;
        this.computed.materializedInput = materializedInput;
        this._snapshotVersion++;
    }

    /**
     * Actualizar config. Retorna true si los datos necesitaron rematerialización.
     */
    updateConfig(patch) {
        let needsRematerialize = false;

        if (patch.data !== undefined && patch.data !== this.config.data) {
            needsRematerialize = true;
        }
        if (patch.derivedAttributes !== undefined && patch.derivedAttributes !== this.config.derivedAttributes) {
            needsRematerialize = true;
        }

        this.config = { ...this.config, ...patch };

        if (needsRematerialize) {
            this.materializeData();
        }

        this._snapshotVersion++;
        this._snapshot = null; // Invalidar cache
        return needsRematerialize;
    }

    getConfig() {
        return this.config;
    }

    getComputed() {
        return this.computed;
    }

    /**
     * Generar un snapshot inmutable para React (useSyncExternalStore).
     */
    getSnapshot() {
        if (!this._snapshot) {
            this._snapshot = {
                config: this.config,
                computed: this.computed,
                version: this._snapshotVersion,
            };
        }
        return this._snapshot;
    }
}
