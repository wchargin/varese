import React, {Component, PropTypes} from 'react';

import {findChordRootOffset} from '../../HarmonicSeries';

import Folding from '../../Folding';
import {arraysEqual} from '../../Utils';

import TreeView from './TreeView';
import TrichordView from './TrichordView';

export default class TrichordTree extends Component {

    render() {
        const {rationalizer, rootChord, onClickChord} = this.props;
        const {levels} = this.props.viewOptions;
        const size = levels <= 4 ? 3 :
            levels <= 5 ? 2 :
            1;

        const chords = this._generateTree(rootChord, levels);
        const nodes = chords.map(row => row.map(chord =>
            <TrichordView
                rationalizer={rationalizer}
                notes={chord}
                onClick={() => onClickChord(chord)}
                size={size}
                showRoot={this.props.viewOptions.showRoots}
                showOctave={this.props.viewOptions.showOctaves}
                limits={this.props.viewOptions.limits}
            />));

        // We'd like to add some padding when it's wide
        // so it's not flush against the edge.
        // We could just use 'paddingLeft' and 'paddingRight',
        // but doing it this way---by modifying the width and position---
        // has the nice side-effect
        // that it prevents a horizontal scrollbar from appearing
        // (it can otherwise appear when there's a vertical scrollbar,
        // because the "viewport width" includes the vertical scrollbar
        // for some reason).
        const widePadding = 20;
        const wideStyle = this.props.viewOptions.wide ? {
            position: "relative",
            width: `calc(100vw - ${2 * widePadding}px)`,
            left: `calc(-50vw + ${widePadding}px + 50%)`,
        } : {};

        return <div>
            <ViewOptions
                {...this.props.viewOptions}
                onSetLevels={this.props.onSetLevels}
                onSetShowRoots={this.props.onSetShowRoots}
                onSetShowOctaves={this.props.onSetShowOctaves}
                onSetWide={this.props.onSetWide}
                onSetLimitValue={this.props.onSetLimitValue}
                onSetLimitEnabled={this.props.onSetLimitEnabled}
            />
            {this._renderWarnings(chords, rationalizer)}
            {this._renderToolbar()}
            <div style={{...wideStyle, marginBottom: 20}}>
                <TreeView
                    elements={nodes}
                    spacing={2 * size}
                />
            </div>
        </div>;
    }
    _iterateRow(previousRow) {
        const branch = c => [Folding.outfoldDown(c), Folding.outfoldUp(c)];
        const branches = previousRow.map(branch);
        const flattened = [].concat.apply([], branches);
        return flattened;
    }
    _generateTree(root, depth) {
        const result = [[root]];
        for (let i = 1; i < depth; i++) {
            result.push(this._iterateRow(result[result.length - 1]));
        }
        return result;
    }

    /*
     * Try to find the roots of all the chords that will appear in the tree.
     * Return a list of warnings that explain why any may have failed.
     */
    _renderWarnings(chords, rationalizer) {
        if (!this.props.viewOptions.showRoots) {
            return [];
        }

        const Warning = props =>
            <div
                className="alert alert-warning"
                style={{ marginTop: 20 }}
                {...props}
            >{props.children}</div>;

        const errors = chords.map(row => row.map(chord => {
            const result = findChordRootOffset(rationalizer, chord);
            return result.status === "error" ? result.error : null;
        }));
        const flattenedErrors = [].concat.apply([], errors);
        const errorTypes = {
            finite: flattenedErrors.some(x => x && x.match(/finite/)),
            zeroRatio: flattenedErrors.some(x => x && x.match(/zero_ratio/)),
        };

        return [
            errorTypes.finite &&
                <Warning key="finite">
                    <strong>Note:</strong>
                    {" "}
                    Some of these chords are too complicated to analyze,
                    so we can't find their roots.
                    In particular, the acoustic ratios are
                    such complicated fractions that
                    your browser gives up on the math.
                    These chords are indicated with a question mark
                    in the place where the root should be.
                </Warning>,
            errorTypes.zeroRatio &&
                <Warning key="zero-ratio">
                    <strong>Note:</strong>
                    {" "}
                    Some of these chords involve a semitone difference
                    that you've mapped to an acoustic ratio of zero,
                    so we can't find their roots.
                    Check your rationalization configuration to fix this.
                    In the meantime,
                    these chords are indicated with a question mark
                    in the place where the root should be.
                </Warning>,
        ];
    }

