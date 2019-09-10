import React, { Component } from 'react';
import './App.scss';
import firebase from './firebase';
import SetGoal from './SetGoal';
import Counter from './Counter';

const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();

class App extends Component {

  constructor() {
    super();
    this.state = {
      // SetGoal
      userGoal: '',
      goalAmount: 0,
      month: [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
      // for progress messages
      weekOne: "",
      weekTwo: "",
      weekThree: "",
      weekFour: "",
      // for toggle
      isHidden: true,
      // for auth
      user: null,
      userID: ""
    }

    // allows save button to also toggle SetGoal closed.
    this.toggleHidden = this.toggleHidden.bind(this);
  }

  // sets state on change for inputs in SetGoal
  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }


  // toggles goal setting section on Set/Update goal button
  toggleHidden() {
    this.setState({
      isHidden: !this.state.isHidden
    })
  }


  componentDidMount() {
    
    // if user is logged in
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          user,
          // get their unique user key from auth and store it
          userID: user.uid

        }, () => {

          // then grab the stuff that that user has saved in database and update state
          const dbRef = firebase.database().ref(`users/${this.state.userID}`);
          dbRef.on('value', (data) => {

            const dataBase = data.val();
            const activity = dataBase.goal.activity;
            const number = dataBase.goal.number;
            const tracker = dataBase.goal.tracker;

            this.setState({
              userGoal: activity,
              goalAmount: number,
              month: tracker
            }, () => {

            })

            // run function addWeekly to reduce the array for each week and store total in state
            // this needs to run here for users who are logged in only
            this.addWeekly(this.state.month[0], "weekOne");
            this.addWeekly(this.state.month[1], "weekTwo");
            this.addWeekly(this.state.month[2], "weekThree");
            this.addWeekly(this.state.month[3], "weekFour");

          });

        });
      }
    });
  }



  // take the tracker info in state and update firebase 
  updateTracker = () => {
    const dbRef = firebase.database().ref(this.state.user ? `users/${this.state.userID}/goal/tracker` : `tracker`);

    dbRef.set(this.state.month)
  }



  // this runs onChange of tracker selects in Counter Component
  trackerValue = (event, weekIndex, dayIndex) => {
    // spreads array and saves
    const copiedArray = [...this.state.month];

    // converts select inputs to a number
    const selected = Number(event.target.value);

    // makes sure select value is now a number and then
    if (typeof (selected) === "number") {
      // sets the index of that array to the value that was selected
      copiedArray[weekIndex][dayIndex] = selected;
    }
    
    this.setState({
      // updates state with new value
      month: copiedArray
      // if the user is logged in run updateTracker function to update firebase
    }, (this.state.user ? this.updateTracker : null))

    // this set of addWeekly runs here exclusively so that users do not have to be logged in to use this progress message feature. This makes the app fully functional (except save past refresh) for guests to try.
    this.addWeekly(this.state.month[0], "weekOne");
    this.addWeekly(this.state.month[1], "weekTwo");
    this.addWeekly(this.state.month[2], "weekThree");
    this.addWeekly(this.state.month[3], "weekFour");
  }




  // deletes tracker data on click of button in result/message section
  handleClear = (event) => {
    event.preventDefault();

    this.setState({
      month: [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]]
    }, this.updateTracker)

  }



  // takes an array to use and a state to update 
  addWeekly = (weekArray, weekState) => {

    // reduces array to get the total
    const total = weekArray.reduce((total, integer) => {
      return total + integer
    })
    // updates the relevant state to hold total for comparison
    const name = weekState;
    this.setState({
      [name]: total
    })

  }


  
  // log in function - also sets state for user id to match database key
  login = () => {
    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        this.setState({
          user,
          userID: user.uid
        });
      });
  }

  // log out function
  logout = () => {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }



  render() {

    // runs the comparison for the total completed vs goal and assigns the message to be rendered
    const progressMessage = (weekState) => {
      if (weekState === 0) {
        return
      } else if (weekState < this.state.goalAmount) {
        return <span>You have {this.state.goalAmount - weekState} more time(s) reach this weeks goal</span>
      } else if (weekState == this.state.goalAmount) {
        return <span>Congrats! You have meet your goal for this week!</span>
      } else if (weekState > this.state.goalAmount) {
        return <span>You have surpassed your goal!</span>
      }
    }

    return (
      <div className="App">
        {/* Header - is a flex container*/}
        <header className="wrapper">
          <h1>(re)solution</h1>
          <button onClick={this.toggleHidden.bind(this)}>Set/Update Goal</button>
          {this.state.user ? <button onClick={this.logout}>Log Out</button> : <button onClick={this.login}>Log In</button>}
        </header>
        {/* Current Goal */}
        <section>
          <h2>Your goal is to <span>{this.state.userGoal}</span> : <span>{this.state.goalAmount}</span> times a week!</h2>
        </section>
        {/* Set/Update goal - shown on click of button in header */}
        {!this.state.isHidden && <SetGoal
          goalState={this.state.goalAmount}
          goalString={this.state.userGoal}
          updateGoal={this.handleChange}
          toggleHidden={this.toggleHidden}
          toggle={this.state.isHidden}
          user={this.state.user}
          userID={this.state.userID}
          className="wrapper"
        />}

        <p className="instructions wrapper">Make your goal a habit! For each day you complete your activity select how many times you did it. Check the progress section to see how you are doing. Please log in if you want to save your data.</p>
        {/* div to flex main content on large screens */}
        <div className="flex-main wrapper">
          {/* Tracker is a css grid */}
          <section className="tracker">
            <p>Mon</p>
            <p>Tue</p>
            <p>Wed</p>
            <p>Thur</p>
            <p>Fri</p>
            <p>Sat</p>
            <p>Sun</p>
            {/* select elements made by mapping an array inside another mapped array and then rendering the Counter Component - which is then rendered into css grid */}
            {
              this.state.month.map((week, weekIndex) => {
                return (
                  week.map((day, dayIndex) => {
                    return <Counter
                      key={weekIndex + dayIndex}
                      dayIndex={dayIndex}
                      weekIndex={weekIndex}
                      trackerFunction={this.trackerValue}
                      value={this.state.month[weekIndex][dayIndex]}
                    />
                  })
                )
              })

            }
          </section>
            {/* progress message takes the state produced by addWeekly - runs the comparison and renders the returned message to the page */}
          <section className="results wrapper">
            <p><span className="week-title">Week One:</span> {progressMessage(this.state.weekOne)}</p>
            <p><span className="week-title">Week Two:</span> {progressMessage(this.state.weekTwo)}</p>
            <p><span className="week-title">Week Three:</span> {progressMessage(this.state.weekThree)}</p>
            <p><span className="week-title">Week Four:</span> {progressMessage(this.state.weekFour)}</p>
            <button onClick={this.handleClear}>Clear Tracked Data</button>
          </section>
        </div>
       
        <footer>
          <p>&copy; Armenia Cole 2019</p>
        </footer>
      </div>
    );
  }
}

export default App;
