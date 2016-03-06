'use strict';

// TODO: Use real AMD, and don't install crap globally.
(function() {
  window.Volume = {
    /** Default volume. */
    DEFAULT: 3.0,

    // TODO: Set validity in UI.
    valid: function(volume) {
      return !isNaN(volume);
    },
  }
}());
