import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { GetTwitchEventRule, GetTwitchEventRuleIsError, GetTwitchEventRuleIsOk, TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/GetTwitchEventRule';
import { DeleteTwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/DeleteTwitchEventRule';
import { TwitchEventRuleElement } from './rule_cards/TwitchEventRuleElement';
import { Link, useHistory, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';

interface Props {
  sessionWrapper: SessionWrapper,
  allTtsModelsByToken: Map<string, TtsModelListItem>,
}

function TtsConfigsDeleteRulePage(props: Props) {
  const { token } : { token : string } = useParams();

  const history = useHistory();

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

  const indexLink = '/tts_configs';

  const handleDeleteFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) : Promise<boolean> => {
    ev.preventDefault();

    const result = await DeleteTwitchEventRule(token);
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
        <h1 className="title"> Delete Rule ? </h1>
      </div>

      <br />

      <div className="content">
        <TwitchEventRuleElement 
          rule={twitchEventRule} 
          hideButtons={true} 
          allTtsModelsByToken={props.allTtsModelsByToken} />
      </div>

      <br />

      <form onSubmit={handleDeleteFormSubmit}>
        <button className="button is-large is-fullwidth is-danger">
          <FontAwesomeIcon icon={faTrash} />&nbsp;Delete
        </button>
      </form>
      
      <br />

      <Link to={indexLink} className="button is-large is-fullwidth is-info is-outlined">
        <FontAwesomeIcon icon={faAngleLeft} />&nbsp;Cancel / Go Back
      </Link>

    </>
  )
}

export { TtsConfigsDeleteRulePage }