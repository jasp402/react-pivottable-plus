/**
 * ModuleRegistry — Registro y ciclo de vida de módulos.
 * Cada módulo implementa: { id, init(engine), destroy(), getApi() }
 */
export class ModuleRegistry {
    constructor(engine) {
        this.engine = engine;
        this._modules = new Map();
    }

    /**
     * Registrar un módulo (factory o instancia).
     * @param {Function|Object} moduleOrFactory - Si es función, se llama para crear la instancia.
     */
    register(moduleOrFactory) {
        const mod = typeof moduleOrFactory === 'function' ? moduleOrFactory() : moduleOrFactory;

        if (!mod.id) {
            throw new Error('[ModuleRegistry] Module must have an "id" property.');
        }

        if (this._modules.has(mod.id)) {
            console.warn(`[ModuleRegistry] Module "${mod.id}" already registered. Replacing.`);
            this._modules.get(mod.id).destroy?.();
        }

        this._modules.set(mod.id, mod);
    }

    /**
     * Inicializar todos los módulos registrados.
     */
    initAll() {
        for (const [, mod] of this._modules) {
            mod.init?.(this.engine);
        }
    }

    /**
     * Obtener un módulo por su ID.
     */
    getModule(id) {
        return this._modules.get(id) || null;
    }

    /**
     * Recolectar todas las APIs de los módulos para inyectarlas en GridApi.
     * @returns {Object} Objeto con todos los métodos combinados
     */
    collectApis() {
        const apis = {};
        for (const [, mod] of this._modules) {
            if (mod.getApi) {
                Object.assign(apis, mod.getApi());
            }
        }
        return apis;
    }

    /**
     * Verificar si un módulo está registrado.
     */
    has(id) {
        return this._modules.has(id);
    }

    /**
     * Destruir todos los módulos.
     */
    destroyAll() {
        for (const [, mod] of this._modules) {
            mod.destroy?.();
        }
        this._modules.clear();
    }
}
