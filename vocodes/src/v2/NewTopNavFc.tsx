import React from 'react';
import { SessionWrapper } from '../session/SessionWrapper';
import { Link } from 'react-router-dom';

interface Props {
  sessionWrapper: SessionWrapper,
  logoutHandler: () => void,
}

function NewTopNavFc(props: Props) {
  let myDataLink = '/signup';

  if (props.sessionWrapper.isLoggedIn()) {
    let username = props.sessionWrapper.getUsername();
    myDataLink = `/profile/${username}/data`;
  }

  return (
    <nav>
      <div className="columns">
        <div className="column">
          <Link to="/"
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
          <Link to={myDataLink}
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

export { NewTopNavFc };