    _renderToolbar() {
        const {rootChord} = this.props;

        const infolded = Folding.infoldCanonical(rootChord);
        const hasInfolding = !arraysEqual(infolded, rootChord);

        const inversion = Folding.invert(rootChord);
        const hasInversion = !arraysEqual(inversion, rootChord);

        return <div style={{ textAlign: "center", marginBottom: 10 }}>
            <strong>Root node manipulation:</strong>
            {" "}
            <div
                className="btn-group"
                role="group"
            >
                <button
                    className="btn btn-default"
                    disabled={!hasInfolding}
                    onClick={() => this.props.onClickChord(infolded)}
                >Infold</button>
                <button
                    className="btn btn-default"
                    disabled={!hasInversion}
                    onClick={() => this.props.onClickChord(inversion)}
                >Invert</button>
            </div>
        </div>;
    }

}
TrichordTree.propTypes = {
    rationalizer: PropTypes.func.isRequired,
    rootChord: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    onClickChord: PropTypes.func.isRequired,

    viewOptions: PropTypes.shape({
        levels: PropTypes.number.isRequired,
        showRoots: PropTypes.bool.isRequired,
        showOctaves: PropTypes.bool.isRequired,
        wide: PropTypes.bool.isRequired,
        limits: PropTypes.shape({
            minCombined: PropTypes.number.isRequired,
            maxCombined: PropTypes.number.isRequired,
            minIndividual: PropTypes.number.isRequired,
            maxIndividual: PropTypes.number.isRequired,
            minCombinedEnabled: PropTypes.bool.isRequired,
            maxCombinedEnabled: PropTypes.bool.isRequired,
            minIndividualEnabled: PropTypes.bool.isRequired,
            maxIndividualEnabled: PropTypes.bool.isRequired,
        }).isRequired,
    }).isRequired,
    onSetLevels: PropTypes.func.isRequired,
    onSetShowRoots: PropTypes.func.isRequired,
    onSetShowOctaves: PropTypes.func.isRequired,
    onSetWide: PropTypes.func.isRequired,
    onSetLimitValue: PropTypes.func.isRequired,
    onSetLimitEnabled: PropTypes.func.isRequired,
};

class ViewOptions extends Component {

    render() {
        // Bootstrap's inline forms don't work really well with checkboxes.
        // So we'll use our own table layout instead; no big deal.
        const row = {style: {display: "table-row"}};
        const cell = {
            style: {
                display: "table-cell",
                verticalAlign: "bottom",
                paddingBottom: 5,
                //
                // marginRight doesn't work on table cells,
                // and we only want horizontal spacing
                // so we can't use borderSpacing on the table div.
                // This should do.
                paddingRight: 20,
            },
        };

        const makeCheckboxCell = (id, checked, onChange, labelYes, labelNo) =>
            <div {...cell} className="checkbox">
                <input
                    ref={id}
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={() => onChange(this.refs[id].checked)}
                    style={{ marginLeft: 0, marginRight: 20 }}
                />
                <label
                    htmlFor={id}
                    style={{
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        color: "#737373",  // Bootstrap's .help-block color
                    }}
                >
                    {checked ? labelYes : labelNo}
                </label>
            </div>;

        const table = {style: {display: "table", marginBottom: 10}};

        const limitValue = limit =>
            value => this.props.onSetLimitValue(limit, value);
        const limitEnabled = limit =>
            enabled => this.props.onSetLimitEnabled(limit, enabled);

        return <div><div {...table}>
            <div {...row}>
                <label {...cell} htmlFor="depth">Tree depth</label>
                <label {...cell} htmlFor="showRoots">Show roots?</label>
                <label {...cell} htmlFor="showOctaves">Show octaves?</label>
                <label {...cell} htmlFor="fillWindow">Fill window?</label>
            </div>
            <div {...row}>
                <div {...cell}>
                    <input
                        ref="levels"
                        type="range"
                        id="depth"
                        min={1}
                        max={8}
                        value={this.props.levels}
                        onChange={() => this.props.onSetLevels(
                            parseInt(this.refs.levels.value, 10))}
                    />
                </div>
                {makeCheckboxCell(
                    "showRoots",
                    this.props.showRoots,
                    this.props.onSetShowRoots,
                    "Shown", "Hidden")}
                {makeCheckboxCell(
                    "showOctaves",
                    this.props.showOctaves,
                    this.props.onSetShowOctaves,
                    "Shown", "Hidden")}
                {makeCheckboxCell(
                    "fillWindow",
                    this.props.wide,
                    this.props.onSetWide,
                    "Wide", "Inline")}
            </div>
        </div><div {...table}>
            <div {...row}>
                <label {...cell} htmlFor="minIndividual">
                    Individual limits
                </label>
                <label {...cell} htmlFor="minCombined">
                    Combined limits
                </label>
            </div>
            <div {...row}>
                <div {...cell}>
                    <LimitControls
                        min={this.props.limits.minIndividual}
                        max={this.props.limits.maxIndividual}
                        minEnabled={this.props.limits.minIndividualEnabled}
                        maxEnabled={this.props.limits.maxIndividualEnabled}
                        onSetMin={limitValue("minIndividual")}
                        onSetMax={limitValue("maxIndividual")}
                        onSetMinEnabled={limitEnabled("minIndividual")}
                        onSetMaxEnabled={limitEnabled("maxIndividual")}
                        minEnabledLabel="Minimum individual limit enabled"
                        maxEnabledLabel="Maximum individual limit enabled"
                        minLabel="Minimum individual limit"
                        maxLabel="Maximum individual limit"
                    />
                </div>
                <div {...cell}>
                    <LimitControls
                        min={this.props.limits.minCombined}
                        max={this.props.limits.maxCombined}
                        minEnabled={this.props.limits.minCombinedEnabled}
                        maxEnabled={this.props.limits.maxCombinedEnabled}
                        onSetMin={limitValue("minCombined")}
                        onSetMax={limitValue("maxCombined")}
                        onSetMinEnabled={limitEnabled("minCombined")}
                        onSetMaxEnabled={limitEnabled("maxCombined")}
                        minEnabledLabel="Minimum combined limit enabled"
                        maxEnabledLabel="Maximum combined limit enabled"
                        minLabel="Minimum combined limit"
                        maxLabel="Maximum combined limit"
                    />
                </div>
            </div>
        </div></div>;
    }

}
ViewOptions.propTypes = {
    levels: PropTypes.number.isRequired,
    showRoots: PropTypes.bool.isRequired,
    showOctaves: PropTypes.bool.isRequired,
    wide: PropTypes.bool.isRequired,
    limits: PropTypes.shape({
        minCombined: PropTypes.number.isRequired,
        maxCombined: PropTypes.number.isRequired,
        minIndividual: PropTypes.number.isRequired,
        maxIndividual: PropTypes.number.isRequired,
        minCombinedEnabled: PropTypes.bool.isRequired,
        maxCombinedEnabled: PropTypes.bool.isRequired,
        minIndividualEnabled: PropTypes.bool.isRequired,
        maxIndividualEnabled: PropTypes.bool.isRequired,
    }),

    onSetLevels: PropTypes.func.isRequired,
    onSetShowRoots: PropTypes.func.isRequired,
    onSetShowOctaves: PropTypes.func.isRequired,
    onSetWide: PropTypes.func.isRequired,
    onSetLimitValue: PropTypes.func.isRequired,
    onSetLimitEnabled: PropTypes.func.isRequired,
};

