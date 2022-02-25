import React, { useEffect, useState } from 'react';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';
import { BitsRuleType } from './types/BitsRuleType';
import { TwitchEventCategory } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/TwitchEventCategory';
import { EventMatchPredicate } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventMatchPredicate';
import { BitsCheermoteNameExactMatchForm } from './subforms/BitsCheermoteNameExactMatchForm';
import { BitsCheermotePrefixSpendThresholdForm } from './subforms/BitsCheermotePrefixSpendThresholdForm';
import { BitsSpendThresholdForm } from './subforms/BitsSpendThresholdForm';
import { ChannelPointsRewardNameExactMatchForm } from './subforms/ChannelPointsRewardNameExactMatchForm';
import { ChannelPointsRuleType } from './types/ChannelPointsRuleType';
import { CheerUtil } from '../../../twitch/CheerUtil';
import { CheerState, CheerStateIsCustom, CheerStateIsOfficial, cheerStateToPredicate, predicateToCheerState } from './CheerState';

interface EventMatchPredicateBuilderComponentProps {
  // CANNOT BE CHANGED AFTER CREATION
  twitchEventCategory: TwitchEventCategory,

  // Original event match predicate from the server 
  // (also immutable for sanity and because we lose information on UI changes)
  serverEventMatchPredicate: EventMatchPredicate,

  // Updates sent back up the tree
  updateModifiedEventMatchPredicate: (predicate: EventMatchPredicate) => void,

  // FakeYou voices
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
};

function EventMatchPredicateBuilderComponent(props: EventMatchPredicateBuilderComponentProps) {
  // ========== Core UI flow ==========

  const [bitsRuleType, setBitsRuleType] = useState<BitsRuleType>(BitsRuleType.BitsCheermoteNameExactMatch);
  const [channelPointsRuleType, setChannelPointsRuleType] = useState<ChannelPointsRuleType>(ChannelPointsRuleType.ChannelPointsRewardNameExactMatch);

  // ========== Cached Values for Editing ==========

  // New, and remove everything else:
  const [cheerState, setCheerState] = useState<CheerState>({});
  






  // Used in:
  // BitsCheermoteNameExactMatch
  // BitsCheermotePrefixSpendThreshold
  const [cheerNameOrPrefix, setCheerNameOrPrefix] = useState('');  // TODO: DIE

//  // Used in:
//  // BitsSpendThreshold
//  // BitsCheermotePrefixSpendThreshold
//  const [minimumBitsSpent, setMinimumBitsSpent] = useState(1);  // TODO: DIE

  // Shared state for :
  // BitsSpendThreshold
  // BitsCheermoteNameExactMatch
  // BitsCheermotePrefixSpendThreshold
  const [bitsValue, setBitsValue] = useState(1);
  const [cheerPrefix, setCheerPrefix] = useState('');

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

    let cheerAndBitsV = undefined;
    let bitsV = undefined;
    let cheerPrefixV = undefined;

    let newCheerState = predicateToCheerState(props.serverEventMatchPredicate);

    switch (props.twitchEventCategory) {
      case TwitchEventCategory.Bits:
        if (!!props.serverEventMatchPredicate.bits_cheermote_name_exact_match) {
          newBitsRuleType = BitsRuleType.BitsCheermoteNameExactMatch;
          cheerAndBitsV = props.serverEventMatchPredicate.bits_cheermote_name_exact_match.cheermote_name;

        } else if (!!props.serverEventMatchPredicate.bits_cheermote_prefix_spend_threshold) {
          newBitsRuleType = BitsRuleType.BitsCheermotePrefixSpendThreshold;
          cheerPrefixV = props.serverEventMatchPredicate.bits_cheermote_prefix_spend_threshold.cheermote_prefix;
          bitsV = props.serverEventMatchPredicate.bits_cheermote_prefix_spend_threshold.minimum_bits_spent;

        } else if (!!props.serverEventMatchPredicate.bits_spend_threshold) {
          newBitsRuleType = BitsRuleType.BitsSpendThreshold;
          bitsV = props.serverEventMatchPredicate.bits_spend_threshold.minimum_bits_spent;

        }
        break;
      case TwitchEventCategory.ChannelPoints: // NB: Only one rule type
        if (!!props.serverEventMatchPredicate.channel_points_reward_name_exact_match) {
          setRewardName(props.serverEventMatchPredicate.channel_points_reward_name_exact_match.reward_name);
          newChannelPointsRuleType = ChannelPointsRuleType.ChannelPointsRewardNameExactMatch;
        }
        break;
      case TwitchEventCategory.ChatCommand: // TODO: Not yet supported
      default:
        break;
    }

    setCheerState(newCheerState);

    console.log('\n\n======== useEffect() =======');
    console.table(props.serverEventMatchPredicate)
    console.log('cheerState', newCheerState);
    console.log('\n\n');

    if (!!cheerAndBitsV) {
      let { cheerPrefix, bitValue } = CheerUtil.parseCheerString(cheerAndBitsV);
      setCheerPrefix(cheerPrefix || '');
      setBitsValue(bitValue || 1);
      setCheerNameOrPrefix(cheerAndBitsV); // TODO: DIE
    } 
    if (!!bitsV) {
      setBitsValue(bitsV || 1);
    }
    if (!!cheerPrefixV) {
      setCheerPrefix(cheerPrefixV || '');
    }

    setBitsRuleType(newBitsRuleType);
    setChannelPointsRuleType(newChannelPointsRuleType);

  }, [props.twitchEventCategory, props.serverEventMatchPredicate]);

  // TODO: We need to recalculate the model.
  const handleChangedBitsRuleType = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const newRuleType = value as BitsRuleType;

    let predicate : EventMatchPredicate = {};

    switch (newRuleType) {
      case BitsRuleType.BitsCheermoteNameExactMatch:
        predicate.bits_cheermote_name_exact_match = {
          cheermote_name: cheerNameOrPrefix,
        }
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        predicate.bits_cheermote_prefix_spend_threshold = {
          cheermote_prefix: cheerNameOrPrefix,
          minimum_bits_spent: bitsValue,
        }
        break;
      case BitsRuleType.BitsSpendThreshold:
        predicate.bits_spend_threshold = {
          minimum_bits_spent: bitsValue,
        }
        break;
    }

    props.updateModifiedEventMatchPredicate(predicate);
    setBitsRuleType(newRuleType);

    return true;
  }

  const handleChangedChannelPointsRuleType = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const ruleType = value as ChannelPointsRuleType;
    setChannelPointsRuleType(ruleType);
    return true;
  }

