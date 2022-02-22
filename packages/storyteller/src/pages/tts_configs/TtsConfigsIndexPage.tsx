import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { ListTwitchEventRules, ListTwitchEventRulesIsError, ListTwitchEventRulesIsOk, TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/ListTwitchEventRules';
import { TwitchEventRuleElement } from './TwitchEventRuleElement';
import { TwitchEventCategory } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/TwitchEventCategory';
import { DiscordLink } from '@storyteller/components/src/elements/DiscordLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faDonate, faGem, faLightbulb, faTerminal } from '@fortawesome/free-solid-svg-icons';

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

  const cheerEventRules = twitchEventRules.filter(rule => rule.event_category === TwitchEventCategory.Bits);

  const channelPointsEventRules = twitchEventRules.filter(rule => rule.event_category === TwitchEventCategory.ChannelPoints);

  return (
    <>
      <div className="section">
        <h1 className="title"> TTS Setup </h1>
        <h2 className="subtitle"> Configure how your stream TTS works </h2>
      </div>
      <div className="content">
        <article className="message is-primary">
          <div className="message-body">
          You can create rules for matching <em>different categories of events</em>: cheers (bits), 
          channel point rewards, etc. 
          
          When an event occurs in your stream, we compare it against the rules in its 
          category. <strong>The first matched rule</strong> (from the top) is selected, and the action 
          that it specifies is taken. For now this is limited to FakeYou text to speech, but we'll be 
          adding lots of new capabilities soon.
          </div>
        </article>
        <h1 className="title"> <FontAwesomeIcon icon={faGem} /> Bits / Cheers </h1>
        <h2 className="subtitle is-4">
          (These settings are best for small and medium-sized channels.)
        </h2>
        <p>
        </p>
        {cheerEventRules.map(rule => {
          return <TwitchEventRuleElement rule={rule} />
        })}
      </div>

      <br />

      <div className="content">
        <h1 className="title"> <FontAwesomeIcon icon={faBox} /> Channel Points / Rewards </h1>
        <h2 className="subtitle is-4">
          (These settings are best for small channels.)
        </h2>
        {channelPointsEventRules.map(rule => {
          return <TwitchEventRuleElement rule={rule} />
        })}
      </div>

      <br />

      <div className="content">
        <h1 className="title"> <FontAwesomeIcon icon={faDonate} /> Donation Services (Streamlabs, StreamElements, etc.) </h1>
        <h2 className="subtitle is-4">
          (These settings are great for large channels, but work for channels of all sizes.)
        </h2>
        <p>Coming soon&hellip;</p>
      </div>

      <br />

      <div className="content">
        <h1 className="title"> <FontAwesomeIcon icon={faTerminal} /> Text <code>/slash</code> Commands</h1>
        <h2 className="subtitle is-4">
          (These settings are great for very small channels.)
        </h2>
        <p>Coming soon&hellip;</p>
      </div>

      <br />

      <div className="content">
        <h1 className="title"> <FontAwesomeIcon icon={faLightbulb} /> Suggestions? </h1>
        <h2 className="subtitle is-4">
          We want to build the things you want
        </h2>
        <p>Can you think of anything we haven't 
          provided? <DiscordLink text="Please let us know in Discord" iconAfterText={true} /> so 
          that we can build it!</p>
      </div>
      <br />
      <br />
    </>
  )
}

export { TtsConfigsIndexPage }