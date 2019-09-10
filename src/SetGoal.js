import React, { Component } from 'react';
import firebase from './firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown } from '@fortawesome/free-solid-svg-icons'


class SetGoal extends Component {
   
    // runs on form submit for SetGoal
    pushToFirebase = (event) => {
        event.preventDefault();
        // toggles section closed
        this.props.toggleHidden();

        // updates firebase for goal setting
        const dbRef = firebase.database().ref(this.props.user ? `users/${this.props.userID}/goal` : `goal`);
        dbRef.set({
            number: this.props.goalState,
            activity: this.props.goalString
        });

        // new auth users need a tracker sent to firebase or the app will crash as it tries to pull it in. Fixed by pushing it up initially as empty. Form submit for this will now remove users data if it exists. Warning message on page for user. 
        firebase.database().ref(this.props.user ? `users/${this.props.userID}/tracker` : `tracker`);
        dbRef.update({
            tracker: [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
        });
    };

    render() {

        // this disables the form submit if they have never saved a goal title. (User can update goal amount whenever they like if they already have a goal activity saved)
        const isEnabled = this.props.goalString.length > 0;

        return (

            <section className="goals">
                <form onSubmit={this.pushToFirebase} action="" className="set-goal">
                    <fieldset>
                        <legend className="visually-hidden">Set or update your goal</legend>
                        <div>
                            <label htmlFor="userGoal">What activity is your goal for?</label>
                            <input
                                name="userGoal"
                                type="text"
                                placeholder="eg: go for a run"
                                onChange={this.props.updateGoal}
                            />
                            {/* If user has never set a goal name. error message for why form wont submit. */}
                            {!isEnabled ? <p>Please set a goal</p> : null}
                        </div>
                        <div>
                            <div className="select-container">
                                <label htmlFor="goalAmount">How many times per week?</label>
                                {/* icon to replace default select styling */}
                                <FontAwesomeIcon icon={faSortDown} className="goal-select-arrow" />
                                <select
                                    name="goalAmount"
                                    onChange={this.props.updateGoal}
                                >
                                    <option value="0">Chose an amount</option>
                                    <option value="1">Once</option>
                                    <option value="2">Twice</option>
                                    <option value="3">Three times</option>
                                    <option value="4">Four times</option>
                                    <option value="5">Five times</option>
                                    <option value="6">Six times</option>
                                    <option value="7">Seven times</option>
                                </select>
                            </div>
                        </div>
                        <label className="save-label" htmlFor="save"><span className="visually-hidden">Save Goal</span> Warning: Clicking this button will erase your previous tracker data. Click set/update to escape.</label>
                        <button disabled={!isEnabled} name="save">Save Goal</button>
                    </fieldset>
                </form>
            </section>
        );
    }

}

export default SetGoal;