import {PropTypes} from 'react';

export const limitsShape = {
    minCombined: PropTypes.number.isRequired,
    maxCombined: PropTypes.number.isRequired,
    minIndividual: PropTypes.number.isRequired,
    maxIndividual: PropTypes.number.isRequired,
    minCombinedEnabled: PropTypes.bool.isRequired,
    maxCombinedEnabled: PropTypes.bool.isRequired,
    minIndividualEnabled: PropTypes.bool.isRequired,
    maxIndividualEnabled: PropTypes.bool.isRequired,
};
export const limits = PropTypes.shape(limitsShape);

export const limitsHandlersShape = {
    onSetLimitValue: PropTypes.func.isRequired,
    onSetLimitEnabled: PropTypes.func.isRequired,
};
export const limitsHandlers = PropTypes.shape(limitsHandlersShape);

export const viewOptionsShape = {
    levels: PropTypes.number.isRequired,
    infiniteLevels: PropTypes.number.isRequired,
    showRoots: PropTypes.bool.isRequired,
    showOctaves: PropTypes.bool.isRequired,
    wide: PropTypes.bool.isRequired,
    limits: limits.isRequired,
};
export const viewOptions = PropTypes.shape(viewOptionsShape);

export const viewOptionsHandlersShape = {
    onSetInfiniteLevels: PropTypes.func.isRequired,
    onSetLevels: PropTypes.func.isRequired,
    onSetShowRoots: PropTypes.func.isRequired,
    onSetShowOctaves: PropTypes.func.isRequired,
    onSetWide: PropTypes.func.isRequired,
    ...limitsHandlersShape,
};
export const viewOptionsHandlers = PropTypes.shape(viewOptionsHandlersShape);

export default {
    limitsShape,
    limits,
    limitsHandlersShape,
    limitsHandlers,
    viewOptionsShape,
    viewOptions,
    viewOptionsHandlersShape,
    viewOptionsHandlers,
};
