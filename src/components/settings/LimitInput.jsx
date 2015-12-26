import React, {Component, PropTypes} from 'react';

/*
 * A set of four connected controls:
 * two input fields, to set minimum and maximum values for a limit,
 * and two checkboxes, to set whether these limits are enforced.
 */
export default class LimitInput extends Component {

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
                    type="checkbox"
                    aria-label={this.props.minEnabledLabel}
                    checked={minEnabled}
                    onChange={e =>
                        onSetMinEnabled(e.target.checked)}
                />
            </span>
            <input
                style={inputStyle}
                disabled={!minEnabled}
                type="number"
                min={0}
                className="form-control"
                value={minEnabled ? min : null}
                aria-label={this.props.minLabel}
                onChange={e => onSetMin(e.target.valueAsNumber)}
            />
            <input
                style={inputStyle}
                disabled={!maxEnabled}
                type="number"
                min={0}
                className="form-control"
                value={maxEnabled ? max : null}
                aria-label={this.props.maxLabel}
                onChange={e => onSetMax(e.target.valueAsNumber)}
            />
            <span className="input-group-addon">
                <input
                    type="checkbox"
                    aria-label={this.props.maxEnabledLabel}
                    checked={maxEnabled}
                    onChange={e =>
                        onSetMaxEnabled(e.target.checked)}
                />
            </span>
        </div>;
    }

}
LimitInput.propTypes = {
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
