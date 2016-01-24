'use strict';

// TODO: Use real AMD.
(function() {
  /** Maintain the words list. */
  var Dictionary = {
    /** Words list. */
    words: [],

    /** Load the word list from the server. */
    load: function() {
      var that = this;
      $.get('/words')
          .done(function(data) {
            console.log('success', data);
            that.words = data.words;
          })
          .fail(function() {
            // Page has catastrophically failed. Suggest reload.
            console.error('failure');
          });
    },

    /** Process a raw sentence into words and other tokens. */
    splitSentence: function(rawSentence) {
      return _.filter(_.map(rawSentence.split(/\s+/),
            function(s) { return s.toLowerCase(); }),
          function(s) { return s !== ""; });
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
  };

  /** Play the passed audio tag. */
  var play = function(audio) {
    console.log('playing audio');
    audio.play();
  }

  /** Handle user input. */
  var handleTyping = function(ev) {
    var sentence = $(this).val();
    if (Dictionary.checkSentence(sentence)) {
      setState('ok');
    } else {
      setState('error');
    }
  }

  /** Handle form submission. */
  var formSubmit = function(ev) {
    var $audio = $('#sound'),
        sentence = $('#text').val(),
        query = encodeURIComponent(sentence),
        url = '/speak?q=' + query;

    $audio.attr('src', url)
    $audio[0].addEventListener('canplaythrough', function() {
      console.log('can play');
      // Play after a short delay, just to make sure sound doesn't tear.
      setTimeout(function() { play($audio[0]); }, 100);
    }, false);

    ev.preventDefault();
    return false;
  }

  /** Set UI state. */
  var setState = function(state) {
    var newClass, oldClass;
    if (state == 'error') {
      newClass = 'error';
      oldClass = 'ok';
    } else if (state == 'ok') {
      newClass = 'ok';
      oldClass = 'error';
    } else {
      newClass = '';
      oldClass = 'error ok';
    }
    $('form').removeClass(oldClass)
        .addClass(newClass);
  }

  // TODO: Temp for debug.
  window.Dictionary= Dictionary;
  window.setState = setState;

  /** Install event handlers. */
  var install = function() {
    $('form').submit(formSubmit);
    //$('input').on('keypress', handleTyping);
    //$('input').on('keydown', handleTyping);
    $('input').on('keyup', handleTyping);
    Dictionary.load();
  }

  $(function() {
    install();
  });
}());

