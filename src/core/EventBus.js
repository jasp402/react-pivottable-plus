/**
 * EventBus — Sistema de eventos con nombre para el Headless Core.
 * Permite suscribirse a eventos específicos (filterChanged, sortChanged, etc.)
 * y también a un evento genérico 'stateChanged' para re-renders de React.
 */
export class EventBus {
    constructor() {
        this._listeners = {};
    }

    /**
     * Suscribirse a un evento.
     * @param {string} event - Nombre del evento (e.g. 'filterChanged', 'stateChanged')
     * @param {Function} callback - Función a ejecutar
     * @returns {Function} Función para desuscribirse
     */
    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = new Set();
        }
        this._listeners[event].add(callback);
        return () => this.off(event, callback);
    }

    /**
     * Desuscribirse de un evento.
     */
    off(event, callback) {
        if (this._listeners[event]) {
            this._listeners[event].delete(callback);
        }
    }

    /**
     * Emitir un evento a todos los suscriptores.
     * @param {string} event - Nombre del evento
     * @param {*} payload - Datos del evento
     */
    emit(event, payload) {
        if (this._listeners[event]) {
            for (const cb of this._listeners[event]) {
                try {
                    cb(payload);
                } catch (e) {
                    console.error(`[EventBus] Error in listener for "${event}":`, e);
                }
            }
        }
    }

    /**
     * Suscribirse a un evento una sola vez.
     */
    once(event, callback) {
        const wrappedCb = (payload) => {
            this.off(event, wrappedCb);
            callback(payload);
        };
        return this.on(event, wrappedCb);
    }

    /**
     * Eliminar todos los listeners.
     */
    destroy() {
        this._listeners = {};
    }
}
