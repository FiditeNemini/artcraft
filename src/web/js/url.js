'use strict';

// TODO: Use real AMD, and don't install crap globally.
(function() {
  /** Manipulate the URL. */
  window.Url = {
    /** JSON key for the `speaker` param. */
    _SPEAKER_KEY: 'v',

    /** JSON key for the `sentence` param. */
    _SENTENCE_KEY: 's',

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
      if (!(this._SPEAKER_KEY in state)) {
        return null;
      } else {
        return state[this._SPEAKER_KEY];
      }
    },

    // TODO: Independent functions to set both speaker and sentence separately.
    /** Set the `window.history` speaker and sentence. */
    setState: function(speaker, rawSentence) {
      var urlHash = this.fromSpeakerAndSentence(speaker, rawSentence);
      console.log('set state, urlhash = ', urlHash);
      window.history.replaceState(null, null, urlHash);
    },

    /** Encode a speaker and sentence in a URL hash. */
    fromSpeakerAndSentence: function(speaker, rawSentence) {
      var cleanedSentence = SentenceHelper.cleanSentence(rawSentence),
          cleanedSpeaker = speaker, // TODO: Check against speakers.
          state = {},
          json = null,
          uriEncoded = null;

      state[this._SPEAKER_KEY] = cleanedSpeaker;
      state[this._SENTENCE_KEY] = cleanedSentence;

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
