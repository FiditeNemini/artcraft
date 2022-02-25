import { EventMatchPredicate } from "@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventMatchPredicate";
import { CHEER_LOOKUP_MAP, TwitchCheerPrefix } from "../../../twitch/Cheers";
import { CheerUtil } from "../../../twitch/CheerUtil";
import { BitsRuleType } from "./types/BitsRuleType";

// TODO: This needs tests badly.

export interface CheerStateOfficial {
  cheerPrefix?: TwitchCheerPrefix,
  bits?: number,
}

export interface CheerStateCustom {
  // NB: This can contain a numeric suffix independent of bits.
  // eg. third party cheers from 7tv.app: Sus11, Sus12, 1984, 4Weird.
  cheerFull?: string,
  bits?: number,
}

// Due to the complexity of the forms, this is used as the source of truth while editing.
// Each type of predicate can serialize and deserialize into the predicates.
export type CheerState = CheerStateOfficial | CheerStateCustom;

export function CheerStateIsOfficial(cheerState: CheerState): cheerState is CheerStateOfficial {
  return cheerState.hasOwnProperty('cheerPrefix');
}
export function CheerStateIsCustom(cheerState: CheerState): cheerState is CheerStateCustom {
  return cheerState.hasOwnProperty('cheerFull');
}

// Convert "exact match" strings into CheerState
export function convertExactMatchToCheerState(freeformText: string) : CheerState {
  const trimmed = freeformText.trim();

  let { cheerPrefix, bitValue } = CheerUtil.parseCheerString(trimmed);

  let maybeCheer = CHEER_LOOKUP_MAP.get(cheerPrefix || '');

  if (maybeCheer !== undefined) {
    return {
      cheerPrefix: maybeCheer,
      bits: bitValue,
    }
  }

  // NB: In this case, bits value may be wrong.
  // eg. "1984"
  return {
    cheerFull: freeformText,
    bits: bitValue,
  };
}

// Convert "prefix + bits" into CheerState
export function convertPrefixAndBitsToCheerState(freeformText?: string, bits?: number) : CheerState {
  const trimmed = !!freeformText ? freeformText.trim() : '';

  let { cheerPrefix, bitValue } = CheerUtil.parseCheerString(trimmed);

  let maybeCheer = CHEER_LOOKUP_MAP.get(cheerPrefix || '');

  // NB: Prefer function args over parsed value since we might be parsing 
  // custom cheers such as "Sus11" or "1984" (7tv.app)
  let maybeBits = bits || bitValue; 

  if (maybeCheer !== undefined) {
    return {
      cheerPrefix: maybeCheer,
      bits: maybeBits,
    }
  }

  // NB: In this case, bits value may be wrong.
  // eg. "1984"
  return {
    cheerFull: freeformText,
    bits: maybeBits,
  };
}

// Turn a cheer state into a predicate
export function predicateToCheerState(predicate: EventMatchPredicate) : CheerState 
{
  if (!!predicate.bits_cheermote_name_exact_match) {
    return convertExactMatchToCheerState(predicate.bits_cheermote_name_exact_match.cheermote_name)
  } else if (!!predicate.bits_cheermote_prefix_spend_threshold) {
    return convertPrefixAndBitsToCheerState(
      predicate.bits_cheermote_prefix_spend_threshold.cheermote_prefix,
      predicate.bits_cheermote_prefix_spend_threshold.minimum_bits_spent,
    );
  } else if (!!predicate.bits_spend_threshold) {
    return {
      bits: predicate.bits_spend_threshold.minimum_bits_spent,
    }
  } else {
    return {};
  }
}

// Turn a cheer state into a predicate
export function cheerStateToPredicate(
  cheerState: CheerState, 
  bitsRuleType: BitsRuleType) : EventMatchPredicate 
{
  let predicate : EventMatchPredicate = {};


  switch (bitsRuleType) {
    case BitsRuleType.BitsCheermoteNameExactMatch:
      predicate.bits_cheermote_name_exact_match = {
        cheermote_name: '',
      }
      break;
    case BitsRuleType.BitsCheermotePrefixSpendThreshold:
      predicate.bits_cheermote_prefix_spend_threshold = {
        cheermote_prefix: '',
        minimum_bits_spent: 1,
      }
      break;
    case BitsRuleType.BitsSpendThreshold:
      predicate.bits_spend_threshold = {
        minimum_bits_spent: 1,
      }
      break;
  }

  return predicate;
}


