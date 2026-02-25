import { VirtualScroller } from '../core/VirtualScroller';

/**
 * VirtualizationModule — Módulo de virtualización registrable.
 *
 * Expone en GridApi:
 *   - setRowHeight(height)
 *   - setColWidth(width)
 *   - setOverscan(rows, cols)
 *   - setContainerSize(height, width)
 *   - setVirtualizationEnabled(enabled)
 *   - getVirtualScroller()
 */
export function VirtualizationModule(config = {}) {
    return {
        id: 'virtualization',
        _engine: null,
        _scroller: null,

        init(engine) {
            this._engine = engine;
            this._scroller = new VirtualScroller(config);
        },

        getApi() {
            const self = this;
            return {
                setRowHeight(height) {
                    self._scroller.updateConfig({ rowHeight: height });
                    self._engine._notifyStateChanged();
                },

                setColWidth(width) {
                    self._scroller.updateConfig({ colWidth: width });
                    self._engine._notifyStateChanged();
                },

                setOverscan(rows, cols) {
                    self._scroller.updateConfig({
                        overscanRows: rows,
                        ...(cols !== undefined ? { overscanCols: cols } : {}),
                    });
                    self._engine._notifyStateChanged();
                },

                setContainerSize(height, width) {
                    self._scroller.updateConfig({
                        containerHeight: height,
                        ...(width !== undefined ? { containerWidth: width } : {}),
                    });
                    self._engine._notifyStateChanged();
                },

                setVirtualizationEnabled(enabled) {
                    self._scroller.updateConfig({ enabled });
                    self._engine._notifyStateChanged();
                },

                setVirtualizationThreshold(threshold) {
                    self._scroller.updateConfig({ threshold });
                    self._engine._notifyStateChanged();
                },

                getVirtualScroller() {
                    return self._scroller;
                },
            };
        },

        destroy() {
            this._engine = null;
            this._scroller = null;
        },
    };
}