// TODO: This may work instead of local setState().
//  // Existing values will be used to pre-populate the forms as well as handle
//  // differential updates to other fields (since this isn't a sparse update model).
//
//  let currentNameOrPrefix = '';
//  let currentMinimumBitsSpent = 1;
//
//  switch (bitsRuleType) {
//    case BitsRuleType.BitsCheermoteNameExactMatch:
//      currentNameOrPrefix = props.serverEventMatchPredicate.bits_cheermote_name_exact_match?.cheermote_name || '';
//      break;
//    case BitsRuleType.BitsCheermotePrefixSpendThreshold:
//      currentNameOrPrefix = props.serverEventMatchPredicate.bits_cheermote_prefix_spend_threshold?.cheermote_prefix || '';
//      currentMinimumBitsSpent = props.serverEventMatchPredicate.bits_cheermote_prefix_spend_threshold?.minimum_bits_spent || 1;
//      break;
//    case BitsRuleType.BitsSpendThreshold:
//      // No name
//      currentMinimumBitsSpent = props.serverEventMatchPredicate.bits_cheermote_prefix_spend_threshold?.minimum_bits_spent || 1;
//      break;
//  }

  //const handleChangedCheerNameOrPrefix = (prefix: string) => {
  const handleChangedCheerPrefix = (prefix: string) => {
    let predicate : EventMatchPredicate = {};

    switch (bitsRuleType) {
      case BitsRuleType.BitsCheermoteNameExactMatch:
        let joined = CheerUtil.joinCheerAndPrefix(prefix, bitsValue);
        predicate.bits_cheermote_name_exact_match = {
          cheermote_name: joined, // New value
        }
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        predicate.bits_cheermote_prefix_spend_threshold = {
          cheermote_prefix: prefix, // New value
          minimum_bits_spent: bitsValue,
        }
        break;
      case BitsRuleType.BitsSpendThreshold:
        predicate.bits_spend_threshold = {
          minimum_bits_spent: bitsValue,
        }
        break;
    }

    props.updateModifiedEventMatchPredicate(predicate);
  }

  const handleChangedCheerName = (name: string) => {
    let predicate : EventMatchPredicate = {};

    switch (bitsRuleType) {
      case BitsRuleType.BitsCheermoteNameExactMatch:
        predicate.bits_cheermote_name_exact_match = {
          cheermote_name: name, // New value
        }
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        let { cheerPrefix, bitValue } = CheerUtil.parseCheerString(name);
        predicate.bits_cheermote_prefix_spend_threshold = {
          cheermote_prefix: cheerPrefix || name, // New value
          minimum_bits_spent: bitValue || bitsValue,
        }
        break;
      case BitsRuleType.BitsSpendThreshold:
        predicate.bits_spend_threshold = {
          minimum_bits_spent: bitsValue,
        }
        break;
    }

    props.updateModifiedEventMatchPredicate(predicate);
  }

  const handleChangedMinimumBitsSpent = (minimumSpent: number) => {

    // 1) Update Cheer State
    // 2) Update NewEventMatchPredicate
    let newCheerState = {};

    if (CheerStateIsOfficial(cheerState)) {
      newCheerState = {
        cheerPrefix: cheerState.cheerPrefix, // Unchanged
        bits: minimumSpent,
      }
    } else if (CheerStateIsCustom(cheerState)) {
      // Test if the cheer name includes numbers, eg. 'Sus12', or '1984', that differ from bit spend
      let { cheerPrefix, bitValue } = CheerUtil.parseCheerString(cheerState.cheerFull || '');
      let cheerFull = cheerState.cheerFull;

      if (!!cheerPrefix && !!bitValue && bitValue === cheerState.bits) {
        // Let's replace the cheer.
        cheerFull = CheerUtil.joinCheerAndPrefix(cheerPrefix, minimumSpent);
      }

      newCheerState = {
        cheerFull: cheerFull,
        bits: minimumSpent,
      }

    } else {
      newCheerState = {
        bits: minimumSpent,
      }
    }

    setCheerState(newCheerState);

    let predicate = cheerStateToPredicate(newCheerState, bitsRuleType);


    console.log('\n\n======== handleChangedMinimumBitsSpend() =======');
    console.log('cheerState', newCheerState);
    console.table(predicate)
    console.log('\n\n');

    //switch (bitsRuleType) {
    //  case BitsRuleType.BitsCheermoteNameExactMatch:
    //    let joined = CheerUtil.joinCheerAndPrefix(cheerPrefix, minimumSpent);
    //    predicate.bits_cheermote_name_exact_match = {
    //      cheermote_name: joined, // Combined value
    //    }
    //    break;
    //  case BitsRuleType.BitsCheermotePrefixSpendThreshold:
    //    predicate.bits_cheermote_prefix_spend_threshold = {
    //      cheermote_prefix: cheerPrefix, // Untouched existing value
    //      minimum_bits_spent: minimumSpent, // New value
    //    }
    //    break;
    //  case BitsRuleType.BitsSpendThreshold:
    //    predicate.bits_spend_threshold = {
    //      minimum_bits_spent: minimumSpent, // New value
    //    }
    //    break;
    //}

    props.updateModifiedEventMatchPredicate(predicate);
  }

  // TODO
  const handleChangedRewardName = (name: string) => {
    let predicate : EventMatchPredicate = {};

    switch (channelPointsRuleType) {
      case ChannelPointsRuleType.ChannelPointsRewardNameExactMatch:
        predicate.channel_points_reward_name_exact_match = {
          reward_name: name, // New value
        }
        break;
    }

    props.updateModifiedEventMatchPredicate(predicate);
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
          cheerState={cheerState}
          updateCheerName={handleChangedCheerName}
          updateCheerPrefix={handleChangedCheerPrefix}
          updateMinimumBitsSpent={handleChangedMinimumBitsSpent} // NB: Technically not a field, but we can parse it out!
          />;
        break;
      case BitsRuleType.BitsCheermotePrefixSpendThreshold:
        matchingRulesForm = <BitsCheermotePrefixSpendThresholdForm
          cheerState={cheerState}
          updateCheerPrefix={handleChangedCheerPrefix}
          updateMinimumBitsSpent={handleChangedMinimumBitsSpent}
          />
        break;
      case BitsRuleType.BitsSpendThreshold:
        matchingRulesForm = <BitsSpendThresholdForm 
          cheerState={cheerState}
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
