import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  faCheckCircle as TRUE,
  faTimesCircle as FALSE,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import {
  FAKEYOU_PRICES as FYP,
  STORYTELLER_PRICES as STP,
} from "@storyteller/fakeyou/src/data/PriceTiers";
import {
  distance,
  pricing1,
  pricing2,
  pricing3,
  delay2,
  duration,
} from "../../../data/animation";

const Fade = require("react-reveal/Fade");

interface Props {
  sessionWrapper: SessionWrapper;
  querySessionCallback: () => void;
}

function PricingPage(props: Props) {
  function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  const [FY_TIERS, ST_TIERS] = [Object.keys(FYP), Object.keys(STP)];

  const [FY_FEATURES, ST_FEATURES] = [
    Object.keys(FYP.free.features),
    Object.keys(STP.free.features),
  ];

  let current_tiers: string[], current_features: string[], current_list: any;

  const site = window.location.hostname;

  switch (site) {
    case "fakeyou":
      [current_tiers, current_features, current_list] = [
        FY_TIERS,
        FY_FEATURES,
        FYP,
      ];
      break;
    case "storyteller":
      [current_tiers, current_features, current_list] = [
        ST_TIERS,
        ST_FEATURES,
        STP,
      ];
      break;
    default:
      [current_tiers, current_features, current_list] = [
        FY_TIERS,
        FY_FEATURES,
        FYP,
      ];
      break;
  }

  return (
    <div>
      <Fade bottom duration={duration} distance={distance}>
        <div className="container py-5 text-center">
          <h1 className="display-5 fw-bold">FakeYou Pricing</h1>
        </div>
      </Fade>

      <div className="container mt-3">
        <div className="row gy-4">
          <div className="col-12 col-lg-4">
            <Fade
              bottom
              duration={duration}
              distance={distance}
              delay={pricing1}
            >
              <div className="rounded panel p-4 h-100">
                <h2 className="text-center my-2 fw-bold">Free</h2>
                <p className="mb-4 text-center">Great for hobbyists</p>
                <Link to="/" className="btn btn-secondary w-100 fs-5">
                  Create free TTS
                </Link>
                <h2 className="display-5 fw-bold text-center my-5">
                  ${current_list.free.price}
                  <span className="fs-5 opacity-75 fw-normal"> /month</span>
                </h2>
                <ul className="pricing-list d-flex flex-column gap-3">
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                    Unlimited TTS Generation
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                    Up to 10 seconds audio
                  </li>
                </ul>
              </div>
            </Fade>
          </div>
          <div className="col-12 col-lg-4">
            <Fade
              bottom
              duration={duration}
              distance={distance}
              delay={pricing2}
            >
              <div className="rounded panel p-4 panel-border h-100">
                <h2 className="text-center my-2 fw-bold">Basic</h2>
                <p className="mb-4 text-center">Great for hobbyists</p>
                <Link to="/" className="btn btn-primary w-100 fs-5">
                  Buy Basic
                </Link>
                <h2 className="display-5 fw-bold text-center my-5">
                  ${current_list.basic.price}
                  <span className="fs-5 opacity-75 fw-normal"> /month</span>
                </h2>
                <ul className="pricing-list d-flex flex-column gap-3">
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                    Unlimited TTS Generation
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                    Up to 30 seconds audio
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                    Priority processing
                  </li>
                </ul>
              </div>
            </Fade>
          </div>
          <div className="col-12 col-lg-4">
            <Fade
              bottom
              duration={duration}
              distance={distance}
              delay={pricing3}
            >
              <div className="rounded panel p-4 h-100">
                <h2 className="text-center my-2 fw-bold">Pro</h2>
                <p className="mb-4 text-center">Great for hobbyists</p>
                <Link to="/" className="btn btn-primary w-100 fs-5">
                  Buy Pro
                </Link>
                <h2 className="display-5 fw-bold text-center my-5">
                  ${current_list.pro.price}
                  <span className="fs-5 opacity-75 fw-normal"> /month</span>
                </h2>
                <ul className="pricing-list d-flex flex-column gap-3">
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                    Unlimited TTS Generation
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                    Up to 1 minute audio
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                    Priority processing
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                    Generate mp3 file
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                    For Commercial Use
                  </li>
                </ul>
              </div>
            </Fade>
          </div>
        </div>
      </div>

      <Fade bottom duration={duration} distance={distance} delay={delay2}>
        <div className="container-panel mt-5 py-5">
          <div className="panel p-4">
            <table className="table">
              <thead>
                <tr>
                  <th className="">Feature List</th>

                  {current_tiers.map((e) => {
                    return (
                      <th key={e} className="">
                        {capitalize(e)}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="has-text-weight-bold">Price</td>
                  <td>${current_list.free.price}/month</td>
                  <td>${current_list.basic.price}/month</td>
                  <td>${current_list.pro.price}/month</td>
                </tr>

                {current_features.map((e, i) => {
                  return (
                    <tr key={i}>
                      <td>{e}</td>

                      <td>
                        <FontAwesomeIcon
                          icon={current_list.free.features[e] ? TRUE : FALSE}
                          className={`fa-2x ${
                            current_list.free.features[e]
                              ? "has-text-success"
                              : "has-text-danger"
                          }`}
                        />
                      </td>

                      <td>
                        <FontAwesomeIcon
                          icon={current_list.basic.features[e] ? TRUE : FALSE}
                          className={`fa-2x ${
                            current_list.basic.features[e]
                              ? "has-text-success"
                              : "has-text-danger"
                          }`}
                        />
                      </td>

                      <td>
                        <FontAwesomeIcon
                          icon={current_list.pro.features[e] ? TRUE : FALSE}
                          className={`fa-2x ${
                            current_list.pro.features[e]
                              ? "has-text-success"
                              : "has-text-danger"
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Fade>
    </div>
  );
}

export { PricingPage };
