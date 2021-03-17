

class SpeakerResponse {
  speakers?: SpeakerDetails[]
}

class SpeakerDetails {
  name?: string
  slug?: string
  model_pipeline?: string
  tacotron?: string
  melgan?: string
}

export {SpeakerResponse, SpeakerDetails};
