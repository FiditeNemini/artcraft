import { DiscordLink2 } from '@storyteller/components/src/elements/DiscordLink2';
import { Trans } from 'react-i18next';
import { TwitterLink } from '@storyteller/components/src/elements/TwitterLink';
import { TwitchLabsLink } from '@storyteller/components/src/elements/TwitchLabsLink';
import React from 'react';

interface Props {
  clearPleaseFollowNotice: () => void,
}

function PleaseFollowNotice(props: Props) {
  return (
    <>
      <div className="notification is-warning">
        <button className="delete" onClick={() => props.clearPleaseFollowNotice()}></button>
        <p>
          <strong>
            <Trans i18nKey="notices.pleaseFollow.title">
            Sorry our site is so slow!
            </Trans>
          </strong>
        </p>
        <br />
        <p>
          <Trans i18nKey="notices.pleaseFollow.body">
            I am so sorry the website is slow. We're getting millions of 
            requests. <TwitterLink>Please follow us on Twitter</TwitterLink> and 
            also <DiscordLink2>join our Discord</DiscordLink2>. 
            I'm going to introduce faster processing (less than one minute) for those that 
            follow us and help support our work. So please follow our Twitter and join our Discord. 
            Our new <TwitchLabsLink>video deepfake technology will debut on Twitch</TwitchLabsLink>, 
            so please follow us there too.
          </Trans>
        </p>
        <br />
        <p>
          <DiscordLink2 /> | <TwitterLink /> | <TwitchLabsLink />
        </p>
      </div>
    </>
  )  
}

export { PleaseFollowNotice }
