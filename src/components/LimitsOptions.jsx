import React, {Component, PropTypes} from 'react';

/*
 * A settings UI for the 'treeViewOptions.limits' state field.
 */
export default class LimitsOptions extends Component {

    render() {
        // Bootstrap's inline forms don't work really well with checkboxes.
        // So we'll use our own table layout instead; no big deal.
        // TODO(william): These are duplicated in tree/ViewOptions.jsx; unify.
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

        const limitValue = limit =>
            value => this.props.onSetLimitValue(limit, value);
        const limitEnabled = limit =>
            enabled => this.props.onSetLimitEnabled(limit, enabled);

        return <div {...table}>
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
                        min={this.props.minIndividual}
                        max={this.props.maxIndividual}
                        minEnabled={this.props.minIndividualEnabled}
                        maxEnabled={this.props.maxIndividualEnabled}
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
                        min={this.props.minCombined}
                        max={this.props.maxCombined}
                        minEnabled={this.props.minCombinedEnabled}
                        maxEnabled={this.props.maxCombinedEnabled}
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
        </div>;
    }
}
LimitsOptions.propTypes = {
    minCombined: PropTypes.number.isRequired,
    maxCombined: PropTypes.number.isRequired,
    minIndividual: PropTypes.number.isRequired,
    maxIndividual: PropTypes.number.isRequired,
    minCombinedEnabled: PropTypes.bool.isRequired,
    maxCombinedEnabled: PropTypes.bool.isRequired,
    minIndividualEnabled: PropTypes.bool.isRequired,
    maxIndividualEnabled: PropTypes.bool.isRequired,
    //
    onSetLimitValue: PropTypes.func.isRequired,
    onSetLimitEnabled: PropTypes.func.isRequired,
};

/*
 * A set of four connected controls:
 * two input fields, to set minimum and maximum values for a limit,
 * and two checkboxes, to set whether these limits are enforced.
 */
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
                min={0}
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
                min={0}
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
    //
    onSetMin: PropTypes.func.isRequired,
    onSetMax: PropTypes.func.isRequired,
    onSetMinEnabled: PropTypes.func.isRequired,
    onSetMaxEnabled: PropTypes.func.isRequired,
    //
    minEnabledLabel: PropTypes.string.isRequired,
    maxEnabledLabel: PropTypes.string.isRequired,
    minLabel: PropTypes.string.isRequired,
    maxLabel: PropTypes.string.isRequired,
};
