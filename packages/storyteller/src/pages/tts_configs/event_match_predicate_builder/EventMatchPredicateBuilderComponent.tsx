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


  let ruleTypeForm = <></>

  if (props.twitchEventCategory === TwitchEventCategory.Bits) {
    switch (bitsRuleType) {
      case BitsRuleType.BitsCheermoteNameExactMatch:
        ruleTypeForm = <BitsCheermoteNameExactMatchForm 
          cheerName={cheerNameOrPrefix}
          updateCheerNameOrPrefix={updateCheerNameOrPrefix}
          />;
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        ruleTypeForm = <BitsCheermotePrefixSpendThresholdForm
          cheerPrefix={cheerNameOrPrefix}
          updateCheerNameOrPrefix={updateCheerNameOrPrefix}
          minimumBitsSpent={minimumBitsSpent}
          updateMinimumBitsSpent={updateMinimumBitsSpent}
          />
        break;
      case BitsRuleType.BitsSpendThreshold:
        ruleTypeForm = <BitsSpendThresholdForm 
          minimumBitsSpent={minimumBitsSpent}
          updateMinimumBitsSpent={updateMinimumBitsSpent}
          />;
        break;
    }

  } else if (props.twitchEventCategory === TwitchEventCategory.ChannelPoints) {
    ruleTypeForm = <ChannelPointsRewardNameExactMatchForm
      rewardName={rewardName}
      updateRewardName={updateRewardName}
      />;
  }

  return (
    <>
      <h2 className="title is-4">1) Pick what to match on</h2>

      <div className="field">
        <label className="label">Rule Type</label>
        <div className="control">
          <div className="select is-medium is-fullwidth">
            <select 
              value={bitsRuleType}
              onChange={handleChangedBitsRuleType}>
              <option value={BitsRuleType.BitsSpendThreshold}>Bits Spend Threshold</option>
              <option value={BitsRuleType.BitsCheermoteNameExactMatch}>Cheermote Name (Exact Match)</option>
              <option value={BitsRuleType.BitsCheermotePrefixSpendThreshold}>Cheermote Prefix and Bits Spend Threshold</option>
            </select>
          </div>
        </div>
      </div>

      <br />
      <br />

      <h2 className="title is-4">2) Configure the matching</h2>
      
      {ruleTypeForm}


    </>
  )
}

export { EventMatchPredicateBuilderComponent }
