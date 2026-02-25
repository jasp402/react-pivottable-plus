/**
 * PaginationModule — Módulo de paginación inyectable.
 *
 * Expone en GridApi:
 *   - setPage(page)
 *   - setPageSize(size)
 *   - nextPage()
 *   - prevPage()
 *   - firstPage()
 *   - lastPage()
 *   - getPaginationInfo()
 */
export function PaginationModule() {
    return {
        id: 'pagination',
        _engine: null,

        init(engine) {
            this._engine = engine;
        },

        getApi() {
            const self = this;
            return {
                setPage(page) {
                    self._engine.stateManager.updateConfig({ page });
                    self._engine.eventBus.emit('pageChanged', { page, pageSize: self._engine.stateManager.getConfig().pageSize });
                    self._engine._notifyStateChanged();
                },

                setPageSize(pageSize) {
                    self._engine.stateManager.updateConfig({ pageSize, page: 1 });
                    self._engine.eventBus.emit('pageChanged', { page: 1, pageSize });
                    self._engine._notifyStateChanged();
                },

                nextPage() {
                    const config = self._engine.stateManager.getConfig();
                    const newPage = config.page + 1;
                    self._engine.stateManager.updateConfig({ page: newPage });
                    self._engine.eventBus.emit('pageChanged', { page: newPage, pageSize: config.pageSize });
                    self._engine._notifyStateChanged();
                },

                prevPage() {
                    const config = self._engine.stateManager.getConfig();
                    const newPage = Math.max(1, config.page - 1);
                    self._engine.stateManager.updateConfig({ page: newPage });
                    self._engine.eventBus.emit('pageChanged', { page: newPage, pageSize: config.pageSize });
                    self._engine._notifyStateChanged();
                },

                firstPage() {
                    self._engine.stateManager.updateConfig({ page: 1 });
                    self._engine.eventBus.emit('pageChanged', { page: 1, pageSize: self._engine.stateManager.getConfig().pageSize });
                    self._engine._notifyStateChanged();
                },

                lastPage(totalPages) {
                    self._engine.stateManager.updateConfig({ page: totalPages });
                    self._engine.eventBus.emit('pageChanged', { page: totalPages, pageSize: self._engine.stateManager.getConfig().pageSize });
                    self._engine._notifyStateChanged();
                },

                setPagination(enabled) {
                    self._engine.stateManager.updateConfig({ pagination: enabled });
                    self._engine._notifyStateChanged();
                },

                getPaginationInfo() {
                    const config = self._engine.stateManager.getConfig();
                    return {
                        page: config.page,
                        pageSize: config.pageSize,
                        pagination: config.pagination,
                    };
                },
            };
        },

        destroy() {
            this._engine = null;
        },
    };
}
