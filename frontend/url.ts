// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

import { RawSentence, FilteredSentence } from "./sentence";

import URI = require('urijs');

/**
 * Sentence -> Audio generation API URL
 */
export function get_audio_api_url(sentence: FilteredSentence) : string {
  // I may expand the API later, but for now this is all I'll expose.
  let encoded = encodeURIComponent(sentence.value);
  return `/speak?v=trump&vol=3&s=${encoded}`;
}

/**
 * Reset the URL.
 */
export function clear_url_hash() {
  window.history.replaceState(null, null, '/');
}

/**
 * Sentence -> Persistent URL hash
 */
export function set_url_hash(sentence: FilteredSentence) {
  let state = { 's': sentence.value },
      json = JSON.stringify(state),
      urlHash = '';

  if (!json) {
    urlHash = new URI('').hash('').toString();
  } else {
    let uriEncoded = encodeURIComponent(json);
    urlHash = new URI('').hash(uriEncoded).toString();
  }

  window.history.replaceState(null, null, urlHash);
}

/**
 * Persistent URL hash -> Raw Sentence
 */
export function decode_url_hash(): RawSentence {
  let urlHash = new URI(window.location).hash(),
      hashless = urlHash.replace('#', ''),
      uriDecodedJson = decodeURIComponent(hashless),
      state = null;

  if (uriDecodedJson) {
    state = JSON.parse(uriDecodedJson);
  }

  if (!state || !('s' in state)) {
    return null;
  } else {
    return new RawSentence(state['s']);
  }
}

