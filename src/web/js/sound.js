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
      // NB(echelon): This is the new TypeScript player wrapper.
      window.waveform_player.loadAndPlay(soundUrl);
    },

    useCaching: function() {
      return window.location.hostname != 'localhost' && !this.disableCaching;
    },
  };
}());
