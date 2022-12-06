import { COMMON_TRANSLATIONS, MergeDeepDictionary } from '@storyteller/components/src/_i18n/CommonTranslations';

// Use \u{00a0} = &nbsp; character literal

const STORYTELLER_TRANSLATIONS : any = {
  // English: 46.6% Twitch (#1), 30+% FakeYou (#1)
  en: {
    translation: {
      commonUi: {
      },
      pages: {
      },
    },
  },
  // Spanish: 10.5% Twitch (#2), 20+% FakeYou (#2)
  es: {
    translation: {
      commonUi: {
      },
      pages: {
      },
    },
  },

  // ---------- OTHER LANGUAGES ----------

  // German: 6.5% Twitch (#4)
  de: {
    translation: {
    }
  },
  // French: 5.6% Twitch (#6)
  fr: {
    translation: {
    }
  },
  // Indonesian 2% FakeYou
  id: {
    translation: {
    }
  },
  // Japanese: 2.5% Twitch (#8)
  ja: {
    translation: {
    },
  },
  // Korean: 5.4% Twitch (#7)
  ko: {
    translation: {
    }
  },
  // Portuguese: 6.2% Twitch (#5)
  pt: {
    translation: {
    },
  },
  // 6.5% Twitch (#3)
  ru: {
    translation: {
    }
  },
  // Turkish: 4% FakeYou (#3)
  tr: {
    translation: {
    }
  },
}

// TODO: Type these as i18next dictionaries
const STORYTELLER_MERGED_TRANSLATIONS : any = MergeDeepDictionary(STORYTELLER_TRANSLATIONS, COMMON_TRANSLATIONS);

export { STORYTELLER_MERGED_TRANSLATIONS }
