import React from 'react';
import { Link } from 'react-router-dom';
import { SessionWrapper } from '../../../../session/SessionWrapper';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ModerationFc(props: Props) {

  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
  }

  return (
    <div>
      <h1 className="title is-1"> Moderation Controls </h1>

      <Link
        to="/moderation/user/list"
        className="button is-link is-large is-fullwidth is-light"
        >User List</Link>

      <br />

      <Link
        to="/moderation/ip_bans"
        className="button is-link is-large is-fullwidth is-light"
        >IP Ban List</Link>
        
      <br />

      <Link
        to="/moderation/job_stats"
        className="button is-link is-large is-fullwidth is-light"
        >Job Stats</Link>
        
      <br />

      <p>
        More mod controls will be added in the future: user roles, activity tracking, 
        timed bans, account bans, etc.
      </p>

    </div>
  )
}

export { ModerationFc };
