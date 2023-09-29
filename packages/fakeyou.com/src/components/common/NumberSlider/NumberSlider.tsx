import React from 'react';
import { Slider } from "components/common";

interface Props {
  max?: number;
  min?: number;
  onChange?: any;
  value?: number;
}

export default function NumberSlider({ max, min, onChange, value }: Props) {
  return <>
  <Slider {...{ max, min, onChange, value }}/>
  <input {...{ min, max, onChange, type: "number", value }}/>
  </>;
};