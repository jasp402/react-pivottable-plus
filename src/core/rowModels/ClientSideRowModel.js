import { PivotData } from '../../Utilities';

/**
 * ClientSideRowModel — Pipeline de datos client-side.
 *
 * Formaliza el flujo:
 *   Raw Data → Derive → Filter → Pivot (PivotData) → Sort → Paginate
 *
 * Todos los cálculos ocurren en memoria sobre el dataset completo.
 * Los totales siempre se calculan sobre TODOS los datos.
 */
export class ClientSideRowModel {
    constructor() {
        this.type = 'clientSide';
        this._engine = null;
        this._pivotData = null;
        this._allRowKeys = [];
        this._allColKeys = [];
        this._displayedRowKeys = [];
        this._displayedColKeys = [];
    }

    /**
     * Inicializar con referencia al engine.
     */
    init(engine) {
        this._engine = engine;
    }

    /**
     * Ejecutar el pipeline completo.
     * Llamado automáticamente cuando cambia el estado.
     * @returns {{ pivotData, allRowKeys, allColKeys, displayedRowKeys, totalRowCount }}
     */
    process() {
        const config = this._engine.stateManager.getConfig();
        const computed = this._engine.stateManager.getComputed();

        // 1. Crear PivotData con los datos materializados
        //    PivotData internamente hace: derive → filter → group → aggregate
        this._pivotData = new PivotData({
            ...config,
            data: computed.materializedInput,
        });

        // 2. Obtener todas las keys (antes de paginación)
        this._allRowKeys = this._pivotData.getRowKeys();
        this._allColKeys = this._pivotData.getColKeys();

        // 3. Aplicar paginación a las filas (sin afectar cálculos de totales)
        let displayedRowKeys = this._allRowKeys;
        let startOffset = 0;

        if (config.pagination && config.pageSize) {
            const start = ((config.page || 1) - 1) * config.pageSize;
            startOffset = start;
            const end = start + config.pageSize;
            displayedRowKeys = this._allRowKeys.slice(start, end);
        }

        this._displayedRowKeys = displayedRowKeys;
        this._displayedColKeys = this._allColKeys;

        return {
            pivotData: this._pivotData,
            allRowKeys: this._allRowKeys,
            allColKeys: this._allColKeys,
            displayedRowKeys: this._displayedRowKeys,
            displayedColKeys: this._displayedColKeys,
            totalRowCount: this._allRowKeys.length,
            totalColCount: this._allColKeys.length,
            startOffset,
            totalPages: config.pagination
                ? Math.ceil(this._allRowKeys.length / (config.pageSize || 20))
                : 1,
        };
    }

    // ─── Accessors ────────────────────────────────────────────────────────────────

    getPivotData() {
        return this._pivotData;
    }

    getAllRowKeys() {
        return this._allRowKeys;
    }

    getAllColKeys() {
        return this._allColKeys;
    }

    getDisplayedRowKeys() {
        return this._displayedRowKeys;
    }

    getRowCount() {
        return this._allRowKeys.length;
    }

    /**
     * Obtener un aggregator para una celda o total.
     * Siempre calcula sobre TODOS los datos.
     */
    getAggregator(rowKey, colKey) {
        if (!this._pivotData) return { value: () => null, format: () => '' };
        return this._pivotData.getAggregator(rowKey, colKey);
    }

    /**
     * Obtener totales (siempre sobre dataset completo).
     */
    getGrandTotal() {
        return this.getAggregator([], []);
    }

    getRowTotal(rowKey) {
        return this.getAggregator(rowKey, []);
    }

    getColTotal(colKey) {
        return this.getAggregator([], colKey);
    }

    /**
     * Iterar sobre cada registro que coincida con ciertos criterios.
     */
    forEachMatchingRecord(criteria, callback) {
        if (this._pivotData) {
            this._pivotData.forEachMatchingRecord(criteria, callback);
        }
    }

    destroy() {
        this._engine = null;
        this._pivotData = null;
        this._allRowKeys = [];
        this._allColKeys = [];
        this._displayedRowKeys = [];
    }
}
