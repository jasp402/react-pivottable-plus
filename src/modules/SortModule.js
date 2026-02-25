/**
 * SortModule — Módulo de ordenamiento inyectable.
 *
 * Expone en GridApi:
 *   - setRowOrder(order)
 *   - setColOrder(order)
 *   - toggleRowOrder()
 *   - toggleColOrder()
 *   - getSortState()
 */
export function SortModule() {
    const SORT_CYCLE = ['key_a_to_z', 'value_a_to_z', 'value_z_to_a'];

    return {
        id: 'sort',
        _engine: null,

        init(engine) {
            this._engine = engine;
        },

        getApi() {
            const self = this;
            return {
                setRowOrder(order) {
                    self._engine.stateManager.updateConfig({ rowOrder: order });
                    self._engine.eventBus.emit('sortChanged', { rowOrder: order, colOrder: self._engine.stateManager.getConfig().colOrder });
                    self._engine._notifyStateChanged();
                },

                setColOrder(order) {
                    self._engine.stateManager.updateConfig({ colOrder: order });
                    self._engine.eventBus.emit('sortChanged', { rowOrder: self._engine.stateManager.getConfig().rowOrder, colOrder: order });
                    self._engine._notifyStateChanged();
                },

                toggleRowOrder() {
                    const config = self._engine.stateManager.getConfig();
                    const currentIdx = SORT_CYCLE.indexOf(config.rowOrder);
                    const nextOrder = SORT_CYCLE[(currentIdx + 1) % SORT_CYCLE.length];
                    self._engine.stateManager.updateConfig({ rowOrder: nextOrder });
                    self._engine.eventBus.emit('sortChanged', { rowOrder: nextOrder, colOrder: config.colOrder });
                    self._engine._notifyStateChanged();
                },

                toggleColOrder() {
                    const config = self._engine.stateManager.getConfig();
                    const currentIdx = SORT_CYCLE.indexOf(config.colOrder);
                    const nextOrder = SORT_CYCLE[(currentIdx + 1) % SORT_CYCLE.length];
                    self._engine.stateManager.updateConfig({ colOrder: nextOrder });
                    self._engine.eventBus.emit('sortChanged', { rowOrder: config.rowOrder, colOrder: nextOrder });
                    self._engine._notifyStateChanged();
                },

                getSortState() {
                    const config = self._engine.stateManager.getConfig();
                    return { rowOrder: config.rowOrder, colOrder: config.colOrder };
                },
            };
        },

        destroy() {
            this._engine = null;
        },
    };
}
