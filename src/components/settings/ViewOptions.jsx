import React, {Component, PropTypes} from 'react';

import {pitchToName} from '../../core/PitchNames';

import CustomPropTypes from '../CustomPropTypes';
import LimitsOptions from './LimitsOptions';
import SingleNoteInput from '../SingleNoteInput';
import {Table, Row, Cell, LabelCell, CheckboxCell} from './SettingsTable';

/*
 * A settings widget to configure the 'treeViewOptions' state branch.
 * This can configure either the finite tree or the infinite tree,
 * depending on the values of 'isInfinite'.
 */
export default class ViewOptions extends Component {

    render() {
        const {infinite, values, handlers} = this.props;

        return <div>
            <Table>
                <Row>
                    {!infinite &&
                        <LabelCell htmlFor="depth">Tree depth</LabelCell>}
                    <LabelCell htmlFor="showRoots">Show roots?</LabelCell>
                    <LabelCell htmlFor="showOctaves">Show octaves?</LabelCell>
                    <LabelCell htmlFor="fillWindow">Fill window?</LabelCell>
                </Row>
                <Row>
                    {!infinite && <Cell>
                        <input
                            ref="levels"
                            type="range"
                            id="depth"
                            //
                            min={1}
                            max={8}
                            value={values.levels}
                            onChange={() => handlers.onSetLevels(
                                this.refs.levels.valueAsNumber)}
                        />
                    </Cell>}
                    <CheckboxCell
                        id="showRoots"
                        checked={values.showRoots}
                        onChange={handlers.onSetShowRoots}
                        labelYes="Shown"
                        labelNo="Hidden"
                    />
                    <CheckboxCell
                        id="showOctaves"
                        checked={values.showOctaves}
                        onChange={handlers.onSetShowOctaves}
                        labelYes="Shown"
                        labelNo="Hidden"
                    />
                    <CheckboxCell
                        id="fillWindow"
                        checked={values.wide}
                        onChange={handlers.onSetWide}
                        labelYes="Wide"
                        labelNo="Inline"
                    />
                </Row>
            </Table>
            <LimitsOptions
                values={values.limits}
                handlers={{
                    onSetLimitValue: handlers.onSetLimitValue,
                    onSetLimitEnabled: handlers.onSetLimitEnabled,
                }}
            />
            {infinite && <Table>
                <Row>
                    <LabelCell htmlFor="depth">Levels shown</LabelCell>
                    <LabelCell htmlFor="height">Height</LabelCell>
                    <LabelCell htmlFor="treeNumber">Tree number</LabelCell>
                    <LabelCell htmlFor="rootBass">Root chord bass</LabelCell>
                </Row>
                <Row>
                    <Cell style={{ verticalAlign: "middle" }}>
                        <input
                            ref="levels"
                            type="range"
                            id="depth"
                            //
                            min={1}
                            max={9}
                            step={0.05}
                            value={values.infiniteLevels}
                            onChange={() => handlers.onSetInfiniteLevels(
                                this.refs.levels.valueAsNumber)}
                        />
                    </Cell>
                    <Cell style={{ verticalAlign: "middle" }}>
                        <input
                            ref="height"
                            type="range"
                            id="height"
                            //
                            min={500}
                            max={1000}
                            value={values.infiniteHeight}
                            onChange={() => handlers.onSetInfiniteHeight(
                                this.refs.height.valueAsNumber)}
                        />
                    </Cell>
                    <Cell>
                        <input
                            ref="treeNumber"
                            id="treeNumber"
                            type="number"
                            className="form-control"
                            //
                            min={0}
                            max={12}
                            value={values.treeNumber}
                            onChange={() => handlers.onSetTreeNumber(
                                parseInt(this.refs.treeNumber.value, 10))}
                        />
                    </Cell>
                    <Cell>
                        <SingleNoteInput
                            value={values.rootBass}
                            displayValue={pitchToName(
                                values.rootBass, true, values.showOctaves)}
                            onChange={value => handlers.onSetRootBass(value)}
                            className="form-control"
                        />
                    </Cell>
                </Row>
            </Table>}
        </div>;
    }

}
ViewOptions.propTypes = {
    // false for finite tree, true for infinite tree
    infinite: PropTypes.bool.isRequired,
    values: CustomPropTypes.viewOptions.isRequired,
    handlers: CustomPropTypes.viewOptionsHandlers.isRequired,
};
