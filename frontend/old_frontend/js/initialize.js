'use strict';

// TODO: Use real AMD.
(function() {

  /** Install event handlers. */
  var installEventHandlers = function() {
    $('form').submit(function(ev) { return Events.handleFormSubmit(ev); });
    $('input#text').on('keyup', function(ev) { return Events.handleTyping(ev); });
    $('body').on('keydown', function(ev) { return Events.handleBodyTyping(ev); });
    $('select').on('change', function(ev) { return Events.handleVoiceSelect(ev); });
  };

  /** Init the UI, possibly from a state passed in from the URL. */
  var uiInitialize = function() {
    var sentence = Url.getSentence(),
        speaker = Url.getSpeaker() || Library.getDefaultSpeaker(),
        volume = Url.getVolume() || Volume.DEFAULT,
        speed = Url.getSpeed() || 1.0,
        useMonophones = Url.getUseMonophones(),
        useNPhones = Url.getUseNPhones(),
        useWords = Url.getUseWords(),
        useEnds = Url.getUseEnds(),
        pbp = Url.getPaddingBetweenPhones() || 0,
        pps = Url.getPolyphonePaddingStart() || 600,
        ppe = Url.getPolyphonePaddingEnd() || 600,
        wps = Url.getWordPaddingStart() || 600,
        wpe = Url.getWordPaddingEnd() || 600,
        urlPreviousState = false;

    if (useMonophones === null) useMonophones = true;
    if (useNPhones === null) useNPhones = true;
    if (useWords === null) useWords = true;
    if (useEnds === null) useEnds = true;

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

    $('#use_monophones').prop('checked', useMonophones);
    $('#use_n_phones').prop('checked', useNPhones);
    $('#use_words').prop('checked', useWords);
    $('#use_ends').prop('checked', useEnds);

    $('input#padding_between_phones').val(pbp);
    $('input#polyphone_padding_start').val(pps);
    $('input#polyphone_padding_end').val(ppe);
    $('input#word_padding_start').val(wps);
    $('input#word_padding_end').val(wpe);

    Library.load(function(library) { Ui.libraryLoadCallback(library); });
    Sound.install();

    if (urlPreviousState) {
      $('form').submit();
    }
  };

  $(function() {
    installEventHandlers();
    uiInitialize();
  });
}());
