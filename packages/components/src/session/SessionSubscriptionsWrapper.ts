import { ActiveSubscription, ListActiveSubscriptions, ListActiveSubscriptionsIsSuccess, ListActiveSubscriptionsSuccessResponse } from "../api/premium/ListActiveSubscriptions";
import { FakeYouFrontendEnvironment } from "../env/FakeYouFrontendEnvironment";

const FAKEYOU_NAMESPACE = "fakeyou";

export class SessionSubscriptionsWrapper {
  listActiveSubscriptionResponse?: ListActiveSubscriptionsSuccessResponse;

  private constructor(listActiveSubscriptionsSuccessResponse?: ListActiveSubscriptionsSuccessResponse) {
    if (listActiveSubscriptionsSuccessResponse !== undefined) {
        this.listActiveSubscriptionResponse = listActiveSubscriptionsSuccessResponse;
    }
  }

  public static async lookupActiveSubscriptions() : Promise<SessionSubscriptionsWrapper> {
    let response = await ListActiveSubscriptions();
    if (ListActiveSubscriptionsIsSuccess(response)) {
      return new SessionSubscriptionsWrapper(response);
    } else {
      return SessionSubscriptionsWrapper.emptySubscriptions();
    }
  }

  public static emptySubscriptions() : SessionSubscriptionsWrapper {
    return new SessionSubscriptionsWrapper();
  }

  public hasFreeOrPaidPremiumFeatures() : boolean {
    return this.hasLoyaltyProgram() || this.hasPaidFeatures();
  }


  public hasLoyaltyProgram() : boolean {
    return !!this.listActiveSubscriptionResponse?.maybe_loyalty_program;
  }

  public hasPaidFeatures() : boolean {
    const subs = this.listActiveSubscriptionResponse?.active_subscriptions || [];
    return subs.length > 0;
  }

  public hasActivePlusSubscription() : boolean {
    let maybePlan = FakeYouFrontendEnvironment.getInstance().useProductionStripePlans() ? 
      this.findActiveSubscription(FAKEYOU_NAMESPACE, "fakeyou_plus") : 
      this.findActiveSubscription(FAKEYOU_NAMESPACE, "development_fakeyou_plus"); 
    return maybePlan !== undefined;
  }

  public hasActiveProSubscription() : boolean {
    let maybePlan = FakeYouFrontendEnvironment.getInstance().useProductionStripePlans() ? 
      this.findActiveSubscription(FAKEYOU_NAMESPACE, "fakeyou_pro") : 
      this.findActiveSubscription(FAKEYOU_NAMESPACE, "development_fakeyou_pro"); 
    return maybePlan !== undefined;
  }

  public hasActiveEliteSubscription() : boolean {
    let maybePlan = FakeYouFrontendEnvironment.getInstance().useProductionStripePlans() ? 
      this.findActiveSubscription(FAKEYOU_NAMESPACE, "fakeyou_elite") : 
      this.findActiveSubscription(FAKEYOU_NAMESPACE, "development_fakeyou_elite"); 
    return maybePlan !== undefined;
  }

  private findActiveSubscription(namespace: string, product_slug: string) : ActiveSubscription | undefined {
    const subs = this.listActiveSubscriptionResponse?.active_subscriptions || [];
    return subs.find((sub) => sub.namespace === namespace && sub.product_slug === product_slug);
  }
}