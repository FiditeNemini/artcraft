import React from "react";
import { Direction, Range } from "react-range";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
} from "@fortawesome/pro-solid-svg-icons";

export interface ZoomSliderOnChangeEvent {
  target: { name?: string; type: "zoom"; value: number };
}

interface Props {
  name?: string;
  onChange: (event: ZoomSliderOnChangeEvent) => void;
  value: number;
}

const renderTrack = ({ props: { style, ...props }, children }: any) => (
  <div {...{ ...props, className: "fy-zoom-slider-track", style }}>
    {children}
    <div {...{ className: "fy-zoom-slider-track-bar" }}></div>
  </div>
);

const thumb =
  (thumbTip = "") =>
  ({ props: { style, ...props } }: any) => {
    return (
      <div {...{ ...props, className: "fy-zoom-slider-thumb", style }}>
        {thumbTip}
      </div>
    );
  };

export default function ZoomSlider({
  name = "",
  onChange: inChange,
  value,
}: Props) {
  const onChange = (newVal: number[]) =>
    inChange({
      target: { ...(name && { name }), type: "zoom", value: newVal[0] },
    });

  return (
    <div {...{ className: "fy-zoom-slider" }}>
      <Icon {...{ icon: faMagnifyingGlassPlus }} />
      <div {...{ className: "fy-zoom-slider-container" }}>
        <Range
          {...{
            direction: Direction.Up,
            min: 1,
            max: 3,
            onChange,
            step: 0.01,
            renderThumb: thumb(
              Math.round(((value - 1) / 2) * 100).toString() + "%"
            ),
            renderTrack,
            // renderTrack,
            // step: step,
            // thumbTip,
            values: [value],
          }}
        />
      </div>
      <Icon {...{ icon: faMagnifyingGlassMinus }} />
    </div>
  );
}
