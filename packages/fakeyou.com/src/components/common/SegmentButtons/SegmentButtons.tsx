import React from 'react';
import { Label } from  "components/common";
import "./SegmentButtons.scss";

interface Props {
  label?: string;
  name?: string;
  onChange?: any;
  options?: any;
  value?: string | number;
}

export default function SegmentButtons({ label, name, onChange, options = [], value: inValue = "" }: Props) {
  // const onClick = ({ target }: any) => onChange();
  return <>
    <Label {...{ label }}/>
    <ul {...{ className: "fy-segment-buttons" }}>
      { options.map(({ label = "", value = "" },key: number) => <li {...{
        ...value === inValue && { className: "fy-selected-segment" },
        key,
        onClick: ({ target }: any) => onChange({ target: { name, type: "option", value } })
      }}>{ label }</li>) }
    </ul>
  </>;
};