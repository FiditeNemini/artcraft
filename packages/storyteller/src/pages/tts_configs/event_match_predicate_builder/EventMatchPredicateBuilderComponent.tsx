import React, { useEffect, useState } from 'react';
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
import { CHEER_LOOKUP_MAP } from '../../../twitch/Cheers';

interface EventMatchPredicateBuilderComponentProps {
  // CANNOT BE CHANGED AFTER CREATION
  twitchEventCategory: TwitchEventCategory,

  // Original event match predicate from the server 
  // (also immutable for sanity and because we lose information on UI changes)
  serverEventMatchPredicate: EventMatchPredicate,

  // Updates sent back up the tree
  updateModifiedEventMatchPredicate: (predicate: EventMatchPredicate) => void,
};

function EventMatchPredicateBuilderComponent(props: EventMatchPredicateBuilderComponentProps) {
  // ========== Core UI flow ==========

  const [bitsRuleType, setBitsRuleType] = useState<BitsRuleType>(BitsRuleType.BitsCheermoteNameExactMatch);
  const [channelPointsRuleType, setChannelPointsRuleType] = useState<ChannelPointsRuleType>(ChannelPointsRuleType.ChannelPointsRewardNameExactMatch);

  // ========== Cached Values for Editing ==========

  // A very complicated container that juggles bits and cheermote state.
  // The state transitions are complicated, and I've tried to document as best as possible.
  // TODO: This really needs some testing.
  const [cheerState, setCheerState] = useState<CheerState>({});

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

    let newCheerState = predicateToCheerState(props.serverEventMatchPredicate);

    switch (props.twitchEventCategory) {
      case TwitchEventCategory.Bits:
        if (!!props.serverEventMatchPredicate.bits_cheermote_name_exact_match) {
          newBitsRuleType = BitsRuleType.BitsCheermoteNameExactMatch;
        } else if (!!props.serverEventMatchPredicate.bits_cheermote_prefix_spend_threshold) {
          newBitsRuleType = BitsRuleType.BitsCheermotePrefixSpendThreshold;
        } else if (!!props.serverEventMatchPredicate.bits_spend_threshold) {
          newBitsRuleType = BitsRuleType.BitsSpendThreshold;
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

    setBitsRuleType(newBitsRuleType);
    setChannelPointsRuleType(newChannelPointsRuleType);

  }, [props.twitchEventCategory, props.serverEventMatchPredicate]);

  // TODO: We need to recalculate the model.
  const handleChangedBitsRuleType = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const newRuleType = value as BitsRuleType;

    let predicate = cheerStateToPredicate(cheerState, newRuleType);
    
    setBitsRuleType(newRuleType);
    props.updateModifiedEventMatchPredicate(predicate);

    return true;
  }

  const handleChangedChannelPointsRuleType = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const ruleType = value as ChannelPointsRuleType;
    setChannelPointsRuleType(ruleType);
    return true;
  }

  const handleChangedCheerPrefix = (newPrefix: string) => {
    // 1) Update Cheer State
    // 2) Update NewEventMatchPredicate
    let newCheerState : CheerState = {};

    let maybeCheerPrefix = CHEER_LOOKUP_MAP.get(newPrefix || '');

    if (!!maybeCheerPrefix) {
      newCheerState = {
        cheerPrefix: maybeCheerPrefix,
        bits: cheerState.bits, // Unchanged
      }
    } else {
      newCheerState = {
        cheerFull: newPrefix,
        bits: cheerState.bits, // Unchanged
      }
    }

    let predicate = cheerStateToPredicate(newCheerState, bitsRuleType);

    setCheerState(newCheerState);
    props.updateModifiedEventMatchPredicate(predicate);
  }

  const handleChangedCheerName = (name: string) => {
    // 1) Update Cheer State
    // 2) Update NewEventMatchPredicate
    let newCheerState : CheerState = {};

    let { cheerPrefix, bitValue } = CheerUtil.parseCheerString(name);

    let newBitValue = bitValue;
    let maybeCheerPrefix = CHEER_LOOKUP_MAP.get(cheerPrefix || '');

    if (!!maybeCheerPrefix) {
      // Official prefix.
      newCheerState = {
        cheerPrefix: maybeCheerPrefix,
        bits: newBitValue,
      }
    } else if (!!cheerPrefix) {
      // Custom prefix.

      // Test if hypothetically we should retain an independent of name bit value.
      // Hypothetically, Sus13 -> Sus12, but the bit value is 5000 in a separate field. 
      // We don't want to repalace with 13.
      if (CheerStateIsCustom(cheerState)) {
        let { cheerPrefix, bitValue } = CheerUtil.parseCheerString(cheerState.cheerFull || '');

        if ((!!cheerPrefix && !!bitValue) // We have a complete name
          && (bitValue !== cheerState.bits)) // The bit value is not independent of the cheer name, as in eg. (Foobar1000, 1000)
        {
          // Keep the old value.
          newBitValue = cheerState.bits;
        }
      }

      newCheerState = {
        cheerFull: name, // Should always be the full value
        bits: newBitValue, 
      }
    } 

    let predicate = cheerStateToPredicate(newCheerState, bitsRuleType);

    setCheerState(newCheerState);
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

    let predicate = cheerStateToPredicate(newCheerState, bitsRuleType);

    setCheerState(newCheerState);
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
