import React from "react";
import { a, useSpring, useTransition } from "@react-spring/web";
import { useHover } from "hooks";
import { baseColors } from "resources";
import "./DynamicButton.scss"

interface Props {
  children?: string|JSX.Element|JSX.Element[];
  className?: string;
disabled?: boolean;
  key?: boolean;
  [x:string]: any;
}

export default function DynamicButton({ children, className, disabled, index = 0, key, slides = [], ...rest }: Props) {
  const [hover, hoverProps = {}] = useHover({});
  const style = useSpring({
    backgroundColor: hover ? baseColors.primary : baseColors.another,
    config: { tension: 130,  friction: 20 },
    opacity: disabled ? .5 : 1
  });

  const transitions = useTransition(slides, {
    config: { tension: 130,  friction: 20 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return <a.button {...{ className: `fy-dynamic-button`, disabled, style, ...hoverProps, ...rest }}>
       { transitions((contentStyle, content, s, i) => 
          index === i ? <a.div {...{ className: `button-slide ${i}`, style: contentStyle }}>{ content }</a.div> : null
        ) }
  </a.button>;
};