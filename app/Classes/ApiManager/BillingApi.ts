import { ApiManager, ApiResponse } from "./ApiManager";

export enum SubscriptionNamespace {
  FAKEYOU = "fakeyou",
}
export enum SubscriptionProduct {
  PLUS = "fakeyou_plus",
  PRO = "fakeyou_pro",
  ELITE = "fakeyou_elite",
}
export enum LoyaltyProgram {
  CONTRIBUTOR = "fakeyou_contributor",
}
export interface Subscription {
  namespace: SubscriptionNamespace;
  product_slug: SubscriptionProduct;
}

export class BillingApi extends ApiManager {
  public async ListActiveSubscriptions(): Promise<
    ApiResponse<{
      active_subscriptions: Subscription[];
      maybe_loyalty_program?: LoyaltyProgram;
    }>
  > {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/billing/active_subscriptions`;
    return await this.get<{
      success: boolean;
      active_subscriptions?: Subscription[];
      maybe_loyalty_program?: LoyaltyProgram;
      error_message?: string;
    }>({ endpoint: endpoint })
      .then((response) => ({
        success: response.success,
        data: {
          active_subscriptions: response.active_subscriptions || [],
          maybe_loyalty_program: response.maybe_loyalty_program,
        },
      }))
      .catch((err) => {
        return {
          success: false,
          errorMessage: err.message,
        };
      });
  }
}
