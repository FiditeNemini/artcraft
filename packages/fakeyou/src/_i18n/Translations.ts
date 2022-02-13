// Use \u{00a0} = &nbsp; character literal

const TRANSLATIONS : any = {
  // English: 46.6% Twitch (#1), 30+% FakeYou (#1)
  en: {
    translation: {
      coreUi: {
        footerNav: {
          aboutUs: 'About Us',
          builtBy: 'Built by <1>echelon</1> in Atlanta.',
          feed: 'Feed',
          leaderboard: 'Leaderboard',
          patrons: 'Patrons',
          termsOfUse: 'Terms of Use',
          textToSpeech: 'Text to Speech',
          upload: 'Upload',
          video: 'Video',
        },
        topNav: {
          aboutUs: 'About Us',
          community: 'Community',
          contributeUpload: 'Contribute / Upload',
          feed: 'Feed',
          leaderboard: 'Leaderboard',
          logout: 'Logout',
          myData: 'My Data',
          patrons: 'Patrons',
          signUpLogin: 'Sign up / Login',
          terms: 'Terms of Use',
          video: 'Video',
        },
      },
      ttsListPage: {
        by: 'by',
        categoryFilters: 'Category Filters', // "Category / Language" in other locales
        loading: 'Loading...',
        search: 'Search',
        searchTerm: 'Search Term',
        speakButton: 'Speak',
        clearButton: 'Clear',
        voiceCount: 'Voice ({{count}} to choose from)',
      }
    }
  },
  // German: 6.5% Twitch (#4)
  de: {
    translation: {
    }
  },
  // Spanish: 10.5% Twitch (#2), 20+% FakeYou (#2)
  es: {
    translation: {
      coreUi: {
        footerNav: {
          aboutUs: 'Sobre Nosotros',
          builtBy: 'Construido por <1>echelon</1> en Atlanta.',
          feed: 'Transmisión en Vivo',
          leaderboard: 'Tabla\u{00a0}de\u{00a0}Clasificación',
          patrons: 'Mecenas',
          termsOfUse: 'Términos\u{00a0}de\u{00a0}Uso',
          textToSpeech: 'Texto a Voz',
          upload: 'Subir',
          video: 'Video', // NB: This *is* translated
        },
        topNav: {
          aboutUs: 'Sobre Nosotros',
          community: 'Comunidad',
          contributeUpload: 'Contribuir / Subir',
          feed: 'Transmisión en Vivo',
          leaderboard: 'Tabla de Clasificación',
          logout: 'Cerrar sesión',
          myData: 'Mis datos',
          patrons: 'Mecenas',
          signUpLogin: 'Registrate e inicia secion',
          terms: 'Términos de Uso',
          video: 'Video', // NB: This *is* translated
        },
      },
      ttsListPage: {
        by: 'de',
        categoryFilters: 'Categoría / Idioma',
        loading: 'Cargando...',
        search: 'Búsqueda',
        searchTerm: 'Término de búsqueda',
        speakButton: 'Hablar',
        clearButton: 'Claro',
        voiceCount: 'Voz ({{count}} para elegir)',
      }
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
      coreUi: {
        topNav: {
          community: 'コミュニティ',
          contributeUpload: '投稿 / アップロード',
          logout: 'ログアウト',
          myData: '私のデータ',
          signUpLogin: 'サインアップ / ログイン',
          video: 'Video', // NB: Katakana here gets forced horizontal for some reason
        },
      },
      ttsListPage: {
        categoryFilters: 'カテゴリ / 言語',
        loading: '読み込んでいます...',
        search: '検索',
        searchTerm: '検索語',
        speakButton: '話す',
        clearButton: 'クリア',
      }
    }
  },
  // Korean: 5.4% Twitch (#7)
  ko: {
    translation: {
    }
  },
  // Portuguese: 6.2% Twitch (#5)
  pt: {
    translation: {
      coreUi: {
        topNav: {
          community: 'Comunidade',
          contributeUpload: 'Contribuir / Carregar',
          logout: 'Sair',
          myData: 'Meus dados',
          signUpLogin: 'Inscreva-se / Faça login',
          video: 'Vídeo',
        },
      },
      ttsListPage: {
        categoryFilters: 'Categoria / Idioma',
        loading: 'Carregando...',
        search: 'Procurar',
        searchTerm: 'Termo de pesquisa',
        speakButton: 'Falar',
        clearButton: 'Claro',
      }
    }
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

export { TRANSLATIONS }
