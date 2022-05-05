import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faCheckCircle as TRUE, faTimesCircle as FALSE } from '@fortawesome/free-solid-svg-icons';
import { CreateAccount, CreateAccountIsError, CreateAccountIsSuccess } from '@storyteller/components/src/api/user/CreateAccount';

import { Link } from 'react-router-dom';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { FAKEYOU_PRICES } from '../../../data/PriceTiers'

interface Props {
  sessionWrapper: SessionWrapper,
  querySessionCallback: () => void,
}

function PricingPage(props: Props) {
  const PRICE_LIST = FAKEYOU_PRICES

  console.log(PRICE_LIST)

  return (
    <div>
      <h1 className="title is-1">
        Pricing
      </h1>

      <div className="table-container">
        <table className="table is-striped is-narrow is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th className="is-flex is-align-items-center is-justify-content-center">
                <FontAwesomeIcon icon={faMoneyBillWave} className="fa-3x" />
              </th>
              <th className="has-text-weight-bold is-size-1-desktop is-size-4-tablet is-size-6-mobile">
                Free
              </th>
              <th className="has-text-weight-bold is-size-1-desktop is-size-4-tablet is-size-6-mobile">
                Basic
              </th>
              <th className="has-text-weight-bold is-size-1-desktop is-size-4-tablet is-size-6-mobile">
                Pro
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="has-text-weight-bold">Price</td>
              <td>${PRICE_LIST.free.price}/month</td>
              <td>${PRICE_LIST.basic.price}/month</td>
              <td>${PRICE_LIST.pro.price}/month</td>
            </tr>

            <tr>
              <td>Extended Audio</td>
              <td>
                <FontAwesomeIcon icon={PRICE_LIST.free.features.extendedAudio ? TRUE : FALSE} className={`fa-3x ${PRICE_LIST.free.features.extendedAudio ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
              <td>{PRICE_LIST.basic.features.extendedAudio ? "Yes" : "No"}</td>
              <td>{PRICE_LIST.pro.features.extendedAudio ? "Yes" : "No"}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}

export { PricingPage };