'use strict';

// TODO: Use real AMD, and don't install crap globally.
(function() {
  /** Event callbacks */
  window.Events = {
    /** Handle user input inside the input box. */
    handleTyping: function(ev) {
      var sentence = $('input#text').val();

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
        $('input#text').select();
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
          volume = $('input#vol').val(),
          speed = $('input#speed').val(),
          mps = $('input#monophone_padding_start').val(),
          mpe = $('input#monophone_padding_end').val(),
          ppe = $('input#polyphone_padding_end').val(),
          query = encodeURIComponent(sentence),
          url = '/speak?v=' + speaker
              + '&s=' + query
              + '&vol=' + volume
              + '&spd=' + speed
              + '&mps=' + mps
              + '&mpe=' + mpe
              + '&ppe=' + ppe
              + '&up=' + $('#use_phonemes').prop('checked')
              + '&uw=' + $('#use_words').prop('checked');

      ev.preventDefault();

      Url.setState(speaker, sentence, volume, speed, mps, mpe, ppe);
      Sound.play(url);

      return false;
    },
  }
}());

