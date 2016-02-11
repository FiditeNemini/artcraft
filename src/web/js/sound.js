'use strict';

// TODO: Use real AMD, and don't install crap globally.
(function() {
  window.Sound = {
    /** Cached sound clips. Significantly speeds up replay on mobile. */
    soundCache: {},

    /** Whether or not the cache is disabled. */
    disableCaching: false,

    /** Install the sound library. */
    install: function() {
      console.info('Installing sound library');
    },

    /** Play a sound file at a URL. */
    play: function(soundUrl) {
      var sound = null,
          fromCache = false;
      if (soundUrl in this.soundCache && this.useCaching()) {
        sound = this.soundCache[soundUrl];
        fromCache = true;
      } else {
        sound = new buzz.sound(soundUrl);
        this.soundCache[soundUrl] = sound;
      }
      console.info('Playing ' + soundUrl + ' from cache: ' + fromCache);
      sound.play();
    },

    useCaching: function() {
      return window.location.hostname != 'localhost' && !this.disableCaching;
    },
  };
}());
