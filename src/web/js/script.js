(function() {
  /** Play the passed audio tag. */
  var play = function(audio) {
    console.log('playing audio');
    audio.play();
  };

  var formSubmit = function(ev) {
    var $audio = $('#sound'),
        sentence = $('#text').val(),
        query = encodeURIComponent(sentence);
        url = '/speak?q=' + query;

    console.info('formSubmit', sentence, url);

    $audio.attr('src', url)
    $audio[0].addEventListener('canplaythrough', function() {
      console.log('can play');
      // Play after a short delay, just to make sure sound doesn't tear.
      setTimeout(function() { play($audio[0]); }, 100);
    }, false);

    ev.preventDefault();
    return false;
  }

  /** Install the handler. */
  var install = function() {
    /*$('form').submit(function(ev) {
      var sentence = $('#text').val(),
          query = encodeURIComponent(sentence);
          url = '/speak?q=' + query,
          $audio = $('#sound');

      $audio.attr('src', url);

      audio[0].addEventListener('canplaythrough', function() {
        // Play after a short delay, just to make sure sound doesn't tear.
        setTimeout(function() { play(audio); }, 100);
      }, false);

      audio[0].load();

      ev.preventDefault();
      return false;
    });*/

    $('form').submit(formSubmit);
  }

  $(function() {
    install();
  });
}());

