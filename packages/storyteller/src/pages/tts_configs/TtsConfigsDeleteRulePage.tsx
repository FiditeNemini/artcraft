import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { GetTwitchEventRule, GetTwitchEventRuleIsError, GetTwitchEventRuleIsOk, TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/GetTwitchEventRule';
import { TwitchEventRuleElement } from './TwitchEventRuleElement';
import { TwitchEventCategory } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/TwitchEventCategory';
import { DiscordLink } from '@storyteller/components/src/elements/DiscordLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faDonate, faGem, faLightbulb, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsConfigsDeleteRulePage(props: Props) {
  const { token } : { token : string } = useParams();

  const [twitchEventRule, setTwitchEventRule] = useState<TwitchEventRule|undefined>(undefined);

  const getTwitchEventRule = useCallback(async (token: string) => {
    const response = await GetTwitchEventRule(token);

    if (GetTwitchEventRuleIsOk(response)) {
      setTwitchEventRule(response.twitch_event_rule);
    } else if (GetTwitchEventRuleIsError(response))  {
      // TODO
    }
  }, []);

  useEffect(() => {
    getTwitchEventRule(token);
  }, [getTwitchEventRule, token]);

  if (!props.sessionWrapper.isLoggedIn()) {
    return <h1>Must Log In</h1>;
  }

  if (twitchEventRule === undefined) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <div className="section">
        <h1 className="title"> Delete Rule ? </h1>
      </div>
      <div className="content">
        <TwitchEventRuleElement rule={twitchEventRule} hideButtons={true} />
      </div>

      <br />
      <br />
    </>
  )
}

export { TtsConfigsDeleteRulePage }