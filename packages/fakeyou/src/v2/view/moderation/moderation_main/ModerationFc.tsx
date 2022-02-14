import React from 'react';
import { Link } from 'react-router-dom';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';

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
        to={FrontendUrlConfig.moderationTtsCategoryList()}
        className="button is-link is-large is-fullwidth is-light"
        >Manage TTS Categories</Link>
        
      <br />

      <Link
        to="/moderation/approve/w2l_templates"
        className="button is-link is-large is-fullwidth is-light"
        >Unapproved W2L Templates</Link>
        
      <br />

      <Link
        to="/moderation/voice_stats"
        className="button is-link is-large is-fullwidth is-light"
        >Voice Stats</Link>
        
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
