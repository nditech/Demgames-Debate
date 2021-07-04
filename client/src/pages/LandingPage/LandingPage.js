import React from "react";
import { ModuleCard } from "../../components/ModuleCard";
import "../../commonStyles.scss";
import "./styles.scss";
import { config } from "../../settings";
import { connect } from "react-redux";
import {
  fetchGameData,
  fetchScores,
  fetchAuthDetails,
  clearAuthDetails,
} from "./actions";
import PropTypes from "prop-types";
import GameInfo from "../../components/GameInfo";
import Auth from "../../Auth";
import { fetchScoreDetail } from "../../components/ProfileInfo/action";

const auth0 = new Auth();

const authDetail = {
  player_given_name: "",
  player_family_name: "",
  player_email: "",
  player_username: "",
  player_picture: "",
  player_gender: "",
};

const scoreDetail = {
  current: 0,
  score: 0,
  play_id: "null",
  player_id: "null",
  game_id: null,
  program: null,
  total: 0,
  program_rank: null,
  total_rank: null,
};

global.fetch = require("node-fetch");

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      color: "blue",
    };

    this.colorChange = this.colorChange.bind(this);

    // this.handleLogIn=this.handleLogIn.bind(this);
  }

  // Fetch complete game data.
  UNSAFE_componentWillMount() {
    let cohort = 'default';
    if (this.props.match) {
      cohort = this.props.match.params.cohortName ? this.props.match.params.cohortName : 'default';
    }
    // fetch('./moduleData.json')
    fetch(`${config.baseUrl}/api/v2/game/${cohort}`, {
      method: "get",
      headers: {
        authorization: `Bearer ${auth0.getAccessToken()}`,
        "Content-Type": "Application/json",
        Accept: "application/json",
      },
    })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          response.json().then(res => {
            this.props.getGameData(res.gameData);
            const scores = this.getScores();
            this.props.getScores(scores);
          });
        } else if (response.status === 404) {
          console.log("Not Found"); // eslint-disable-line
        }
      })
      .catch(err => console.log(err)); // eslint-disable-line

    // auth0.handleAuthentication();
    if (auth0.isAuthenticated() === true) {
      authDetail.player_given_name = auth0.getProfile().given_name;
      authDetail.player_family_name = auth0.getProfile().family_name;
      authDetail.player_picture = auth0.getProfile().picture;
      authDetail.player_username = auth0.getProfile().nickname;
      authDetail.player_email = auth0.getProfile().email;
      authDetail.player_picture = auth0.getProfile().picture;
      authDetail.player_gender = auth0.getProfile().gender;

      this.props.setAuth(authDetail);

      fetch(`${config.baseUrl}/user/findOne/${authDetail.player_email}`, {
        method: "get",
        headers: {
          authorization: `Bearer ${auth0.getAccessToken()}`,
          "Content-Type": "Application/json",
          Accept: "application/json",
        },
      })
        .then(res => res.json())
        .then(data => {
          if (!data.email) {
            console.log("email not found --V"); // eslint-disable-line

            fetch(`${config.baseUrl}/registerplayer`, {
              method: "POST",
              headers: {
                authorization: `Bearer ${auth0.getAccessToken()}`,
                "Content-Type": "Application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                firstName: authDetail.player_username,
                email: authDetail.player_email,
                userName: authDetail.player_username,
              }),
            })
              .then(res => res.json())
              .then(responseData => responseData)
              .catch(error => {
                console.log(error); // eslint-disable-line
              });
          }
        })
        .catch(error => {
          console.log(error); // eslint-disable-line
        });
    } else {
      this.props.clearAuth(authDetail);
    }

    if (auth0.isAuthenticated() === true) {
      fetch(`${config.baseUrl}/selectPlayerProfile`, {
        method: "post",
        headers: {
          "Content-Type": "Application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(auth0.getProfile()),
      })
        .then(res => res.json())
        .then(data => {
          scoreDetail.current = data[0].current;
          scoreDetail.game_id = data[0].game_id;
          scoreDetail.play_id = data[0].id;
          scoreDetail.player_id = data[0].player_id;
          scoreDetail.score = data[0].score;
          scoreDetail.total = data[0].total;
          scoreDetail.total_rank = data[0].total_rank;
          scoreDetail.program = data[0].program;
          scoreDetail.program_rank = data[0].program_rank;
          this.props.setScoreDetail(scoreDetail);
        })
        .catch(error => console.log(error)); // eslint-disable-line
    }
  }

  // Fetch scores for each levels of each module.
  getScores = () => {
    const allScores = [];
    this.props.gameData.gameData.map(modules => {
      allScores.push(
        modules.levels.map(level => level.current_score),
      );
    });
    return allScores;
  };

  // Handle info icon click to open info dialog box.
  handleClickOpen = () => {
    this.setState({ open: true });
  };

  // Handle info dialog box close.
  handleClose = () => {
    this.setState({ open: false });
  };

  // handle Login in action
  handleLogIn = () => {
    if (!auth0.isAuthenticated()) {
      auth0.login();
    }
  };

  // handle Logout in action
  handleLogOut = () => {
    if (auth0.isAuthenticated()) {
      authDetail.player_given_name = "";
      authDetail.player_family_name = "";
      authDetail.player_email = "";
      authDetail.player_username = "";
      authDetail.player_picture = "";
      authDetail.player_gender = "";
      this.props.clearAuth(authDetail);
      auth0.logout();
    }
  };

 colorChange = (color) => {
   this.setState({ color });
 };

 render() {
   const { gameData } = this.props.gameData;
   const { open } = this.state;
   return (
     <div className="landing-page-wrapper">
       <div className="landing-page-container">
         <div className="game-title-container">
           <p className="game-title">DemGames - Demo</p>
         </div>
         <div className="game-type-card-container">
           {gameData.length > 0
              && gameData.map((modules) => (
                <ModuleCard
                  key={modules.id}
                  moduleId={modules.id}
                  gameId={modules.game_id}
                  moduleName={modules.name}
                  levels={modules.levels}
                  style={modules.style}
                  moduleType={modules.type}
                  player_email={
                    this.props.player_email === null
                      ? "default"
                      : this.props.player_email
                  }
                />
              ))}
         </div>
       </div>
       {open && <GameInfo open={open} handleClose={this.handleClose} />}
     </div>
   );
 }
}

