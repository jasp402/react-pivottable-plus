import { PivotEngine } from '../core/PivotEngine';
import { FilterModule } from '../modules/FilterModule';
import { PaginationModule } from '../modules/PaginationModule';
import { SortModule } from '../modules/SortModule';

const testData = [
    { Country: 'USA', Year: '2020', Sales: 100, Profit: 50 },
    { Country: 'USA', Year: '2021', Sales: 150, Profit: 70 },
    { Country: 'Canada', Year: '2020', Sales: 80, Profit: 30 },
    { Country: 'Canada', Year: '2021', Sales: 120, Profit: 55 },
    { Country: 'Mexico', Year: '2020', Sales: 60, Profit: 20 },
    { Country: 'Mexico', Year: '2021', Sales: 90, Profit: 40 },
];

describe('PivotEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new PivotEngine({
            data: testData,
            rows: ['Country'],
            cols: ['Year'],
            aggregatorName: 'Count',
            modules: [FilterModule, PaginationModule, SortModule],
        });
    });

    afterEach(() => {
        engine.destroy();
    });

    describe('Inicialización', () => {
        it('crea el engine con datos válidos', () => {
            expect(engine).toBeDefined();
            expect(engine.gridApi).toBeDefined();
            expect(engine.columnApi).toBeDefined();
        });

        it('materializa los datos correctamente', () => {
            const materialized = engine.gridApi.getMaterializedData();
            expect(materialized).toHaveLength(6);
            expect(materialized[0]).toHaveProperty('Country');
            expect(materialized[0]).toHaveProperty('Year');
        });

        it('extrae attrValues correctamente', () => {
            const attrValues = engine.gridApi.getAttrValues();
            expect(Object.keys(attrValues)).toContain('Country');
            expect(Object.keys(attrValues)).toContain('Year');
            expect(Object.keys(attrValues)).toContain('Sales');
        });

        it('devuelve el config inicial correcto', () => {
            const config = engine.gridApi.getConfig();
            expect(config.rows).toEqual(['Country']);
            expect(config.cols).toEqual(['Year']);
            expect(config.aggregatorName).toBe('Count');
        });
    });

    describe('Snapshot y suscripción', () => {
        it('devuelve un snapshot válido', () => {
            const snapshot = engine.getSnapshot();
            expect(snapshot).toBeDefined();
            expect(snapshot).toHaveProperty('props');
            expect(snapshot).toHaveProperty('state');
        });

        it('notifica a los suscriptores cuando cambia el estado', () => {
            const listener = jest.fn();
            engine.subscribe(listener);
            engine.gridApi.updateConfig({ aggregatorName: 'Sum' });
            expect(listener).toHaveBeenCalled();
        });

        it('permite desuscribirse', () => {
            const listener = jest.fn();
            const unsub = engine.subscribe(listener);
            unsub();
            engine.gridApi.updateConfig({ aggregatorName: 'Sum' });
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('GridApi — Config', () => {
        it('actualiza config con updateConfig', () => {
            engine.gridApi.updateConfig({ aggregatorName: 'Sum', vals: ['Sales'] });
            const config = engine.gridApi.getConfig();
            expect(config.aggregatorName).toBe('Sum');
            expect(config.vals).toEqual(['Sales']);
        });

        it('setAggregator actualiza nombre y vals', () => {
            engine.gridApi.setAggregator('Sum', ['Sales']);
            const config = engine.gridApi.getConfig();
            expect(config.aggregatorName).toBe('Sum');
            expect(config.vals).toEqual(['Sales']);
        });

        it('setRenderer actualiza el nombre del renderer', () => {
            engine.gridApi.setRenderer('Table Heatmap');
            expect(engine.gridApi.getConfig().rendererName).toBe('Table Heatmap');
        });

        it('setRows actualiza filas y remueve duplicados de cols', () => {
            engine.gridApi.setCols(['Country', 'Year']);
            engine.gridApi.setRows(['Year']);
            const config = engine.gridApi.getConfig();
            expect(config.rows).toEqual(['Year']);
            // 'Year' ya no debe estar en cols
            expect(config.cols).not.toContain('Year');
        });

        it('setCols actualiza columnas y remueve duplicados de rows', () => {
            engine.gridApi.setRows(['Country', 'Year']);
            engine.gridApi.setCols(['Country']);
            const config = engine.gridApi.getConfig();
            expect(config.cols).toEqual(['Country']);
            expect(config.rows).not.toContain('Country');
        });
    });

    describe('GridApi — Data', () => {
        it('setRowData actualiza los datos y rematerializa', () => {
            const newData = [
                { Country: 'UK', Year: '2022', Sales: 200 },
            ];
            engine.gridApi.setRowData(newData);
            const materialized = engine.gridApi.getMaterializedData();
            expect(materialized).toHaveLength(1);
            expect(materialized[0].Country).toBe('UK');
        });
    });

    describe('GridApi — Row Model', () => {
        it('processData devuelve resultados de pivot', () => {
            const result = engine.gridApi.processData();
            expect(result).toHaveProperty('pivotData');
            expect(result).toHaveProperty('allRowKeys');
            expect(result).toHaveProperty('allColKeys');
            expect(result.allRowKeys.length).toBeGreaterThan(0);
            expect(result.allColKeys.length).toBeGreaterThan(0);
        });

        it('getRowCount devuelve el número correcto de filas', () => {
            engine.gridApi.processData();
            expect(engine.gridApi.getRowCount()).toBe(3); // USA, Canada, Mexico
        });
    });

    describe('Events', () => {
        it('addEventListener recibe eventos', () => {
            const callback = jest.fn();
            engine.gridApi.addEventListener('dataChanged', callback);
            engine.gridApi.setRowData(testData);
            expect(callback).toHaveBeenCalledWith(expect.objectContaining({ data: testData }));
        });
    });
});
