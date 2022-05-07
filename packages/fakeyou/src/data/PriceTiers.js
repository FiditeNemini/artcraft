const FAKEYOU_PRICES = {
  'free': {
    tier: 'free',
    price: 0,
    features: {
      'Extended Audio': false,
      'mp3': false,
      'Priority Processing': false,
      'Commercial Voices': false
    }
  },
  'basic': {
    tier: 'basic',
    price: 5,
    features: {
      'Extended Audio': true,
      'mp3': false,
      'Priority Processing': false,
      'Commercial Voices': false
    }
  },
  'pro': {
    tier: 'pro',
    price: 30,
    features: {
      'Extended Audio': true,
      'mp3': true,
      'Priority Processing': true,
      'Commercial Voices': true
    }
  }
}

const STORYTELLER_PRICES = {
  'free': {
    tier: 'free',
    price: 0,
    features: {
      'Priority Processing': false,
      'Stream Labs': false
    }
  },
  basic: {
    tier: 'basic',
    price: 5,
    features: {
      'Priority Processing': false,
      'Stream Labs': false
    }
  },
  pro: {
    tier: 'premium',
    price: 50,
    features: {
      'Priority Processing': true,
      "Stream Labs": true
    }
  }
}

export { FAKEYOU_PRICES, STORYTELLER_PRICES }