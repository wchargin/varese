import React, {Component, PropTypes} from 'react';

import LimitsOptions from './LimitsOptions';
import {Table, Row, Cell, LabelCell, CheckboxCell} from './SettingsTable';

/*
 * A settings widget to configure the 'treeViewOptions' state branch.
 * This can configure either the finite tree or the infinite tree,
 * depending on the values of 'isInfinite'.
 */
export default class ViewOptions extends Component {

    render() {
        const levelStep = this.props.infinite ? 0.05 : 1;
        const levelMin = 1;
        const levelMax = (this.props.infinite ? 6 : 8);
        const levelValue = this.props.infinite ?
            this.props.infiniteLevels :
            this.props.levels;
        const levelSetter = this.props.infinite ?
            this.props.onSetInfiniteLevels :
            this.props.onSetLevels;
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
                            //
                            min={levelMin / levelStep}
                            max={levelMax / levelStep}
                            value={levelValue / levelStep}
                            onChange={() => levelSetter(levelStep *
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
    // false for finite tree, true for infinite tree
    infinite: PropTypes.bool.isRequired,
    //
    levels: PropTypes.number.isRequired,
    infiniteLevels: PropTypes.number.isRequired,
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
    //
    onSetInfiniteLevels: PropTypes.func.isRequired,
    onSetLevels: PropTypes.func.isRequired,
    onSetShowRoots: PropTypes.func.isRequired,
    onSetShowOctaves: PropTypes.func.isRequired,
    onSetWide: PropTypes.func.isRequired,
    onSetLimitValue: PropTypes.func.isRequired,
    onSetLimitEnabled: PropTypes.func.isRequired,
};
