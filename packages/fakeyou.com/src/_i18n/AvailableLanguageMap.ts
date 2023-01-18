import { Language } from "@storyteller/components/src/i18n/Language";

export interface AvailableLanguage {
  language: Language;
  languageCode: string;
  languageName: string;
  showPleaseFollowNotice: boolean;
  showBootstrapLanguageNotice: boolean;
}

export const ENGLISH_LANGUAGE: AvailableLanguage = {
  language: Language.English,
  languageCode: "en",
  languageName: "English",
  showPleaseFollowNotice: false,
  showBootstrapLanguageNotice: false,
};

export const AVAILABLE_LANGUAGE_MAP: Record<string, AvailableLanguage> = {
  en: ENGLISH_LANGUAGE,
  es: {
    language: Language.Spanish,
    languageCode: "es",
    languageName: "Spanish",
    showPleaseFollowNotice: true,
    showBootstrapLanguageNotice: false,
  },
  de: {
    language: Language.German,
    languageCode: "de",
    languageName: "German",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  fr: {
    language: Language.French,
    languageCode: "fr",
    languageName: "French",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  hi: {
    language: Language.Hindi,
    languageCode: "hi",
    languageName: "Hindi",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  id: {
    language: Language.Indonesian,
    languageCode: "id",
    languageName: "Indonesian",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  it: {
    language: Language.Italian,
    languageCode: "it",
    languageName: "Italian",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: false,
  },
  ja: {
    language: Language.Japanese,
    languageCode: "ja",
    languageName: "Japanese",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  ko: {
    language: Language.Korean,
    languageCode: "ko",
    languageName: "Korean",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  pt: {
    language: Language.Portuguese,
    languageCode: "pt",
    languageName: "Portuguese",
    showPleaseFollowNotice: true,
    showBootstrapLanguageNotice: false,
  },
  tr: {
    language: Language.Turkish,
    languageCode: "tr",
    languageName: "Turkish",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  vi: {
    language: Language.Vietnamese,
    languageCode: "vi",
    languageName: "Vietnamese",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
  zh: {
    language: Language.ChineseSimplified,
    languageCode: "zh",
    languageName: "Chinese Simplified",
    showPleaseFollowNotice: false,
    showBootstrapLanguageNotice: true,
  },
};
