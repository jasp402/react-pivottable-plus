/**
 * ColumnApi — API pública para controlar columnas.
 * Delega al ColumnEngine del PivotEngine.
 */
export class ColumnApi {
    constructor(engine) {
        this._engine = engine;
    }

    // ─── Column Definitions ───────────────────────────────────────────────────────

    setColumnDefs(defs) {
        this._engine.columnEngine.setColumnDefs(defs);
        this._engine.eventBus.emit('columnDefsChanged', { columnDefs: defs });
        this._engine._notifyStateChanged();
    }

    getColumnDefs() {
        return this._engine.columnEngine.getColumnDefs();
    }

    getColumn(field) {
        return this._engine.columnEngine.getColumn(field);
    }

    getColumnOrDefault(field) {
        return this._engine.columnEngine.getColumnOrDefault(field);
    }

    // ─── Visibility ───────────────────────────────────────────────────────────────

    setColumnVisible(field, visible) {
        this._engine.columnEngine.setColumnVisible(field, visible);

        // Sincronizar con hiddenAttributes del StateManager
        const config = this._engine.stateManager.getConfig();
        const hiddenAttributes = [...(config.hiddenAttributes || [])];
        if (!visible && !hiddenAttributes.includes(field)) {
            hiddenAttributes.push(field);
        } else if (visible) {
            const idx = hiddenAttributes.indexOf(field);
            if (idx > -1) hiddenAttributes.splice(idx, 1);
        }
        this._engine.stateManager.updateConfig({ hiddenAttributes });
        this._engine.eventBus.emit('columnVisibleChanged', { field, visible });
        this._engine._notifyStateChanged();
    }

    getVisibleColumns() {
        return this._engine.columnEngine.getVisibleColumns();
    }

    getHiddenAttributes() {
        return this._engine.stateManager.getConfig().hiddenAttributes;
    }

    // ─── Sizing ───────────────────────────────────────────────────────────────────

    setColumnWidth(field, width) {
        this._engine.columnEngine.setColumnWidth(field, width);
        this._engine.eventBus.emit('columnResized', { field, width });
        this._engine._notifyStateChanged();
    }

    autoSizeColumns(fields) {
        this._engine.columnEngine.autoSizeColumns(fields);
        this._engine._notifyStateChanged();
    }

    // ─── Position ─────────────────────────────────────────────────────────────────

    moveColumn(field, toIndex) {
        this._engine.columnEngine.moveColumn(field, toIndex);
        this._engine.eventBus.emit('columnMoved', { field, toIndex });
        this._engine._notifyStateChanged();
    }

    setColumnPinned(field, pinned) {
        this._engine.columnEngine.setColumnPinned(field, pinned);
        this._engine.eventBus.emit('columnPinned', { field, pinned });
        this._engine._notifyStateChanged();
    }

    // ─── Pivot-Specific ───────────────────────────────────────────────────────────

    getColumns() {
        const config = this._engine.stateManager.getConfig();
        return {
            rows: config.rows,
            cols: config.cols,
            vals: config.vals,
        };
    }

    getDimensionColumns() {
        return this._engine.columnEngine.getDimensionColumns();
    }

    getValueColumns() {
        return this._engine.columnEngine.getValueColumns();
    }

    /**
     * Obtener el cell pipeline específico para un campo.
     */
    getCellPipelineFor(field) {
        return this._engine.columnEngine.getCellPipelineFor(field);
    }
}
