'use strict';

// TODO: Use real AMD.
(function() {
  /** UI controls and state. */
  window.Ui = {
    /** The current speaker vocabulary in use. */
    currentVocabulary: null,

    /** Handle completion of async load of library. */
    libraryLoadCallback: function(library) {
      var defaultSpeaker = library.getDefaultSpeaker(),
          vocabulary = library.getSpeakerVocabulary(defaultSpeaker);
      this.currentVocabulary = vocabulary;
      $('#wordcount').html(vocabulary.words.length);
      this.setStateFromInput();
    },

    /** Set the voice. */
    setVoice: function(voice) {
      var vocabulary = Library.getSpeakerVocabulary(voice);
      if (vocabulary) {
        this.currentVocabulary = vocabulary;
      }
    },

    /** Clear the input box. */
    clearInput: function() {
      $('input').val('');
    },

    // TODO: Rename, redesign.
    setFromInput: function(sentence) {
      var suggestedWords = [];
      if (this.currentVocabulary.checkSentence(sentence)) {
        this.setState('ok');
      } else {
        this.setState('error');
      }

      suggestedWords = this.currentVocabulary.getTypeAhead(sentence);
      this.setSuggestedWords(suggestedWords);
    },

    /** Set state with respect to input. */
    setStateFromInput: function() {
      var rawSentence = $('input').val();
      if (this.currentVocabulary.checkSentence(rawSentence)) {
        this.setState('ok');
      } else {
        this.setState('error');
      }
    },

    /** Set UI state. */
    setState: function(state) {
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
    },

    /** Set suggested words. Takes a list of dictionary words. */
    setSuggestedWords: function(suggestedWords) {
      var html = '';
      suggestedWords = suggestedWords || [];

      for (var i = 0; i < suggestedWords.length; i++) {
        var suggestedWord = suggestedWords[i];
        html += '<li>' + suggestedWord + '</li>';
      }

      $('#typeahead ul').html(html);
    },
  }
}());
