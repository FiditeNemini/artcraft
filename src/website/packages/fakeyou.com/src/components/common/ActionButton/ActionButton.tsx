import React from "react";
import Tippy from "@tippyjs/react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { AnimationStatus, useAnimationStatus } from "hooks";
import { WorkDots } from "components/svg";
import "./ActionButton.scss";

export interface ActionButtonProps {
  actionType: "bookmark" | "feature" | "like";
  busy?: boolean;
  entityToken?: string;
  entityType?: string;
  iconOff: IconDefinition;
  iconOn: IconDefinition;
  isToggled: boolean;
  labelOff: string | number;
  labelOn: string | number;
  toggle: (entityToken: string, entityType: string) => any;
  toolTipOff?: string;
  toolTipOn?: string;
}

export default function ActionButton({
  actionType = "like",
  busy,
  entityToken = "",
  entityType = "",
  iconOff,
  iconOn,
  isToggled,
  labelOff,
  labelOn,
  toggle,
  toolTipOff,
  toolTipOn,
}: ActionButtonProps) {
  const { events, status } = useAnimationStatus();
  const onClick = () => {
    if (status === AnimationStatus.paused) {
      toggle(entityToken, entityType);
    }
  };

  return (
    <Tippy
      {...{
        content: isToggled ? toolTipOn : toolTipOff,
        delay: [500, 0],
        hideOnClick: false,
        offset: [0, 12],
        placement: "bottom",
        theme: "fakeyou",
        trigger: "mouseenter",
      }}
    >
      <button
        {...{
          className: `fy-action-button ${actionType}-action-button ${
            isToggled ? "action-button-toggled" : ""
          }`,
          disabled: busy,
          onClick,
        }}
      >
        <Icon
          {...{
            className: `fy-action-button-icon${isToggled ? "-toggled" : ""}`,
            icon: isToggled ? iconOn : iconOff,
          }}
        />
        <WorkDots
          {...{
            events,
            labels: [labelOn, labelOff],
            index: busy ? 0 : isToggled ? 1 : 2,
          }}
        />
      </button>
    </Tippy>
  );
}
