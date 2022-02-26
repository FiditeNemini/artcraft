import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { GetTwitchEventRule, GetTwitchEventRuleIsError, GetTwitchEventRuleIsOk, TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/GetTwitchEventRule';
import { EditTwitchEventRule, EditTwitchEventRuleRequest } from '@storyteller/components/src/api/storyteller/twitch_event_rules/EditTwitchEventRule';
import { TwitchEventRuleElement } from './TwitchEventRuleElement';
import { Link, useHistory, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { EventMatchPredicate } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventMatchPredicate';
import { EventResponse } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventResponse';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';
import { EventResponseComponent } from './event_response_builder/EventResponseComponent';
import { EventMatchPredicateBuilderComponent } from './event_match_predicate_builder/EventMatchPredicateBuilderComponent';

interface Props {
  sessionWrapper: SessionWrapper,
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
}

function TtsConfigsEditRulePage(props: Props) {
  const { token } : { token : string } = useParams();

  // TODO: Use centralized URL configs
  const indexLink = '/tts_configs';

  const history = useHistory();

  // ========== Initial Load of Server State ==========

  const [twitchEventRule, setTwitchEventRule] = useState<TwitchEventRule|undefined>(undefined);

  // Sent to sub-components to initialize UI
  const [serverEventMatchPredicate, setServerEventMatchPredicate] = useState<EventMatchPredicate>({});
  const [serverEventResponse, setServerEventResponse] = useState<EventResponse>({});

  // ========== In-Progress Model Edits ==========

  const [modifiedEventMatchPredicate, setModifiedEventMatchPredicate] = useState<EventMatchPredicate>({});
  const [modifiedEventResponse, setModifiedEventResponse] = useState<EventResponse>({});
  const [ruleIsDisabled, setRuleIsDisabled] = useState(false);

  const getTwitchEventRule = useCallback(async (token: string) => {
    const response = await GetTwitchEventRule(token);

    if (GetTwitchEventRuleIsOk(response)) {
      // Source of truth
      setTwitchEventRule(response.twitch_event_rule);
      setServerEventMatchPredicate(response.twitch_event_rule.event_match_predicate);
      setServerEventResponse(response.twitch_event_rule.event_response);

      // In-progress modifications
      setModifiedEventMatchPredicate(response.twitch_event_rule.event_match_predicate);
      setModifiedEventResponse(response.twitch_event_rule.event_response);
      setRuleIsDisabled(response.twitch_event_rule.rule_is_disabled);

    } else if (GetTwitchEventRuleIsError(response))  {
      // TODO
    }
  }, []);

  useEffect(() => {
    getTwitchEventRule(token);
  }, [getTwitchEventRule, token]);

  const updateModifiedEventMatchPredicate = (predicate: EventMatchPredicate) => {
    setModifiedEventMatchPredicate(predicate);
  }

  const updateModifiedEventResponse = (response: EventResponse) => {
    setModifiedEventResponse(response);
  }

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) : Promise<boolean> => {
    ev.preventDefault();

    // TODO: Check for errors.

    let newEventMatchPredicate = modifiedEventMatchPredicate;
    let newEventResponse = modifiedEventResponse;

    const request : EditTwitchEventRuleRequest = {
      event_match_predicate: newEventMatchPredicate,
      event_response: newEventResponse,
      rule_is_disabled: ruleIsDisabled,
    };

    const result = await EditTwitchEventRule(token, request);
    if (result.success) {
      history.push(indexLink);
    }

    return false;
  }

  if (!props.sessionWrapper.isLoggedIn()) {
    return <h1>Must Log In</h1>;
  }

  if (twitchEventRule === undefined) {
    return <h1>Loading...</h1>;
  }

  // NB: This is a hypothetical version of what we'll update to
  let renderRule : TwitchEventRule = {
    // Unchanged
    token: twitchEventRule.token,
    event_category: twitchEventRule.event_category,
    user_specified_rule_order: twitchEventRule.user_specified_rule_order,
    created_at: twitchEventRule.created_at,
    updated_at: twitchEventRule.updated_at,

    // Updated in UI
    event_match_predicate: modifiedEventMatchPredicate,
    event_response: modifiedEventResponse,
    rule_is_disabled: ruleIsDisabled,
  };

  return (
    <>
      <div className="section">
        <h1 className="title"> Edit Rule </h1>
      </div>

      <br />
      <br />

      <form onSubmit={handleFormSubmit}>

        <EventMatchPredicateBuilderComponent
          twitchEventCategory={twitchEventRule.event_category}
          serverEventMatchPredicate={serverEventMatchPredicate}
          updateModifiedEventMatchPredicate={updateModifiedEventMatchPredicate}
          />

        <br />
        <br />

        <EventResponseComponent
          serverEventResponse={serverEventResponse}
          updateModifiedEventResponse={updateModifiedEventResponse}
          allTtsModels={props.allTtsModels}
          allTtsModelsByToken={props.allTtsModelsByToken}
          />

        <h2 className="title is-4">This is the rule:</h2>

        <div className="content">
          <TwitchEventRuleElement 
            rule={renderRule} 
            hideButtons={true} 
            allTtsModelsByToken={props.allTtsModelsByToken}
            />
        </div>

        <button className="button is-large is-fullwidth is-primary">
          Save Changes&nbsp;<FontAwesomeIcon icon={faSave} />
        </button>
      </form>
      
      <br />

      <Link to={indexLink} className="button is-large is-fullwidth is-info is-outlined">
        <FontAwesomeIcon icon={faAngleLeft} />&nbsp;Cancel / Go Back
      </Link>

    </>
  )
}

export { TtsConfigsEditRulePage }