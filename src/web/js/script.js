'use strict';

// TODO: Use real AMD.
(function() {
  /** Play the passed audio tag. */
  var play = function(audio) {
    console.log('playing audio');
    audio.play();
  }

  /** Handle user input. */
  var handleTyping = function(ev) {
    var sentence = $(this).val(),
        suggestedWords = [];

    if (ev.keyCode === 27) {
      $(this).val(''); // ESC key.
      sentence = '';
    }

    if (Dictionary.checkSentence(sentence)) {
      setState('ok');
    } else {
      setState('error');
    }

    suggestedWords = Dictionary.getTypeAhead(sentence);
    uiSetSuggestedWords(suggestedWords);
  }

  /** Handle typing outside of the input box. */
  var handleBodyTyping = function(ev) {
    if (ev.keyCode === 27) {
      // Handle ESC key.
      $('input').select();
    }
  }

  /** Handle form submission. */
  var formSubmit = function(ev) {
    var $audio = $('#sound'),
        sentence = $('#text').val(),
        query = encodeURIComponent(sentence),
        url = '/speak?q=' + query;

    Url.setSentence(sentence);

    $audio.attr('src', url)
    $audio[0].addEventListener('canplaythrough', function() {
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

  /** Set suggested words. Takes a list of dictionary words. */
  var uiSetSuggestedWords = function(suggestedWords) {
    var html = '';
    suggestedWords = suggestedWords || [];

    for (var i = 0; i < suggestedWords.length; i++) {
      var suggestedWord = suggestedWords[i];
      html += '<li>' + suggestedWord + '</li>';
    }

    $('#typeahead ul').html(html);
  }

  var uiDictionaryLoadCallback = function(dictionary) {
    $('#wordcount').html(dictionary.words.length);
  }

  /** Init the UI, possibly from a state passed in from the URL. */
  var uiInitialize = function() {
    var sentence = Url.getSentence(),
        urlPreviousState = false;
    if (sentence.length > 0) {
      $('input').val(sentence);
      urlPreviousState = true;
    }

    Dictionary.load(uiDictionaryLoadCallback);

    if (urlPreviousState) {
      $('form').submit();
    }
  }

  // TODO: Temp for debug.
  window.setState = setState;

  /** Install event handlers. */
  var installEventHandlers = function() {
    $('form').submit(formSubmit);
    //$('input').on('keypress', handleTyping);
    //$('input').on('keydown', handleTyping);
    $('input').on('keyup', handleTyping);
    $('body').on('keyup', handleBodyTyping);
  }

  $(function() {
    installEventHandlers();
    uiInitialize();
  });
}());

