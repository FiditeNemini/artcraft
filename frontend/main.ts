// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

/// <reference path='./typings/tsd.d.ts' />

import $ = require('jquery');

import { setup_animation } from "./animation";
import Audio from "./audio";
import { clear_url_hash, decode_url_hash, get_audio_api_url, set_url_hash } from "./url";
import { RawSentence, FilteredSentence } from "./sentence";

const INPUT = 'input#jungle';

$(function() {
  (<any>window).audio = new Audio();
  install_events();
  initialize_from_url();
  focus();

  if ($('#animation').length > 0) {
    // Only install animation if the page supports it.
    setup_animation();
  }
});

function install_events() {
  $('form').submit(function(ev: any): boolean {
    let input = $('input#jungle').val(),
        sentence = new RawSentence(input),
        filtered = sentence.filter();

    set_url_hash(filtered);

    let url = get_audio_api_url(filtered);
    (<any>window).audio.playUrl(url);

    ev.preventDefault();
    return false;
  });

  $('body').on('keyup', function(ev: any): any {
    if (ev.keyCode === 27) {
      // ESC key.
      focus();
      $(INPUT).val('');
      (<any>window).audio.stop();
    }
  });

  $('input#jungle').on('keyup', function(ev: any): any {
    var sentence = $(INPUT).val();

    if (ev.keyCode === 27) {
      $(INPUT).val(''); // ESC key.
      (<any>window).audio.stop();
    }
  });

  $('button#speak').on('click', function(ev: any): any {
    $('form').submit();
    ev.preventDefault();
    return false;
  });

  $('button#clear').on('click', function(ev: any): any {
    $(INPUT).val(''); // ESC key.
    (<any>window).audio.stop();
    clear_url_hash();
    ev.preventDefault();
    return false;
  });
}

function initialize_from_url() {
  let rawSentence = decode_url_hash();

  if (rawSentence == null) return;

  $(INPUT)
      .val(rawSentence.filter().value)
      .submit();
}

function focus() {
  $(INPUT).focus();
  $(INPUT).select();
}

