import React from 'react';
import { NewMode } from '../../v2/NewVocodesContainer'
import { SessionStateResponse } from '../api/SessionState';

interface Props {
  sessionState?: SessionStateResponse,
  mode: NewMode,
  ///historyBadgeCount: number,
  //isHistoryCountBadgeVisible: boolean,
  switchModeCallback: (mode: NewMode ) => void,
  logoutHandler: () => void,
}

function NewTopNav(props: Props) {
  let badge = <span />;

  /*if (props.historyBadgeCount > 0) {
    let className = "tag is-info is-light";

    if (props.isHistoryCountBadgeVisible) {
      className = "tag is-danger";
    }

    badge = <span className={className}>{props.historyBadgeCount}</span>;
  }*/

  let loggedIn = false;
  let displayName = "My Account";

  if (props.sessionState !== undefined) {
    console.log('sessionstate', props.sessionState);
    loggedIn = props.sessionState.logged_in;
    if (props.sessionState.user !== undefined && 
        props.sessionState.user !== null) {
      displayName = props.sessionState.user.display_name;
    }
  }

  // Vo.codes 2.0
  let loginManagement = <span />;
  let extendedFeatures = <span />;
  let column1 = <div></div>;
  let column2 = <div></div>;

  if (true) {
    if (loggedIn) {
      loginManagement = (
        <span>
          <a href="#profile" onClick={() => props.switchModeCallback(NewMode.MY_PROFILE_MODE)}>{displayName}</a>
          <a href="#logout" onClick={() => props.logoutHandler()}>Log Out</a>
        </span>
      );
      column1 = (
        <div className="column">
          <button 
            className="button is-link is-large is-inverted"
            onClick={() => props.switchModeCallback(NewMode.MY_PROFILE_MODE)}
            >Firehose</button>
        </div>
      );
    } else {
      loginManagement = (
        <span>
          <a href="#login" onClick={() => props.switchModeCallback(NewMode.LOGIN_MODE)}>Login</a>
          <a href="#signup" onClick={() => props.switchModeCallback(NewMode.SIGNUP_MODE)} className="signup">Sign Up</a>
        </span>
      );
      column1 = (
        <div className="column">
          <button 
            className="button is-link is-large is-inverted"
            onClick={() => props.switchModeCallback(NewMode.SIGNUP_MODE)}
            >Sign Up</button>
        </div>
      );
      column2 = (
        <div className="column">
          <button 
            className="button is-link is-large is-inverted"
            onClick={() => props.switchModeCallback(NewMode.LOGIN_MODE)}
            >Login</button>
        </div>
      );
    }

    extendedFeatures = (
      <div className="notification is-info is-light">
          <strong>NEW Community Features let you use Your Own Voices and Video:</strong>
          <br />
          <br />
          <a href="#community_tts" onClick={() => props.switchModeCallback(NewMode.COMMUNITY_TTS_MODE)}>TTS</a>
          <a href="#community_video" onClick={() => props.switchModeCallback(NewMode.COMMUNITY_W2L_MODE)}>Video</a>
          <a href="#upload" onClick={() => props.switchModeCallback(NewMode.UPLOAD_MODE)}>Upload</a>
          <a href="#my_data" onClick={() => props.switchModeCallback(NewMode.MY_DATA_MODE)}>My Data</a>
      </div>
    );
  }


  return (
    <nav>
      <div className="columns">
        {column1}
        {column2}
        <div className="column">
          <button 
            className="button is-link is-large is-inverted"
            onClick={() => props.switchModeCallback(NewMode.COMMUNITY_TTS_MODE)}
            >Text to Speech 🗣️</button>
        </div>
        <div className="column">
          <button 
            className="button is-link is-large is-inverted"
            onClick={() => props.switchModeCallback(NewMode.COMMUNITY_TTS_MODE)}
            >Video 🎥</button>
        </div>
      </div>
      <div className="columns">
        <div className="column">
          <button 
            className="button is-link is-large is-inverted"
            onClick={() => props.switchModeCallback(NewMode.COMMUNITY_TTS_MODE)}
            >Upload TTS ⬆️</button>
        </div>
        <div className="column">
          <button 
            className="button is-link is-large is-inverted"
            onClick={() => props.switchModeCallback(NewMode.COMMUNITY_TTS_MODE)}
            >Upload Video ⬆️</button>
        </div>
        <div className="column">
          <button 
            className="button is-link is-large is-inverted"
            onClick={() => props.switchModeCallback(NewMode.COMMUNITY_TTS_MODE)}
            >My Data</button>
        </div>
      </div>
      <hr />
    </nav>
  )
}

export { NewTopNav };
