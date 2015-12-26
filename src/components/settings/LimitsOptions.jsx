import React, {Component} from 'react';

import CustomPropTypes from '../CustomPropTypes';
import LimitInput from './LimitInput';
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
                    <LimitInput
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
                    <LimitInput
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
