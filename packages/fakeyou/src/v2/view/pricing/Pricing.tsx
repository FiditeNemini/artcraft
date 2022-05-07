import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faCheckCircle as TRUE, faTimesCircle as FALSE } from '@fortawesome/free-solid-svg-icons';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { FAKEYOU_PRICES as FYP, STORYTELLER_PRICES as STP } from '@storyteller/fakeyou/src/data/PriceTiers'

interface Props {
  sessionWrapper: SessionWrapper,
  querySessionCallback: () => void,
}

function PricingPage(props: Props) {
  function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1)
  }

  const [FY_TIERS, ST_TIERS] = [
    Object.keys(FYP),
    Object.keys(STP)
  ]

  const [FY_FEATURES, ST_FEATURES] = [Object.keys(FYP.free.features), Object.keys(STP.free.features)]

  let current_tiers: string[], current_features: string[], current_list: any

  const site = window.location.hostname

  switch (site) {
    case 'fakeyou':
      [current_tiers, current_features, current_list] = [FY_TIERS, FY_FEATURES, FYP];
      break
    case 'storyteller':
      [current_tiers, current_features, current_list] = [ST_TIERS, ST_FEATURES, STP];
      break
    default:
      [current_tiers, current_features, current_list] = [FY_TIERS, FY_FEATURES, FYP];
      break
  }


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

              {
                current_tiers.map(e => { return <th key={e} className="has-text-weight-bold is-size-1-desktop is-size-4-tablet is-size-6-mobile">{capitalize(e)}</th> })
              }
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="has-text-weight-bold">Price</td>
              <td>${current_list.free.price}/month</td>
              <td>${current_list.basic.price}/month</td>
              <td>${current_list.pro.price}/month</td>
            </tr>

            {
              current_features.map((e, i) => {
                return (
                  <tr key={i}>
                    <td >{e}</td>

                    <td>
                      <FontAwesomeIcon icon={current_list.free.features[e] ? TRUE : FALSE} className={`fa-3x ${current_list.free.features[e] ? "has-text-success" : "has-text-danger"}`} />
                    </td>

                    <td>
                      <FontAwesomeIcon icon={current_list.basic.features[e] ? TRUE : FALSE} className={`fa-3x ${current_list.basic.features[e] ? "has-text-success" : "has-text-danger"}`} />
                    </td>

                    <td>
                      <FontAwesomeIcon icon={current_list.pro.features[e] ? TRUE : FALSE} className={`fa-3x ${current_list.pro.features[e] ? "has-text-success" : "has-text-danger"}`} />
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { PricingPage };