class LimitControls extends Component {

    render() {
        const {props} = this;
        const {min, max, minEnabled, maxEnabled} = props;
        const {onSetMin, onSetMax, onSetMinEnabled, onSetMaxEnabled} = props;

        const inputStyle = {
            display: "inline-block",
            width: "50%",
            maxWidth: "5em",
        };

        return <div className="input-group">
            <span className="input-group-addon">
                <input
                    ref="minEnabled"
                    type="checkbox"
                    aria-label={this.props.minEnabledLabel}
                    checked={minEnabled}
                    onChange={() =>
                        onSetMinEnabled(this.refs.minEnabled.checked)}
                />
            </span>
            <input
                ref="min"
                style={inputStyle}
                disabled={!minEnabled}
                type="number"
                className="form-control"
                value={minEnabled ? min : null}
                aria-label={this.props.minLabel}
                onChange={() => onSetMin(this.refs.min.valueAsNumber)}
            />
            <input
                ref="max"
                style={inputStyle}
                disabled={!maxEnabled}
                type="number"
                className="form-control"
                value={maxEnabled ? max : null}
                aria-label={this.props.maxLabel}
                onChange={() => onSetMax(this.refs.max.valueAsNumber)}
            />
            <span className="input-group-addon">
                <input
                    ref="maxEnabled"
                    type="checkbox"
                    aria-label={this.props.maxEnabledLabel}
                    checked={maxEnabled}
                    onChange={() =>
                        onSetMaxEnabled(this.refs.maxEnabled.checked)}
                />
            </span>
        </div>;
    }

}
LimitControls.propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    minEnabled: PropTypes.bool.isRequired,
    maxEnabled: PropTypes.bool.isRequired,
    onSetMin: PropTypes.func.isRequired,
    onSetMax: PropTypes.func.isRequired,
    onSetMinEnabled: PropTypes.func.isRequired,
    onSetMaxEnabled: PropTypes.func.isRequired,

    minEnabledLabel: PropTypes.string.isRequired,
    maxEnabledLabel: PropTypes.string.isRequired,
    minLabel: PropTypes.string.isRequired,
    maxLabel: PropTypes.string.isRequired,
};
