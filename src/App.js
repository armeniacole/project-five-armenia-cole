import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
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
      userGoal: '',
      goalAmount: 0,
      month: [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]],
      weekOne: "",
      weekTwo: "",
      weekThree: "",
      weekFour: "",
      isHidden: true,
      user: null,
      userID: ""
    }
    // allows save button to also toggle set goal
    this.toggleHidden = this.toggleHidden.bind(this);
  }

  // updates goal amount and goal name in set goal
  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  // toggles goal setting section
  toggleHidden() {
    this.setState({
      isHidden: !this.state.isHidden
    })
  }


  componentDidMount() {
    // this.addWeekly(this.state.month[0], "weekOne");
    // this.addWeekly(this.state.month[1], "weekTwo");
    // this.addWeekly(this.state.month[2], "weekThree");
    // this.addWeekly(this.state.month[3], "weekFour");

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

            // console.log(dataBase.tracker)
            // console.log("user id in dbref call", this.state.userID)
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
            this.addWeekly(this.state.month[0], "weekOne");
            this.addWeekly(this.state.month[1], "weekTwo");
            this.addWeekly(this.state.month[2], "weekThree");
            this.addWeekly(this.state.month[3], "weekFour");

          });

        });
      }
    });

    console.log(this.state.month[0])

    // console.log(this.state.user)
    // console.log("user id", this.state.userID)
    // console.log(this.state.month)


  }

  // take the tracker info in state and update firebase 
  updateTracker = () => {
    const dbRef = firebase.database().ref(this.state.user ? `users/${this.state.userID}/goal/tracker` : `tracker`);

    dbRef.set(this.state.month)
  }

  // this runs on change of tracker selects in Counter Component (this.props.trackerFunction(event, this.props.weekIndex, this.props.dayIndex))

  trackerValue = (event, weekIndex, dayIndex) => {
    // spreads array and saves
    const copiedArray = [...this.state.month];
    // console.log("array",copiedArray)
    // converts select inputs to a number
    const selected = Number(event.target.value);
    // makes sure select value is now a number and then
    if (typeof (selected) === "number") {
      // console.log("selected",selected)
      // console.log("copied", copiedArray[weekIndex])


      // sets the index of that array to the value that was selected
      copiedArray[weekIndex][dayIndex] = selected;
    }
    // copiedArray[weekIndex][dayIndex] = event.target.value;

    this.setState({
      // updates state with new value
      month: copiedArray
      // if the user is logged in run updateTracker function to update firebase
    }, (this.state.user ? this.updateTracker : null))

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
    console.log(weekArray, weekState, 'hhee')
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

  logout = () => {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }



  render() {

    // console.log(this.state.user)
    console.log(this.state.weekOne)

    // runs the comparison for the total completed vs goal and then renders message to page
    const progressMessage = (weekState) => {
      if (weekState === 0) {
        return
      } else if (weekState < this.state.goalAmount) {
        return <p>You have {this.state.goalAmount - weekState} more time(s) reach this weeks goal</p>
      } else if (weekState == this.state.goalAmount) {
        return <p>Congrats! You have meet your goal for this week!</p>
      } else if (weekState > this.state.goalAmount) {
        return <p>You have surpassed your goal!</p>
      }
    }



    return (
      <div className="App">
        <header className="wrapper">
          <h1>(re)solution</h1>
          <button onClick={this.toggleHidden.bind(this)}>Set/Update Goal</button>
          {this.state.user ? <button onClick={this.logout}>Log Out</button> : <button onClick={this.login}>Log In</button>}
        </header>
        <div>
          <h2>Your goal is to <span>{this.state.userGoal}</span> : <span>{this.state.goalAmount}</span> times a week!</h2>
        </div>
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
        <div className="flex-main wrapper">
          <section className="tracker">
            <p>Mon</p>
            <p>Tue</p>
            <p>Wed</p>
            <p>Thur</p>
            <p>Fri</p>
            <p>Sat</p>
            <p>Sun</p>

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

          <section className="results wrapper">
            {console.log("weekOne", this.state.weekOne)}
            <p><span>Week One:</span> {progressMessage(this.state.weekOne)}</p>
            <p><span>Week Two:</span> {progressMessage(this.state.weekTwo)}</p>
            <p><span>Week Three:</span> {progressMessage(this.state.weekThree)}</p>
            <p><span>Week Four:</span> {progressMessage(this.state.weekFour)}</p>
            <button onClick={this.handleClear}>Clear Tracked Data</button>
          </section>
        </div>
        {/* <button onClick={(event) => { if (window.confirm('Delete the item?')) { this.handleClear() }; }}>Clear Tracked Data</button> */}

        <footer>
          <p>&copy; Armenia Cole 2019</p>
        </footer>
      </div>
    );
  }
}

export default App;
