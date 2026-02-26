import { PivotEngine } from '../core/PivotEngine';
import { FilterModule } from '../modules/FilterModule';
import { PaginationModule } from '../modules/PaginationModule';
import { SortModule } from '../modules/SortModule';

const testData = [
    { Country: 'USA', Year: '2020', Sales: 100 },
    { Country: 'USA', Year: '2021', Sales: 150 },
    { Country: 'Canada', Year: '2020', Sales: 80 },
    { Country: 'Canada', Year: '2021', Sales: 120 },
    { Country: 'Mexico', Year: '2020', Sales: 60 },
    { Country: 'Mexico', Year: '2021', Sales: 90 },
];

describe('FilterModule', () => {
    let engine;

    beforeEach(() => {
        engine = new PivotEngine({
            data: testData,
            rows: ['Country'],
            cols: ['Year'],
            modules: [FilterModule, PaginationModule, SortModule],
        });
    });

    afterEach(() => {
        engine.destroy();
    });

    it('setFilter excluye valores del filtro', () => {
        engine.gridApi.setFilter('Country', ['USA']);
        const filter = engine.gridApi.getFilter('Country');
        expect(filter).toHaveProperty('USA', true);

        const config = engine.gridApi.getConfig();
        expect(config.valueFilter.Country.USA).toBe(true);
    });

    it('toggleFilter alterna un valor', () => {
        // Activar filtro
        engine.gridApi.toggleFilter('Country', 'USA');
        expect(engine.gridApi.getFilter('Country')).toHaveProperty('USA', true);

        // Desactivar filtro
        engine.gridApi.toggleFilter('Country', 'USA');
        expect(engine.gridApi.getFilter('Country')).not.toHaveProperty('USA');
    });

    it('clearFilter limpia un atributo específico', () => {
        engine.gridApi.setFilter('Country', ['USA', 'Canada']);
        engine.gridApi.clearFilter('Country');

        const config = engine.gridApi.getConfig();
        expect(config.valueFilter.Country).toBeUndefined();
    });

    it('clearAllFilters limpia todos los filtros', () => {
        engine.gridApi.setFilter('Country', ['USA']);
        engine.gridApi.setFilter('Year', ['2020']);
        engine.gridApi.clearAllFilters();

        const config = engine.gridApi.getConfig();
        expect(config.valueFilter).toEqual({});
    });

    it('addValuesToFilter agrega valores al filtro existente', () => {
        engine.gridApi.setFilter('Country', ['USA']);
        engine.gridApi.addValuesToFilter('Country', ['Canada']);

        const filter = engine.gridApi.getFilter('Country');
        expect(filter).toHaveProperty('USA', true);
        expect(filter).toHaveProperty('Canada', true);
    });

    it('removeValuesFromFilter remueve valores específicos', () => {
        engine.gridApi.setFilter('Country', ['USA', 'Canada']);
        engine.gridApi.removeValuesFromFilter('Country', ['USA']);

        const filter = engine.gridApi.getFilter('Country');
        expect(filter).not.toHaveProperty('USA');
        expect(filter).toHaveProperty('Canada', true);
    });

    it('getAllFilters devuelve todos los filtros activos', () => {
        engine.gridApi.setFilter('Country', ['USA']);
        engine.gridApi.setFilter('Year', ['2020']);

        const allFilters = engine.gridApi.getAllFilters();
        expect(allFilters).toHaveProperty('Country');
        expect(allFilters).toHaveProperty('Year');
    });

    it('emite evento filterChanged', () => {
        const callback = jest.fn();
        engine.gridApi.addEventListener('filterChanged', callback);
        engine.gridApi.setFilter('Country', ['USA']);
        expect(callback).toHaveBeenCalled();
    });
});

