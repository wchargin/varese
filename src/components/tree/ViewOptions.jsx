import React, {Component, PropTypes} from 'react';

import LimitsOptions from '../LimitsOptions';

/*
 * A settings widget to configure the 'treeViewOptions' state branch.
 */
export default class ViewOptions extends Component {

    render() {
        // Bootstrap's inline forms don't work really well with checkboxes.
        // So we'll use our own table layout instead; no big deal.
        const table = {style: {display: "table", marginBottom: 10}};
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
        </div>
        <LimitsOptions
            {...this.props.limits}
            onSetLimitValue={this.props.onSetLimitValue}
            onSetLimitEnabled={this.props.onSetLimitEnabled}
        />
        </div>;
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
