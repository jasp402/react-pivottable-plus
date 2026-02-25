/**
 * ColumnEngine — Motor de columnas para pivot tables.
 *
 * En una pivot table, las "columnas" no son estáticas como en AG Grid.
 * Son generadas dinámicamente de las combinaciones de datos.
 * ColumnDef aquí define cómo se comporta cada ATRIBUTO del dataset
 * cuando aparece como columna, fila, o filtro.
 *
 * Uso:
 *   const engine = new ColumnEngine([
 *     { field: 'Country', headerName: 'País', sortable: true, filterable: true, width: 120 },
 *     { field: 'Year', sortable: true, pinned: 'left' },
 *     { field: 'Sales', headerName: 'Ventas', valueFormatter: v => `$${v}`, width: 100 },
 *   ]);
 */

// Defaults para ColumnDef
const COLUMN_DEF_DEFAULTS = {
    headerName: null,      // null = usar field name
    sortable: true,
    filterable: true,
    width: null,           // null = auto
    minWidth: 50,
    maxWidth: null,
    flex: null,            // null = no flex
    pinned: null,          // 'left' | 'right' | null
    hide: false,
    lockPosition: false,   // true = no se puede reordenar
    lockVisible: false,    // true = no se puede ocultar
    cellRenderer: null,    // Custom render function for cells of this attribute
    valueFormatter: null,  // Custom format function
    cellStyle: null,       // Dynamic cell style
    cellClass: null,       // Dynamic cell class
    headerClass: null,     // CSS class for header
    tooltipField: null,    // Field to show as tooltip
    suppressMenu: false,   // true = no mostrar menú de filtro
    // Pivot-specific:
    allowAsDimension: true,  // Puede ser fila o columna
    allowAsValue: true,      // Puede ser valor (aggregator)
    defaultZone: null,       // 'row' | 'col' | 'val' | 'unused'
};

export class ColumnEngine {
    constructor(columnDefs = []) {
        this._columns = new Map();
        this._order = []; // field names en orden

        for (const def of columnDefs) {
            this.addColumn(def);
        }
    }

    /**
     * Agregar o actualizar una definición de columna.
     */
    addColumn(def) {
        if (!def.field) {
            throw new Error('[ColumnEngine] ColumnDef must have a "field" property.');
        }
        const merged = { ...COLUMN_DEF_DEFAULTS, ...def };
        if (!merged.headerName) merged.headerName = merged.field;
        this._columns.set(def.field, merged);
        if (!this._order.includes(def.field)) {
            this._order.push(def.field);
        }
    }

    /**
     * Setear todas las definiciones de columna (reemplaza existentes).
     */
    setColumnDefs(defs) {
        this._columns.clear();
        this._order = [];
        for (const def of defs) {
            this.addColumn(def);
        }
    }

    /**
     * Obtener definición de columna por field.
     */
    getColumn(field) {
        return this._columns.get(field) || null;
    }

    /**
     * Obtener todas las definiciones.
     */
    getColumnDefs() {
        return this._order.map(field => this._columns.get(field));
    }

    /**
     * Obtener solo definiciones visibles.
     */
    getVisibleColumns() {
        return this.getColumnDefs().filter(col => !col.hide);
    }

    /**
     * Obtener definición o un default genérico para campos sin ColumnDef.
     */
    getColumnOrDefault(field) {
        return this._columns.get(field) || { ...COLUMN_DEF_DEFAULTS, field, headerName: field };
    }

    /**
     * Mover columna de posición.
     */
    moveColumn(fromField, toIndex) {
        const fromIndex = this._order.indexOf(fromField);
        if (fromIndex === -1) return;
        this._order.splice(fromIndex, 1);
        this._order.splice(toIndex, 0, fromField);
    }

    /**
     * Setear visibilidad de una columna.
     */
    setColumnVisible(field, visible) {
        const col = this._columns.get(field);
        if (col && !col.lockVisible) {
            col.hide = !visible;
        }
    }

    /**
     * Setear ancho de una columna.
     */
    setColumnWidth(field, width) {
        const col = this._columns.get(field);
        if (col) {
            col.width = Math.max(col.minWidth, col.maxWidth ? Math.min(width, col.maxWidth) : width);
        }
    }

    /**
     * Auto-size columnas (placeholder — necesita integración con DOM).
     */
    autoSizeColumns(fields = null) {
        const targets = fields || this._order;
        for (const field of targets) {
            const col = this._columns.get(field);
            if (col) {
                col.width = null; // Reset to auto
            }
        }
    }

    /**
     * Setear pin de columna.
     */
    setColumnPinned(field, pinned) {
        const col = this._columns.get(field);
        if (col && !col.lockPosition) {
            col.pinned = pinned; // 'left' | 'right' | null
        }
    }

    /**
     * Obtener columnas que pueden ser dimensiones (filas/cols).
     */
    getDimensionColumns() {
        return this.getColumnDefs().filter(col => col.allowAsDimension);
    }

    /**
     * Obtener columnas que pueden ser valores (aggregator).
     */
    getValueColumns() {
        return this.getColumnDefs().filter(col => col.allowAsValue);
    }

    /**
     * Verificar si existe una definición para un campo.
     */
    has(field) {
        return this._columns.has(field);
    }

    /**
     * Obtener el cellPipeline config específico para un campo.
     * Permite que cada columna tenga su propio cellRenderer/valueFormatter.
     */
    getCellPipelineFor(field) {
        const col = this.getColumnOrDefault(field);
        const config = {};
        if (col.valueFormatter) config.valueFormatter = col.valueFormatter;
        if (col.cellRenderer) config.cellRenderer = col.cellRenderer;
        if (col.cellStyle) config.cellStyle = col.cellStyle;
        if (col.cellClass) config.cellClass = col.cellClass;
        return Object.keys(config).length > 0 ? config : null;
    }
}

export { COLUMN_DEF_DEFAULTS };
