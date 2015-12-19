import React, {Component, PropTypes} from 'react';

import CustomPropTypes from './CustomPropTypes';
import {Table, Row, Cell, LabelCell} from './SettingsTable';

/*
 * A settings UI for the 'treeViewOptions.limits' state field.
 */
export default class LimitsOptions extends Component {

    render() {
        const {values, handlers} = this.props;

        const limitValue = limit =>
            value => handlers.onSetLimitValue(limit, value);
        const limitEnabled = limit =>
            enabled => handlers.onSetLimitEnabled(limit, enabled);

        return <Table>
            <Row>
                <LabelCell htmlFor="minIndividual">
                    Individual limits
                </LabelCell>
                <LabelCell htmlFor="minCombined">
                    Combined limits
                </LabelCell>
            </Row>
            <Row>
                <Cell>
                    <LimitControls
                        min={values.minIndividual}
                        max={values.maxIndividual}
                        minEnabled={values.minIndividualEnabled}
                        maxEnabled={values.maxIndividualEnabled}
                        onSetMin={limitValue("minIndividual")}
                        onSetMax={limitValue("maxIndividual")}
                        onSetMinEnabled={limitEnabled("minIndividual")}
                        onSetMaxEnabled={limitEnabled("maxIndividual")}
                        minEnabledLabel="Minimum individual limit enabled"
                        maxEnabledLabel="Maximum individual limit enabled"
                        minLabel="Minimum individual limit"
                        maxLabel="Maximum individual limit"
                    />
                </Cell>
                <Cell>
                    <LimitControls
                        min={values.minCombined}
                        max={values.maxCombined}
                        minEnabled={values.minCombinedEnabled}
                        maxEnabled={values.maxCombinedEnabled}
                        onSetMin={limitValue("minCombined")}
                        onSetMax={limitValue("maxCombined")}
                        onSetMinEnabled={limitEnabled("minCombined")}
                        onSetMaxEnabled={limitEnabled("maxCombined")}
                        minEnabledLabel="Minimum combined limit enabled"
                        maxEnabledLabel="Maximum combined limit enabled"
                        minLabel="Minimum combined limit"
                        maxLabel="Maximum combined limit"
                    />
                </Cell>
            </Row>
        </Table>;
    }
}
LimitsOptions.propTypes = {
    values: CustomPropTypes.limits.isRequired,
    handlers: CustomPropTypes.limitsHandlers.isRequired,
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
    minLabel: PropTypes.string.isRequired,
    maxLabel: PropTypes.string.isRequired,
    minEnabledLabel: PropTypes.string.isRequired,
    maxEnabledLabel: PropTypes.string.isRequired,
};
