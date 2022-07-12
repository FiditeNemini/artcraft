import React from "react";
import { BackLink } from "../_common/BackLink";
import { FrontendUrlConfig } from "../../../common/FrontendUrlConfig";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { PATRONS } from "../../../data/Patrons";
import { PatreonLink } from "@storyteller/components/src/elements/PatreonLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPatreon } from "@fortawesome/free-brands-svg-icons";
import { distance, delay, delay2, duration } from "../../../data/animation";
import { USE_REFRESH } from "../../../Refresh";
const Fade = require("react-reveal/Fade");

interface Props {
  sessionWrapper: SessionWrapper;
}
<script src="https://fonts.googleapis.com"></script>;

function PatronPage(props: Props) {
  if (!USE_REFRESH) {
    return (
      <>
        <section className="hero is-small">
          <div className="hero-body">
            <div className="columns is-vcentered">
              <div className="column is-one-third">
                <div className="mascot">
                  <img
                    src="/mascot/kitsune_pose7_black_2000.webp"
                    alt="FakeYou's mascot!"
                  />
                </div>
              </div>

              <div className="column">
                <p className="title">Thanks to our Patrons!</p>
                <p className="subtitle">Our Patrons help support our work.</p>
              </div>
            </div>
          </div>
        </section>

        <div>
          <div className="content">
            <p>
              Our Patrons help pay offset (but not completely cover) our
              expensive server bills.
            </p>

            <ul>
              {PATRONS.map((patron) => {
                return (
                  <li>
                    {patron.username} &mdash; ${patron.donationTotal}
                  </li>
                );
              })}
            </ul>

            <p>
              Patrons will get first looks at new features, get dedicated access
              to Patron-only Discord channels, can ask for specific voices from
              our in-house audio engineers, and more!
            </p>

            <p>
              Please consider{" "}
              <PatreonLink text="donating on Patreon" iconAfterText={true} />.
            </p>

            <BackLink
              link={FrontendUrlConfig.indexPage()}
              text="Back to main"
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="container py-5 ps-3 pt-lg-0 ps-md-5 ps-lg-3">
        <div className="row">
          <Fade bottom cascade duration={duration} distance={distance}>
            <div className="col-12 col-lg-7 d-flex flex-column justify-content-center text-center text-lg-start">
              <h1 className="display-5 fw-bold">Thanks to our Patrons!</h1>
              <h3 className="mb-4">Our Patrons help support our work.</h3>
              <p className="lead mb-5">
                Our Patrons help pay offset (but not completely cover) our
                expensive server bills.
              </p>

              <div>
                <a href="https://www.patreon.com/fakeyou" target="_blank">
                  <button className="btn btn-primary">
                    <FontAwesomeIcon icon={faPatreon} className="me-2" />
                    Support us on Patreon
                  </button>
                </a>
              </div>
            </div>
          </Fade>
          <div className="col-12 col-lg-5 d-flex flex-column align-items-center">
            <Fade right distance={distance} delay={delay} duration={duration}>
              <img
                className="img-fluid mt-5 mw-50"
                src="/mascot/kitsune_pose7.png"
                alt=""
                width="560"
              />
            </Fade>
          </div>
        </div>
      </div>

      <div className="container-panel pb-5">
        <Fade bottom distance={distance} delay={delay2} duration={duration}>
          <div className="panel p-3 p-lg-4">
            <h1 className="panel-title fw-bold">Our Patrons</h1>
            <div className="py-6">
              <div className="row text-center">
                <ul className="patrons-list col-12 col-md-4 w-100">
                  {PATRONS.map((patron) => {
                    return (
                      <li>
                        {patron.username} &mdash; ${patron.donationTotal}
                      </li>
                    );
                  })}
                </ul>
                <div className="col-12 col-md-4"></div>
                <div className="col-12 col-md-4"></div>
              </div>
            </div>
          </div>
          <div className="pt-5">
            <p>
              Patrons will get first looks at new features, get dedicated access
              to Patron-only Discord channels, can ask for specific voices from
              our in-house audio engineers, and more!
              <br />
              <br />
              Please consider{" "}
              <PatreonLink text="donating on Patreon" iconAfterText={true} />
            </p>
          </div>
        </Fade>
      </div>
    </div>
  );
}

export { PatronPage };
