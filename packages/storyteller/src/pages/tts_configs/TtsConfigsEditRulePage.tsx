import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { GetTwitchEventRule, GetTwitchEventRuleIsError, GetTwitchEventRuleIsOk, TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/GetTwitchEventRule';
import { EditTwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/EditTwitchEventRule';
import { TwitchEventRuleElement } from './TwitchEventRuleElement';
import { Link, useHistory, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { EventMatchPredicate } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventMatchPredicate';
import { EventResponse } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventResponse';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';
import { BitsCheermoteNameExactMatchForm } from './components/BitsCheermoteNameExactMatchForm';
import { BitsSpendThresholdForm } from './components/BitsSpendThresholdForm';
import { BitsCheermotePrefixSpendThresholdForm } from './components/BitsCheermotePrefixSpendThresholdForm';
import { TwitchEventCategory } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/TwitchEventCategory';
import { BitsRuleType, ChannelPointsRuleType } from './components/RuleTypes';

interface Props {
  sessionWrapper: SessionWrapper,
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
}

function TtsConfigsEditRulePage(props: Props) {
  const { token } : { token : string } = useParams();

  const indexLink = '/tts_configs';

  const history = useHistory();

  // Initial request
  const [twitchEventRule, setTwitchEventRule] = useState<TwitchEventRule|undefined>(undefined);

  // The event category cannot be changed !
  const [twitchEventCategory, setTwitchEventCategory] = useState<TwitchEventCategory>(TwitchEventCategory.Bits);

  // The rule types differ per category and the user can change them
  const [bitsRuleType, setBitsRuleType] = useState<BitsRuleType>(BitsRuleType.BitsCheermoteNameExactMatch);
  const [channelPointsRuleType, setChannelPointsRuleType] = useState<ChannelPointsRuleType>(ChannelPointsRuleType.ChannelPointsRewardNameExactMatch);

  // Field values
  const [eventMatchPredicate, setEventMatchPredicate] = useState<EventMatchPredicate|undefined>(undefined);
  const [eventResponse, setEventResponse] = useState<EventResponse|undefined>(undefined);
  const [ruleIsDisabled, setRuleIsDisabled] = useState(false);

  const getTwitchEventRule = useCallback(async (token: string) => {
    const response = await GetTwitchEventRule(token);

    if (GetTwitchEventRuleIsOk(response)) {
      setTwitchEventRule(response.twitch_event_rule);
      setTwitchEventCategory(response.twitch_event_rule.event_category);
      setEventMatchPredicate(response.twitch_event_rule.event_match_predicate);
      setEventResponse(response.twitch_event_rule.event_response);
      setRuleIsDisabled(response.twitch_event_rule.rule_is_disabled);

      let serverBitsRuleType = BitsRuleType.BitsCheermoteNameExactMatch;

      switch (response.twitch_event_rule.event_category) {
        case TwitchEventCategory.Bits:
          if (!!response.twitch_event_rule.event_match_predicate.bits_cheermote_name_exact_match) {
            serverBitsRuleType = BitsRuleType.BitsCheermoteNameExactMatch;
          } else if (!!response.twitch_event_rule.event_match_predicate.bits_cheermote_prefix_spend_threshold) {
            serverBitsRuleType = BitsRuleType.BitsCheermotePrefixSpendThreshold;
          } else if (!!response.twitch_event_rule.event_match_predicate.bits_spend_threshold) {
            serverBitsRuleType = BitsRuleType.BitsSpendThreshold;
          }
          break;
        case TwitchEventCategory.ChannelPoints: // NB: Only one rule type
          break;
        case TwitchEventCategory.ChatCommand: // TODO: Not yet supported
        default:
          break;
      }

      setBitsRuleType(serverBitsRuleType);

    } else if (GetTwitchEventRuleIsError(response))  {
      // TODO
    }
  }, []);

  useEffect(() => {
    getTwitchEventRule(token);
  }, [getTwitchEventRule, token]);

  const updateBitsRuleType = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value as BitsRuleType;
    setBitsRuleType(value);
    return true;
  }

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

  let ruleTypeForm = <></>

  if (twitchEventCategory === TwitchEventCategory.Bits) {
    switch (bitsRuleType) {
      case BitsRuleType.BitsCheermoteNameExactMatch:
        ruleTypeForm = <BitsCheermoteNameExactMatchForm />;
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        ruleTypeForm = <BitsCheermotePrefixSpendThresholdForm />
        break;
      case BitsRuleType.BitsSpendThreshold:
        ruleTypeForm = <BitsSpendThresholdForm />;
        break;
    }

  } else if (twitchEventCategory === TwitchEventCategory.ChannelPoints) {
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
          <label className="label">Rule Type</label>
          <div className="control">
            <div className="select is-medium is-fullwidth">
              <select 
                value={bitsRuleType}
                onChange={updateBitsRuleType}>
                <option value={BitsRuleType.BitsSpendThreshold}>Bits Spend Threshold</option>
                <option value={BitsRuleType.BitsCheermoteNameExactMatch}>Cheermote Name (Exact Match)</option>
                <option value={BitsRuleType.BitsCheermotePrefixSpendThreshold}>Cheermote Prefix and Bits Spend Threshold</option>
              </select>
            </div>
          </div>
        </div>

        <br />

        {ruleTypeForm}

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

interface BitsSpendThresholdFormProps {
};



export { TtsConfigsEditRulePage }