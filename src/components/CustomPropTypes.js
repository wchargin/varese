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

export const viewOptionsShape = {
    levels: PropTypes.number.isRequired,
    infiniteLevels: PropTypes.number.isRequired,
    showRoots: PropTypes.bool.isRequired,
    showOctaves: PropTypes.bool.isRequired,
    wide: PropTypes.bool.isRequired,
    limits: limits.isRequired,
};
export const viewOptions = PropTypes.shape(viewOptionsShape);

export default {
    limitsShape,
    limits,
    viewOptionsShape,
    viewOptions,
};
