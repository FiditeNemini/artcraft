'use strict';

// TODO: Use real AMD, and don't install crap globally.
(function() {
  /**
   * Static, sentence-related functions.
   */
  window.SentenceHelper = {
    /**
     * Process a raw sentence into a cleaned up sentence (no extra
     * spaces, etc.). Returns a string sentence.
     */
    cleanSentence: function(rawSentence) {
      return this.splitSentence(rawSentence).join(' ');
    },

    /** Process a raw sentence into words and other tokens. */
    splitSentence: function(rawSentence) {
      return _.filter(_.map(rawSentence.split(/\s+/),
            function(s) { return s.toLowerCase(); }),
          function(s) { return s !== ""; });
    },
  }
}());
