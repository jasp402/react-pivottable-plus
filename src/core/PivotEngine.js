import { EventBus } from './EventBus';
import { StateManager } from './StateManager';
import { ModuleRegistry } from './ModuleRegistry';
import { ColumnEngine } from './ColumnEngine';
import { ClientSideRowModel } from './rowModels/ClientSideRowModel';
import { GridApi } from './api/GridApi';
import { ColumnApi } from './api/ColumnApi';

/**
 * PivotEngine — Orquestador principal del Headless Core.
 *
 * Uso:
 *   const engine = new PivotEngine({
 *     data: [...],
 *     modules: [FilterModule, PaginationModule],
 *     columnDefs: [{ field: 'Country', sortable: true, width: 120 }],
 *     rows: ['Country'],
 *     cols: ['Year'],
 *   });
 *
 *   const api = engine.gridApi;
 *   api.setRowData(newData);
 *   api.addEventListener('filterChanged', (e) => console.log(e));
 */
export class PivotEngine {
    constructor(config = {}) {
        // Extraer modules y columnDefs del config
        const { modules = [], columnDefs = [], ...stateConfig } = config;

        this.eventBus = new EventBus();
        this.stateManager = new StateManager(stateConfig);
        this.moduleRegistry = new ModuleRegistry(this);
        this.columnEngine = new ColumnEngine(columnDefs);
        this.rowModel = new ClientSideRowModel();

        // Inicializar row model
        this.rowModel.init(this);

        // Registrar módulos
        for (const mod of modules) {
            this.moduleRegistry.register(mod);
        }

        // Inicializar módulos
        this.moduleRegistry.initAll();

        // Crear APIs (después de init para que los módulos ya estén listos)
        this._gridApi = new GridApi(this);
        this._columnApi = new ColumnApi(this);

        // Snapshot cache para React
        this._reactSnapshot = null;
    }

    get gridApi() {
        return this._gridApi;
    }

    get columnApi() {
        return this._columnApi;
    }

    /**
     * Obtener snapshot para useSyncExternalStore de React.
     */
    getSnapshot() {
        const stateSnapshot = this.stateManager.getSnapshot();
        if (!this._reactSnapshot || this._reactSnapshot._version !== stateSnapshot.version) {
            this._reactSnapshot = {
                props: stateSnapshot.config,
                state: stateSnapshot.computed,
                _version: stateSnapshot.version,
            };
        }
        return this._reactSnapshot;
    }

    /**
     * Suscribirse a cambios de estado (para React adapter).
     */
    subscribe(listener) {
        return this.eventBus.on('stateChanged', listener);
    }

    /**
     * Notificar cambio de estado (usado internamente por GridApi y módulos).
     */
    _notifyStateChanged() {
        this._reactSnapshot = null; // Invalidar cache
        const snapshot = this.getSnapshot();
        this.eventBus.emit('stateChanged', snapshot);

        // Backward compatibility: llamar onChange si existe
        const config = this.stateManager.getConfig();
        if (config.onChange) {
            config.onChange(config);
        }
    }

    /**
     * Destruir el engine y todos sus módulos.
     */
    destroy() {
        this.moduleRegistry.destroyAll();
        this.rowModel.destroy();
        this.eventBus.destroy();
    }
}
