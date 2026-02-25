import React, { useState, useCallback } from 'react';
import tips from './tips';
import { sortAs } from '../src/Utilities';
import SubtotalRenderers from '../src/SubtotalRenderers';
import TableRenderers from '../src/TableRenderers';
import createPlotlyRenderers from '../src/PlotlyRenderers';
import createPlotlyComponent from 'react-plotly.js/factory';
import PivotTableUI from '../src/PivotTableUI';
import '../src/pivottable.css';
import '../src/grouping.css';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';

const Plot = createPlotlyComponent(window.Plotly);

function Checkbox(props) {
    return <label className=" checkbox-inline" style={{ textTransform: "capitalize" }}>
        <input type="checkbox"
            // onChange={e => props.update(e, props.name)}
            name={props.name}
            onChange={props.onChange}
            defaultChecked={!props.unchecked}></input> {props.name.replace(/([A-Z])/g, " $1")}
    </label>
}

function Grouping(props) {
    const [disabled, setDisabled] = useState(true);

    const visible = !!props.rendererName && props.rendererName.startsWith('Table');

    if (!visible)
        return <div></div>;

    const onChange = e => {
        setDisabled(!e.target.checked);
        props.onChange(e);
    };

    return <div className="row text-center">
        <div className="col-md-2 col-md-offset-2">
            <Checkbox onChange={onChange} name="grouping" unchecked={true} />
        </div>
        <div className="col-md-2">
            <Checkbox onChange={props.onChange} name="pagination" unchecked={true} />
        </div>
        <fieldset className="col-md-6" disabled={disabled}>
            <Checkbox onChange={props.onChange} name="compactRows" />
            <Checkbox onChange={props.onChange} name="rowGroupBefore" />
            <Checkbox onChange={props.onChange} name="colGroupBefore" unchecked={true} />
        </fieldset>
        <br />
        <br />
    </div>
}

class PivotTableUISmartWrapper extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { pivotState: props };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ pivotState: nextProps });
    }

    render() {
        // ─── Cell Pipeline: formateo y estilos condicionales ───
        const cellPipelineConfig = this.props.enableCellPipeline ? {
            valueFormatter: ({ value, aggregator }) => {
                if (value === null || value === undefined) return '';
                if (typeof value === 'number') {
                    return value >= 1000
                        ? `$${(value / 1000).toFixed(1)}K`
                        : `$${value.toFixed(2)}`;
                }
                return aggregator.format(value);
            },
            cellStyle: ({ value }) => {
                if (typeof value !== 'number') return null;
                if (value > 10) return { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', fontWeight: 600 };
                if (value < 2) return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' };
                return null;
            },
        } : undefined;

        // ─── Virtualización bidireccional ───
        const virtConfig = this.props.enableVirtualization ? {
            enabled: true,
            rowHeight: 32,
            colWidth: 100,
            containerHeight: 400,
            containerWidth: 900,
            threshold: 15, // bajo para la demo con pocos datos
            overscanRows: 3,
            overscanCols: 2,
        } : undefined;

        return (
            <PivotTableUI
                renderers={Object.assign(
                    {},
                    TableRenderers,
                    SubtotalRenderers,
                    createPlotlyRenderers(Plot)
                )}
                {...this.state.pivotState}
                size={this.props.size}
                cellPipeline={cellPipelineConfig}
                virtualization={virtConfig}
                unusedOrientationCutoff={Infinity}
            />
        );
    }
}

export default class App extends React.Component {
    componentWillMount() {
        this.setState({
            mode: 'demo',
            filename: 'Sample Dataset: Tips',
            size: 'lg',
            enableCellPipeline: false,
            enableVirtualization: false,
            pivotState: {
                data: tips,
                rows: ['Day of Week', 'Party Size'],
                cols: ['Payer Gender', 'Meal'],
                aggregatorName: 'Sum',
                vals: ['Tip'],
                rendererName: 'Table With Subtotal',
                sorters: {
                    Meal: sortAs(['Lunch', 'Dinner']),
                    'Day of Week': sortAs([
                        'Thursday',
                        'Friday',
                        'Saturday',
                        'Sunday',
                    ]),
                },
                plotlyOptions: { width: 900, height: 500 },
                plotlyConfig: {},
                tableOptions: {
                    clickCallback: function (e, value, filters, pivotData) {
                        var names = [];
                        pivotData.forEachMatchingRecord(filters, function (
                            record
                        ) {
                            names.push(record.Meal);
                        });
                    },
                },
            },
        });
    }

