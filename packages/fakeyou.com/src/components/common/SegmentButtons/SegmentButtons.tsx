import React from 'react';
import "./SegmentButtons.scss";

interface Props {
  name?: string;
  onChange?: any;
  options?: any;
  value?: string;
}

export default function SegmentButtons({ name, onChange, options = [], value: inValue = "" }: Props) {
  // const onClick = ({ target }: any) => onChange();
  return <ul {...{ className: "fy-segment-buttons" }}>
    { options.map(({ label = "", value = "" },i: number) => <li {...{
      ...value === inValue && { className: "fy-selected-segment" },
      onClick: ({ target }: any) => onChange({ target: { name, type: "option", value } })
    }}>{ label }</li>) }
  </ul>;
};