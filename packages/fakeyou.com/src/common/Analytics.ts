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

  // ========== USER ==========

  static accountSignupAttempt() {
    Analytics.sendCategorizedEvent('account', 'signup_attempt');
  }

  static accountSignupComplete() {
    Analytics.sendCategorizedEvent('account', 'signup_complete');
  }

  static accountLoginAttempt() {
    Analytics.sendCategorizedEvent('account', 'login_attempt');
  }

  static accountLoginSuccess() {
    Analytics.sendCategorizedEvent('account', 'login_success');
  }

  // ========== PREMIUM ==========

  static premiumForwardToStripeCheckout() {
    Analytics.sendCategorizedEvent('premium', 'forward_to_stripe_checkout');
  }

  static premiumForwardToStripePortal() {
    Analytics.sendCategorizedEvent('premium', 'forward_to_stripe_portal');
  }


  static premiumBounceToSignup() {
    Analytics.sendCategorizedEvent('premium', 'bounce_to_signup');
  }


  // ========== TTS ==========

  static ttsGenerate(modelToken: string, ttsLength: number) {
    Analytics.sendCategorizedEvent('TTS', 'generate_tts', modelToken, ttsLength);
  }

  static ttsClear(modelToken?: string) {
    Analytics.sendCategorizedEvent('TTS', 'clear', modelToken);
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