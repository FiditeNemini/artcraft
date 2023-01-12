/**
 * Send Analytics to Google Analytics.
 * 
 * Keeping track of events in a singular space lets us easily update them and keep track of what we're analyzing at a high level.
 * 
 * Currently we use Universal Analytics (UA), but support for that ends July 2023. We need to update to Google Analytics 4 (GA4).
 * 
 * Here is some reading material:
 *  - [Events usage in UA - really good resource on how to bucket events](https://support.google.com/analytics/answer/1033068)
 *  - [GTag events for multiple Google products: UA, GA4, etc.](https://developers.google.com/tag-platform/devguides/events)
 *  - [Sending events to both UA and GA4](https://support.google.com/analytics/answer/11091026)
 */

class Analytics {
  // NB: DO NOT CHANGE! 
  // These should be stable values for analytics.
  private static readonly ACCOUNT = "account";
  private static readonly PREMIUM = "premium";
  private static readonly TTS = "tts";
  private static readonly TTS_RESULT = "tts_result";
  private static readonly UI = "ui";
  private static readonly TOPBAR = "topbar";

  // ========== USER ==========

  static accountSignupAttempt() {
    Analytics.sendCategorizedEvent(this.ACCOUNT, 'signup_attempt');
  }

  static accountSignupComplete() {
    Analytics.sendCategorizedEvent(this.ACCOUNT, 'signup_complete');
  }

  static accountLoginAttempt() {
    Analytics.sendCategorizedEvent(this.ACCOUNT, 'login_attempt');
  }

  static accountLoginSuccess() {
    Analytics.sendCategorizedEvent(this.ACCOUNT, 'login_success');
  }

  static accountLogout() {
    Analytics.sendCategorizedEvent(this.ACCOUNT, 'logout');
  }

  // ========== PREMIUM ==========

  static premiumSelectPlanPlus() {
    Analytics.sendCategorizedEvent(this.PREMIUM, 'select_plan_plus');
  }

  static premiumSelectPlanPro() {
    Analytics.sendCategorizedEvent(this.PREMIUM, 'select_plan_pro');
  }

  static premiumSelectPlanElite() {
    Analytics.sendCategorizedEvent(this.PREMIUM, 'select_plan_elite');
  }

  static premiumSelectUnsubscribe() {
    Analytics.sendCategorizedEvent(this.PREMIUM, 'select_unsubscribe');
  }

  static premiumForwardToStripeCheckout() {
    Analytics.sendCategorizedEvent(this.PREMIUM, 'forward_to_stripe_checkout');
  }

  static premiumForwardToStripePortal() {
    Analytics.sendCategorizedEvent(this.PREMIUM, 'forward_to_stripe_portal');
  }

  static premiumBounceToSignup() {
    Analytics.sendCategorizedEvent(this.PREMIUM, 'bounce_to_signup');
  }

  // ========== TTS ==========

  static ttsGenerate(modelToken: string, ttsLength: number) {
    Analytics.sendCategorizedEvent(this.TTS, 'generate_tts', modelToken, ttsLength);
  }

  static ttsClear(modelToken?: string) {
    Analytics.sendCategorizedEvent(this.TTS, 'clear', modelToken);
  }
  
  static ttsClickResultLink() {
    Analytics.sendCategorizedEvent(this.TTS, 'click_tts_result_link');
  }

  static ttsClickModelDetailsLink() {
    Analytics.sendCategorizedEvent(this.TTS, 'click_model_details_link');
  }

  static ttsClickHeroVoiceClone() {
    Analytics.sendCategorizedEvent(this.TTS, 'click_hero_voice_clone');
  }

  static ttsClickHeroUpgradePlan() {
    Analytics.sendCategorizedEvent(this.TTS, 'click_hero_upgrade_plan');
  }

  static ttsClickHeroSignup() {
    Analytics.sendCategorizedEvent(this.TTS, 'click_hero_signup');
  }

  static ttsSelectVoiceFromCategory() {
    Analytics.sendCategorizedEvent(this.TTS, 'select_voice_from_category');
  }

  static ttsSelectVoiceFromSearchResult() {
    Analytics.sendCategorizedEvent(this.TTS, 'select_voice_from_search_result');
  }

  static ttsClickSelectCategory() {
    Analytics.sendCategorizedEvent(this.TTS, 'click_select_category');
  }

  //static ttsClickVoiceSearchBox() {
  //  Analytics.sendCategorizedEvent(this.TTS, 'click_voice_search_box');
  //}

  static ttsClickTextInputBox() {
    Analytics.sendCategorizedEvent(this.TTS, 'click_text_input_box');
  }

  static ttsTooSlowUpgradePremium() {
    Analytics.sendCategorizedEvent(this.TTS, 'tts_too_slow_upgrade_premium');
  }

  // ========== TTS RESULT PAGE ==========

  static ttsResultPageClickPlayPauseToggle() {
    Analytics.sendCategorizedEvent(this.TTS_RESULT, 'click_play_pause_toggle');
  }

  static ttsResultPageClickDownload() {
    Analytics.sendCategorizedEvent(this.TTS_RESULT, 'click_download');
  }

  static ttsResultPageClickRegisterToDownload() {
    Analytics.sendCategorizedEvent(this.TTS_RESULT, 'click_register_to_download');
  }


  // ========== UI ==========

  static uiTurnOnAnimations() {
    Analytics.sendCategorizedEvent(this.UI, 'turn_on_animations');
  }

  static uiTurnOffAnimations() {
    Analytics.sendCategorizedEvent(this.UI, 'turn_off_animations');
  }

  // ========== TOPBAR ==========

  static topbarClickPricing() {
    Analytics.sendCategorizedEvent(this.TOPBAR, 'click_pricing');
  }

  static topbarClickVoiceClone() {
    Analytics.sendCategorizedEvent(this.TOPBAR, 'click_voice_clone');
  }

  static topbarClickAbout() {
    Analytics.sendCategorizedEvent(this.TOPBAR, 'click_about');
  }

  static topbarClickTerms() {
    Analytics.sendCategorizedEvent(this.TOPBAR, 'click_terms');
  }

  // ========== (impl) ==========

  private static sendEvent(actionName: string, eventLabel?: string, value?: number) {
    gtag('event', actionName, {
      'event_category': undefined,
      'event_label': eventLabel,
      'value': value,
    });
  }

  private static sendCategorizedEvent(eventCategory: string, actionName: string, eventLabel?: string, value?: number) {
    gtag('event', actionName, {
      'event_category': eventCategory,
      'event_label': eventLabel,
      'value': value,
    });
  }
}

export { Analytics }