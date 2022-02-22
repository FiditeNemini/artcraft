import React, { useCallback, useEffect, useState } from 'react';
import { TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/ListTwitchEventRules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faRulerVertical } from '@fortawesome/free-solid-svg-icons';

interface Props {
  rule: TwitchEventRule,
}

function TwitchEventRuleElement(props: Props) {
  let title = "Not Set";
  let subtitle = <></>;
  let description = <></>;

  if (props.rule.event_match_predicate.bits_cheermote_name_exact_match !== undefined) {
    title = "Cheermote Name Matches"
    subtitle = (
      <>Cheermote name matches "{props.rule.event_match_predicate.bits_cheermote_name_exact_match.cheermote_name}"</>
    );
  } else if (props.rule.event_match_predicate.bits_cheermote_prefix_spend_threshold !== undefined) {
    title = "Cheermote Prefix Matches and Spend Threshold"
    subtitle = (
      <>
        Cheermote prefix is "{props.rule.event_match_predicate.bits_cheermote_prefix_spend_threshold.cheermote_prefix}"
        and spend at least {props.rule.event_match_predicate.bits_cheermote_prefix_spend_threshold.minimum_bits_spent} bits
      </>
    );
  } else if (props.rule.event_match_predicate.bits_spend_threshold !== undefined) {
    title = "Spend Threshold"
    subtitle = (
      <>
        Spend at least {props.rule.event_match_predicate.bits_spend_threshold.minimum_bits_spent} bits
      </>
    );
  } else if (props.rule.event_match_predicate.channel_points_reward_name_exact_match !== undefined) {
    title = "Channel Points Reward Name Match"
    subtitle = (
      <>
        Reward name matches "{props.rule.event_match_predicate.channel_points_reward_name_exact_match.reward_name}"
      </>
    );
  }

  if (props.rule.event_response.tts_single_voice !== undefined) {
    description = (
      <>
        TTS with voice: {props.rule.event_response.tts_single_voice.tts_model_token}
      </>
    );
  } else if (props.rule.event_response.tts_random_voice !== undefined) {
    description = (
      <>
        TTS with a random voice from: {props.rule.event_response.tts_random_voice.tts_model_tokens}
      </>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-content">
          <p className="title is-5">
            {subtitle}
          </p>
          <p>
            {description}
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