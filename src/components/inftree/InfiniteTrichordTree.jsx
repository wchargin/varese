import React, {Component} from 'react';

import CustomPropTypes from '../CustomPropTypes';
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
                height={600}
                levels={this.props.viewOptions.infiniteLevels}
                treeNumber={this.props.viewOptions.treeNumber}
                rootBass={this.props.viewOptions.rootBass}
            />
        </div>;
    }

}
InfiniteTrichordTree.propTypes = {
    viewOptions: CustomPropTypes.viewOptions.isRequired,
};
