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
        speed = Url.getSpeed() || 1.0,
        usePhonemes = Url.getUsePhonemes(),
        useDiphones = Url.getUseDiphones(),
        useWords = Url.getUseWords(),
        mps = Url.getMonophonePaddingStart() || 0,
        mpe = Url.getMonophonePaddingEnd() || 0,
        ppe = Url.getPolyphonePaddingEnd() || 600,
        urlPreviousState = false;

    if (usePhonemes === null) usePhonemes = true;
    if (useDiphones === null) useDiphones = true;
    if (useWords === null) useWords = true;

    if (speaker) {
      $('select').val(speaker); // TODO: whitelist
    }

    if (sentence.length > 0) {
      $('input#text').val(sentence);
      urlPreviousState = true;
    }

    speed = parseFloat(speed).toFixed(2);
    $('input#speed').val(speed);
    $('input#vol').val(volume);

    $('#use_phonemes').prop('checked', usePhonemes);
    $('#use_diphones').prop('checked', useDiphones);
    $('#use_words').prop('checked', useWords);

    $('input#monophone_padding_start').val(mps);
    $('input#monophone_padding_end').val(mpe);
    $('input#polyphone_padding_end').val(ppe);

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
