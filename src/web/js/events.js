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
      var $audio = $('#sound'),
          sentence = $('#text').val(),
          speaker = $('select').val(),
          volume = $('input#vol').val(),
          speed = $('input#speed').val(),
          up = $('#use_phonemes').prop('checked'),
          ud = $('#use_diphones').prop('checked'),
          un = $('#use_n_phones').prop('checked'),
          uw = $('#use_words').prop('checked'),
          ue = $('#use_ends').prop('checked'),
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
              + '&up=' + up
              + '&ud=' + ud
              + '&un=' + un
              + '&uw=' + uw
              + '&ue=' + ue;

      ev.preventDefault();

      Url.setState(speaker,
                   sentence,
                   volume,
                   speed,
                   up,
                   ud,
                   un,
                   uw,
                   ue,
                   mps,
                   mpe,
                   ppe);

      Sound.play(url);

      return false;
    },
  }
}());

