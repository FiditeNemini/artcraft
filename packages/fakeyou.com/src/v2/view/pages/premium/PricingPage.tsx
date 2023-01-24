import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";
import { faCheck, faHeart } from "@fortawesome/free-solid-svg-icons";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { FAKEYOU_PRICES as FYP } from "../../../../data/PriceTiers";
import {
  CreateStripeCheckoutRedirect,
  CreateStripeCheckoutRedirectIsError,
  CreateStripeCheckoutRedirectIsSuccess,
} from "@storyteller/components/src/api/premium/CreateStripeCheckoutRedirect";
import {
  CreateStripePortalRedirect,
  CreateStripePortalRedirectIsError,
  CreateStripePortalRedirectIsSuccess,
} from "@storyteller/components/src/api/premium/CreateStripePortalRedirect";
import { motion } from "framer-motion";
import { container, item, panel } from "../../../../data/animation";
import { FakeYouFrontendEnvironment } from "@storyteller/components/src/env/FakeYouFrontendEnvironment";
import { Analytics } from "../../../../common/Analytics";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function PricingPage(props: Props) {
  let history = useHistory();

  const beginStripeCheckoutFlow = async (
    internal_plan_key: string
  ): Promise<boolean> => {
    const response = await CreateStripeCheckoutRedirect(internal_plan_key);
    if (CreateStripeCheckoutRedirectIsSuccess(response)) {
      window.location.href = response.stripe_checkout_redirect_url;
    } else if (CreateStripeCheckoutRedirectIsError(response)) {
      // TODO
    }
    return false;
  };

  const beginStripePortalFlow = async (): Promise<boolean> => {
    const response = await CreateStripePortalRedirect();
    if (CreateStripePortalRedirectIsSuccess(response)) {
      window.location.href = response.stripe_portal_redirect_url;
    } else if (CreateStripePortalRedirectIsError(response)) {
      // TODO
    }
    return false;
  };

  const beginStripeFlow = async (
    internal_plan_key: string,
    analyticsName: string,
  ): Promise<boolean> => {

    switch (analyticsName) {
      case "plus":
        Analytics.premiumSelectPlanPlus();
        break;
      case "pro":
        Analytics.premiumSelectPlanPro();
        break;
      case "elite":
        Analytics.premiumSelectPlanElite();
        break;
      case "unsubscribe":
        Analytics.premiumSelectUnsubscribe();
        break;
    }

    if (!props.sessionWrapper.isLoggedIn()) {
      // TODO: This needs to bring the user back to purchase flow.
      Analytics.premiumBounceToSignup();
      history.push("/signup");
      return false;
    } else if (props.sessionSubscriptionsWrapper.hasPaidFeatures()) {
      Analytics.premiumForwardToStripePortal();
      return await beginStripePortalFlow();
    } else {
      Analytics.premiumForwardToStripeCheckout();
      return await beginStripeCheckoutFlow(internal_plan_key);
    }
  };

  const environment = FakeYouFrontendEnvironment.getInstance();
  const planKey = environment.useProductionStripePlans() ? "production" : "development";

  const userHasPaidPremium = props.sessionSubscriptionsWrapper.hasPaidFeatures();

  let plusButtonText = "Buy Plus";
  let plusButtonDisabled = false;

  let proButtonText = "Buy Pro";
  let proButtonDisabled = false;
  let proBorderCss = "rounded panel p-4 h-100"

  let eliteButtonText = "Buy Elite";
  let eliteButtonDisabled = false;

  let unsubscribeButton = <></>;

  if (userHasPaidPremium) {
    let unsubscribeKey = FYP.plus.internal_plan_key[planKey]; // NB: Default to something (I don't think this matters to Stripe.)

    if (props.sessionSubscriptionsWrapper.hasActivePlusSubscription()) {
      plusButtonText = "Subscribed";
      plusButtonDisabled = true;
    } else {
      plusButtonText = "Switch to Plus";
    }

    if (props.sessionSubscriptionsWrapper.hasActiveProSubscription()) {
      unsubscribeKey = FYP.pro.internal_plan_key[planKey];
      proButtonText = "Subscribed";
      proButtonDisabled = true;
    } else {
      proButtonText = "Switch to Pro";
    }

    if (props.sessionSubscriptionsWrapper.hasActiveEliteSubscription()) {
      unsubscribeKey = FYP.elite.internal_plan_key[planKey];
      eliteButtonText = "Subscribed";
      eliteButtonDisabled = true;
    } else {
      eliteButtonText = "Switch to Elite";
    }

    unsubscribeButton = (
      <>
        <div className="container pt-5 pb-3 text-center">
          <motion.div
            className="mt-4"
            variants={item}
          >
            <button
              onClick={() => beginStripeFlow(unsubscribeKey, "unsubscribe")}
              className="btn btn-link w-100 fs-6"
            >
              Unsubscribe
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  // Highlight the mid-tier plan if nothing is subscribed
  if (!userHasPaidPremium) {
    proBorderCss = "rounded panel p-4 h-100  panel-border"
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container pt-5 pb-3 text-center">
        <motion.h1 className="display-5 fw-bold" variants={item}>
          Pricing
        </motion.h1>
        {/* <p className="fs-5">
          By purchasing FakeYou premium, you help us build more!
        </p> */}
        <motion.div
          className="alert alert-warning mt-4 alert-pricing"
          variants={item}
        >
          <FontAwesomeIcon icon={faHeart} className="text-red me-3" />
          By purchasing FakeYou premium, you help us build more!
        </motion.div>
      </div>
      <div className="container mt-3 mb-5">
        <div className="row gx-3 gy-4">


          {/* Starter Tier */}
          {/*<motion.div className="col-12 col-sm-6 col-lg-3" variants={panel}>
            <div className="rounded panel p-4 h-100">
              <h2 className="text-center my-2 fw-bold mb-4">
                {FYP.starter.tier}
              </h2>


              <h2 className="display-5 fw-bold text-center my-5">
                ${FYP.starter.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
                <li className="fw-semibold">{FYP.starter.priority.title}</li>
                {FYP.starter.priority.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}

                <li className="fw-semibold">{FYP.starter.tts.title}</li>
                {FYP.starter.tts.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
                <li className="fw-semibold">{FYP.starter.w2l.title}</li>
                {FYP.starter.w2l.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
              */}

          {/* Plus Tier */}
          <motion.div className="col-12 col-sm-6 col-lg-4" variants={panel}>
            <div className="rounded panel p-4 h-100">
              <h2 className="text-center my-2 fw-bold mb-4">{FYP.plus.tier}</h2>
              <button
                onClick={() => beginStripeFlow(FYP.plus.internal_plan_key[planKey], "plus")}
                className="btn btn-primary w-100 fs-6"
                disabled={plusButtonDisabled}
              >
                {plusButtonText}
              </button>
              <h2 className="display-5 fw-bold text-center my-5">
                ${FYP.plus.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
                <li className="fw-semibold">{FYP.plus.priority.title}</li>
                {FYP.plus.priority.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}

                <li className="fw-semibold">{FYP.plus.tts.title}</li>
                {FYP.plus.tts.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
                {/*<li className="fw-semibold">{FYP.plus.vcweb.title}</li>
                {FYP.plus.vcweb.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
                <li className="fw-semibold">{FYP.plus.vcapp.title}</li>
                {FYP.plus.vcapp.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}*/}
                <li className="fw-semibold">{FYP.plus.w2l.title}</li>
                {FYP.plus.w2l.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
                {/* <li className="fw-semibold">{FYP.plus.support.title}</li>
                {FYP.plus.support.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })} */}
              </ul>
              <hr className="my-4" />
              <h6 className="text-center fw-normal">
                + Many more features coming soon!
              </h6>
            </div>
          </motion.div>

          {/* Pro Tier */}
          <motion.div className="col-12 col-sm-6 col-lg-4" variants={panel}>
            <div className={proBorderCss}>
              <h2 className="text-center my-2 fw-bold mb-4">{FYP.pro.tier}</h2>
              <button
                onClick={() => beginStripeFlow(FYP.pro.internal_plan_key[planKey], "pro")}
                className="btn btn-primary w-100 fs-6"
                disabled={proButtonDisabled}
              >
                {proButtonText}
              </button>
              <h2 className="display-5 fw-bold text-center my-5">
                ${FYP.pro.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
                <li className="fw-semibold">{FYP.pro.priority.title}</li>
                {FYP.pro.priority.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}

                <li className="fw-semibold">{FYP.pro.tts.title}</li>
                {FYP.pro.tts.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
                {/*<li className="fw-semibold">{FYP.pro.vcweb.title}</li>
                {FYP.pro.vcweb.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
                <li className="fw-semibold">{FYP.pro.vcapp.title}</li>
                {FYP.pro.vcapp.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}*/}
                <li className="fw-semibold">{FYP.pro.w2l.title}</li>
                {FYP.pro.w2l.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
                {/*<li className="fw-semibold">{FYP.pro.api.title}</li>
                {FYP.pro.api.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}*/}
                {/* <li className="fw-semibold">{FYP.pro.support.title}</li>
                {FYP.pro.support.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })} */}
              </ul>
              <hr className="my-4" />
              <h6 className="text-center fw-normal">
                + Many more features coming soon!
              </h6>
            </div>
          </motion.div>

          {/* Elite Tier */}
          <motion.div className="col-12 col-sm-6 col-lg-4" variants={panel}>
            <div className="rounded panel p-4 h-100">
              <h2 className="text-center my-2 fw-bold mb-4">
                {FYP.elite.tier}
              </h2>
              <button
                onClick={() => beginStripeFlow(FYP.elite.internal_plan_key[planKey], "elite")}
                className="btn btn-primary w-100 fs-6"
                disabled={eliteButtonDisabled}
              >
                {eliteButtonText}
              </button>
              <h2 className="display-5 fw-bold text-center my-5">
                ${FYP.elite.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
                <li className="fw-semibold">{FYP.elite.priority.title}</li>
                {FYP.elite.priority.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}

                <li className="fw-semibold">{FYP.elite.tts.title}</li>
                {FYP.elite.tts.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
                {/*<li className="fw-semibold">{FYP.elite.vcweb.title}</li>
                {FYP.elite.vcweb.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
                <li className="fw-semibold">{FYP.elite.vcapp.title}</li>
                {FYP.elite.vcapp.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}*/}
                <li className="fw-semibold">{FYP.elite.w2l.title}</li>
                {FYP.elite.w2l.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
                {/*<li className="fw-semibold">{FYP.elite.api.title}</li>
                {FYP.elite.api.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}*/}
                <li className="fw-semibold">{FYP.elite.commercial.title}</li>
                {FYP.elite.commercial.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })}
                {/* <li className="fw-semibold">{FYP.elite.support.title}</li>
                {FYP.elite.support.features.map((e: any) => {
                  return (
                    <li key={e}>
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="text-red me-3"
                      />
                      {e}
                    </li>
                  );
                })} */}
              </ul>
              <hr className="my-4" />
              <h6 className="text-center fw-normal">
                + Many more features coming soon!
              </h6>
            </div>
          </motion.div>
        </div>

      <div className="container mt-3 mb-5">
        <div className="row gx-3 gy-4">
          {unsubscribeButton}
        </div>
      </div>

        {/* Starter Tier (to show for Latin American countries) */}
        {/* <div className="w-100 mt-4">
          <div className="rounded panel p-4 h-100">
            <div className="d-flex w-100">
              <h2 className="my-2 fw-bold mb-4 flex-grow-1">
                {FYP.starter.tier}
              </h2>

              <h2 className="display-6 fw-bold text-right">
                ${FYP.starter.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
            </div>

            <Link to="/" className="btn btn-secondary w-100 fs-6">
              Use for free
            </Link>

            <div className="row mt-5">
              <div className="col-4 d-flex flex-column gap-3">
                <ul className="pricing-list d-flex flex-column gap-2">
                  <li className="fw-semibold">{FYP.starter.tts.title}</li>
                  {FYP.starter.tts.features.map((e: any) => {
                    return (
                      <li key={e}>
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-red me-3"
                        />
                        {e}
                      </li>
                    );
                  })}
                </ul>
                <ul className="pricing-list d-flex flex-column gap-2">
                  <li className="fw-semibold">{FYP.starter.vcweb.title}</li>
                  {FYP.starter.vcweb.features.map((e: any) => {
                    return (
                      <li key={e}>
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-red me-3"
                        />
                        {e}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="col-4 d-flex flex-column gap-3">
                <ul className="pricing-list d-flex flex-column gap-2">
                  <li className="fw-semibold">
                    {FYP.starter.vcapp.title}{" "}
                    <span className="small-text">(registered users)</span>
                  </li>
                  {FYP.starter.vcapp.features.map((e: any) => {
                    return (
                      <li key={e}>
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-red me-3"
                        />
                        {e}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="col-4 d-flex flex-column gap-3">
                <ul className="pricing-list d-flex flex-column gap-2">
                  <li className="fw-semibold">{FYP.starter.w2l.title}</li>
                  {FYP.starter.w2l.features.map((e: any) => {
                    return (
                      <li key={e}>
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-red me-3"
                        />
                        {e}
                      </li>
                    );
                  })}
                </ul>
                <ul className="pricing-list d-flex flex-column gap-2">
                  <li className="fw-semibold">
                    {FYP.starter.priority.title}{" "}
                    <span className="small-text">(registered users)</span>
                  </li>
                  {FYP.starter.priority.features.map((e: any) => {
                    return (
                      <li key={e}>
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-red me-3"
                        />
                        {e}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </motion.div>
  );
}

export { PricingPage };
