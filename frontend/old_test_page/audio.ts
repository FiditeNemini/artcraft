import { WordString } from './words';

// FIXME: no type declarations exist.
declare var buzz: any;

const URL_PREFIX = '/speak';

interface SoundUrl {
  url: string;
}

// Convert a WordString into a SoundUrl.
function get_url(words: WordString) : SoundUrl {
  let sentence = words.words.join(' ');
  let url = URL_PREFIX + '?v=trump&vol=3&s=' + encodeURIComponent(sentence);
  return { url: url };
}

// Use the buzz.js library to play a SoundUrl.
function play_url(soundUrl: SoundUrl) {
  let sound = new buzz.sound(soundUrl.url);
  sound.play();
}

// Play a WordString.
export function play(words: WordString) {
  let soundUrl = get_url(words);
  play_url(soundUrl);
}

// Play several WordStrings.
export function play_all(wordList: WordString[]) {
  if (wordList.length == 0) return;

  let soundUrl = get_url(wordList[0]);
  let remainingWordList = wordList.slice(1, wordList.length);

  let sound = new buzz.sound(soundUrl.url);
  sound.bind('ended', function(e) { play_all(remainingWordList); });
  sound.play();
}

