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
    if (Dictionary.checkSentence(sentence)) {
      setState('ok');
    } else {
      setState('error');
    }

    suggestedWords = Dictionary.getTypeAhead(sentence);
    uiSetSuggestedWords(suggestedWords);
  }

  /** Handle form submission. */
  var formSubmit = function(ev) {
    var $audio = $('#sound'),
        sentence = $('#text').val(),
        query = encodeURIComponent(sentence),
        url = '/speak?q=' + query;

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

    $('ul').html(html);
  }

  // TODO: Temp for debug.
  window.setState = setState;

  /** Install event handlers. */
  var install = function() {
    $('form').submit(formSubmit);
    //$('input').on('keypress', handleTyping);
    //$('input').on('keydown', handleTyping);
    $('input').on('keyup', handleTyping);
    Dictionary.load();
  }

  $(function() {
    install();
  });
}());