const mapStateToProps = state => ({
  player_given_name: state.authDetail.authDetail.player_given_name,
  player_picture: state.authDetail.authDetail.player_picture,
  gameData: state.gameData,
});

// Dispatch action to fetch game data and scores.
const mapDispatchToProps = dispatch => ({
  getGameData: gameData => dispatch(fetchGameData(gameData)),
  getScores: scores => dispatch(fetchScores(scores)),
  setAuth: () => dispatch(fetchAuthDetails(authDetail)),
  clearAuth: () => dispatch(clearAuthDetails(authDetail)),
  setScoreDetail: () => dispatch(fetchScoreDetail(scoreDetail)),
});

LandingPage.propTypes = {
  getGameData: PropTypes.func,
  getScores: PropTypes.func,
  gameData: PropTypes.shape({
    gameData: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  authDetail: PropTypes.shape({}),
  setAuth: PropTypes.func,
  clearAuth: PropTypes.func,
  setScoreDetail: PropTypes.func.isRequired,
  scoreDetail: PropTypes.shape({}),
  player_email: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      cohortName: PropTypes.string,
    }),
  }),
};

LandingPage.defaultProps = {
  getGameData: null,
  getScores: null,
  gameData: null,
  authDetail: null,
  setAuth: null,
  clearAuth: null,
  scoreDetail: null,
  player_email: null,
  match: null,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LandingPage);
