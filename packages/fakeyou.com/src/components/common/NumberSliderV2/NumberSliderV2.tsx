import React from "react";
import { Range } from "react-range";
import Tippy from "@tippyjs/react";
import { Label } from "components/common";
import "./NumberSliderV2.scss";

interface Props {
  label?: string;
  thumbTip?: string;
  min: number;
  max: number;
  step?: number;
  initialValue?: number;
  onChange?: (x:number) => void;
  required?: boolean;
}

function roundToStep(x:number, step:number){
  return Math.round(x/step) * step;
}

const renderTrack = ({ props: { style, ...props }, children }: any) => (
  <div {...{ ...props, className: "fy-number-slider-track", style }}>
    {children}
  </div>
);

const thumb =
  (thumbTip = "") =>
  ({ props: { style, ...props } }: any) => {
    return (
      <Tippy
        {...{
          arrow: false,
          content: thumbTip,
          placement: "bottom",
          theme: "range-slider",
        }}
      >
        <div
          {...{ ...props, className: "fy-number-slider-thumb", style }}
        ></div>
      </Tippy>
    );
  };

export default function NumberSlider({
  label,
  thumbTip,
  min,
  max,
  step: stepProps,
  onChange: onChangeCallback,
  required,
  initialValue: initialValueProps,
}: Props) {
  const step = stepProps && stepProps <= max-min ? stepProps 
    : max-min >= 1 ? 1 : (max-min) / 10;
  const initialValue = initialValueProps && initialValueProps <= max && initialValueProps >= min ? initialValueProps
  : max-min === step ? min : roundToStep((max+min)/2, step);

  function handleInputOnChange(e: React.ChangeEvent<HTMLInputElement>){
    if(onChangeCallback)onChangeCallback(Number.parseInt(e.target.value))
  }
  function handleRangeOnChange(rangeValue: number[]){
    if(onChangeCallback)onChangeCallback(rangeValue[0])
  }

  return (
    <div>
      <Label {...{ label, required }} />
      <div className="fy-number-slider">
        <input 
          className="fy-number-slider-value"
          type="number"
          {...{ min, max, step, value:initialValue}}
          onChange={handleInputOnChange}
        />
        <div className="fy-number-slider-range">
          <Range
            {...{min, max, step,
              onChange: handleRangeOnChange,
              renderThumb: thumb(thumbTip),
              renderTrack,
              thumbTip,
              values: [initialValue],
            }}
          />
        </div>
      </div>
    </div>
  );
}
