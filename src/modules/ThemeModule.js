/**
 * ThemeModule — Maneja el sistema de temas y tamaños para la tabla
 * 
 * Expone métodos en el GridApi para cambiar programáticamente el tema visual
 * (ej. pvt-theme-default, pvt-theme-dark) y el tamaño (sm, md, lg).
 */
export class ThemeModule {
    constructor() {
        this.id = 'theme';
        this.engine = null;
    }

    init(engine) {
        this.engine = engine;

        // Configurar valores por defecto si no existen
        const config = this.engine.stateManager.getConfig();
        if (!config.theme) {
            this.engine.stateManager.updateConfig({ theme: 'default' });
        }
        if (!config.size) {
            this.engine.stateManager.updateConfig({ size: 'lg' });
        }
    }

    // Se inyecta al GridApi
    getApi() {
        return {
            setTheme: (theme) => {
                this.engine.stateManager.updateConfig({ theme });
                this.engine.eventBus.emit('themeChanged', { theme });
                this.engine._notifyStateChanged();
            },
            setSize: (size) => {
                this.engine.stateManager.updateConfig({ size });
                this.engine.eventBus.emit('sizeChanged', { size });
                this.engine._notifyStateChanged();
            },
            getTheme: () => {
                return this.engine.stateManager.getConfig().theme || 'default';
            },
            getSize: () => {
                return this.engine.stateManager.getConfig().size || 'lg';
            }
        };
    }

    destroy() {
        this.engine = null;
    }
}
