import React, {Component, PropTypes} from 'react';

/*
 * Lay out a bunch of components in a complete binary tree.
 */
export default class TreeView extends Component {

    render() {
        return <div>
            {this.props.elements.map(this._renderRow.bind(this))}
        </div>;
    }

    _renderRow(row, rowIndex) {
        return <div key={rowIndex} style={{
            display: "table",
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: this.props.spacing,
            marginBottom: -this.props.spacing,  // counteract double-spacing
        }}>
            <div style={{
                display: "table-row",
                height: this.props.rowHeight,  // might be undefined; fine
            }}>
                {row.map((node, nodeIndex) =>
                    <div key={nodeIndex} style={{
                        display: "table-cell",
                        textAlign: "center",
                        verticalAlign: "top",
                    }}>{node}</div>)}
            </div>
        </div>;
    }

}
TreeView.propTypes = {

    /*
     * A ragged array like [[1], [2, 3], [4, 5, 6, 7], [8, ..., 15]]
     * containing the rows to render, in left-to-right order.
     */
    elements: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.node.isRequired).isRequired
    ).isRequired,

    // Optional: fixed row height (px).
    rowHeight: PropTypes.number,

    // Optional: row and column spacing (defaults to 5px).
    spacing: PropTypes.number,

};
TreeView.defaultProps = {
    rowHeight: undefined,
    spacing: 5,
};
