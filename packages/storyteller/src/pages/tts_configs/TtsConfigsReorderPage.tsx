import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { ListTwitchEventRules, ListTwitchEventRulesIsError, ListTwitchEventRulesIsOk, TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/ListTwitchEventRules';
import { TwitchEventRuleElement } from './rule_cards/TwitchEventRuleElement';
import { TwitchEventCategory, TWITCH_EVENT_CATEGORY_BY_STRING } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/TwitchEventCategory';
import { DiscordLink } from '@storyteller/components/src/elements/DiscordLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faDonate, faGem, faHeart, faLightbulb, faMeteor, faPlus, faSort, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';
import { Link, useHistory, useParams } from 'react-router-dom';
import { ReorderableTwitchEventRuleElement } from './rule_cards/ReorderableTwitchEventRuleElement';

interface Props {
  sessionWrapper: SessionWrapper,
  allTtsModelsByToken: Map<string, TtsModelListItem>,
}

function TtsConfigsReorderPage(props: Props) {
  const { event_category } = useParams() as { event_category : string };

  const history = useHistory();

  // TODO: Use centralized configs
  const indexLink = '/tts_configs';

  const [twitchEventCategory, setTwitchEventCategory] = useState(TwitchEventCategory.Bits);
  const [twitchEventRules, setTwitchEventRules] = useState<TwitchEventRule[]>([]);

  const listTwitchEventRules = useCallback(async (twitchEventCategory: TwitchEventCategory) => {
    const response = await ListTwitchEventRules();

    if (ListTwitchEventRulesIsOk(response)) {
      const allRules = response.twitch_event_rules;
      const releventRules = allRules.filter(rule => rule.event_category === twitchEventCategory);

      setTwitchEventRules(releventRules);

    } else if (ListTwitchEventRulesIsError(response))  {
      // TODO
    }
  }, []);

  useEffect(() => {
    let maybeTwitchEventCategory = TWITCH_EVENT_CATEGORY_BY_STRING.get(event_category);

    if (maybeTwitchEventCategory === undefined) {
      history.push(indexLink);
    } else {
      setTwitchEventCategory(maybeTwitchEventCategory);
      listTwitchEventRules(maybeTwitchEventCategory);
    }

  }, [listTwitchEventRules, event_category, history]);

  const handleMoveUp = (ruleIndex: number) => {

  }

  const handleMoveDown = (ruleIndex: number) => {

  }

  if (!props.sessionWrapper.isLoggedIn()) {
    return <h1>Must Log In</h1>;
  }

  return (
    <>
      <div className="section">
        <h1 className="title"> Reorder Rules </h1>
        <h2 className="subtitle"> This affects match priority. Rules at the top come first. </h2>
      </div>

      <div className="content">
        <article className="message is-dark">
          <div className="message-body">
          You can create rules for matching <em>different categories of events</em>: cheers (bits), 
          channel point rewards, etc. 
          
          When an event occurs in your stream, we compare it against the rules in its 
          category. <strong>The first matched rule</strong> (from the top) is selected, and the action 
          that it specifies is taken. For now this is limited to FakeYou text to speech, but we'll be 
          adding lots of new capabilities soon.
          </div>
        </article>

        {twitchEventRules.map((rule, index) => {
          return <ReorderableTwitchEventRuleElement
            key={rule.token}
            rule={rule} 
            ruleIndex={index}
            handleMoveUp={handleMoveUp}
            handleMoveDown={handleMoveDown}
            allTtsModelsByToken={props.allTtsModelsByToken}
            />
        })}
      </div>

      <br />
      <br />
    </>
  )
}

export { TtsConfigsReorderPage }