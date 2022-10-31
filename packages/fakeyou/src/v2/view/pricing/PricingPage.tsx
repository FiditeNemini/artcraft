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
      <div className="container py-5 text-center">
        <h1 className="display-5 fw-bold">Pricing</h1>
        <p className="fs-5">
          Some kind of description here, idk haven't thought of it.
        </p>
      </div>
      <div className="container mt-3">
        <div className="row gx-3 gy-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="rounded panel p-4 h-100">
              <h2 className="text-center my-2 fw-bold mb-4">Starter</h2>
              <Link to="/" className="btn btn-secondary w-100 fs-6">
                Use for free
              </Link>
              <h2 className="display-5 fw-bold text-center my-5">
                ${current_list.free.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
                <li className="fw-semibold">TTS</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Unlimited generation
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 12 seconds audio
                </li>
                <li className="fw-semibold">VC Web</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 12 seconds audio
                </li>
                <li className="fw-semibold">
                  VC App <span className="small-text">(registered users)</span>
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />5
                  model downloads
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 12 secs prerecorded
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 2 mins realtime
                </li>
                <li className="fw-semibold">Wav2Lip</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 12 seconds video
                </li>
                <li className="fw-semibold">Processing Priority</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="me-3" />
                  Level 0
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Level 1 <span className="small-text">(registered users)</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="rounded panel p-4 panel-border h-100">
              <h2 className="text-center my-2 fw-bold mb-4">Plus</h2>
              <Link to="/" className="btn btn-primary w-100 fs-6">
                Buy Plus
              </Link>
              <h2 className="display-5 fw-bold text-center my-5">
                ${current_list.plus.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
                <li className="fw-semibold">TTS</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Unlimited generation
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 30 seconds audio
                </li>
                <li className="fw-semibold">VC Web</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 30 seconds audio
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Push to play
                </li>
                <li className="fw-semibold">VC App</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  10 model downloads
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 30 secs prerecorded
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 7 mins realtime
                </li>
                <li className="fw-semibold">Wav2Lip</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 1 minute video
                </li>
                <li className="fw-semibold">Processing Priority</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Level 20
                </li>
              </ul>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="rounded panel p-4 h-100">
              <h2 className="text-center my-2 fw-bold mb-4">Pro</h2>
              <Link to="/" className="btn btn-primary w-100 fs-6">
                Buy Pro
              </Link>
              <h2 className="display-5 fw-bold text-center my-5">
                ${current_list.pro.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
                <li className="fw-semibold">TTS</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Unlimited generation
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 1 minute audio
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Generate MP3 file
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Upload private models
                </li>
                <li className="fw-semibold">VC Web</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 2 minutes audio
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Push to play
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Generate MP3 file
                </li>
                <li className="fw-semibold">VC App</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  20 model downloads
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 5 mins prerecorded
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 15 mins realtime
                </li>
                <li className="fw-semibold">Wav2Lip</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 2 minutes video
                </li>
                <li className="fw-semibold">Processing Priority</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Level 30
                </li>
                <li className="fw-semibold">API Access</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Full API access
                </li>
              </ul>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="rounded panel p-4 h-100">
              <h2 className="text-center my-2 fw-bold mb-4">Elite</h2>
              <Link to="/" className="btn btn-primary w-100 fs-6">
                Buy Elite
              </Link>
              <h2 className="display-5 fw-bold text-center my-5">
                ${current_list.elite.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
                <li className="fw-semibold">TTS</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Unlimited generation
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 5 minutes audio
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Generate MP3 file
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Upload private models
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Share private models
                </li>
                <li className="fw-semibold">VC Web</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 7 minutes audio
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Push to play
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Generate MP3 file
                </li>
                <li className="fw-semibold">VC App</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Unlimited models
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Unlimited prerecorded
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Unlimited realtime
                </li>
                <li className="fw-semibold">Wav2Lip</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Up to 5 minutes video
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Turn off watermark
                </li>
                <li className="fw-semibold">Processing Priority</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Level 40
                </li>
                <li className="fw-semibold">API Access</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Full API access
                </li>
                <li className="fw-semibold">Commercial Voices</li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-red me-3" />
                  Usable commercial voices
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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
                <td>${current_list.plus.price}/month</td>
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
                        icon={current_list.plus.features[e] ? TRUE : FALSE}
                        className={`fa-2x ${
                          current_list.plus.features[e]
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
    </div>
  );
}

export { PricingPage };
