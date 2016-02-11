'use strict';

// TODO: Use real AMD, and don't install crap globally.
(function() {
  /** Event callbacks */
  window.Events = {
    /** Handle user input inside the input box. */
    handleTyping: function(ev) {
      var sentence = $('input').val();

      if (ev.keyCode === 27) {
        $(this).val(''); // ESC key.
        sentence = '';
      }

      Ui.setFromInput(sentence);
    },

    /** Handle typing outside of the input box. */
    handleBodyTyping: function(ev) {
      if (ev.keyCode === 27) {
        // Handle ESC key.
        $('input').select();
        Ui.clearInput();
        Ui.clearSuggestedWords();
        Ui.setFromInput('');
      }
    },

    /** Handle changing voices. */
    handleVoiceSelect: function(ev) {
      var selectedVoice = $('select').val();
      Ui.setSpeaker(selectedVoice);
    },

    /** Handle form submission. */
    handleFormSubmit: function(ev) {
      var $audio = $('#sound'),
          sentence = $('#text').val(),
          speaker = $('select').val(),
          query = encodeURIComponent(sentence),
          url = '/speak?v=' + speaker + '&s=' + query;

      ev.preventDefault();

      Url.setState(speaker, sentence);
      Sound.play(url);

      return false;
    },
  }
}());

