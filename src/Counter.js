import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown } from '@fortawesome/free-solid-svg-icons'

class Counter extends Component {

    render() {
        return (

            <div className="select-container">
                {/* icon used for replacing default select styles */}
                <FontAwesomeIcon aria-hidden="true" icon={faSortDown} className="select-arrow" />

                <label className="visually-hidden" htmlFor="times">Enter a value for this day</label>
                <select 
                // select runs trackerValue onChange to keep state updated.
                    name="times"
                    onChange={(event) => this.props.trackerFunction(event, this.props.weekIndex, this.props.dayIndex)}
                    value={this.props.value}
                    disabled={this.props.userGoal.length > 1 ? false : true }
                >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
            </div>
        );
    }

}
export default Counter;