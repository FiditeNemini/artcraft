import React from 'react';

interface Props {
  max?: number;
  min?: number;
  step?: number;
  onChange?: any;
  value?: number;
}

export default function Slider({ max, min, step, onChange, value }: Props) {
  return <input {...{ type: "range", min, max, step, onChange, value }}/>;
};