import React, { useCallback, useEffect, useState } from 'react';
import { TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/ListTwitchEventRules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faRulerVertical } from '@fortawesome/free-solid-svg-icons';

interface Props {
  rule: TwitchEventRule,
}

function TwitchEventRuleElement(props: Props) {
  let title = "Not Set"

  if (props.rule.event_match_predicate.bits_cheermote_name_exact_match !== undefined) {
    title = "Cheermote Name Matches"
  } else if (props.rule.event_match_predicate.bits_cheermote_prefix_spend_threshold !== undefined) {
    title = "Cheermote Prefix Matches and Spend Threshold"
  } else if (props.rule.event_match_predicate.bits_spend_threshold !== undefined) {
    title = "Spend Threshold"
  } else if (props.rule.event_match_predicate.channel_points_reward_name_exact_match !== undefined) {
    title = "Channel Points Reward Name Match"
  }

  return (
    <div>
      <div className="card">
        <div className="card-content">
          <p className="title is-5">
            {title}
          </p>
          <p className="subtitle is-5">
            Subtitle
          </p>
        </div>
        <footer className="card-footer">
          <p className="card-footer-item">
            <span className="icon">
              <FontAwesomeIcon icon={faArrowUp} />
            </span>
          </p>
          <p className="card-footer-item">
            <span className="icon">
              <FontAwesomeIcon icon={faArrowDown} />
            </span>
          </p>
          <p className="card-footer-item">
            <span>
              Edit
            </span>
          </p>
          <p className="card-footer-item">
            <span>
              Delete
            </span>
          </p>
        </footer>
      </div>
      <br />
    </div>
  )
}

export { TwitchEventRuleElement }