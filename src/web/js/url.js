'use strict';

// TODO: Use real AMD.
(function() {

  // TODO: Don't install globally.
  /** Manipulate the URL. */
  window.Url = {

    /** Get the sentence from the `window.location`. */
    getSentence: function() {
      return this.toSentence(window.location);
    },

    /** Set the `window.history` sentence. */
    setSentence: function(rawSentence) {
      var urlHash = this.fromSentence(rawSentence);
      window.history.replaceState(null, null, urlHash);
    },

    /** Encode a sentence in a URL hash. */
    fromSentence: function(rawSentence) {
      var cleanedSentence = Dictionary.cleanSentence(rawSentence),
          uriEncoded = encodeURIComponent(cleanedSentence);
      return new URI("/").hash(uriEncoded).toString();
    },

    /** Decode a sentence from a URL. */
    toSentence: function(url) {
      var urlHash = new URI(url).hash(),
          uriDecoded = decodeURIComponent(urlHash),
          hashless = uriDecoded.replace('#', '');
      return Dictionary.cleanSentence(hashless);
    },
  }

}());
