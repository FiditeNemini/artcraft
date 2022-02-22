import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { ListTwitchEventRules, ListTwitchEventRulesIsError, ListTwitchEventRulesIsOk, TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/ListTwitchEventRules';

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
    <div>
      <h1> TTS Setup </h1>
    </div>
  )
}

export { TtsConfigsIndexPage }