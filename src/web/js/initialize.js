'use strict';

// TODO: Use real AMD.
(function() {

  /** Install event handlers. */
  var installEventHandlers = function() {
    $('form').submit(function(ev) { return Events.handleFormSubmit(ev); });
    $('input').on('keyup', function(ev) { return Events.handleTyping(ev); });
    $('body').on('keyup', function(ev) { return Events.handleBodyTyping(ev); });
  }

  /** Init the UI, possibly from a state passed in from the URL. */
  var uiInitialize = function() {
    var sentence = Url.getSentence(),
        urlPreviousState = false;
    if (sentence.length > 0) {
      $('input').val(sentence);
      urlPreviousState = true;
    }

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
