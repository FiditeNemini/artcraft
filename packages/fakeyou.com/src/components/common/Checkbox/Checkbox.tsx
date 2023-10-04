import React from 'react';
import { a, useSpring } from "@react-spring/web";
import { Check } from "components/common";
import { useHover, useId } from "hooks";
import makeClass from "resources/makeClass";
import "./Checkbox.scss";

interface Props {
  checked?: boolean;
  className?: string;
  label?: string;
  name?: string;
  onChange?: any;
}

export default function Checkbox({ checked, className = "", label = "", name = "", onChange }: Props) {
  const [hover, hoverEvents = {}] = useHover({});
  const style = useSpring({
    config: { tension: 120, friction: 14 },
    backgroundColor: checked ? hover ? "#bb5a5d" : "#e66462" : hover ? "#bb5a5d" : "#39394c"
  });
  const onClick = ({ target }: any) => onChange({ target: { checked: !checked, name, type: 'checkbox' } });
  const id = "checkbox-" + useId();
  return <div {...{ ...makeClass("form-check",className),  }}>
    <a.svg {...{ className: "fy-checkbox", onClick, style, ...hoverEvents }}>
      <Check {...{ checked }}/>
    </a.svg>
    { label && <label {...{ className: "form-check-label", for: id, onClick }}>{ label }</label> } 
  </div>
};