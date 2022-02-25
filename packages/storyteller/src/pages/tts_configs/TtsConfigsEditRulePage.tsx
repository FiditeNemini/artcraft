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
import { TwitchEventCategory } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/TwitchEventCategory';
import { EventResponseType } from './event_response_builder/EventResponseType';
import { EventResponseComponent } from './event_response_builder/EventResponseComponent';
import { BitsRuleType } from './event_match_predicate_builder/types/BitsRuleType';
import { EventMatchPredicateBuilderComponent } from './event_match_predicate_builder/EventMatchPredicateBuilderComponent';
import { CheerState } from './event_match_predicate_builder/CheerState';

interface Props {
  sessionWrapper: SessionWrapper,
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
}

function TtsConfigsEditRulePage(props: Props) {
  const { token } : { token : string } = useParams();

  const indexLink = '/tts_configs';

  const history = useHistory();

  // ========== Initial Load of Server State ==========

  const [twitchEventRule, setTwitchEventRule] = useState<TwitchEventRule|undefined>(undefined);

  // ========== Values passed to subcomponents for editing ==========

  const [newEventMatchPredicate, setNewEventMatchPredicate] = useState<EventMatchPredicate>({});
  const [newEventResponse, setNewEventResponse] = useState<EventResponse>({});

  const [cheerState, setCheerState] = useState<CheerState>({});

  // ========== ??? ==========

  // TODO: GET RID OF THIS
  const [eventResponseType, setEventResponseType] = useState<EventResponseType>(EventResponseType.TtsSingleVoice);


  // TODO: GET RID OF THIS
  const [ttsModelToken, setTtsModelToken] = useState(''); 

  // ===== Field values (final) =====

  // TODO: GET RID OF non-"new" (see above)
  const [eventMatchPredicate, setEventMatchPredicate] = useState<EventMatchPredicate>({});
  const [eventResponse, setEventResponse] = useState<EventResponse>({});
  const [ruleIsDisabled, setRuleIsDisabled] = useState(false);

  const getTwitchEventRule = useCallback(async (token: string) => {
    const response = await GetTwitchEventRule(token);

    if (GetTwitchEventRuleIsOk(response)) {
      setTwitchEventRule(response.twitch_event_rule);
      setEventMatchPredicate(response.twitch_event_rule.event_match_predicate);
      setEventResponse(response.twitch_event_rule.event_response);
      setRuleIsDisabled(response.twitch_event_rule.rule_is_disabled);

      // TODO
      setNewEventMatchPredicate(response.twitch_event_rule.event_match_predicate);
      setNewEventResponse(response.twitch_event_rule.event_response);

      let serverBitsRuleType = BitsRuleType.BitsCheermoteNameExactMatch;

      switch (response.twitch_event_rule.event_category) {
        case TwitchEventCategory.Bits:
          if (!!response.twitch_event_rule.event_match_predicate.bits_cheermote_name_exact_match) {
            serverBitsRuleType = BitsRuleType.BitsCheermoteNameExactMatch;
          } else if (!!response.twitch_event_rule.event_match_predicate.bits_cheermote_prefix_spend_threshold) {
            serverBitsRuleType = BitsRuleType.BitsCheermotePrefixSpendThreshold;
            //setMinimumBitsSpent(response.twitch_event_rule.event_match_predicate.bits_cheermote_prefix_spend_threshold.minimum_bits_spent);
          } else if (!!response.twitch_event_rule.event_match_predicate.bits_spend_threshold) {
            serverBitsRuleType = BitsRuleType.BitsSpendThreshold;
            //setMinimumBitsSpent(response.twitch_event_rule.event_match_predicate.bits_spend_threshold.minimum_bits_spent);
          }
          break;
        case TwitchEventCategory.ChannelPoints: // NB: Only one rule type
          if (!!response.twitch_event_rule.event_match_predicate.channel_points_reward_name_exact_match) {
            //setRewardName(response.twitch_event_rule.event_match_predicate.channel_points_reward_name_exact_match.reward_name);
          }
          break;
        case TwitchEventCategory.ChatCommand: // TODO: Not yet supported
        default:
          break;
      }

      if (!!response.twitch_event_rule.event_response.tts_single_voice) {
        setEventResponseType(EventResponseType.TtsSingleVoice);
        setTtsModelToken(response.twitch_event_rule.event_response.tts_single_voice.tts_model_token)
      } else if (!!response.twitch_event_rule.event_response.tts_random_voice) {
        setEventResponseType(EventResponseType.TtsRandomVoice);
        // TODO
      }

    } else if (GetTwitchEventRuleIsError(response))  {
      // TODO
    }
  }, []);

  useEffect(() => {
    getTwitchEventRule(token);
  }, [getTwitchEventRule, token]);

  const updateTtsModelToken = (token: string) => {
    let response : EventResponse = {};

    switch (eventResponseType) {
      case EventResponseType.TtsSingleVoice:
        response.tts_single_voice = {
          tts_model_token: token,
        }
        break;
      case EventResponseType.TtsRandomVoice:
        break;
    }

    console.log(token);

    setTtsModelToken(token);
    setEventResponse(response);
  }

  const updateEventMatchPredicate = (predicate: EventMatchPredicate) => {
    setNewEventMatchPredicate(predicate);
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

  // NB: This is a hypothetical version of what we'll update to
  let renderRule : TwitchEventRule = {
    // Unchanged
    token: twitchEventRule.token,
    event_category: twitchEventRule.event_category,
    user_specified_rule_order: twitchEventRule.user_specified_rule_order,
    created_at: twitchEventRule.created_at,
    updated_at: twitchEventRule.updated_at,

    // Updated in UI
    event_match_predicate: eventMatchPredicate,
    event_response: eventResponse,
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
          eventMatchPredicate={newEventMatchPredicate}
          updateEventMatchPredicate={updateEventMatchPredicate}
          allTtsModels={props.allTtsModels}
          allTtsModelsByToken={props.allTtsModelsByToken}

          />

        <br />
        <br />

        <EventResponseComponent
          allTtsModels={props.allTtsModels}
          allTtsModelsByToken={props.allTtsModelsByToken}
          setTtsModelToken={updateTtsModelToken}
          ttsModelToken={ttsModelToken}
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

interface BitsSpendThresholdFormProps {
};



export { TtsConfigsEditRulePage }