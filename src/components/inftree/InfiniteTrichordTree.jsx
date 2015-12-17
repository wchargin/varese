import React, {Component, PropTypes} from 'react';

import InfiniteCanvas from './InfiniteCanvas';

export default class InfiniteTrichordTree extends Component {

    render() {
        return <div>
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
