import React from 'react';
import { SessionStateResponse } from '../v1/api/SessionState';
import { SessionWrapper } from '../session/SessionWrapper';
import { Link } from 'react-router-dom';

interface Props {
  sessionState?: SessionStateResponse,
  sessionWrapper: SessionWrapper,
  ///historyBadgeCount: number,
  //isHistoryCountBadgeVisible: boolean,
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
          <a href="#profile" onClick={() => {}}>{displayName}</a>
          <a href="#logout" onClick={() => {}}>Log Out</a>
        </span>
      );
      column1 = (
        <div className="column">
          <button 
            className="button is-link is-large is-inverted"
            onClick={() => {}}
            >Firehose</button>
        </div>
      );
    } else {
      loginManagement = (
        <span>
          <a href="#login" onClick={() => {}}>Login</a>
          <a href="#signup" onClick={() => {}} className="signup">Sign Up</a>
        </span>
      );
      column1 = (
        <div className="column">
          <button 
            className="button is-link is-large is-inverted"
            onClick={() => {}}
            >Sign Up</button>
        </div>
      );
      column2 = (
        <div className="column">
          <button 
            className="button is-link is-large is-inverted"
            onClick={() => {}}
            >Login</button>
        </div>
      );
    }

    extendedFeatures = (
      <div className="notification is-info is-light">
          <strong>NEW Community Features let you use Your Own Voices and Video:</strong>
          <br />
          <br />
          <a href="#community_tts" onClick={() => {}}>TTS</a>
          <a href="#community_video" onClick={() => {}}>Video</a>
          <a href="#upload" onClick={() => {}}>Upload</a>
          <a href="#my_data" onClick={() => {}}>My Data</a>
      </div>
    );
  }


  return (
    <nav>
      <div className="columns">
        <div className="column">
          <Link to="/tts"
            className="button is-link is-medium is-inverted"
            >Text to Speech️</Link>
        </div>
        <div className="column">
          <Link to="/video"
            className="button is-link is-medium is-inverted"
            >Video</Link>
        </div>
        <div className="column">
          <Link to="/upload"
            className="button is-link is-medium is-inverted"
            >Upload</Link>
        </div>
        <div className="column">
          <Link to="/upload"
            className="button is-link is-medium is-inverted"
            >My Data</Link>
        </div>
        <div className="column">
          <Link to="/firehose"
            className="button is-link is-medium is-inverted"
            >Firehose</Link>
        </div>
      </div>
      <hr />
    </nav>
  )
}

export { NewTopNav };
