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

  // Storyteller TTS configs

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

  // Used in:
  // TtsSingleVoice
  const [ttsModelToken, setTtsModelToken] = useState(''); 

  const handleChangedBitsRuleType = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const ruleType = value as BitsRuleType;

    let predicate : EventMatchPredicate = {};

    // TODO
    //switch (ruleType) {
    //  case BitsRuleType.BitsCheermoteNameExactMatch:
    //    predicate.bits_cheermote_name_exact_match = {
    //      cheermote_name: cheerNameOrPrefix,
    //    }
    //    break;
    //  case BitsRuleType.BitsCheermotePrefixSpendThreshold:
    //    predicate.bits_cheermote_prefix_spend_threshold = {
    //      cheermote_prefix: cheerNameOrPrefix,
    //      minimum_bits_spent: minimumBitsSpent,
    //    }
    //    break;
    //  case BitsRuleType.BitsSpendThreshold:
    //    predicate.bits_spend_threshold = {
    //      minimum_bits_spent: minimumBitsSpent,
    //    }
    //    break;
    //}

    setBitsRuleType(ruleType);
    // TODO
    //setEventMatchPredicate(predicate);

    return true;
  }

  const handleChangedChannelPointsRuleType = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const ruleType = value as ChannelPointsRuleType;

    // TODO:
    let predicate : EventMatchPredicate = {};

    setChannelPointsRuleType(ruleType);
    return true;
  }

  const updateCheerNameOrPrefix = (nameOrPrefix: string) => {
    let predicate : EventMatchPredicate = {};

    switch (bitsRuleType) {
      case BitsRuleType.BitsCheermoteNameExactMatch:
        predicate.bits_cheermote_name_exact_match = {
          cheermote_name: nameOrPrefix,
        }
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        predicate.bits_cheermote_prefix_spend_threshold = {
          cheermote_prefix: nameOrPrefix,
          minimum_bits_spent: minimumBitsSpent,
        }
        break;
      case BitsRuleType.BitsSpendThreshold:
        predicate.bits_spend_threshold = {
          minimum_bits_spent: minimumBitsSpent,
        }
        break;
    }

    setCheerNameOrPrefix(nameOrPrefix);
    // TODO
    //setEventMatchPredicate(predicate);
  }

  const updateMinimumBitsSpent = (minimumSpent: number) => {
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
          minimum_bits_spent: minimumSpent,
        }
        break;
      case BitsRuleType.BitsSpendThreshold:
        predicate.bits_spend_threshold = {
          minimum_bits_spent: minimumSpent,
        }
        break;
    }

    setMinimumBitsSpent(minimumSpent);
    // TODO
    //setEventMatchPredicate(predicate);
  }

  const updateRewardName = (name: string) => {
    setRewardName(name);
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
          cheerName={cheerNameOrPrefix}
          updateCheerNameOrPrefix={updateCheerNameOrPrefix}
          />;
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        matchingRulesForm = <BitsCheermotePrefixSpendThresholdForm
          cheerPrefix={cheerNameOrPrefix}
          updateCheerNameOrPrefix={updateCheerNameOrPrefix}
          minimumBitsSpent={minimumBitsSpent}
          updateMinimumBitsSpent={updateMinimumBitsSpent}
          />
        break;
      case BitsRuleType.BitsSpendThreshold:
        matchingRulesForm = <BitsSpendThresholdForm 
          minimumBitsSpent={minimumBitsSpent}
          updateMinimumBitsSpent={updateMinimumBitsSpent}
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
      updateRewardName={updateRewardName}
      />;
  }

  console.log(matchingRulesForm);

  return (
    <>
      <h2 className="title is-4">1) Pick what to match on</h2>

      <div className="field">
        <label className="label">Rule Type</label>
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
