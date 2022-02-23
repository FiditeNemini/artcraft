import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { GetTwitchEventRule, GetTwitchEventRuleIsError, GetTwitchEventRuleIsOk, TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/GetTwitchEventRule';
import { EditTwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/EditTwitchEventRule';
import { TwitchEventRuleElement } from './TwitchEventRuleElement';
import { Link, useHistory, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faGem, faSave } from '@fortawesome/free-solid-svg-icons';
import { EventMatchPredicate } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventMatchPredicate';
import { EventResponse } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventResponse';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';
import { CHEER_BIT_LEVELS, CHEER_PREFIXES } from '../../twitch/Cheers';

interface Props {
  sessionWrapper: SessionWrapper,
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
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

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) : Promise<boolean> => {
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
      <br />

      <form onSubmit={handleFormSubmit}>

        <h2 className="title is-4">Match on</h2>

        <div className="field">
          <label className="label">Type</label>
          <div className="control">
            <div className="select is-medium is-fullwidth">
              <select>
                <option>Bits Spend Threshold</option>
                <option>Cheermote Name (Exact Match)</option>
                <option>Cheermote Prefix and Bits Spend Threshold</option>
              </select>
            </div>
          </div>
        </div>

        <ExactCheersForm />

        <br />
        <br />

        <h2 className="title is-4">TTS Behavior</h2>
        <p>Todo</p>
        <br />
        <br />

        <h2 className="title is-4">Final Rule</h2>
        <div className="content">
          <TwitchEventRuleElement 
            rule={twitchEventRule} 
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


interface ExactCheersFormProps {
};

function ExactCheersForm(props: ExactCheersFormProps) {
  const [cheerPrefix, setCheerPrefix] = useState<string|undefined>();
  const [bitsValue, setBitsValue] = useState<number>(1);
  const [manualCheerValue, setManualCheerValue] = useState<string>("");

  const updateCheerPrefix = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    setCheerPrefix(value);
    recalcuateFieldValue(value, bitsValue);
    return true;
  }

  const updateBitsValue = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const numericValue = parseInt(value);
    setBitsValue(numericValue);
    recalcuateFieldValue(cheerPrefix, numericValue);
    return true;
  }

  const updateTextCheerValue = (ev: React.FormEvent<HTMLInputElement>) : boolean => {
    const value = (ev.target as HTMLInputElement).value;
    setManualCheerValue(value);
    return true;
  }

  // When the dropdowns are used, replace any manual text entry.
  const recalcuateFieldValue = (prefix: string|undefined, bits: number) => {
    if (prefix === undefined) {
      return;
    }
    const cheerValue = `${prefix}${bits}`;
    setManualCheerValue(cheerValue);
  }

  return (
    <>
      <div className="field is-grouped">
        <p className="control">
        <label className="label">Pick the cheer</label>
          <div className="select is-medium">
            <select onChange={updateCheerPrefix}>
              <option
                key={`option-*`}
                value=""
              >Select cheer...</option>
              {CHEER_PREFIXES.map(cheerPrefix => {
                return (
                  <option
                    key={`option-${cheerPrefix}`}
                    value={cheerPrefix}
                  >{cheerPrefix}</option>
                );
              })}
            </select>
          </div>
        </p>
        <p className="control">
          <label className="label">Then the bit value</label>
          <div className="control">
            <div className="select is-medium">
              <select onChange={updateBitsValue}>
                {CHEER_BIT_LEVELS.map(level => {
                  return (
                    <option
                      key={`option-${cheerPrefix}-${level}`}
                      value={level}
                    >{level}</option>
                  );
                })}
              </select>
            </div>
          </div>
        </p>
        <p className="control is-expanded">
          <label className="label">To match against this (or set something custom)</label>
          <p className="control has-icons-left is-large">
            <input 
              value={manualCheerValue}
              onChange={updateTextCheerValue}
              className="input is-medium is-primary" 
              type="text" 
              placeholder="Cheermote full name (including bit value)" />
            <span className="icon is-small is-left">
              <FontAwesomeIcon icon={faGem} />
            </span>
          </p>
        </p>
      </div>
    </>
  )
}



export { TtsConfigsEditRulePage }