import React from 'react';
import { NewTopNav } from '../navigation/NewTopNav';
import { SessionStateResponse } from '../api/SessionState';
import { LoginComponent } from '../modes/login/LoginComponent';
import { SignupComponent } from '../modes/signup/SignupComponent';


enum NewMode {
  LOGIN_MODE,
  SIGNUP_MODE,
  COMMUNITY_TTS_MODE,
  COMMUNITY_W2L_MODE,
  UPLOAD_MODE,
  MY_DATA_MODE,
  MY_PROFILE_MODE,
  EDIT_MY_PROFILE_MODE,
}

interface Props {
  sessionState?: SessionStateResponse,
}

interface State {
  mode: NewMode,
}

class NewVocodesContainer extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      mode: NewMode.SIGNUP_MODE,
    }
  }

  switchMode = (mode: NewMode) => {
    this.setState({mode: mode});
  }

  logout = () => {
  }

  public render() {
    let innerComponent = <div />;
    let loggedIn = false;
    let displayName = "My Account";

    if (this.props.sessionState !== undefined) {
      console.log('sessionstate', this.props.sessionState);
      loggedIn = this.props.sessionState.logged_in;
      if (this.props.sessionState.user !== undefined && 
          this.props.sessionState.user !== null) {
        displayName = this.props.sessionState.user.display_name;
      }
    }


    switch (this.state.mode) {
      case NewMode.SIGNUP_MODE:
        innerComponent = (
          <SignupComponent
            querySessionCallback={()=>{}}
            loggedIn={loggedIn}
          />
        );
        break;
      case NewMode.LOGIN_MODE:
        innerComponent = (
          <LoginComponent 
            querySessionCallback={()=>{}}
            loggedIn={loggedIn}
          />
        );
        break;
    }

    return (
      <div id="main" className="mainwrap">
        <div id="viewable">

          <NewTopNav
            mode={this.state.mode}
            switchModeCallback={this.switchMode}
            logoutHandler={this.logout}
            sessionState={this.props.sessionState}
            />

          {innerComponent}


        </div>
      </div>
    )
  }
}

export { NewVocodesContainer, NewMode }
