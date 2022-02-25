import React, { useEffect, useState } from 'react';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';
import { TtsSingleVoiceForm } from './TtsSingleVoiceForm';
import { EventResponseType } from './EventResponseType';
import { EventResponse } from '@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventResponse';
import { buildEventResponse } from './BuildEventResponse';
import { TtsRandomVoiceForm } from './TtsRandomVoiceForm';

interface EventResponseComponentProps {
  // Original response from server.
  // (also immutable for sanity and because we may lose info on UI changes)
  serverEventResponse: EventResponse,

  // Updates sent back up the tree
  updateModifiedEventResponse: (response: EventResponse) => void,

  // FakeYou voices
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
};

function EventResponseComponent(props: EventResponseComponentProps) {
  // ========== Core UI flow ==========

  const [eventResponseType, setEventResponseType] = useState<EventResponseType>(EventResponseType.TtsSingleVoice);

  // ========== Cached Values for Editing ==========

  const [selectedTtsModelTokens, setSelectedTtsModelTokens] = useState<string[]>([]);

  // NB: useState is not always setting from props correctly (after several re-renders)
  // The following answers suggests using useEffect:
  //  https://stackoverflow.com/a/54866051 (less clear by also using useState(), but good comments)
  //  https://stackoverflow.com/a/62982753
  useEffect(() => {
    let newEventResponseType = EventResponseType.TtsSingleVoice;
    let modelTokens : string[] = [];
    
    if (!!props.serverEventResponse.tts_single_voice) {
      newEventResponseType = EventResponseType.TtsSingleVoice;

      if (!!props.serverEventResponse.tts_single_voice.tts_model_token) {
        modelTokens.push(props.serverEventResponse.tts_single_voice.tts_model_token)
      }

    } else if (!!props.serverEventResponse.tts_random_voice) {
      newEventResponseType = EventResponseType.TtsRandomVoice;

      if (!!props.serverEventResponse.tts_random_voice.tts_model_tokens && 
        props.serverEventResponse.tts_random_voice.tts_model_tokens.length > 0) 
      {
        modelTokens = [...props.serverEventResponse.tts_random_voice.tts_model_tokens];
      }
    }

    setEventResponseType(newEventResponseType);
    setSelectedTtsModelTokens(modelTokens);

  }, [props.serverEventResponse]);

  const handleChangedEventResponseType = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const responseType = value as EventResponseType;
    setEventResponseType(responseType);
    return true;
  }

  const handleChangedTtsModelToken = (token: string) => {
    // We may be only updating to a single token, but we want to be able to navigate back to 
    // the "random voices" view, etc.
    let updatedTokens = [... selectedTtsModelTokens];

    if (updatedTokens.length > 0) {
      updatedTokens[0] = token;
    } else if (updatedTokens.length === 0) {
      updatedTokens.push(token);
    }

    const newEventResponse = buildEventResponse(updatedTokens, eventResponseType);

    setSelectedTtsModelTokens(updatedTokens);
    props.updateModifiedEventResponse(newEventResponse);
  }

  const handleChangedTtsModelTokens = (tokens: string[]) => {
    let updatedTokens = [... tokens];

    const newEventResponse = buildEventResponse(updatedTokens, eventResponseType);

    setSelectedTtsModelTokens(updatedTokens);
    props.updateModifiedEventResponse(newEventResponse);
  }

  let responseForm = <></>

  switch (eventResponseType) {
    case EventResponseType.TtsSingleVoice:
      responseForm = <TtsSingleVoiceForm
        selectedTtsModelTokens={selectedTtsModelTokens}
        updateSelectedTtsModelToken={handleChangedTtsModelToken}
        allTtsModels={props.allTtsModels}
        allTtsModelsByToken={props.allTtsModelsByToken}
        />
      break;
    case EventResponseType.TtsRandomVoice:
      responseForm = <TtsRandomVoiceForm
        selectedTtsModelTokens={selectedTtsModelTokens}
        updateSelectedTtsModelTokens={handleChangedTtsModelTokens}
        allTtsModels={props.allTtsModels}
        allTtsModelsByToken={props.allTtsModelsByToken}
        />
      break;
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

      {responseForm}

      <br />
      <br />

    </>
  )
}

export { EventResponseComponent }
