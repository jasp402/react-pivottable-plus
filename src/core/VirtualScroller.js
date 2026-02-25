/**
 * VirtualScroller — Motor de virtualización bidireccional (filas + columnas).
 *
 * Calcula qué filas y columnas deben renderizarse basado en la posición del scroll.
 * Los totales (fila de totales, columna de totales) siempre se calculan sobre TODOS los datos.
 * La virtualización solo afecta al DOM.
 */
export class VirtualScroller {
    constructor(config = {}) {
        this.rowHeight = config.rowHeight || 32;
        this.colWidth = config.colWidth || 100;
        this.overscanRows = config.overscanRows || 5;
        this.overscanCols = config.overscanCols || 3;
        this.containerHeight = config.containerHeight || 400;
        this.containerWidth = config.containerWidth || 800;
        this.threshold = config.threshold || 100; // Activar auto si total > threshold
        this.enabled = config.enabled !== undefined ? config.enabled : true;
    }

    /**
     * Determinar si virtualización debe activarse automáticamente.
     */
    shouldVirtualize(totalRows, totalCols) {
        if (!this.enabled) return { rows: false, cols: false };
        return {
            rows: totalRows > this.threshold,
            cols: totalCols > this.threshold,
        };
    }

    /**
     * Calcular rango visible de filas.
     * @param {number} scrollTop - Posición vertical del scroll
     * @param {number} totalRows - Total de filas en el dataset
     * @returns {{ startIndex, endIndex, topPadding, bottomPadding, visibleCount }}
     */
    getVisibleRowRange(scrollTop, totalRows) {
        if (!this.enabled || totalRows <= this.threshold) {
            return {
                startIndex: 0,
                endIndex: totalRows - 1,
                topPadding: 0,
                bottomPadding: 0,
                visibleCount: totalRows,
            };
        }

        const visibleCount = Math.ceil(this.containerHeight / this.rowHeight);
        const startIndex = Math.max(0, Math.floor(scrollTop / this.rowHeight) - this.overscanRows);
        const endIndex = Math.min(totalRows - 1, startIndex + visibleCount + 2 * this.overscanRows);

        return {
            startIndex,
            endIndex,
            topPadding: startIndex * this.rowHeight,
            bottomPadding: Math.max(0, (totalRows - endIndex - 1) * this.rowHeight),
            visibleCount: endIndex - startIndex + 1,
        };
    }

    /**
     * Calcular rango visible de columnas.
     * @param {number} scrollLeft - Posición horizontal del scroll
     * @param {number} totalCols - Total de columnas
     * @returns {{ startIndex, endIndex, leftPadding, rightPadding, visibleCount }}
     */
    getVisibleColRange(scrollLeft, totalCols) {
        if (!this.enabled || totalCols <= this.threshold) {
            return {
                startIndex: 0,
                endIndex: totalCols - 1,
                leftPadding: 0,
                rightPadding: 0,
                visibleCount: totalCols,
            };
        }

        const visibleCount = Math.ceil(this.containerWidth / this.colWidth);
        const startIndex = Math.max(0, Math.floor(scrollLeft / this.colWidth) - this.overscanCols);
        const endIndex = Math.min(totalCols - 1, startIndex + visibleCount + 2 * this.overscanCols);

        return {
            startIndex,
            endIndex,
            leftPadding: startIndex * this.colWidth,
            rightPadding: Math.max(0, (totalCols - endIndex - 1) * this.colWidth),
            visibleCount: endIndex - startIndex + 1,
        };
    }

    /**
     * Altura total de todas las filas (para el scroll container).
     */
    getTotalHeight(totalRows) {
        return totalRows * this.rowHeight;
    }

    /**
     * Ancho total de todas las columnas (para el scroll container).
     */
    getTotalWidth(totalCols) {
        return totalCols * this.colWidth;
    }

    /**
     * Actualizar configuración.
     */
    updateConfig(patch) {
        Object.assign(this, patch);
    }
}
