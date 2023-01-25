import { useDocumentTitle } from "@storyteller/components/src/hooks/UseDocumentTitle"

const DEFAULT_FOR_EMPTY_TITLE = "FakeYou. Deep Fake Text to Speech.";

export function usePrefixedDocumentTitle(title?: string) {
  const fixed = title === undefined ? "" : title.trim();
  // NB: Choice of a vertical bar "|" separator is due to conserving pixels, which *might* matter to SEO.
  // I haven't fully investigated the veracity of this, nor the position of prefixes, suffixes, etc.
  // https://www.searchenginejournal.com/pipe-or-dash-in-title-tag/378099/#close
  const outputTitle = fixed.length === 0 ? DEFAULT_FOR_EMPTY_TITLE : `FakeYou | ${fixed}`;
  useDocumentTitle(outputTitle);
}
