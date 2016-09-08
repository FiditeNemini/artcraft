'use strict';

// TODO: Use real AMD, and don't install crap globally.
(function() {
  /** Manipulate the URL. */
  window.Url = {
    /** JSON key for the `speaker` param. */
    _SPEAKER_KEY: 'v',

    /** JSON key for the `sentence` param. */
    _SENTENCE_KEY: 's',

    /** JSON key for the `volume` param. */
    _VOLUME_KEY: 'vol',

    /** JSON key for the `speed` param. */
    _SPEED_KEY: 'spd',

    /** JSON key for the `use_phonemes` param. */
    _USE_PHONEMES_KEY: 'up',

    /** JSON key for the `use_diphones` param. */
    _USE_DIPHONES_KEY: 'ud',

    /** JSON key for the `use_n_phones` param. */
    _USE_N_PHONES_KEY: 'un',

    /** JSON key for the `use_words` param. */
    _USE_WORDS_KEY: 'uw',

    _MONOPHONE_PADDING_START_KEY: 'mps',
    _MONOPHONE_PADDING_END_KEY: 'mpe',
    _POLYPHONE_PADDING_END_KEY: 'ppe',

    /** Get the sentence from the `window.location`. */
    getSentence: function() {
      var state = this.parseState(window.location),
          sentence = null;
      if (!state || !(this._SENTENCE_KEY in state)) {
        return '';
      } else {
        sentence = state[this._SENTENCE_KEY] || '';
        return SentenceHelper.cleanSentence(sentence);
      }
    },

    /** Get the speaker from the `window.location`. */
    getSpeaker: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._SPEAKER_KEY in state)) {
        return null;
      } else {
        return state[this._SPEAKER_KEY];
      }
    },

    /** Get the volume from the `window.location`. */
    getVolume: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._VOLUME_KEY in state)) {
        return null;
      } else {
        return state[this._VOLUME_KEY];
      }
    },

    /** Get the speed from the `window.location`. */
    getSpeed: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._SPEED_KEY in state)) {
        return null;
      } else {
        return state[this._SPEED_KEY];
      }
    },

    /** Get the "use phonemes" from the `window.location`. */
    getUsePhonemes: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._USE_PHONEMES_KEY in state)) {
        return null;
      } else {
        return state[this._USE_PHONEMES_KEY];
      }
    },

    /** Get the "use diphones" from the `window.location`. */
    getUseDiphones: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._USE_DIPHONES_KEY in state)) {
        return null;
      } else {
        return state[this._USE_DIPHONES_KEY];
      }
    },

    /** Get the "use n-phones" from the `window.location`. */
    getUseNPhones: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._USE_N_PHONES_KEY in state)) {
        return null;
      } else {
        return state[this._USE_N_PHONES_KEY];
      }
    },

    /** Get the "use words" from the `window.location`. */
    getUseWords: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._USE_WORDS_KEY in state)) {
        return null;
      } else {
        return state[this._USE_WORDS_KEY];
      }
    },

    /** Get the MPS value from the `window.location`. */
    getMonophonePaddingStart: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._MONOPHONE_PADDING_START_KEY in state)) {
        return null;
      } else {
        return state[this._MONOPHONE_PADDING_START_KEY];
      }
    },

    /** Get the MPE value from the `window.location`. */
    getMonophonePaddingEnd: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._MONOPHONE_PADDING_END_KEY in state)) {
        return null;
      } else {
        return state[this._MONOPHONE_PADDING_END_KEY];
      }
    },

    /** Get the PPE value from the `window.location`. */
    getPolyphonePaddingEnd: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._POLYPHONE_PADDING_END_KEY in state)) {
        return null;
      } else {
        return state[this._POLYPHONE_PADDING_END_KEY];
      }
    },

    // TODO: Independent functions to set both speaker and sentence separately.
    /** Set the `window.history` speaker, sentence, phoneme use, and word use. */
    setState: function(speaker,
                       rawSentence,
                       volume,
                       speed,
                       usePhonemes,
                       useDiphones,
                       useNPhones,
                       useWords,
                       monophonePaddingStart,
                       monophonePaddingEnd,
                       polyphonePaddingEnd) {

      var urlHash = this.fromParams(speaker,
                                    rawSentence,
                                    volume,
                                    speed,
                                    usePhonemes,
                                    useDiphones,
                                    useNPhones,
                                    useWords,
                                    monophonePaddingStart,
                                    monophonePaddingEnd,
                                    polyphonePaddingEnd);

      console.log('set state, urlhash = ', urlHash);
      window.history.replaceState(null, null, urlHash);
    },

    /** Encode a speaker and sentence in a URL hash. */
    fromParams: function(speaker,
                         rawSentence,
                         volume,
                         speed,
                         usePhonemes,
                         useDiphones,
                         useNPhones,
                         useWords,
                         monophonePaddingStart,
                         monophonePaddingEnd,
                         polyphonePaddingEnd) {

      var cleanedSentence = SentenceHelper.cleanSentence(rawSentence),
          cleanedSpeaker = speaker, // TODO: Check against speakers.
          cleanedVolume = volume, // TODO: Filter invalid values.
          state = {},
          json = null,
          uriEncoded = null;

      state[this._SPEAKER_KEY] = cleanedSpeaker;
      state[this._SENTENCE_KEY] = cleanedSentence;
      state[this._VOLUME_KEY] = cleanedVolume;
      state[this._SPEED_KEY] = speed; // TODO: Filter invalid values.
      state[this._USE_PHONEMES_KEY] = !!usePhonemes;
      state[this._USE_DIPHONES_KEY] = !!useDiphones;
      state[this._USE_N_PHONES_KEY] = !!useNPhones;
      state[this._USE_WORDS_KEY] = !!useWords;
      state[this._MONOPHONE_PADDING_START_KEY] = monophonePaddingStart;
      state[this._MONOPHONE_PADDING_END_KEY] = monophonePaddingEnd;
      state[this._POLYPHONE_PADDING_END_KEY] = polyphonePaddingEnd;

      json = JSON.stringify(state);

      if (!json) {
        return new URI('/').hash('').toString();
      } else {
        uriEncoded = encodeURIComponent(json);
        return new URI('/').hash(uriEncoded).toString();
      }
    },

    /**
     * Parse the represented state (object) out of a URL hash that
     * contains urlencoded JSON.
     */
    parseState: function(url) {
      var urlHash = new URI(url).hash(),
          hashless = urlHash.replace('#', ''),
          uriDecodedJson = decodeURIComponent(hashless),
          state = null;

      if (uriDecodedJson) {
        state = JSON.parse(uriDecodedJson);
      }
      return state;
    }
  }
}());
