// Functions on words and sentences.

// TODO: SymbolString
export interface WordString {
  words: string[];
}

/** Parse a raw string sentence into a Word String. */
export function parse_words(rawSentence: string) : WordString {
  let words = rawSentence.split(/\s+/)
      .filter(function(w) { return w !== "" })
      .map(function(w) { return w.toLowerCase(); });

  return { words: words };
}

/*export = {
  parse_words: parse_words
};*/

