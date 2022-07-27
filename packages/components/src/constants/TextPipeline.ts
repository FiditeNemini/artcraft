
// Friendly names for each of the text pipeline identifiers.
const TEXT_PIPELINE_NAMES : Map<string, string> = new Map([
  //["legacy_vocodes", "Legacy Vocodes"],
  ["legacy_fakeyou", "Legacy FakeYou (grapheme-focused)"],
  ["spanish_v2", "English v0 (Old Arpabet)"], // NB: Tricksy.
  ["english_v1", "English v1 (Arpabet)"],
  //["spanish_v1", "Spanish v1"],
]);

export { TEXT_PIPELINE_NAMES }