import { useRef, useState, useCallback } from 'react';

/**
 * useColumnResize — Hook para gestionar el redimensionado de columnas.
 *
 * @param {Object} options
 * @param {Object}   options.initialWidths  - Anchos iniciales { [colKey]: number }
 * @param {number}   options.minWidth       - Ancho mínimo en px (default: 50)
 * @param {number}   options.maxWidth       - Ancho máximo en px (default: sin límite)
 * @param {Function} options.onWidthChange  - Callback cuando cambian los anchos
 *
 * @returns {{ widths: Object, startResize: Function, isResizing: boolean }}
 */
export function useColumnResize({
    initialWidths = {},
    minWidth = 50,
    maxWidth = null,
    onWidthChange = null,
} = {}) {
    // widths: { [colKey]: number }
    const [widths, setWidths] = useState(initialWidths);

    // Ref para el estado de drag activo (evita closures obsoletas)
    const dragRef = useRef(null);
    const [isResizing, setIsResizing] = useState(false);

    /**
     * Iniciar resize para una columna específica.
     * @param {string} colKey  - Identificador único de la columna
     * @param {PointerEvent} e
     */
    const startResize = useCallback((colKey, e) => {
        e.preventDefault();
        e.stopPropagation();

        const th = e.currentTarget.closest('th');
        const startWidth = th ? th.offsetWidth : (widths[colKey] || 100);

        dragRef.current = {
            colKey,
            startX: e.clientX,
            startWidth,
        };

        setIsResizing(true);
        document.body.classList.add('pvt-is-resizing');

        const onPointerMove = (moveEvent) => {
            if (!dragRef.current) return;
            const { colKey: key, startX, startWidth: sw } = dragRef.current;
            const delta = moveEvent.clientX - startX;
            let newWidth = sw + delta;

            // Aplicar restricciones
            newWidth = Math.max(minWidth, newWidth);
            if (maxWidth) newWidth = Math.min(maxWidth, newWidth);

            setWidths(prev => ({ ...prev, [key]: newWidth }));
        };

        const onPointerUp = () => {
            if (!dragRef.current) return;
            const { colKey: key } = dragRef.current;

            setWidths(prev => {
                const next = { ...prev };
                if (onWidthChange) {
                    onWidthChange(next);
                }
                return next;
            });

            dragRef.current = null;
            setIsResizing(false);
            document.body.classList.remove('pvt-is-resizing');

            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }, [minWidth, maxWidth, onWidthChange, widths]);

    return { widths, startResize, isResizing };
}
