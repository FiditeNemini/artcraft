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

    /** JSON key for the `use_monophones` param. */
    _USE_MONOPHONES_KEY: 'um',

    /** JSON key for the `use_n_phones` param. */
    _USE_N_PHONES_KEY: 'un',

    /** JSON key for the `use_words` param. */
    _USE_WORDS_KEY: 'uw',

    /** JSON key for the `use_ends` param. */
    _USE_ENDS_KEY: 'ue',

    _PADDING_BETWEEN_PHONES: 'pbp',
    _POLYPHONE_PADDING_START_KEY: 'pps',
    _POLYPHONE_PADDING_END_KEY: 'ppe',
    _WORD_PADDING_START_KEY: 'wps',
    _WORD_PADDING_END_KEY: 'wpe',

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

    /** Get the "use monophones" from the `window.location`. */
    getUseMonophones: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._USE_MONOPHONES_KEY in state)) {
        return null;
      } else {
        return state[this._USE_MONOPHONES_KEY];
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

    /** Get the "use ends" from the `window.location`. */
    getUseEnds: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._USE_ENDS_KEY in state)) {
        return null;
      } else {
        return state[this._USE_ENDS_KEY];
      }
    },

    /** Get the PBP value from the `window.location`. */
    getPaddingBetweenPhones: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._PADDING_BETWEEN_PHONES in state)) {
        return null;
      } else {
        return state[this._PADDING_BETWEEN_PHONES];
      }
    },

    /** Get the PPS value from the `window.location`. */
    getPolyphonePaddingStart: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._POLYPHONE_PADDING_START_KEY in state)) {
        return null;
      } else {
        return state[this._POLYPHONE_PADDING_START_KEY];
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

    getWordPaddingStart: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._WORD_PADDING_START_KEY in state)) {
        return null;
      } else {
        return state[this._WORD_PADDING_START_KEY];
      }
    },

    getWordPaddingEnd: function() {
      var state = this.parseState(window.location);
      if (!state || !(this._WORD_PADDING_END_KEY in state)) {
        return null;
      } else {
        return state[this._WORD_PADDING_END_KEY];
      }
    },


    // TODO: Independent functions to set both speaker and sentence separately.
    /** Set the `window.history` speaker, sentence, phoneme use, and word use. */
    setState: function(speaker,
                       rawSentence,
                       volume,
                       speed,
                       useMonophones,
                       useNPhones,
                       useWords,
                       useEnds,
                       paddingBetweenPhones,
                       polyphonePaddingStart,
                       polyphonePaddingEnd,
                       wordPaddingStart,
                       wordPaddingEnd) {

      var urlHash = this.fromParams(speaker,
                                    rawSentence,
                                    volume,
                                    speed,
                                    useMonophones,
                                    useNPhones,
                                    useWords,
                                    useEnds,
                                    paddingBetweenPhones,
                                    polyphonePaddingStart,
                                    polyphonePaddingEnd,
                                    wordPaddingStart,
                                    wordPaddingEnd);

      console.log('set state, urlhash = ', urlHash);
      window.history.replaceState(null, null, urlHash);
    },

    /** Encode a speaker and sentence in a URL hash. */
    fromParams: function(speaker,
                         rawSentence,
                         volume,
                         speed,
                         useMonophones,
                         useNPhones,
                         useWords,
                         useEnds,
                         paddingBetweenPhones,
                         polyphonePaddingStart,
                         polyphonePaddingEnd,
                         wordPaddingStart,
                         wordPaddingEnd) {

      var cleanedSentence = SentenceHelper.cleanSentence(rawSentence),
          cleanedSpeaker = speaker, // TODO: Check against speakers.
          cleanedVolume = volume, // TODO: Filter invalid values.
          state = {},
          json,
          uriEncoded = null;

      state[this._SPEAKER_KEY] = cleanedSpeaker;
      state[this._SENTENCE_KEY] = cleanedSentence;
      state[this._VOLUME_KEY] = cleanedVolume;
      state[this._SPEED_KEY] = speed; // TODO: Filter invalid values.
      state[this._USE_MONOPHONES_KEY] = !!useMonophones;
      state[this._USE_N_PHONES_KEY] = !!useNPhones;
      state[this._USE_WORDS_KEY] = !!useWords;
      state[this._USE_ENDS_KEY] = !!useEnds;
      state[this._PADDING_BETWEEN_PHONES] = paddingBetweenPhones;
      state[this._POLYPHONE_PADDING_START_KEY] = polyphonePaddingStart;
      state[this._POLYPHONE_PADDING_END_KEY] = polyphonePaddingEnd;
      state[this._WORD_PADDING_START_KEY] = wordPaddingStart;
      state[this._WORD_PADDING_END_KEY] = wordPaddingEnd;

      json = JSON.stringify(state);

      if (!json) {
        return new URI('/old').hash('').toString();
      } else {
        uriEncoded = encodeURIComponent(json);
        return new URI('/old').hash(uriEncoded).toString();
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
