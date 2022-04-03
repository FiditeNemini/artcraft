'use strict';

// TODO: Use real AMD, and don't install crap globally.
(function() {
  /** Event callbacks */
  window.Events = {
    /** Handle user input inside the input box. */
    handleTyping: function(ev) {
      var sentence = $('input#text').val();

      if (ev.keyCode === 27) {
        $('input#text').val(''); // ESC key.
        sentence = '';
        window.waveform_player.clear();
      } else if (ev.keyCode == 32) {
        // Space key.
        ev.stopPropagation();
      }

      Ui.setFromInput(sentence);
    },

    /** Handle typing outside of the input box. */
    handleBodyTyping: function(ev) {
      if (ev.target.tagName.toLowerCase() === 'input') {
        return; // We'll handle this elsewhere.
      }

      if (ev.keyCode === 27) {
        // Handle ESC key.
        $('input#text').select();
        Ui.clearInput();
        Ui.clearSuggestedWords();
        Ui.setFromInput('');
        window.waveform_player.clear();
      } else if (ev.keyCode == 32) {
        // 'Space' key to toggle playing.
        window.waveform_player.toggle();
        // Prevent spacebar from causing scroll.
        ev.preventDefault();
        return false;
      }
    },

    /** Handle changing voices. */
    handleVoiceSelect: function(ev) {
      var selectedVoice = $('select').val();
      Ui.setSpeaker(selectedVoice);
    },

    /** Handle form submission. */
    handleFormSubmit: function(ev) {
      var sentence = $('#text').val(),
          speaker = $('select').val(),
          volume = $('input#vol').val(),
          speed = $('input#speed').val(),
          um = $('#use_monophones').prop('checked'),
          un = $('#use_n_phones').prop('checked'),
          us = $('#use_syllables').prop('checked'),
          uw = $('#use_words').prop('checked'),
          ue = $('#use_ends').prop('checked'),
          pbp = $('input#padding_between_phones').val(),
          pps = $('input#polyphone_padding_start').val(),
          ppe = $('input#polyphone_padding_end').val(),
          wps = $('input#word_padding_start').val(),
          wpe = $('input#word_padding_end').val(),
          query = encodeURIComponent(sentence),
          url = '/speak?v=' + speaker
              + '&s=' + query
              + '&vol=' + volume
              + '&spd=' + speed
              + '&pbp=' + pbp
              + '&pps=' + pps
              + '&ppe=' + ppe
              + '&wps=' + wps
              + '&wpe=' + wpe
              + '&um=' + um
              + '&un=' + un
              + '&us=' + us
              + '&uw=' + uw
              + '&ue=' + ue;

      ev.preventDefault();

      Url.setState(speaker,
                   sentence,
                   volume,
                   speed,
                   um,
                   un,
                   us,
                   uw,
                   ue,
                   pbp,
                   pps,
                   ppe,
                   wps,
                   wpe);

      Sound.play(url);

      return false;
    },
  }
}());

