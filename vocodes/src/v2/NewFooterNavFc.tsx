import React from 'react';
import { SessionWrapper } from '../session/SessionWrapper';
import { Link } from 'react-router-dom';

import './_css/footer.scss'

interface Props {
  sessionWrapper: SessionWrapper,
}

function NewFooterNavFc(props: Props) {

  let moderationLink = <span />;

  if (props.sessionWrapper.canBanUsers()) {
    moderationLink = (
      <div className="v2_mod_link">
        <Link to="/moderation">&#xbb; Mod Controls</Link>
      </div>
    );
  }

  return (
    <div>
      <hr />

      <div className="content has-text-centered">
        <p>
          Built by <Link to="/profile/echelon">@echelon</Link> in Atlanta.
          | <Link to="/about">About Us</Link>&nbsp;| <Link to="/terms">Terms of Use</Link>
        </p>

      </div>

      <div className="v2_social">
        <a href="https://discord.gg/H72KFXm" target="_blank" rel="noopener noreferrer"><img src="/social-icons/016-discord.png" alt="Join us on Discord!" /></a>
        <a href="https://twitch.tv/vocodes" target="_blank" rel="noopener noreferrer"><img src="/social-icons/094-twitch.png" alt="Twitch" /></a>
        <a href="https://twitter.com/vocodes" target="_blank" rel="noopener noreferrer"><img src="/social-icons/096-twitter.png" alt="Twitter" /></a>
        <a href="https://facebook.com/vocodes" target="_blank" rel="noopener noreferrer"><img src="/social-icons/024-facebook.png" alt="Facething" /></a>
        <a href="https://www.patreon.com/vocodes" target="_blank" rel="noopener noreferrer"><img src="/social-icons/061-patreon.png" alt="Patreon" /></a>
      </div>

      {moderationLink}

    </div>
  )
}

export { NewFooterNavFc };
