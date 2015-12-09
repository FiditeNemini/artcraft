(function() {
  /** Play the passed audio tag. */
  var play = function(audio) {
    console.log('playing audio');
    audio.play();
  };

  /** Handle form submission. */
  var submit = function() {
    var sentence = document.getElementById('text').value,
        query = encodeURIComponent(sentence);
        url = '/speak?q=' + query,
        audio = document.getElementById('sound');

    audio.setAttribute('src', url);

    audio.addEventListener('canplaythrough', function() {
      // Play after a short delay, just to make sure sound doesn't tear.
      setTimeout(function() { play(audio); }, 100);
    }, false);

    audio.load();
  };

  /** Install the handler. */
  var install = function() {
    document.getElementById('form')
      .addEventListener('submit', function() {
        submit();
      });
  };

  window.onload = function() { install(); };
}());

