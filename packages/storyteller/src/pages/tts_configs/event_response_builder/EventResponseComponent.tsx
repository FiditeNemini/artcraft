import React, { useEffect, useState } from 'react';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';
import { FakeYouExternalLink } from '@storyteller/components/src/elements/FakeYouExternalLink';
import { TtsSingleVoiceForm } from './TtsSingleVoiceForm';
import { EventResponseType } from './EventResponseType';

interface EventResponseComponentProps {
  // Storyteller TTS configs
  ttsModelToken: string,
  setTtsModelToken: (token: string) => void,

  // FakeYou voices
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
};

function EventResponseComponent(props: EventResponseComponentProps) {
  const [eventResponseType, setEventResponseType] = useState<EventResponseType>(EventResponseType.TtsSingleVoice);

  const handleChangedEventResponseType = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const responseType = value as EventResponseType;

    // TODO:
    //let predicate : EventMatchPredicate = {};

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

    setEventResponseType(responseType);
    //setEventMatchPredicate(predicate);

    return true;
  }
  return (
    <>
      <h2 className="title is-4">3) Pick how to respond</h2>

      <div className="field">
        <label className="label">Response Type</label>
        <div className="control">
          <div className="select is-medium is-fullwidth">
            <select 
              value={eventResponseType}
              onChange={handleChangedEventResponseType}>
              <option value={EventResponseType.TtsSingleVoice}>Respond with a TTS voice</option>
              <option value={EventResponseType.TtsRandomVoice}>Respond with a Random TTS voice from list</option>
            </select>
          </div>
        </div>
      </div>

      <br />
      <br />

      <h2 className="title is-4">4) Configure the response</h2>

      <TtsSingleVoiceForm
        allTtsModels={props.allTtsModels}
        allTtsModelsByToken={props.allTtsModelsByToken}
        setTtsModelToken={props.setTtsModelToken}
        ttsModelToken={props.ttsModelToken}
        />

      <br />
      <br />

    </>
  )
}

export { EventResponseComponent }
