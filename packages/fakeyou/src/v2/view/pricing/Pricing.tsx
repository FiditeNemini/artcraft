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
  const FREE = FAKEYOU_PRICES.free
  const BASIC = FAKEYOU_PRICES.basic
  const PRO = FAKEYOU_PRICES.pro

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
            {/* Price */}
            <tr>
              <td className="has-text-weight-bold">Price</td>
              <td>${FREE.price}/month</td>
              <td>${BASIC.price}/month</td>
              <td>${PRO.price}/month</td>
            </tr>

            {/* Extended Audio */}
            <tr>
              <td>Extended Audio</td>
              <td>
                <FontAwesomeIcon icon={FREE.features.extendedAudio ? TRUE : FALSE} className={`fa-3x ${FREE.features.extendedAudio ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
              <td>
                <FontAwesomeIcon icon={BASIC.features.extendedAudio ? TRUE : FALSE} className={`fa-3x ${BASIC.features.extendedAudio ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
              <td>
                <FontAwesomeIcon icon={PRO.features.extendedAudio ? TRUE : FALSE} className={`fa-3x ${PRO.features.extendedAudio ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
            </tr>

            {/* mp3 */}
            <tr>
              <td>mp3 Format</td>
              <td>
                <FontAwesomeIcon icon={FREE.features.mp3 ? TRUE : FALSE} className={`fa-3x ${FREE.features.mp3 ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
              <td>
                <FontAwesomeIcon icon={BASIC.features.mp3 ? TRUE : FALSE} className={`fa-3x ${BASIC.features.mp3 ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
              <td>
                <FontAwesomeIcon icon={PRO.features.mp3 ? TRUE : FALSE} className={`fa-3x ${PRO.features.mp3 ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
            </tr>

            {/* Priority Processing */}
            <tr>
              <td>Priority Processing</td>
              <td>
                <FontAwesomeIcon icon={FREE.features.priorityProcessing ? TRUE : FALSE} className={`fa-3x ${FREE.features.priorityProcessing ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
              <td>
                <FontAwesomeIcon icon={BASIC.features.priorityProcessing ? TRUE : FALSE} className={`fa-3x ${BASIC.features.priorityProcessing ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
              <td>
                <FontAwesomeIcon icon={PRO.features.priorityProcessing ? TRUE : FALSE} className={`fa-3x ${PRO.features.priorityProcessing ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
            </tr>

            {/* Commercial Voices */}
            <tr>
              <td>Commercial Voices</td>
              <td>
                <FontAwesomeIcon icon={FREE.features.commercialVoices ? TRUE : FALSE} className={`fa-3x ${FREE.features.commercialVoices ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
              <td>
                <FontAwesomeIcon icon={BASIC.features.commercialVoices ? TRUE : FALSE} className={`fa-3x ${BASIC.features.commercialVoices ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
              <td>
                <FontAwesomeIcon icon={PRO.features.commercialVoices ? TRUE : FALSE} className={`fa-3x ${PRO.features.commercialVoices ? "has-text-success" : "has-text-danger"}`}
                />
              </td>
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  )
}

export { PricingPage };