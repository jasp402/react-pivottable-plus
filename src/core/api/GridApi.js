/**
 * GridApi — API pública para controlar la grilla.
 * Los módulos inyectan métodos adicionales via ModuleRegistry.collectApis().
 */
export class GridApi {
    constructor(engine) {
        this._engine = engine;

        // Inyectar APIs de módulos dinámicamente
        const moduleApis = engine.moduleRegistry.collectApis();
        for (const [key, fn] of Object.entries(moduleApis)) {
            if (!(key in this)) {
                this[key] = fn;
            }
        }
    }

    // ─── Data ─────────────────────────────────────────────────────────────────────
    setRowData(data) {
        this._engine.stateManager.updateConfig({ data });
        this._engine.eventBus.emit('dataChanged', { data });
        this._engine._notifyStateChanged();
    }

    getRowData() {
        return this._engine.stateManager.getConfig().data;
    }

    getMaterializedData() {
        return this._engine.stateManager.getComputed().materializedInput;
    }

    getAttrValues() {
        return this._engine.stateManager.getComputed().attrValues;
    }

    // ─── Config ───────────────────────────────────────────────────────────────────
    updateConfig(patch) {
        this._engine.stateManager.updateConfig(patch);
        this._engine._notifyStateChanged();
    }

    getConfig() {
        return this._engine.stateManager.getConfig();
    }

    // ─── Convenience Setters ──────────────────────────────────────────────────────
    setAggregator(name, vals) {
        const patch = { aggregatorName: name };
        if (vals !== undefined) patch.vals = vals;
        this._engine.stateManager.updateConfig(patch);
        this._engine.eventBus.emit('aggregatorChanged', { name, vals });
        this._engine._notifyStateChanged();
    }

    setRenderer(name) {
        this._engine.stateManager.updateConfig({ rendererName: name });
        this._engine.eventBus.emit('rendererChanged', { name });
        this._engine._notifyStateChanged();
    }

    // ─── Refresh ──────────────────────────────────────────────────────────────────
    refreshCells() {
        this._engine._notifyStateChanged();
    }

    // ─── Dimension Management ─────────────────────────────────────────────────────
    setRows(rows) {
        const cols = this._engine.stateManager.getConfig().cols.filter(c => !rows.includes(c));
        this._engine.stateManager.updateConfig({ rows, cols });
        this._engine.eventBus.emit('dimensionMoved', { rows, cols });
        this._engine._notifyStateChanged();
    }

    setCols(cols) {
        const rows = this._engine.stateManager.getConfig().rows.filter(r => !cols.includes(r));
        this._engine.stateManager.updateConfig({ cols, rows });
        this._engine.eventBus.emit('dimensionMoved', { rows, cols });
        this._engine._notifyStateChanged();
    }

    setUnusedOrder(order) {
        this._engine.stateManager.computed.unusedOrder = order;
        this._engine.stateManager._snapshotVersion++;
        this._engine.stateManager._snapshot = null;
        this._engine._notifyStateChanged();
    }

    /**
     * Aplica múltiples cambios de dimensión en una única notificación atómica.
     * Evita bucles de re-render al mover campos entre zonas durante el drag & drop.
     * @param {object} patch - Objeto con las claves a actualizar: { rows?, cols?, unusedOrder? }
     */
    batchUpdate(patch) {
        const { unusedOrder, ...configPatch } = patch;
        if (Object.keys(configPatch).length > 0) {
            this._engine.stateManager.updateConfig(configPatch);
        }
        if (unusedOrder !== undefined) {
            this._engine.stateManager.computed.unusedOrder = unusedOrder;
            this._engine.stateManager._snapshotVersion++;
            this._engine.stateManager._snapshot = null;
        }
        this._engine.eventBus.emit('dimensionMoved', configPatch);
        this._engine._notifyStateChanged();
    }

    // ─── Events ───────────────────────────────────────────────────────────────────
    addEventListener(event, callback) {
        return this._engine.eventBus.on(event, callback);
    }

    removeEventListener(event, callback) {
        this._engine.eventBus.off(event, callback);
    }

    // ─── Row Model ───────────────────────────────────────────────────────────────
    /**
     * Ejecutar el pipeline completo y obtener el resultado procesado.
     * Útil para obtener pivotData, rowKeys, colKeys, totales.
     */
    processData() {
        return this._engine.rowModel.process();
    }

    getRowModel() {
        return this._engine.rowModel;
    }

    getPivotData() {
        return this._engine.rowModel.getPivotData();
    }

    getRowCount() {
        return this._engine.rowModel.getRowCount();
    }

    getGrandTotal() {
        return this._engine.rowModel.getGrandTotal();
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────────────
    destroy() {
        this._engine.destroy();
    }
}
