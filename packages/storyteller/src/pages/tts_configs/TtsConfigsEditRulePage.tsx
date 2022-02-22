import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { GetTwitchEventRule, GetTwitchEventRuleIsError, GetTwitchEventRuleIsOk, TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/GetTwitchEventRule';
import { EditTwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/EditTwitchEventRule';
import { TwitchEventRuleElement } from './TwitchEventRuleElement';
import { Link, useHistory, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import { EventMatchPredicate } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventMatchPredicate';
import { EventResponse } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventResponse';

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsConfigsEditRulePage(props: Props) {
  const { token } : { token : string } = useParams();

  const history = useHistory();

  const [twitchEventRule, setTwitchEventRule] = useState<TwitchEventRule|undefined>(undefined);
  const [eventMatchPredicate, setEventMatchPredicate] = useState<EventMatchPredicate|undefined>(undefined);
  const [eventResponse, setEventResponse] = useState<EventResponse|undefined>(undefined);
  const [ruleIsDisabled, setRuleIsDisabled] = useState(false);

  const getTwitchEventRule = useCallback(async (token: string) => {
    const response = await GetTwitchEventRule(token);

    if (GetTwitchEventRuleIsOk(response)) {
      setTwitchEventRule(response.twitch_event_rule);
      setEventMatchPredicate(response.twitch_event_rule.event_match_predicate);
      setEventResponse(response.twitch_event_rule.event_response);
      setRuleIsDisabled(response.twitch_event_rule.rule_is_disabled);
    } else if (GetTwitchEventRuleIsError(response))  {
      // TODO
    }
  }, []);

  useEffect(() => {
    getTwitchEventRule(token);
  }, [getTwitchEventRule, token]);

  const indexLink = '/tts_configs';

  const handleDeleteFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) : Promise<boolean> => {
    ev.preventDefault();

    if (eventMatchPredicate === undefined || eventResponse === undefined) {
      return false;
    }

    const request = {
      event_match_predicate: eventMatchPredicate,
      event_response: eventResponse,
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

  return (
    <>
      <div className="section">
        <h1 className="title"> Edit Rule </h1>
      </div>

      <br />

      <div className="content">
        <TwitchEventRuleElement rule={twitchEventRule} hideButtons={true} />
      </div>

      <br />

      <form onSubmit={handleDeleteFormSubmit}>
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