import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { ListTwitchEventRules, ListTwitchEventRulesIsError, ListTwitchEventRulesIsOk, TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/ListTwitchEventRules';
import { TwitchEventRuleElement } from './TwitchEventRuleElement';

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsConfigsIndexPage(props: Props) {
  const [twitchEventRules, setTwitchEventRules] = useState<TwitchEventRule[]>([]);

  const listTwitchEventRules = useCallback(async () => {
    const response = await ListTwitchEventRules();

    if (ListTwitchEventRulesIsOk(response)) {
      setTwitchEventRules(response.twitch_event_rules);
    } else if (ListTwitchEventRulesIsError(response))  {
      // TODO
    }
  }, []);

  useEffect(() => {
    listTwitchEventRules();
  }, [listTwitchEventRules]);

  if (!props.sessionWrapper.isLoggedIn()) {
    return <h1>Must Log In</h1>;
  }

  return (
    <>
      <div className="section">
        <h1 className="title"> TTS Setup </h1>
        <h2 className="subtitle"> Configure how your stream TTS works </h2>
      </div>
      <div className="content">
        <h1 className="title"> Bits / Cheers </h1>
        <h2 className="subtitle is-4">
          (These settings are best for small and medium-sized channels.)
        </h2>
        <p>
          You can create rules for matching cheers. When someone cheers, these rules will be tested in order. 
          The first match wins, and the action the rule specifies will be taken.
        </p>
        {twitchEventRules.map(rule => {
          return <TwitchEventRuleElement rule={rule} />
        })}
      </div>
      <div className="content">
        <h1 className="title"> Channel Points / Rewards </h1>
        <h2 className="subtitle is-4">
          (These settings are best for small channels.)
        </h2>
        <p>
          You can create rules for matching channel point reward redemptions. When a reward is redeemed, 
          it will be tested against these rules in order. The first match wins, and the action the rule 
          specifies will be taken.
        </p>
        {twitchEventRules.map(rule => {
          return <TwitchEventRuleElement rule={rule} />
        })}
      </div>
      <div className="content">
        <h1 className="title"> Donation Services (Streamlabs, StreamElements, etc.) </h1>
        <h2 className="subtitle is-4">
          (These settings are great for large channels, but work for channels of all sizes.)
        </h2>
        <p>Coming soon&hellip;</p>
      </div>
      <div className="content">
        <h1 className="title"> Text <code>/slash</code> Commands</h1>
        <h2 className="subtitle is-4">
          (These settings are great for very small channels.)
        </h2>
        <p>Coming soon&hellip;</p>
      </div>
      <br />
      <br />
    </>
  )
}

export { TtsConfigsIndexPage }