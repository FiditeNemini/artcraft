import React from 'react';

interface Props {
  max?: number;
  min?: number;
  onChange?: any;
  value?: number;
}

export default function Slider({ max, min, onChange, value }: Props) {
  return <input {...{ type: "range", min, max, onChange, value }}/>;
};