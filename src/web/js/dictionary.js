// TODO: Use real AMD, and don't install crap globally.
(function() {
  /** Maintain the library of vocabularies. */
  window.Library = {
    /** Libraries: voiceName(str)=> Vocabulary(obj) */
    library: {},

    /** Load the word list from the server. */
    load: function(successCallback, failureCallback) {
      var that = this;
      $.get('/words')
        .done(function(data) {
          console.log('success', data);

          for (var speaker in data.library) {
            var words = data.library[speaker];
            if (words.length !== 0) {
              var vocabulary = new Vocabulary(words);
              that.library[speaker] = vocabulary;
            }
          }

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
  }

  /**
   * An individual speaker's words.
   * Initialize with the subset of the JSON response corresponding to
   * the speaker.
   */
  window.Vocabulary = function(responseSubset) {
    return {
      /** List of words. */
      words: responseSubset.words,

      /**
       * Check the entirety of a sentence against words in the
       * dictionary.
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
       * Return a list of words from the dictionary based on the last
       * word in the sentence. This powers type ahead.
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
  }
}());
