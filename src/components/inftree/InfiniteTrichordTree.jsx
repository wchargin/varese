import React, {Component, PropTypes} from 'react';

import InfiniteCanvas from './InfiniteCanvas';

export default class InfiniteTrichordTree extends Component {

    render() {
        const widePadding = 20;
        const wideStyle = this.props.viewOptions.wide ? {
            position: "relative",
            width: `calc(100vw - ${2 * widePadding}px)`,
            left: `calc(-50vw + ${widePadding}px + 50%)`,
        } : {};

        return <div style={{...wideStyle, marginBottom: 20}}>
            <InfiniteCanvas
                levels={this.props.viewOptions.levels}
            />
        </div>;
    }

}
InfiniteTrichordTree.propTypes = {
    viewOptions: PropTypes.shape({
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
        }).isRequired,
    }).isRequired,
};