    onDrop(files) {
        this.setState(
            {
                mode: 'thinking',
                filename: '(Parsing CSV...)',
                textarea: '',
                pivotState: { data: [] },
            },
            () =>
                Papa.parse(files[0], {
                    skipEmptyLines: true,
                    error: e => alert(e),
                    complete: parsed =>
                        this.setState({
                            mode: 'file',
                            filename: files[0].name,
                            pivotState: { data: parsed.data },
                        }),
                })
        );
    }

    onType(event) {
        Papa.parse(event.target.value, {
            skipEmptyLines: true,
            error: e => alert(e),
            complete: parsed =>
                this.setState({
                    mode: 'text',
                    filename: 'Data from <textarea>',
                    textarea: event.target.value,
                    pivotState: { data: parsed.data },
                }),
        });
    }

    onGrouping({ target: { name, checked } }) {
        var pivotState = Object.assign({}, this.state.pivotState);
        pivotState[name] = checked;
        this.setState({ pivotState });
    }

    render() {
        return (
            <div>
                <div className="row text-center">
                    <div className="col-md-3 col-md-offset-3">
                        <p>Try it right now on a file...</p>
                        <Dropzone
                            onDrop={this.onDrop.bind(this)}
                            accept="text/csv"
                            className="dropzone"
                            activeClassName="dropzoneActive"
                            rejectClassName="dropzoneReject"
                        >
                            <p>
                                Drop a CSV file here, or click to choose a file
                                from your computer.
                            </p>
                        </Dropzone>
                    </div>
                    <div className="col-md-3 text-center">
                        <p>...or paste some data:</p>
                        <textarea
                            value={this.state.textarea}
                            onChange={this.onType.bind(this)}
                            placeholder="Paste from a spreadsheet or CSV-like file"
                        />
                    </div>
                </div>
                <div className="row text-center">
                    <p>
                        <em>Note: the data never leaves your browser!</em>
                    </p>
                    <br />
                </div>
                <div className="row" style={{ position: 'relative' }}>
                    <h2 className="text-center">{this.state.filename}</h2>
                    <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={this.state.enableCellPipeline}
                                onChange={e => this.setState({ enableCellPipeline: e.target.checked })}
                                style={{ accentColor: '#22c55e' }}
                            />
                            🎨 Cell Pipeline
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={this.state.enableVirtualization}
                                onChange={e => this.setState({ enableVirtualization: e.target.checked })}
                                style={{ accentColor: '#3b82f6' }}
                            />
                            ⚡ Virtualización
                        </label>
                        <span style={{ fontSize: '20px', marginRight: '4px' }} title="Table Size Configuration">⚙️</span>
                        <select
                            value={this.state.size || 'lg'}
                            onChange={e => this.setState({ size: e.target.value })}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #c8d4e3', background: '#fff', color: '#2a3f5f', outline: 'none' }}
                        >
                            <option value="lg">Large (lg) - 100%</option>
                            <option value="md">Medium (md) - 85%</option>
                            <option value="sm">Small (sm) - 70%</option>
                        </select>
                    </div>
                    <br />
                </div>
                <Grouping
                    onChange={this.onGrouping.bind(this)}
                    rendererName={this.state.pivotState.rendererName}
                />
                <div className="row">
                    <PivotTableUISmartWrapper
                        size={this.state.size}
                        enableCellPipeline={this.state.enableCellPipeline}
                        enableVirtualization={this.state.enableVirtualization}
                        {...this.state.pivotState}
                        onChange={s => this.setState({ pivotState: s })}
                    />
                </div>
            </div>
        );
    }
}
