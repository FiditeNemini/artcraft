import { EventResponse } from "@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventResponse";
import { EventResponseType } from "./EventResponseType";

export function buildEventResponse(ttsModelTokens: string[], eventResponseType: EventResponseType) {
  let eventResponse : EventResponse = {};

  switch (eventResponseType) {
    case EventResponseType.TtsSingleVoice:
      let ttsModelToken = '';
      if (ttsModelTokens.length > 0) {
        ttsModelToken = ttsModelTokens[0];
      }
      eventResponse.tts_single_voice =  {
        tts_model_token: ttsModelToken,
      }
      break;
    case EventResponseType.TtsRandomVoice:
      eventResponse.tts_random_voice=  {
        tts_model_tokens: [...ttsModelTokens],
      }
      break;
  }

  return eventResponse;
}