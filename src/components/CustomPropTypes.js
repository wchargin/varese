import {PropTypes} from 'react';

export const limits = PropTypes.shape({
    minCombined: PropTypes.number.isRequired,
    maxCombined: PropTypes.number.isRequired,
    minIndividual: PropTypes.number.isRequired,
    maxIndividual: PropTypes.number.isRequired,
    minCombinedEnabled: PropTypes.bool.isRequired,
    maxCombinedEnabled: PropTypes.bool.isRequired,
    minIndividualEnabled: PropTypes.bool.isRequired,
    maxIndividualEnabled: PropTypes.bool.isRequired,
});

const limitsHandlersShape = {
    onSetLimitValue: PropTypes.func.isRequired,
    onSetLimitEnabled: PropTypes.func.isRequired,
};
export const limitsHandlers = PropTypes.shape(limitsHandlersShape);

export const viewOptions = PropTypes.shape({
    levels: PropTypes.number.isRequired,
    infiniteLevels: PropTypes.number.isRequired,
    showRoots: PropTypes.bool.isRequired,
    showOctaves: PropTypes.bool.isRequired,
    wide: PropTypes.bool.isRequired,
    treeNumber: PropTypes.number.isRequired,
    rootBass: PropTypes.number.isRequired,
    limits: limits.isRequired,
});

export const viewOptionsHandlers = PropTypes.shape({
    onSetInfiniteLevels: PropTypes.func.isRequired,
    onSetLevels: PropTypes.func.isRequired,
    onSetShowRoots: PropTypes.func.isRequired,
    onSetShowOctaves: PropTypes.func.isRequired,
    onSetWide: PropTypes.func.isRequired,
    onSetTreeNumber: PropTypes.func.isRequired,
    onSetRootBass: PropTypes.func.isRequired,
    ...limitsHandlersShape,
});

export default {
    limits,
    limitsHandlers,
    viewOptions,
    viewOptionsHandlers,
};
