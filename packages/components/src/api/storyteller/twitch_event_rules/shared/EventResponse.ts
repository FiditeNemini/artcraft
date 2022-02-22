
export interface NotSet {
};

export interface TtsSingleVoice {
  tts_model_token: string,
};

export interface TtsRandomVoice {
  tts_model_tokens: string[],
};


// The response will have one field set exclusively.
export interface EventResponse {
  // Empty
  not_set?: NotSet,

  // Respond with TTS
  tts_single_voice?: TtsSingleVoice,
  tts_random_voice?: TtsRandomVoice,
}