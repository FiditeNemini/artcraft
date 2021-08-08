
/** Centralize URL configurations (apart from bindings) */
class FrontendUrlConfig {

  static indexPage() : string {
    return '/';
  }

  // TTS model links

  static ttsModelPage(modelToken: string) : string {
    return `/tts/${modelToken}`;
  }

  static ttsModelEditPage(modelToken: string) : string {
    return `/tts/${modelToken}/edit`;
  }

  static ttsModelDeleteConfirmPage(modelToken: string) : string {
    return `/tts/${modelToken}/edit`;
  }

  static ttsResultDeletePage(resultToken: string) : string {
    return `/tts/result/${resultToken}/delete`;
  }

  // User links

  static userProfilePage(userDisplayName: string) : string {
    return `/profile/${userDisplayName}`;
  }
}

export { FrontendUrlConfig }
