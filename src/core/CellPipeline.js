/**
 * CellPipeline — Pipeline de renderizado de celdas.
 *
 * Cada celda pasa por: valueGetter → valueFormatter → cellRenderer → cellStyle
 *
 * Uso:
 *   const pipeline = new CellPipeline({
 *     valueFormatter: ({ value }) => `$${value.toFixed(2)}`,
 *     cellStyle: ({ value }) => value < 0 ? { color: 'red' } : null,
 *   });
 *
 *   const result = pipeline.process({ aggregator, rowKey, colKey, pivotData });
 *   // → { value, formattedValue, rendered, style, className }
 */
export class CellPipeline {
    constructor(config = {}) {
        this.valueGetter = config.valueGetter || CellPipeline.defaultValueGetter;
        this.valueFormatter = config.valueFormatter || CellPipeline.defaultValueFormatter;
        this.cellRenderer = config.cellRenderer || null;
        this.cellStyle = config.cellStyle || null;
        this.cellClass = config.cellClass || null;
    }

    /**
     * Procesar una celda a través del pipeline completo.
     * @param {Object} params
     * @param {Object} params.aggregator - El aggregator de PivotData
     * @param {Array} params.rowKey - Clave de la fila
     * @param {Array} params.colKey - Clave de la columna
     * @param {Object} [params.pivotData] - Instancia de PivotData (opcional)
     * @returns {{ value, formattedValue, rendered, style, className }}
     */
    process(params) {
        const { aggregator, rowKey, colKey, pivotData } = params;

        // 1. Value Getter
        const value = this.valueGetter({ aggregator, rowKey, colKey, pivotData });

        // 2. Value Formatter
        const formattedValue = this.valueFormatter({
            value,
            aggregator,
            rowKey,
            colKey,
            pivotData,
        });

        // 3. Cell Renderer (optional — if not set, use formattedValue)
        const rendered = this.cellRenderer
            ? this.cellRenderer({
                value,
                formattedValue,
                aggregator,
                rowKey,
                colKey,
                pivotData,
            })
            : formattedValue;

        // 4. Cell Style (optional)
        const style = this.cellStyle
            ? this.cellStyle({ value, formattedValue, rowKey, colKey, pivotData })
            : null;

        // 5. Cell Class (optional)
        const className = this.cellClass
            ? this.cellClass({ value, formattedValue, rowKey, colKey, pivotData })
            : null;

        return { value, formattedValue, rendered, style, className };
    }

    /**
     * Procesar una celda de total (fila o columna).
     */
    processTotal(params) {
        const { aggregator, rowKey = [], colKey = [], pivotData, type = 'row' } = params;
        const value = aggregator.value();
        const formattedValue = aggregator.format(value);

        const style = this.cellStyle
            ? this.cellStyle({ value, formattedValue, rowKey, colKey, pivotData, isTotal: true, totalType: type })
            : null;

        return { value, formattedValue, rendered: formattedValue, style, className: null };
    }

    // ─── Defaults ─────────────────────────────────────────────────────────────────

    static defaultValueGetter({ aggregator }) {
        return aggregator.value();
    }

    static defaultValueFormatter({ value, aggregator }) {
        return aggregator.format(value);
    }

    /**
     * Crear un pipeline con defaults (backward compatible, no cambia nada).
     */
    static default() {
        return new CellPipeline();
    }
}
