import {PropTypes} from 'react';

const limits = PropTypes.shape({
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
const limitsHandlers = PropTypes.shape(limitsHandlersShape);

const viewOptions = PropTypes.shape({
    levels: PropTypes.number.isRequired,
    infiniteLevels: PropTypes.number.isRequired,
    infiniteHeight: PropTypes.number.isRequired,
    showRoots: PropTypes.bool.isRequired,
    showOctaves: PropTypes.bool.isRequired,
    wide: PropTypes.bool.isRequired,
    treeNumber: PropTypes.number.isRequired,
    rootBass: PropTypes.number.isRequired,
    highQuality: PropTypes.bool.isRequired,
    rainbowFactor: PropTypes.number.isRequired,
    alwaysEngrave: PropTypes.bool.isRequired,
    limits: limits.isRequired,
});

const viewOptionsHandlers = PropTypes.shape({
    onSetLevels: PropTypes.func.isRequired,
    onSetInfiniteLevels: PropTypes.func.isRequired,
    onSetInfiniteHeight: PropTypes.func.isRequired,
    onSetShowRoots: PropTypes.func.isRequired,
    onSetShowOctaves: PropTypes.func.isRequired,
    onSetWide: PropTypes.func.isRequired,
    onSetTreeNumber: PropTypes.func.isRequired,
    onSetRootBass: PropTypes.func.isRequired,
    onSetHighQuality: PropTypes.func.isRequired,
    onSetRainbowFactor: PropTypes.func.isRequired,
    onSetAlwaysEngrave: PropTypes.func.isRequired,
    ...limitsHandlersShape,
});

export default {
    limits,
    limitsHandlers,
    viewOptions,
    viewOptionsHandlers,
};
