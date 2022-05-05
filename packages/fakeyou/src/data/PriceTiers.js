const FAKEYOU_PRICES = {
  free: {
    price: 0,
    features: {
      extendedAudio: false,
      mp3: false,
      priorityProcessing: false,
      commercialVoices: false
    }
  },
  basic: {
    price: 5,
    features: {
      extendedAudio: true,
      mp3: false,
      priorityProcessing: false,
      commercialVoices: false
    }
  },
  pro: {
    price: 30,
    features: {
      extendedAudio: true,
      mp3: true,
      priorityProcessing: true,
      commercialVoices: true
    }
  }
}

const STORYTELLER_PRICES = {
  free: {
    price: 0,
    features: {
      priorityProcessing: false,
      streamlabs: false
    }
  },
  basic: {
    price: 5,
    features: {
      priorityProcessing: false,
      streamlabs: false
    }
  },
  pro: {
    price: 50,
    features: {
      priorityProcessing: true,
      streamlabs: true
    }
  }
}

export { FAKEYOU_PRICES, STORYTELLER_PRICES }