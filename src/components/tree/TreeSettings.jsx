import React, {Component} from 'react';

export default class TreeSettings extends Component {

    render() {
        const updateIn = (name, value) =>
            this.props.onChange({...this.props.value, [name]: value});

        return <div>
            <label forName="depth">Tree depth</label>
            <div className="input-group">
                <input
                    ref="levels"
                    type="range"
                    id="depth"
                    min={1}
                    max={6}
                    value={this.props.value.levels}
                    onChange={() => updateIn("levels", this.refs.levels.value)}
                />
            </div>
        </div>;
    }

}
