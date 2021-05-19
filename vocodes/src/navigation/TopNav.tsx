import React from 'react';
import { Mode } from '../AppMode'
import { SessionStateResponse } from '../api/SessionState';

interface Props {
  enableAlpha: boolean,
  sessionState?: SessionStateResponse,
  mode: Mode,
  historyBadgeCount: number,
  isHistoryCountBadgeVisible: boolean,
  switchModeCallback: (mode: Mode) => void,
  logoutHandler: () => void,
}

function TopNav(props: Props) {
  let badge = <span />;

  if (props.historyBadgeCount > 0) {
    let className = "tag is-info is-light";

    if (props.isHistoryCountBadgeVisible) {
      className = "tag is-danger";
    }

    badge = <span className={className}>{props.historyBadgeCount}</span>;
  }

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

  if (props.enableAlpha) {
    if (loggedIn) {
      loginManagement = (
        <span>
          <a href="#profile" onClick={() => props.switchModeCallback(Mode.PROFILE_MODE)}>{displayName}</a>
          <a href="#logout" onClick={() => props.logoutHandler()}>Log Out</a>
        </span>
      );
    } else {
      loginManagement = (
        <span>
          <a href="#login" onClick={() => props.switchModeCallback(Mode.LOGIN_MODE)}>Login</a>
          <a href="#signup" onClick={() => props.switchModeCallback(Mode.SIGNUP_MODE)} className="signup">Sign Up</a>
        </span>
      );
    }

    extendedFeatures = (
      <div className="notification is-info is-light">
          <strong>NEW:</strong>
          <a href="#community_tts" onClick={() => props.switchModeCallback(Mode.COMMUNITY_TTS_MODE)}>Community TTS</a>
          <a href="#community_video" onClick={() => props.switchModeCallback(Mode.COMMUNITY_VIDEO_MODE)}>Community Video</a>
          <a href="#upload_voices" onClick={() => props.switchModeCallback(Mode.UPLOAD_VOICES_MODE)}>Upload Voices</a>
          <a href="#upload_video" onClick={() => props.switchModeCallback(Mode.UPLOAD_VIDEO_MODE)}>Upload Video</a>
          <a href="#my_data" onClick={() => props.switchModeCallback(Mode.MY_DATA_MODE)}>My Data</a>
          <br />
          <p>(Yes, this needs a redesign!)</p>
      </div>
    );
  }

  return (
    <nav>
      <span id="logo_text">
        <a href="#speak" onClick={() => props.switchModeCallback(Mode.SPEAK_MODE)}><span 
          className="vo">Vo</span><span className="codes">codes</span></a>
      </span>
      <a href="#video" onClick={() => props.switchModeCallback(Mode.SPEAK_MODE)}>TTS</a>
      <a href="#video" onClick={() => props.switchModeCallback(Mode.VIDEO_MODE)}>Video</a>
      <a href="#history" onClick={() => props.switchModeCallback(Mode.HISTORY_MODE)}>Results {badge}</a>
      <a href="#use" onClick={() => props.switchModeCallback(Mode.ABOUT_MODE)}>About</a>

      {loginManagement}
      {extendedFeatures}
      <hr />
    </nav>
  )
}

export { TopNav };