describe('PaginationModule', () => {
    let engine;

    beforeEach(() => {
        engine = new PivotEngine({
            data: testData,
            rows: ['Country'],
            cols: ['Year'],
            pagination: true,
            pageSize: 2,
            page: 1,
            modules: [FilterModule, PaginationModule, SortModule],
        });
    });

    afterEach(() => {
        engine.destroy();
    });

    it('getPaginationInfo devuelve info correcta', () => {
        const info = engine.gridApi.getPaginationInfo();
        expect(info.page).toBe(1);
        expect(info.pageSize).toBe(2);
        expect(info.pagination).toBe(true);
    });

    it('setPage cambia la página actual', () => {
        engine.gridApi.setPage(2);
        expect(engine.gridApi.getPaginationInfo().page).toBe(2);
    });

    it('setPageSize cambia el tamaño y resetea a página 1', () => {
        engine.gridApi.setPage(2);
        engine.gridApi.setPageSize(5);
        const info = engine.gridApi.getPaginationInfo();
        expect(info.pageSize).toBe(5);
        expect(info.page).toBe(1);
    });

    it('nextPage incrementa la página', () => {
        engine.gridApi.nextPage();
        expect(engine.gridApi.getPaginationInfo().page).toBe(2);
    });

    it('prevPage decrementa la página (mínimo 1)', () => {
        engine.gridApi.setPage(2);
        engine.gridApi.prevPage();
        expect(engine.gridApi.getPaginationInfo().page).toBe(1);

        // No debería bajar de 1
        engine.gridApi.prevPage();
        expect(engine.gridApi.getPaginationInfo().page).toBe(1);
    });

    it('firstPage va a la página 1', () => {
        engine.gridApi.setPage(3);
        engine.gridApi.firstPage();
        expect(engine.gridApi.getPaginationInfo().page).toBe(1);
    });

    it('lastPage va a la última página', () => {
        engine.gridApi.lastPage(5);
        expect(engine.gridApi.getPaginationInfo().page).toBe(5);
    });

    it('setPagination habilita/deshabilita paginación', () => {
        engine.gridApi.setPagination(false);
        expect(engine.gridApi.getPaginationInfo().pagination).toBe(false);
        engine.gridApi.setPagination(true);
        expect(engine.gridApi.getPaginationInfo().pagination).toBe(true);
    });

    it('emite evento pageChanged', () => {
        const callback = jest.fn();
        engine.gridApi.addEventListener('pageChanged', callback);
        engine.gridApi.setPage(2);
        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({ page: 2, pageSize: 2 })
        );
    });
});

describe('SortModule', () => {
    let engine;

    beforeEach(() => {
        engine = new PivotEngine({
            data: testData,
            rows: ['Country'],
            cols: ['Year'],
            rowOrder: 'key_a_to_z',
            colOrder: 'key_a_to_z',
            modules: [FilterModule, PaginationModule, SortModule],
        });
    });

    afterEach(() => {
        engine.destroy();
    });

    it('getSortState devuelve el estado de orden', () => {
        const state = engine.gridApi.getSortState();
        expect(state.rowOrder).toBe('key_a_to_z');
        expect(state.colOrder).toBe('key_a_to_z');
    });

    it('setRowOrder cambia el orden de filas', () => {
        engine.gridApi.setRowOrder('value_a_to_z');
        expect(engine.gridApi.getSortState().rowOrder).toBe('value_a_to_z');
    });

    it('setColOrder cambia el orden de columnas', () => {
        engine.gridApi.setColOrder('value_z_to_a');
        expect(engine.gridApi.getSortState().colOrder).toBe('value_z_to_a');
    });

    it('toggleRowOrder cicla el orden de filas', () => {
        // key_a_to_z → value_a_to_z
        engine.gridApi.toggleRowOrder();
        expect(engine.gridApi.getSortState().rowOrder).toBe('value_a_to_z');

        // value_a_to_z → value_z_to_a
        engine.gridApi.toggleRowOrder();
        expect(engine.gridApi.getSortState().rowOrder).toBe('value_z_to_a');

        // value_z_to_a → key_a_to_z
        engine.gridApi.toggleRowOrder();
        expect(engine.gridApi.getSortState().rowOrder).toBe('key_a_to_z');
    });

    it('toggleColOrder cicla el orden de columnas', () => {
        engine.gridApi.toggleColOrder();
        expect(engine.gridApi.getSortState().colOrder).toBe('value_a_to_z');
    });

    it('emite evento sortChanged', () => {
        const callback = jest.fn();
        engine.gridApi.addEventListener('sortChanged', callback);
        engine.gridApi.setRowOrder('value_z_to_a');
        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({ rowOrder: 'value_z_to_a' })
        );
    });
});
