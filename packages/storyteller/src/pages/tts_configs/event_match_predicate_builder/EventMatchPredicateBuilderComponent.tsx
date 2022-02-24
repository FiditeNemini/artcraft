import React, { useEffect, useState } from 'react';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';
import { FakeYouExternalLink } from '@storyteller/components/src/elements/FakeYouExternalLink';
import { BitsRuleType } from './types/BitsRuleType';
import { TwitchEventCategory } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/TwitchEventCategory';
import { EventMatchPredicate } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventMatchPredicate';
import { BitsCheermoteNameExactMatchForm } from './subforms/BitsCheermoteNameExactMatchForm';
import { BitsCheermotePrefixSpendThresholdForm } from './subforms/BitsCheermotePrefixSpendThresholdForm';
import { BitsSpendThresholdForm } from './subforms/BitsSpendThresholdForm';
import { ChannelPointsRewardNameExactMatchForm } from './subforms/ChannelPointsRewardNameExactMatchForm';
import { ChannelPointsRuleType } from './types/ChannelPointsRuleType';

interface EventMatchPredicateBuilderComponentProps {
  // CANNOT BE CHANGED AFTER CREATION
  twitchEventCategory: TwitchEventCategory,

  // Updates sent back up the tree
  eventMatchPredicate: EventMatchPredicate,
  updateEventMatchPredicate: (predicate: EventMatchPredicate) => void,

  // FakeYou voices
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
};

