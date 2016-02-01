
// TODO: Use real AMD
(function() {
  // TODO: Don't install globally.
  /** Maintain the words list. */
  window.Dictionary = {
    /** Words list. */
    words: [],

    /** Load the word list from the server. */
    load: function(successCallback, failureCallback) {
      var that = this;
      $.get('/words')
          .done(function(data) {
            console.log('success', data);
            that.words = data.words;
            if (typeof successCallback !== 'undefined') {
              successCallback(that);
            }
          })
          .fail(function() {
            // Page has catastrophically failed. Suggest reload.
            console.error('failure');
            if (typeof successCallback !== 'undefined') {
              failureCallback(that);
            }
          });
    },

    /**
     * Check the entirety of a sentence against words in the dictionary.
     * Return true if okay to send to the server.
     * TODO: Great candidate for unit testing.
     * TODO: Handle punctuation.
     */
    checkSentence: function(rawSentence) {
      var splitWords = this.splitSentence(rawSentence);
      // TODO: Bad efficiency.
      for (var i in splitWords) {
        if (!_.contains(this.words, splitWords[i])) {
          return false;
        }
      }
      return true;
    },

    /**
     * Return a list of words from the dictionary based on the last word
     * in the sentence. This powers type ahead.
     */
    getTypeAhead: function(rawSentence) {
      var splitWords = this.splitSentence(rawSentence),
          lastWord = '';
      if (splitWords.length === 0) {
        return [];
      }
      lastWord = splitWords[splitWords.length - 1];
      return this.wordsStartingWith(lastWord);
    },

    /** Returns a list of words starting with the string provided. */
    wordsStartingWith: function(startFragment) {
      // TODO: This will become inefficient with a large dictionary.
      var search = (startFragment || '').toLowerCase();
      if (search === '') {
        return [];
      } else {
        return _.filter(this.words,
           function(word) { return word.lastIndexOf(search, 0) === 0; });
      }
    },

    /** Process a raw sentence into words and other tokens. */
    splitSentence: function(rawSentence) {
      return _.filter(_.map(rawSentence.split(/\s+/),
            function(s) { return s.toLowerCase(); }),
          function(s) { return s !== ""; });
    },
  };
}());
