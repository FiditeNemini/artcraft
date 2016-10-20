// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

export class RawSentence {
  value: string;

  constructor(sentence: string) {
    this.value = sentence;
  }

  /**
   * Process a raw sentence into a cleaned up sentence (no extra
   * spaces, etc.) Returns a string sentence.
   */
  filter(): FilteredSentence {
    let lower = this.value.toLowerCase(),
        split = lower.split(/\s+/),
        filtered = split.filter(function(s: string): boolean { return s !== ''; }),
        joined = filtered.join(' ');

    return new FilteredSentence(joined);
  }
}

export class FilteredSentence {
  value: string;

  constructor(sentence: string) {
    this.value = sentence;
  }
}

