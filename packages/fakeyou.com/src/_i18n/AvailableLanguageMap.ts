import { Language } from "@storyteller/components/src/i18n/Language";

export interface AvailableLanguage {
  language: Language;
  languageCode: string;
  showPleaseFollowNotice: boolean;
  showBootstrapLanguageNotice: boolean;
}

export const ENGLISH_LANGUAGE: AvailableLanguage = {
  language: Language.English,
  languageCode: "en",
  showPleaseFollowNotice: false,
  showBootstrapLanguageNotice: false,
};

export const AVAILABLE_LANGUAGE_MAP: Record<string, AvailableLanguage> = {
  en: ENGLISH_LANGUAGE,
  es: {
    language: Language.Spanish,
    languageCode: "es",
    showPleaseFollowNotice: true,
    showBootstrapLanguageNotice: false,
  },
  de: {
    language: Language.German,
    languageCode: "de",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  fr: {
    language: Language.French,
    languageCode: "fr",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  hi: {
    language: Language.Hindi,
    languageCode: "hi",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  id: {
    language: Language.Indonesian,
    languageCode: "id",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  it: {
    language: Language.Italian,
    languageCode: "it",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: false,
  },
  ja: {
    language: Language.Japanese,
    languageCode: "ja",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  ko: {
    language: Language.Korean,
    languageCode: "ko",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  pt: {
    language: Language.Portuguese,
    languageCode: "pt",
    showPleaseFollowNotice: true,
    showBootstrapLanguageNotice: false,
  },
  tr: {
    language: Language.Turkish,
    languageCode: "tr",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  vi: {
    language: Language.Vietnamese,
    languageCode: "vi",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  zh: {
    language: Language.ChineseSimplified,
    languageCode: "zh",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
};
