// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

declare var $: any;

import Audio from "./audio";
import decode_url_hash from "./url";
import get_audio_api_url from "./url";
import set_url_hash from "./url";
import { RawSentence, FilteredSentence } from "./sentence";

$(function() {
  console.log('installing...');
  window.audio = new Audio();
  install_events();
});

function install_events() {
  $('form').submit(function(ev: any): boolean {
    let input = $('input#jungle').val(),
        sentence = new RawSentence(input),
        filtered = sentence.filter();

    let url = get_audio_api_url(filtered);

    window.audio.playUrl(url);

    console.log(ev);
    ev.preventDefault();
    return false;
  });

  $('input#jungle').on('keyup', function(ev: any): any {
    var sentence = $('input#jungle').val();

    if (ev.keyCode === 27) {
      $('input#jungle').val(''); // ESC key.
      window.audio.stop();
    }
  });

  $('button#speak').on('click', function(ev: any): any {
    $('form').submit();
    ev.preventDefault();
    return false;
  });

  $('button#clear').on('click', function(ev: any): any {
    $('input#jungle').val(''); // ESC key.
    window.audio.stop();
    ev.preventDefault();
    return false;
  });
}

