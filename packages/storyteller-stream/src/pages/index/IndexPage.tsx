import React from "react";
import { FakeYouExternalLink } from "@storyteller/components/src/elements/FakeYouExternalLink";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { LoggedInIndex } from "./subpages/LoggedInIndex";
import { LoggedOutIndex } from "./subpages/LoggedOutIndex";

interface Props {
  sessionWrapper: SessionWrapper;
}

function IndexPage(props: Props) {
  return (
    <div>
      <div className="bg-hero">
        <div className="hero-section d-flex flex-column align-items-center">
          <div className="hero-inner container-fluid d-flex flex-column align-items-center justify-content-center">
            <h1 className="display-3 fw-bold mb-3 parent">
              Text to Speech For <span className="word">Your Stream</span>
            </h1>
            <p className="hero-text lead mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="mt-4 d-flex gap-3 flex-column flex-md-row">
              <button
                type="button"
                className="btn btn-primary btn-hero load-hidden"
              >
                Sign Up Now
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-hero load-hidden"
              >
                Join Discord
              </button>
            </div>
          </div>

          <div className="hero-img-section noselect">
            <img className="hero-img" src="assets/hero-kitsune.png" alt="" />
            <div className="d-none d-md-flex" id="hero-audio-wave"></div>
            <img
              className="hero-floor d-none d-md-flex"
              src="/assets/hero-bg-floor.png"
              alt=""
            />

            <div className="panel hero-floating-panel hero-floating-panel-left d-none d-lg-block">
              <h6 className="pb-0">Tracer (Overwatch)</h6>
              <p className="hero-floating-panel-text">
                “Look out world! Tracer's here.”
              </p>
            </div>
            <div className="panel hero-floating-panel hero-floating-panel-right d-none d-lg-block">
              <h6 className="pb-0">Sonic the Hedgehog</h6>
              <p className="hero-floating-panel-text">
                "This is what speed looks like."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { IndexPage };
