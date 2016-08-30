'use strict';

// TODO: Use real AMD.
(function() {

  /** Install event handlers. */
  var installEventHandlers = function() {
    $('form').submit(function(ev) { return Events.handleFormSubmit(ev); });
    $('input#text').on('keyup', function(ev) { return Events.handleTyping(ev); });
    $('body').on('keyup', function(ev) { return Events.handleBodyTyping(ev); });
    $('select').on('change', function(ev) { return Events.handleVoiceSelect(ev); });
  }

  /** Init the UI, possibly from a state passed in from the URL. */
  var uiInitialize = function() {
    var sentence = Url.getSentence(),
        speaker = Url.getSpeaker() || Library.getDefaultSpeaker(),
        volume = Url.getVolume() || Volume.DEFAULT,
        urlPreviousState = false;

    if (speaker) {
      $('select').val(speaker); // TODO: whitelist
    }

    if (sentence.length > 0) {
      $('input#text').val(sentence);
      urlPreviousState = true;
    }

    $('input#vol').val(volume);

    $('#use_phonemes').prop('use_phonemes', Url.getUsePhonemes());
    $('#use_words').prop('use_words', Url.getUseWords());

    Library.load(function(library) { Ui.libraryLoadCallback(library); });
    Sound.install();

    if (urlPreviousState) {
      $('form').submit();
    }
  }

  $(function() {
    installEventHandlers();
    uiInitialize();
  });
}());
