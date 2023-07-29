
import posthog from 'posthog-js'

/**
 * Since Posthog costs a lot of money, we'll use this interface to mediate when to 
 * turn on Posthog calls.
 */
export class PosthogClient {

  private static POSTHOG_ENABLED : boolean = false;

  public static enablePosthog() {
    if (PosthogClient.isEnabled()) {
      return;
    }
    PosthogClient.POSTHOG_ENABLED = true;
    posthog.init('phc_x6IRdmevMt4XAoJqx9tCmwDiaQkEkD48c0aLmuXMOvu', { 
      api_host: 'https://app.posthog.com' 
    })
  }

  public static isEnabled() : boolean {
    return PosthogClient.POSTHOG_ENABLED;
  }

  public static setUsername(username: string) {
    if (PosthogClient.isEnabled()) {
      posthog.identify(username, {});
    }
  }

  // Disassociate any identity (eg. on logout)
  public static reset() {
    if (PosthogClient.isEnabled()) {
      posthog.reset(); 
    }
  }

  public static recordPageview() {
    if (PosthogClient.isEnabled()) {
      posthog.capture('$pageview');
    }
  }

  public static recordAction(actionName: string) {
    if (PosthogClient.isEnabled()) {
      posthog.capture(actionName);
    }
  }
}
