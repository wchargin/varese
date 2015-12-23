/*
 * A set of lightweight utilities to build settings layouts.
 * This contains some basic structural components (Table, Row, Cell)
 * and a few higher-level Cell abstractions (LabelCell, CheckboxCell).
 *
 * Sample usage:
 *
 *  import {
 *      Table,
 *      Row,
 *      Cell,
 *      LabelCell,
 *      CheckboxCell,
 *  } from 'path/to/SettingsTable';
 *
 *  function render() {
 *      return <Table>
 *          <Row>
 *              <LabelCell htmlFor="capacitance">Flux capacitance</LabelCell>
 *              <LabelCell htmlFor="extraPower">Use extra power?</LabelCell>
 *          </Row>
 *          <Row>
 *              <Cell>
 *                  <input id="capacitance" {...moreProps} />
 *              </Cell>
 *              <CheckboxCell
 *                  id="extraPower"
 *                  checked={this.props.extraPower}
 *                  onChange={this.props.onSetExtraPower}
 *                  labelYes="Powered up"
 *                  labelNo="Idle"
 *              />
 *          </Row>
 *      </Table>;
 *  }
 */
import React, {Component, PropTypes} from 'react';

/*
 * Create a component that just throws some extra style on another component.
 */
function makeStyledComponent(displayName, extraStyle, BaseComponent = 'div') {
    class StyledComponent extends Component {
        render() {
            const style = {
                ...extraStyle,
                ...this.props.style,
            };

            const otherProps = {...this.props};
            delete otherProps.style;
            delete otherProps.children;

            return <BaseComponent style={style} {...otherProps}>
                {this.props.children}
            </BaseComponent>;
        }
    }
    StyledComponent.displayName = displayName;
    StyledComponent.propTypes = {
        children: PropTypes.node.isRequired,
        style: PropTypes.object,
    };
    StyledComponent.defaultProps = {
        style: {},
    };
    return StyledComponent;
}

export const Table = makeStyledComponent('Table', {
    display: "table",
    marginBottom: 10,
});

export const Row = makeStyledComponent('Row', {
    display: "table-row",
});

const cellStyle = {
    display: "table-cell",
    verticalAlign: "middle",
    paddingBottom: 5,
    //
    // marginRight doesn't work on table cells,
    // and we only want horizontal spacing
    // so we can't use borderSpacing on the table div.
    // This should do.
    paddingRight: 20,
};
export const Cell = makeStyledComponent('Cell', cellStyle);
export const LabelCell = makeStyledComponent('LabelCell', cellStyle, 'label');

/*
 * A cell with a checkbox and a label for that checkbox.
 * The label text can change depending on the checked state of the box.
 */
export class CheckboxCell extends Component {

    render() {
        const {id, checked, onChange, labelYes, labelNo} = this.props;
        return <Cell className="checkbox">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                style={{ marginLeft: 0, marginRight: 20 }}
            />
            <label
                htmlFor={id}
                style={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    color: "#737373",  // Bootstrap's .help-block color
                }}
            >
                {checked ? labelYes : labelNo}
            </label>
        </Cell>;
    }

}
CheckboxCell.propTypes = {
    id: PropTypes.string.isRequired,       // HTML id for the checkbox itself
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes. func.isRequired,  // boolean => void
    labelYes: PropTypes.node.isRequired,   // probably a string
    labelNo: PropTypes.node.isRequired,    // probably a string
};