function EventMatchPredicateBuilderComponent(props: EventMatchPredicateBuilderComponentProps) {
  // ========== Core UI flow ==========

  const [bitsRuleType, setBitsRuleType] = useState<BitsRuleType>(BitsRuleType.BitsCheermoteNameExactMatch);
  const [channelPointsRuleType, setChannelPointsRuleType] = useState<ChannelPointsRuleType>(ChannelPointsRuleType.ChannelPointsRewardNameExactMatch);

  // ========== Cached Values for Editing ==========

  // Used in:
  // BitsCheermoteNameExactMatch
  // BitsCheermotePrefixSpendThreshold
  const [cheerNameOrPrefix, setCheerNameOrPrefix] = useState(''); 

  // Used in:
  // BitsSpendThreshold
  // BitsCheermotePrefixSpendThreshold
  const [minimumBitsSpent, setMinimumBitsSpent] = useState(1); 

  // Used in:
  // ChannelPointsRewardNameExactMatch
  const [rewardName, setRewardName] = useState(''); 

  // NB: useState is not always setting from props correctly (after several re-renders)
  // The following answers suggests using useEffect:
  //  https://stackoverflow.com/a/54866051 (less clear by also using useState(), but good comments)
  //  https://stackoverflow.com/a/62982753
  useEffect(() => {
    let newBitsRuleType = BitsRuleType.BitsCheermoteNameExactMatch; 
    let newChannelPointsRuleType = ChannelPointsRuleType.ChannelPointsRewardNameExactMatch;

    switch (props.twitchEventCategory) {
      case TwitchEventCategory.Bits:
        if (!!props.eventMatchPredicate.bits_cheermote_name_exact_match) {
          newBitsRuleType = BitsRuleType.BitsCheermoteNameExactMatch;
          setCheerNameOrPrefix(props.eventMatchPredicate.bits_cheermote_name_exact_match.cheermote_name);
        } else if (!!props.eventMatchPredicate.bits_cheermote_prefix_spend_threshold) {
          //setMinimumBitsSpent(props.eventMatchPredicate.bits_cheermote_prefix_spend_threshold.minimum_bits_spent);
          setCheerNameOrPrefix(props.eventMatchPredicate.bits_cheermote_prefix_spend_threshold.cheermote_prefix);
          newBitsRuleType = BitsRuleType.BitsCheermotePrefixSpendThreshold;
        } else if (!!props.eventMatchPredicate.bits_spend_threshold) {
          //setMinimumBitsSpent(props.eventMatchPredicate.bits_spend_threshold.minimum_bits_spent);
          newBitsRuleType = BitsRuleType.BitsSpendThreshold;
        }
        break;
      case TwitchEventCategory.ChannelPoints: // NB: Only one rule type
        if (!!props.eventMatchPredicate.channel_points_reward_name_exact_match) {
          //setRewardName(props.eventMatchPredicate.channel_points_reward_name_exact_match.reward_name);
          newChannelPointsRuleType = ChannelPointsRuleType.ChannelPointsRewardNameExactMatch;
        }
        break;
      case TwitchEventCategory.ChatCommand: // TODO: Not yet supported
      default:
        break;
    }

    setBitsRuleType(newBitsRuleType);
    setChannelPointsRuleType(newChannelPointsRuleType);

  }, [props.twitchEventCategory, props.eventMatchPredicate]);

  const handleChangedBitsRuleType = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const ruleType = value as BitsRuleType;
    setBitsRuleType(ruleType);
    return true;
  }

  const handleChangedChannelPointsRuleType = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const ruleType = value as ChannelPointsRuleType;
    setChannelPointsRuleType(ruleType);
    return true;
  }

  // Existing values will be used to pre-populate the forms as well as handle
  // differential updates to other fields (since this isn't a sparse update model).

  let currentNameOrPrefix = '';

  switch (bitsRuleType) {
    case BitsRuleType.BitsCheermoteNameExactMatch:
      currentNameOrPrefix = props.eventMatchPredicate.bits_cheermote_name_exact_match?.cheermote_name || '';
      break;
    case BitsRuleType.BitsCheermotePrefixSpendThreshold:
      currentNameOrPrefix = props.eventMatchPredicate.bits_cheermote_prefix_spend_threshold?.cheermote_prefix || '';
      break;
    case BitsRuleType.BitsSpendThreshold:
      // No name
      break;
  }

  const handleChangedCheerNameOrPrefix = (nameOrPrefix: string) => {
    //setCheerNameOrPrefix(nameOrPrefix);
    //backPropagateEventMatchPredicate();
    let predicate : EventMatchPredicate = {};

    switch (bitsRuleType) {
      case BitsRuleType.BitsCheermoteNameExactMatch:
        predicate.bits_cheermote_name_exact_match = {
          cheermote_name: nameOrPrefix, // New value
        }
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        predicate.bits_cheermote_prefix_spend_threshold = {
          cheermote_prefix: nameOrPrefix, // New value
          minimum_bits_spent: props.eventMatchPredicate.bits_cheermote_prefix_spend_threshold?.minimum_bits_spent || 0,
        }
        break;
      case BitsRuleType.BitsSpendThreshold:
        predicate.bits_spend_threshold = {
          minimum_bits_spent: minimumBitsSpent,
        }
        break;
    }

    props.updateEventMatchPredicate(predicate);
  }

  const handleChangedMinimumBitsSpent = (minimumSpent: number) => {
    //setMinimumBitsSpent(minimumSpent);
    //backPropagateEventMatchPredicate();
    let predicate : EventMatchPredicate = {};

    switch (bitsRuleType) {
      case BitsRuleType.BitsCheermoteNameExactMatch:
        predicate.bits_cheermote_name_exact_match = {
          cheermote_name: currentNameOrPrefix, // Untouched existing value
        }
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        predicate.bits_cheermote_prefix_spend_threshold = {
          cheermote_prefix: currentNameOrPrefix, // Untouched existing value
          minimum_bits_spent: minimumSpent, // New value
        }
        break;
      case BitsRuleType.BitsSpendThreshold:
        predicate.bits_spend_threshold = {
          minimum_bits_spent: minimumSpent, // New value
        }
        break;
    }

    props.updateEventMatchPredicate(predicate);
  }

  // TODO
  const handleChangedRewardName = (name: string) => {
    setRewardName(name);
    backPropagateEventMatchPredicate();
  }

  const backPropagateEventMatchPredicate = () => {
    let predicate : EventMatchPredicate = {};

    switch (bitsRuleType) {
      case BitsRuleType.BitsCheermoteNameExactMatch:
        predicate.bits_cheermote_name_exact_match = {
          cheermote_name: cheerNameOrPrefix,
        }
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        predicate.bits_cheermote_prefix_spend_threshold = {
          cheermote_prefix: cheerNameOrPrefix,
          minimum_bits_spent: minimumBitsSpent,
        }
        break;
      case BitsRuleType.BitsSpendThreshold:
        predicate.bits_spend_threshold = {
          minimum_bits_spent: minimumBitsSpent,
        }
        break;
    }

    props.updateEventMatchPredicate(predicate);
  }


  let ruleTypeSelect = <></>
  let matchingRulesForm = <></>

  if (props.twitchEventCategory === TwitchEventCategory.Bits) {
    ruleTypeSelect = (
      <>
        <select 
          value={bitsRuleType}
          onChange={handleChangedBitsRuleType}>
          <option 
            value={BitsRuleType.BitsSpendThreshold}
            >Bits Spend Threshold</option>
          <option 
            value={BitsRuleType.BitsCheermoteNameExactMatch}
            >Cheermote Name (Exact Match)</option>
          <option 
            value={BitsRuleType.BitsCheermotePrefixSpendThreshold}
            >Cheermote Prefix and Bits Spend Threshold</option>
        </select>
      </>
    );

    switch (bitsRuleType) {
      case BitsRuleType.BitsCheermoteNameExactMatch:
        matchingRulesForm = <BitsCheermoteNameExactMatchForm 
          //cheerName={currentNameOrPrefix}
          cheerName={cheerNameOrPrefix}
          updateCheerNameOrPrefix={handleChangedCheerNameOrPrefix}
          />;
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        matchingRulesForm = <BitsCheermotePrefixSpendThresholdForm
          //cheerPrefix={currentNameOrPrefix}
          cheerPrefix={cheerNameOrPrefix}
          updateCheerNameOrPrefix={handleChangedCheerNameOrPrefix}
          minimumBitsSpent={minimumBitsSpent}
          updateMinimumBitsSpent={handleChangedMinimumBitsSpent}
          />
        break;
      case BitsRuleType.BitsSpendThreshold:
        matchingRulesForm = <BitsSpendThresholdForm 
          minimumBitsSpent={minimumBitsSpent}
          updateMinimumBitsSpent={handleChangedMinimumBitsSpent}
          />;
        break;
    }

  } else if (props.twitchEventCategory === TwitchEventCategory.ChannelPoints) {
    ruleTypeSelect = (
      <>
        <select 
          value={channelPointsRuleType}
          onChange={handleChangedChannelPointsRuleType}>
          <option 
            value={ChannelPointsRuleType.ChannelPointsRewardNameExactMatch}
            >Channel Points Reward Name (exact match)</option>
        </select>
      </>
    );

    matchingRulesForm = <ChannelPointsRewardNameExactMatchForm
      rewardName={rewardName}
      updateRewardName={handleChangedRewardName}
      />;
  }

  return (
    <>
      <h2 className="title is-4">1) Pick what to match on</h2>

      <div className="field">
        {/*<label className="label">Rule Type</label>*/}
        <div className="control">
          <div className="select is-medium is-fullwidth">
            {ruleTypeSelect}
          </div>
        </div>
      </div>

      <br />
      <br />

      <h2 className="title is-4">2) Configure the matching</h2>
      
      {matchingRulesForm}

    </>
  )
}

export { EventMatchPredicateBuilderComponent }
