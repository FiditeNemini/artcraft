import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { FAKEYOU_PRICES as FYP } from "@storyteller/fakeyou/src/data/PriceTiers";

interface Props {
  sessionWrapper: SessionWrapper;
  querySessionCallback: () => void;
}

function PricingPage(props: Props) {
  return (
    <div>
      <div className="container py-5 text-center">
        <h1 className="display-5 fw-bold">Pricing</h1>
        <p className="fs-5">
          Some kind of description here, idk haven't thought of it.
        </p>
      </div>
      <div className="container mt-3 mb-5">
        <div className="row gx-3 gy-4">
          {/* Starter Tier */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="rounded panel p-4 h-100">
              <h2 className="text-center my-2 fw-bold mb-4">
                {FYP.starter.tier}
              </h2>
              <Link to="/" className="btn btn-secondary w-100 fs-6">
                Use for free
              </Link>
              <h2 className="display-5 fw-bold text-center my-5">
                ${FYP.starter.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
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

          {/* Basic Tier (For Latin American countries) */}
          {/* <div className="col-12 col-sm-6 col-lg-3">
            <div className="rounded panel p-4 h-100">
              <h2 className="text-center my-2 fw-bold mb-4">
                {FYP.basic.tier}
              </h2>
              <Link to="/" className="btn btn-primary w-100 fs-6">
                Buy {FYP.basic.tier}
              </Link>
              <h2 className="display-5 fw-bold text-center my-5">
                ${FYP.basic.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
                <li className="fw-semibold">{FYP.basic.tts.title}</li>
                {FYP.basic.tts.features.map((e: any) => {
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
                <li className="fw-semibold">{FYP.basic.vcweb.title}</li>
                {FYP.basic.vcweb.features.map((e: any) => {
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
                <li className="fw-semibold">{FYP.basic.vcapp.title}</li>
                {FYP.basic.vcapp.features.map((e: any) => {
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
                <li className="fw-semibold">{FYP.basic.w2l.title}</li>
                {FYP.basic.w2l.features.map((e: any) => {
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
                <li className="fw-semibold">{FYP.basic.priority.title}</li>
                {FYP.basic.priority.features.map((e: any) => {
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
          </div> */}

          {/* Plus Tier */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="rounded panel p-4 h-100">
              <h2 className="text-center my-2 fw-bold mb-4">{FYP.plus.tier}</h2>
              <Link to="/" className="btn btn-primary w-100 fs-6">
                Buy {FYP.plus.tier}
              </Link>
              <h2 className="display-5 fw-bold text-center my-5">
                ${FYP.plus.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
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
                <li className="fw-semibold">{FYP.plus.vcweb.title}</li>
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
                })}
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
              </ul>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="rounded panel p-4 h-100">
              <h2 className="text-center my-2 fw-bold mb-4">{FYP.pro.tier}</h2>
              <Link to="/" className="btn btn-primary w-100 fs-6">
                Buy {FYP.pro.tier}
              </Link>
              <h2 className="display-5 fw-bold text-center my-5">
                ${FYP.pro.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
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
                <li className="fw-semibold">{FYP.pro.vcweb.title}</li>
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
                })}
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
                <li className="fw-semibold">{FYP.pro.api.title}</li>
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
                })}
              </ul>
            </div>
          </div>

          {/* Elite Tier */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="rounded panel p-4 h-100">
              <h2 className="text-center my-2 fw-bold mb-4">
                {FYP.elite.tier}
              </h2>
              <Link to="/" className="btn btn-primary w-100 fs-6">
                Buy {FYP.elite.tier}
              </Link>
              <h2 className="display-5 fw-bold text-center my-5">
                ${FYP.elite.price}
                <span className="fs-5 opacity-75 fw-normal"> /month</span>
              </h2>
              <ul className="pricing-list d-flex flex-column gap-2">
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
                <li className="fw-semibold">{FYP.elite.vcweb.title}</li>
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
                })}
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
                <li className="fw-semibold">{FYP.elite.api.title}</li>
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
                })}
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
              </ul>
            </div>
          </div>
        </div>

        {/* Starter Tier (to show for Latin American countries) */}
        <div className="w-100 mt-4">
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
        </div>
      </div>
    </div>
  );
}

export { PricingPage };
