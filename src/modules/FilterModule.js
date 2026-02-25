/**
 * FilterModule — Módulo de filtros inyectable.
 *
 * Expone en GridApi:
 *   - setFilter(attr, values)
 *   - toggleFilter(attr, value)
 *   - clearFilter(attr)
 *   - clearAllFilters()
 *   - getFilter(attr)
 */
export function FilterModule() {
    return {
        id: 'filter',
        _engine: null,

        init(engine) {
            this._engine = engine;
        },

        getApi() {
            const self = this;
            return {
                setFilter(attribute, values) {
                    const config = self._engine.stateManager.getConfig();
                    const newFilter = Array.isArray(values)
                        ? values.reduce((r, v) => { r[v] = true; return r; }, {})
                        : values;
                    const newValueFilter = { ...config.valueFilter, [attribute]: newFilter };
                    self._engine.stateManager.updateConfig({ valueFilter: newValueFilter });
                    self._engine.eventBus.emit('filterChanged', { attribute, filter: newFilter });
                    self._engine._notifyStateChanged();
                },

                toggleFilter(attribute, value) {
                    const config = self._engine.stateManager.getConfig();
                    const filter = { ...(config.valueFilter[attribute] || {}) };
                    if (value in filter) {
                        delete filter[value];
                    } else {
                        filter[value] = true;
                    }
                    const newValueFilter = { ...config.valueFilter, [attribute]: filter };
                    self._engine.stateManager.updateConfig({ valueFilter: newValueFilter });
                    self._engine.eventBus.emit('filterChanged', { attribute, filter });
                    self._engine._notifyStateChanged();
                },

                addValuesToFilter(attribute, values) {
                    const config = self._engine.stateManager.getConfig();
                    const filter = { ...(config.valueFilter[attribute] || {}) };
                    for (const v of values) {
                        filter[v] = true;
                    }
                    const newValueFilter = { ...config.valueFilter, [attribute]: filter };
                    self._engine.stateManager.updateConfig({ valueFilter: newValueFilter });
                    self._engine.eventBus.emit('filterChanged', { attribute, filter });
                    self._engine._notifyStateChanged();
                },

                removeValuesFromFilter(attribute, values) {
                    const config = self._engine.stateManager.getConfig();
                    const filter = { ...(config.valueFilter[attribute] || {}) };
                    for (const v of values) {
                        delete filter[v];
                    }
                    const newValueFilter = { ...config.valueFilter, [attribute]: filter };
                    self._engine.stateManager.updateConfig({ valueFilter: newValueFilter });
                    self._engine.eventBus.emit('filterChanged', { attribute, filter });
                    self._engine._notifyStateChanged();
                },

                clearFilter(attribute) {
                    const config = self._engine.stateManager.getConfig();
                    const newValueFilter = { ...config.valueFilter };
                    delete newValueFilter[attribute];
                    self._engine.stateManager.updateConfig({ valueFilter: newValueFilter });
                    self._engine.eventBus.emit('filterChanged', { attribute, filter: {} });
                    self._engine._notifyStateChanged();
                },

                clearAllFilters() {
                    self._engine.stateManager.updateConfig({ valueFilter: {} });
                    self._engine.eventBus.emit('filterChanged', { attribute: null, filter: {} });
                    self._engine._notifyStateChanged();
                },

                getFilter(attribute) {
                    return self._engine.stateManager.getConfig().valueFilter[attribute] || {};
                },

                getAllFilters() {
                    return self._engine.stateManager.getConfig().valueFilter;
                },
            };
        },

        destroy() {
            this._engine = null;
        },
    };
}
