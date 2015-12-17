import React, {Component, PropTypes} from 'react';

import LimitsOptions from '../LimitsOptions';
import {Table, Row, Cell, LabelCell, CheckboxCell} from '../SettingsTable';

/*
 * A settings widget to configure the 'treeViewOptions' state branch.
 */
export default class ViewOptions extends Component {

    render() {
        return <div>
            <Table>
                <Row>
                    <LabelCell htmlFor="depth">Tree depth</LabelCell>
                    <LabelCell htmlFor="showRoots">Show roots?</LabelCell>
                    <LabelCell htmlFor="showOctaves">Show octaves?</LabelCell>
                    <LabelCell htmlFor="fillWindow">Fill window?</LabelCell>
                </Row>
                <Row>
                    <Cell>
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
                    </Cell>
                    <CheckboxCell
                        id="showRoots"
                        checked={this.props.showRoots}
                        onChange={this.props.onSetShowRoots}
                        labelYes="Shown"
                        labelNo="Hidden"
                    />
                    <CheckboxCell
                        id="showOctaves"
                        checked={this.props.showOctaves}
                        onChange={this.props.onSetShowOctaves}
                        labelYes="Shown"
                        labelNo="Hidden"
                    />
                    <CheckboxCell
                        id="fillWindow"
                        checked={this.props.wide}
                        onChange={this.props.onSetWide}
                        labelYes="Wide"
                        labelNo="Inline"
                    />
                </Row>
            </Table>
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
