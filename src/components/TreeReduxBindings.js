/*
 * Common functions for the TreeExplorer and InfiniteTreeExplorer views.
 */
import * as Actions from '../core/Actions';

export function mapStateToProps(state) {
    return {
        acousticRatios: state.acousticRatios,
        rootsVisible: state.treeViewOptions.showRoots,
        treeViewOptions: state.treeViewOptions,
    };
}

export function mapDispatchToProps(dispatch) {
    return {
        onSetAcousticRatio: (index, ratio) => dispatch(
            Actions.setAcousticRatio(index, ratio)),
        viewOptionsHandlers: {
            onSetLevels: levels => dispatch(Actions.setTreeLevels(levels)),
            onSetInfiniteLevels: levels => dispatch(
                Actions.setInfiniteTreeLevels(levels)),
            onSetInfiniteHeight: height => dispatch(
                Actions.setInfiniteTreeHeight(height)),
            onSetShowRoots: showRoots => dispatch(
                Actions.setTreeShowRoots(showRoots)),
            onSetShowOctaves: showOctaves => dispatch(
                Actions.setTreeShowOctaves(showOctaves)),
            onSetWide: wide => dispatch(Actions.setTreeWide(wide)),
            onSetTreeNumber: treeNumber => dispatch(
                Actions.setTreeTreeNumber(treeNumber)),
            onSetRootBass: rootBass => dispatch(
                Actions.setTreeRootBass(rootBass)),
            onSetHighQuality: highQuality => dispatch(
                Actions.setTreeHighQuality(highQuality)),
            onSetRainbowFactor: rainbowFactor => dispatch(
                Actions.setTreeRainbowFactor(rainbowFactor)),
            onSetAlwaysEngrave: alwaysEngrave => dispatch(
                Actions.setTreeAlwaysEngrave(alwaysEngrave)),
            onSetLimitValue: (limit, value) => dispatch(
                Actions.setTreeLimitValue(limit, value)),
            onSetLimitEnabled: (limit, enabled) => dispatch(
                Actions.setTreeLimitEnabled(limit, enabled)),
        },
    };
}
