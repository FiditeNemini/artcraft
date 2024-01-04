import React from 'react';

interface Props {
  label?: any,
  required?: boolean
}

export default function Label({ label, required }: Props) {
  return label ? <label {...{ className: `sub-title${required ? " required" : ""}` }}>
    { label }
  </label> : null;
};