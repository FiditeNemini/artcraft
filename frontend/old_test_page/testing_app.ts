import audio = require('./audio');
import words = require('./words');
import sentences = require('./sentences');

// FIXME: Cannot find import.
import $ = require('jquery');

function main() {
  display_sentences();
  play_sentences();
}

function display_sentences() {
  let $ul = $('#sentenceList');

  for (let sentence of sentences) {
    $ul.append('<li>' + sentence + '</li>');
  }
}

function play_sentences() {
  let wordLists = [];

  for (let sentence of sentences) {
    let w = words.parse_words(sentence);
    wordLists.push(w);
  }

  audio.play_all(wordLists);
}

// To export objects,
//window.words = words;
//window.audio = audio;

$(() => { main(); });

