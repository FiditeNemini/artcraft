import { computed, signal } from "@preact/signals-core";
import { ActiveSubscriptions, UserInfo } from "~/models";
import { AUTH_STATUS, LoyaltyProgram } from "~/enums";

const status = signal<AUTH_STATUS>(AUTH_STATUS.INIT);
const sessionToken = signal<string | undefined>(undefined);
const userInfo = signal<UserInfo | undefined>(undefined);
const activeSubs = signal<ActiveSubscriptions | undefined>(undefined);

const hasAccess = computed(() => {
  if (
    userInfo.value === undefined ||
    userInfo.value.can_access_studio === undefined
  ) {
    return undefined;
  }
  return userInfo.value.can_access_studio;
});

const hasPremium = computed(() => {
  if (activeSubs.value === undefined) {
    return undefined;
  }
  if (
    activeSubs.value.active_subscriptions.length > 0 ||
    activeSubs.value.maybe_loyalty_program === LoyaltyProgram.CONTRIBUTOR
  ) {
    return true;
  }
  return false;
});

export const authentication = {
  status,
  sessionToken,
  userInfo,
  activeSubs,
  hasAccess,
  hasPremium,
};