/*

Truth table-ish breakdown (incomplete).

"Corgo" is an official cheer
"Zombo", "Sus12", and "1984" are custom cheers

------------------------------------------------------------------------------------------------

Backend                                                                    Re-serialize to backend

Bits 1000                => CheerState { bits: 1000 }                         

ExactMatch Corgo100      => CheerState { official: Corgo,  bits: 100 }    => ExactMatch Corgo100
ExactMatch Zombo100      => CheerState { full: Zombo100,  bits: 100 }     => ExactMatch Zombo100 (from "full")

PrefixBits (Corgo, 100)  => CheerState { official: Corgo, bits: 100 }     => PrefixBits (Corgo, 100)
PrefixBits (Corgo, 123)  => CheerState { official: Corgo, bits: 123 }     => PrefixBits (Corgo, 123)
PrefixBits (Zombo, 123)  => CheerState { full: Zombo, bits: 123 }         => PrefixBits (Zombo, 123)

------------------------------------------------------------------------------------------------

Backend                                                                    To another [view type] w/ UI state

Bits 1000                => CheerState { bits: 1000 }                     => [ExactMatch]  PrefixSelect: (n/a) BitSelect: 1000 FreeForm: (n/a)
Bits 1234                => CheerState { bits: 1234 }                     => [ExactMatch]  PrefixSelect: (n/a) BitSelect: (n/a) FreeForm: (n/a)  [CANNOT POPULATE]

Bits 1000                => CheerState { bits: 1000 }                     => [PrefixBits]  PefixSelect: (n/a) FreeForm: (n/a) Bits: 1000  
Bits 1234                => CheerState { bits: 1234 }                     => [PrefixBits]  PefixSelect: (n/a) FreeForm: (n/a) Bits: 1234

ExactMatch Corgo100      => CheerState { official: Corgo,  bits: 100 }    => [ExactMatch]  PrefixSelect: Corgo BitSelect: 100 FreeForm: Corgo100
ExactMatch Zombo100      => CheerState { full: Zombo100,  bits: 100 }     => [ExactMatch]  PrefixSelect: (n/a) BitSelect: 100 FreeForm: Zombo100
ExactMatch Corgo100      => CheerState { official: Corgo,  bits: 100 }    => [Bits]        BitsSelect: 100  BitsFreeForm: 100
*) ExactMatch Corgo100      => CheerState { official: Corgo,  bits: 100 } => [PrefixBits]  PrefixSelect: Corgo FreeForm: Corgo Bits: 100
*) ExactMatch Zombo100      => CheerState { full: Zombo100,  bits: 100 }  => [PrefixBits]  PrefixSelect: (n/a) FreeForm: Zombo100 Bits: 100

PrefixBits (Corgo, 100)  => CheerState { official: Corgo, bits: 100 }     => PrefixBits (Corgo, 100)
PrefixBits (Corgo, 123)  => CheerState { official: Corgo, bits: 123 }     => PrefixBits (Corgo, 123)
PrefixBits (Zombo, 123)  => CheerState { full: Zombo, bits: 123 }         => PrefixBits (Zombo, 123)

# Notably, prefix is usually always "full":
PrefixBits (1884, 1000)  => CheerState { full: 1984, bits: 1000 }         => [PrefixBits]  PrefixSelect: (n/a) FreeForm: 1984 Bits: 1000
PrefixBits (Sus12, 1000) => CheerState { full: Sus12, bits: 1000 }        => [PrefixBits]  PrefixSelect: (n/a) FreeForm: Sus12 Bits: 1000
PrefixBits (Corgo1000, 5000) => CheerState { full: Corgo1000, bits: 5000} => [PrefixBits]  PrefixSelect: (n/a) FreeForm: Corgo1000 Bits: 5000

PrefixBits (1884, 1000)  => CheerState { full: 1984, bits: 1000 }         => [ExactMatch]  PrefixSelect: (n/a) FreeForm: 1984 Bits: 1000
PrefixBits (Sus12, 1000) => CheerState { full: Sus12, bits: 1000 }        => [ExactMatch]  PrefixSelect: (n/a) FreeForm: Sus12 Bits: 1000
PrefixBits (Corgo1000, 5000) => CheerState { full: Corgo1000, bits: 5000} => [ExactMatch]  PrefixSelect: (Corgo) FreeForm: Corgo1000 Bits: 1000 (*ignore bits*)


# Unless it is *only* an official prefix
PrefixBits (Corgo, 5000) => CheerState { official: Corgo, bits: 5000} => [PrefixBits]  PrefixSelect: Corgo FreeForm: Corgo Bits: 5000
PrefixBits (Corgo, 5000) => CheerState { official: Corgo, bits: 5000} => [ExactMatch]  PrefixSelect: Corgo FreeForm: Corgo5000


------------------------------------------------------------------------------------------------

CheerState                                    UI                                                               CheerState

CheerState { official: Corgo, bits: 5000} => [Bits]        BitsSelect: 5000, BitsFreeForm: 5000                => CheerState { official: (retain), bits: 5000 }
CheerState { official: Corgo, bits: 5000} => [PrefixBits]  PrefixSelect: Corgo FreeForm: Corgo Bits: 5000      => CheerState { official: Corgo, bits: 5000 }
CheerState { official: Corgo, bits: 5000} => [ExactMatch]  PrefixSelect: Corgo FreeForm: Corgo5000             => CheerState { official: Corgo, bits: 5000 } [split freeform]

CheerState { full: Zombo, bits: 5000}     => [Bits]        BitsSelect: 5000, BitsFreeForm: 5000
CheerState { full: Zombo, bits: 5000}     => [PrefixBits]  PrefixSelect: (n/a) FreeForm: Zombo Bits: 5000
CheerState { full: Zombo, bits: 5000}     => [ExactMatch]  PrefixSelect: (n/a) FreeForm: Zombo5000

CheerState { full: Zombo, bits: 5000}     => [Bits]        BitsSelect: 5000, BitsFreeForm: 5000
CheerState { full: Zombo, bits: 5000}     => [Bits]        BitsSelect: 5000, BitsFreeForm: 5000

CheerState { full: 1984, bits: 5000}      => [PrefixBits]  PrefixSelect: Corgo FreeForm: Corgo Bits: 5000
CheerState { full: Sus12, bits: 5000}     => [ExactMatch]  PrefixSelect: Corgo FreeForm: Corgo5000
CheerState { full: Corgo1000, bits: 5000} => [ExactMatch]  PrefixSelect: Corgo FreeForm: Corgo5000


*/