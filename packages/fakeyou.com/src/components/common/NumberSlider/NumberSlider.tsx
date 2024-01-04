import React from 'react';
import { Range } from "react-range";
import Tippy from "@tippyjs/react";
import { Label } from "components/common";
import "./NumberSlider.scss";

interface Props {
  label?: string;
  max?: number,
  min?: number,
  name?: string,
  onChange?: any,
  required?: boolean,
  step?: number,
  thumbTip?: string,
  value?: number
}

const renderTrack = ({ props: { style, ...props }, children }: any) => 
  <div {...{ ...props, className: "fy-number-slider-track", style }}>
    { children }
  </div>;

const thumb = (thumbTip = "") => ({ props: { style, ...props }}: any) => {
  return <Tippy {...{ arrow: false, content: thumbTip, placement: "bottom", theme: "range-slider" }} >
    <div {...{ ...props, className: "fy-number-slider-thumb", style }}></div>
  </Tippy>
};

export default function NumberSlider({ label, max, min, name, onChange: inChange = () => {}, required, step = 1, thumbTip, value = 0 }: Props) {

  const onChange = (newVal: number[]) => inChange({ target: { ...name && { name }, type: "number", value: newVal[0] }});

  return <>
    <Label {...{ label, required }}/>
    <div {...{ className: `fy-number-slider` }}>
      <div {...{ className: "fy-number-slider-range" }}>
        <Range {...{ max, min, onChange, renderThumb: thumb(thumbTip), renderTrack, step, thumbTip, values: [value] }}/>
      </div>
      <input {...{ className: "fy-number-slider-value", min, max, name, onChange: inChange, type: "number", value }}/>
    </div>
  </>;
};