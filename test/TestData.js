/*
 * Some useful pre-defined and centralized data for testing purposes.
 */
import reducer from '../src/core/Reducers';
import {noop} from '../src/core/Actions';

export const initialState = reducer(undefined, noop());

export {canonicalRationalizer} from '../src/core/HarmonicData';
