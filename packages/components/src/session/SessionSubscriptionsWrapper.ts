import { ListActiveSubscriptions, ListActiveSubscriptionsIsSuccess, ListActiveSubscriptionsSuccessResponse } from "../api/premium/ListActiveSubscriptions";

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
}