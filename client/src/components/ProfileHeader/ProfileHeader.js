import React from "react";
import PropTypes from 'prop-types';
import { withRouter } from "react-router";
import { Dropdown, Image } from "semantic-ui-react";
import { connect } from "react-redux";
import Icon from "@material-ui/core/Icon";
import profileUrl from "../../images/profile.png";
import { clearAuthDetails } from "../../pages/LandingPage/actions";
import Auth from "../../Auth";

const auth0 = new Auth();

const authDetail = {
  player_given_name: "",
  player_family_name: "",
  player_email: "",
  player_username: "",
  player_picture: "",
  player_gender: "",
};

const ProfileHeader = props => {
  let trigger;
  let options = [];
  if (props.location.pathname.includes("/landingpage") && props.location.pathname.length >= 14) {
    auth0.setCohort(props.location.pathname);
  }

  // handle Login in action
  const handleLogIn = () => {
    if (!auth0.isAuthenticated()) {
      auth0.login();
    }
  };

  // handle Logout in action
  const handleLogOut = () => {
    if (auth0.isAuthenticated()) {
      authDetail.player_given_name = "";
      authDetail.player_family_name = "";
      authDetail.player_email = "";
      authDetail.player_username = "";
      authDetail.player_picture = "";
      authDetail.player_gender = "";
      props.clearAuth(authDetail);
      auth0.logout();
    }
  };

  const getLogoPath = () => {
    try {
      const cohort_name = auth0.getCohort().split("/landingpage")[0];
      if (cohort_name) {
        return `/client/images${cohort_name}.png`;
      }
      return "/client/images/default.png";
    } catch (err) {
      return "/client/images/default.png";
    }
  };

  const handleAdmin = () => {
    props.history.push("/admin");
  };

  const handleProfile = () => {
    props.history.push("/profile");
  };
  if (auth0.isAuthenticated()) {
    trigger = (
      <span>
        <Image avatar src={`${props.player.player_picture || profileUrl}`} />
        {" "}
        {`${props.player.player_given_name || ""} ${props.player
          .player_family_name || ""}`}
      </span>
    );
    options = [
      {
        key: "profile",
        text: "Profile",
        icon: "user",
        onClick: handleProfile,
      },
      {
        key: "sign-out",
        text: "Sign Out",
        icon: "sign out",
        onClick: handleLogOut,
      },
    ];

    if (
      auth0.getProfile()
      && auth0.getProfile()["http://demGames.net/roles"]
      && auth0.getProfile()["http://demGames.net/roles"][0] === "admin"
    ) {
      options.unshift({
        key: "adminPage",
        text: "Admin Page",
        icon: "settings",
        onClick: handleAdmin,
      });
    }
  } else {
    trigger = (
      <span>
        <Image avatar src={profileUrl} />
        {' '}
        Hello. Sign In
      </span>
    );
    options = [
      {
        key: "login",
        text: "Login / Sign Up",
        icon: "user",
        onClick: handleLogIn,
      },
    ];
  }
  return (
    <div className="main-header">
      <div className="logo-header">
        <img className="company-logo" src={getLogoPath()} alt="ndi-logo" />
      </div>
      <div className="profile-header">
        <a
          href={auth0.getCohort() != null ? auth0.getCohort() : "/landingpage"}
          style={{ verticalAlign: "middle", paddingRight: "30px" }}
        >
          <Icon>home</Icon>
          {" "}
        </a>
        <Dropdown
          trigger={trigger}
          options={options}
          pointing="top left"
          icon={null}
        />
      </div>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  clearAuth: () => dispatch(clearAuthDetails(authDetail)),
});

const mapStateToProps = state => ({
  player: state.authDetail.authDetail,
  gameData: state.gameData,
});

ProfileHeader.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  clearAuth: PropTypes.func.isRequired,
  player: PropTypes.shape({
    player_given_name: PropTypes.string,
    player_family_name: PropTypes.string,
    player_picture: PropTypes.string,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

ProfileHeader.defaultProps = {

};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(ProfileHeader));
