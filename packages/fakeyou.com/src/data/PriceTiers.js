const FAKEYOU_PRICES = {
  //Starter Tier
  starter: {
    internal_plan_key: {
      development: null,
      production: null,
    },
    tier: "Starter",
    price: 0,
    tts: {
      title: "TTS",
      features: ["Unlimited generation", "Up to 12 seconds audio"],
    },
    // vcweb: {
    //   title: "VC Web",
    //   features: ["Up to 12 seconds audio"],
    // },
    // vcapp: {
    //   title: "VC App",
    //   features: [
    //     "5 model downloads",
    //     "Up to 12 secs prerecorded",
    //     "Up to 2 mins realtime",
    //   ],
    // },
    w2l: {
      title: "Wav2Lip",
      features: ["Up to 12 seconds video"],
    },
    priority: {
      title: "Processing Priority",
      features: ["Level 1"],
    },
  },

  //Basic Tier
  basic: {
    internal_plan_key: {
      development: null, // TODO
      production: null, // TODO
    },
    tier: "Basic",
    price: 3,
    tts: {
      title: "TTS",
      features: ["Unlimited generation", "Up to 20 seconds audio"],
    },
    // vcweb: {
    //   title: "VC Web",
    //   features: ["Up to 20 seconds audio", "Push to play"],
    // },
    // vcapp: {
    //   title: "VC App",
    //   features: [
    //     "7 model downloads",
    //     "Up to 20 secs prerecorded",
    //     "Up to 5 mins realtime",
    //   ],
    // },
    w2l: {
      title: "Wav2Lip",
      features: ["Up to 30 seconds video"],
    },
    priority: {
      title: "Processing Priority",
      features: ["Level 10"],
    },
  },

  //Plus Tier
  plus: {
    internal_plan_key: {
      development: "development_fakeyou_plus",
      production: "fakeyou_plus",
    },
    tier: "Plus",
    price: 7,
    tts: {
      title: "TTS",
      features: ["Unlimited generation", "Up to 30 seconds audio"],
    },
    // vcweb: {
    //   title: "VC Web",
    //   features: ["Up to 30 seconds audio", "Push to play"],
    // },
    // vcapp: {
    //   title: "VC App",
    //   features: [
    //     "10 model downloads",
    //     "Up to 30 secs prerecorded",
    //     "Up to 7 mins realtime",
    //   ],
    // },
    w2l: {
      title: "Wav2Lip",
      features: ["Up to 1 minute video"],
    },
    priority: {
      title: "Processing Priority",
      features: ["Level 20"],
    },
  },

  //Pro Tier
  pro: {
    internal_plan_key: {
      development: "development_fakeyou_pro",
      production: "fakeyou_pro",
    },
    tier: "Pro",
    price: 15,
    tts: {
      title: "TTS",
      features: [
        "Unlimited generation",
        "Up to 1 minute audio",
        //"Generate MP3 file",
        "Upload private models",
      ],
    },
    // vcweb: {
    //   title: "VC Web",
    //   features: ["Up to 30 seconds audio", "Push to play", "Generate MP3 file"],
    // },
    // vcapp: {
    //   title: "VC App",
    //   features: [
    //     "20 model downloads",
    //     "Up to 5 mins prerecorded",
    //     "Up to 15 mins realtime",
    //   ],
    // },
    w2l: {
      title: "Wav2Lip",
      features: ["Up to 2 minutes video"],
    },
    priority: {
      title: "Processing Priority",
      features: ["Level 30"],
    },
    api: {
      title: "API Access",
      features: ["Full API access"],
    },
  },

  //Elite Tier
  elite: {
    internal_plan_key: {
      development: "development_fakeyou_elite",
      production: "fakeyou_elite",
    },
    tier: "Elite",
    price: 25,
    tts: {
      title: "TTS",
      features: [
        "Unlimited generation",
        "Up to 2 minutes audio",
        //"Generate MP3 file",
        "Upload private models",
        "Share private models",
      ],
    },
    // vcweb: {
    //   title: "VC Web",
    //   features: ["Up to 7 minutes audio", "Push to play", "Generate MP3 file"],
    // },
    // vcapp: {
    //   title: "VC App",
    //   features: [
    //     "Unlimited models",
    //     "Unlimited prerecorded",
    //     "Unlimited realtime",
    //   ],
    // },
    w2l: {
      title: "Wav2Lip",
      features: ["Up to 2 minutes video"],
    },
    priority: {
      title: "Processing Priority",
      features: ["Level 40"],
    },
    api: {
      title: "API Access",
      features: ["Full API access"],
    },
    commercial: {
      title: "Commercial Voices",
      features: ["FakeYou commercial voices"],
    },
  },
};

export { FAKEYOU_PRICES };
